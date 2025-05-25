
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  prompt: string;
  templateName: string;
  hasImage?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, templateName, hasImage = false }: GenerateRequest = await req.json();
    
    console.log('Starting poster generation for prompt:', prompt);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create a request record
    const { data: requestData, error: requestError } = await supabase
      .from('poster_requests')
      .insert({
        prompt_text: prompt,
        template_name: templateName,
        has_image: hasImage,
        status: 'processing'
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating request:', requestError);
      throw new Error('Failed to create request');
    }

    // Generate 4 different prompts using GPT-4
    const promptVariations = await generatePromptVariations(prompt, templateName);
    console.log('Generated prompt variations:', promptVariations);

    // Generate images using DALL-E 3
    const imageUrls = await Promise.all(
      promptVariations.map(variation => generateImage(variation))
    );

    console.log('Generated image URLs:', imageUrls);

    // Store the results
    const { data: posterData, error: posterError } = await supabase
      .from('generated_posters')
      .insert({
        prompt_text: prompt,
        template_name: templateName,
        image_urls: imageUrls,
        prompts_used: promptVariations
      })
      .select()
      .single();

    if (posterError) {
      console.error('Error storing poster:', posterError);
      throw new Error('Failed to store poster');
    }

    // Update request status
    await supabase
      .from('poster_requests')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', requestData.id);

    return new Response(JSON.stringify({
      success: true,
      poster: posterData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-posters function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate posters'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generatePromptVariations(originalPrompt: string, templateName: string): Promise<string[]> {
  const systemPrompt = `You are a creative poster design expert. Given a user's prompt and template style, create 4 different detailed prompts for DALL-E 3 to generate posters in the "${templateName}" style.

Each prompt should:
- Be specific and detailed for poster design
- Include composition, colors, typography hints
- Maintain the "${templateName}" aesthetic
- Be unique and creative variations of the original idea
- Be optimized for DALL-E 3 poster generation

Return exactly 4 prompts, one per line, no numbering or formatting.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: originalPrompt }
      ],
      temperature: 0.8,
      max_tokens: 800
    }),
  });

  const data = await response.json();
  const variations = data.choices[0].message.content.trim().split('\n').filter((line: string) => line.trim());
  
  return variations.slice(0, 4);
}

async function generateImage(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard'
    }),
  });

  const data = await response.json();
  return data.data[0].url;
}

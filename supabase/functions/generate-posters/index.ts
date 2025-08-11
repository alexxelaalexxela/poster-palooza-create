
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { FunctionsHttpError } from 'https://esm.sh/@supabase/supabase-js@2';

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
  templateDescription: string;
  hasImage?: boolean;
  visitorId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, templateName, templateDescription, hasImage, visitorId }: GenerateRequest = await req.json();

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    let canGenerate = false;
    let userId = user?.id;

    if (user) {
      // Utilisateur authentifié
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_paid, generations_remaining')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profile && profile.is_paid && profile.generations_remaining > 0) {
        canGenerate = true;
        // On décrémentera le quota après la génération
      } else if (profile && profile.generations_remaining > 0) {
        // C'est sa génération gratuite en tant qu'utilisateur loggué
        canGenerate = true;
      }
    } else if (visitorId) {
      // Utilisateur anonyme
      const { data: existingVisitor } = await supabase
        .from('visitor_user_links')
        .select('visitor_id')
        .eq('visitor_id', visitorId)
        .single();

      if (!existingVisitor) {
        canGenerate = true; // C'est sa génération gratuite en tant que visiteur
      }
    }

    if (!canGenerate) {
      return new Response(JSON.stringify({ success: false, error: 'Limit reached.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate 4 different prompts using GPT-4
    console.log('tempplate descrip');
    const promptVariations = await generatePromptVariations(prompt, templateDescription);
    console.log('Generated prompt variationsss:', promptVariations);

    // Generate images using DALL-E 3
    const imageUrls = await Promise.all(
      promptVariations.map(variation => generateImage(variation))
    );

    console.log('Generated image URLs:', imageUrls);

    /*// Store the results
    const { data: posterData, error: posterError } = await supabase
      .from('generated_posters')
      .insert({
        prompt_text: prompt,
        template_name: templateName,              // ✅ ENUM / nom
        template_description: templateDescription,
        image_urls: imageUrls,
        prompts_used: promptVariations
      })
      .select()
      .single();

    if (posterError) {
      console.error('Error storing poster:', posterError);
      throw new Error('Failed to store poster');
    }*/


    if (user) {
      await supabase.rpc('decrement_generations', { user_id_param: user.id });
      // Associer les posters générés à l'utilisateur
      const posterRows = imageUrls.map(url => ({ visitor_id: visitorId, url, user_id: user.id }));
      await supabase.from('visitor_posters').insert(posterRows);
    } else if (visitorId) {
      // Marquer le visiteur comme ayant utilisé sa génération gratuite
      await supabase.from('visitor_user_links').insert({ visitor_id: visitorId });
      // Enregistrer les posters comme anonymes
      const posterRows = imageUrls.map(url => ({ visitor_id: visitorId, url }));
      await supabase.from('visitor_posters').insert(posterRows);
    }


    return new Response(
      JSON.stringify({ success: true, imageUrls: imageUrls ?? [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

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

async function generatePromptVariations(originalPrompt: string, templateDescription: string): Promise<string[]> {
  const systemPromptOld = `You are a creative poster design expert. Given a user's prompt and template style, create 4 prompts for gpt-image to generate posters in the "${templateDescription}" style.

Each prompt should:
- Be specific and detailed for the poster design
- Include composition, colors, typography hints
- Maintain the "${templateDescription}" aesthetic !!!
- Be unique and creative variations of the original idea
- Use the prompt that will follow
The objective is to take the following idea and very importantly to make it in the aesthetic of "${templateDescription}" !
Return 4 slightly different from each other prompts, one prompt per line so that i can separate after, no numbering or formatting.`;

  const systemPrompt = `You are a creative poster-design expert. Given a user’s prompt and the template style, create 4 prompts for GPT-Image that will generate posters in the “${templateDescription}” style.

  Each prompt must:
    •	Be specific and detailed for the poster design (composition, colour palette, typography hints).
    •	Rigorously maintain the “${templateDescription}” aesthetic.
    •	Include a short title—just one or two words, never a full sentence, that captures the place or activity (like the city, the country, the activity etc.. ). If possible, add a one- or two-word subtitle directly below. 
    •	Offer unique, creative variations of the original idea.
    •	Incorporate the user’s prompt that will follow.
    The most important is to take the aesthetic described “${templateDescription}” !!
  
   Return 4 slightly different, complete prompts that each describe the entire poster. Output them in a table formatted exactly like ["prompt1", "prompt2", "prompt3", "prompt4"], with one prompt per line and no numbering or extra formatting.`

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

  if (!response.ok) {
    throw new Error(
      data?.error?.message || `OpenAI returned ${response.status}`
    );
  }
  // double garde au cas où
  if (!data.choices?.length) {
    throw new Error('OpenAI response missing choices');
  }

  //const variations = data.choices[0].message.content.trim().split('\n').filter((line: string) => line.trim());

  const rawContent = data.choices[0].message.content;

  // 1) Table finder : extrait la chaîne allant du premier '[' au dernier ']'
  const tableSlice = rawContent.slice(
    rawContent.indexOf('['),
    rawContent.lastIndexOf(']') + 1
  );

  // 2) Conversion en tableau de chaînes
  const variations: string[] = JSON.parse(tableSlice);

  console.log(variations);

  return variations.slice(0, 4);
}



async function generateImage(prompt: string): Promise<string> {
  console.log('prompt', prompt);
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: prompt,
      n: 1,
      size: '1024x1536',
      quality: 'medium'
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    console.error('OpenAI image generation failed:', data);
    throw new Error(data?.error?.message || `OpenAI image API returned ${response.status}`);
  }

  if (!data.data || !data.data.length || !data.data[0].b64_json) {
    console.error('No image data in OpenAI response:', data);
    throw new Error('No image generated by OpenAI');
  }
  const base64 = data.data[0].b64_json;
  const imageUrl = `data:image/png;base64,${base64}`;
  return imageUrl;

  //return data.data[0].url;
}

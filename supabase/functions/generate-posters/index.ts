
// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { FunctionsHttpError } from 'https://esm.sh/@supabase/supabase-js@2';
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const logoUrl = Deno.env.get('LOGO_URL');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  prompt: string;
  templateName: string;
  templateDescription: string;
  libraryPosterId?: string;
  hasImage?: boolean;
  imageDataUrl?: string;
  visitorId?: string;
  fbEventId?: string;
  fbp?: string;
  fbc?: string;
  pageUrl?: string;
  manualTitle?: string;
  manualSubtitle?: string;
  manualDate?: string;
  // New for iteration flow
  iterateFromUrl?: string;
  improvementInstructions?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, templateName, templateDescription, libraryPosterId, hasImage, imageDataUrl, visitorId, fbEventId, fbp, fbc, pageUrl, manualTitle, manualSubtitle, manualDate, iterateFromUrl, improvementInstructions }: GenerateRequest = await req.json();
    const reqId = crypto.randomUUID();
    console.log('[gen] reqId=%s received', reqId, {
      mode: iterateFromUrl ? 'improve' : 'generate',
      templateName,
      hasImage: !!hasImage,
      iterateFromUrl: !!iterateFromUrl,
      hasInstructions: !!(improvementInstructions && improvementInstructions.trim()),
      visitorId,
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    console.log('[gen] reqId=%s user=%s', reqId, user?.id || null);

    let canGenerate = false;
    let userId = user?.id;
    let isPaid = false;

    if (user) {
      // Utilisateur authentifié
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_paid, generations_remaining')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profile && profile.generations_remaining > 0) {
        canGenerate = true;
        // On décrémentera le quota après la génération
      }
      isPaid = !!profile?.is_paid;
    } else if (visitorId) {
      // Utilisateur anonyme - vérifier s'il a encore des tentatives
      const { data: visitorData, error } = await supabase
        .from('visitor_user_links')
        .select('generation_count')
        .eq('visitor_id', visitorId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, ce qui est normal pour un nouveau visiteur
        throw error;
      }

      const usedAttempts = visitorData?.generation_count || 0;
      const maxAttempts = 3; // Limite pour les visiteurs anonymes
      
      if (usedAttempts < maxAttempts) {
        canGenerate = true;
      }
    }

    if (!canGenerate) {
      return new Response(JSON.stringify({ success: false, error: 'Limit reached.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Feature premium: description d'image uploadée réservée aux utilisateurs payants
    // (itération à partir d'un poster public n'est pas considérée comme un upload utilisateur)
    if (hasImage && !isPaid) {
      return new Response(JSON.stringify({ success: false, error: 'Premium required for image upload.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If an image is provided (normal flow), we can optionally enrich the prompt with a description
    let effectivePrompt = prompt || '';
    if (!iterateFromUrl) {
      if (hasImage && imageDataUrl) {
        try {
          const imageDescription = await describeImage(imageDataUrl);
          console.log('Image description:', imageDescription);
          effectivePrompt = effectivePrompt
            ? `${effectivePrompt}\n\nDescription de la personne/batiment: ${imageDescription}`
            : `Description de l'image: ${imageDescription}`;
        } catch (e) {
          console.error('Image description failed:', e);
          // Continue without image description rather than failing hard
        }
      }
    }

    // Iteration: do not describe the reference poster here; handled later in edit flow

    // Determine titles based on manual inputs
    let mainTitle = '';
    let subtitle = '';
    const hasManualTitle = !!(manualTitle && manualTitle.trim());
    const hasManualSubtitle = !!(manualSubtitle && manualSubtitle.trim());
    const normalizedDate = (manualDate || '').trim();

    if (hasManualTitle) {
      // 1) User provided a title -> do not generate
      mainTitle = manualTitle!.trim();
      subtitle = hasManualSubtitle ? manualSubtitle!.trim() : '';
    } else {
      // 2) No manual title: generate, then optionally override subtitle, and add date later in prompt composition
      console.log('Generating title from prompt...');
      console.log(effectivePrompt);
      const generatedTitle = await generateTitle(effectivePrompt);
      console.log('Generated title:', generatedTitle);
      if (generatedTitle && typeof generatedTitle === 'string') {
        const [rawMain, ...rest] = generatedTitle.split(',');
        mainTitle = (rawMain || '').trim().replace(/^['"]|['"]$/g, '');
        subtitle = (rest.join(',') || '').trim().replace(/^['"]|['"]$/g, '');
        if (!mainTitle && subtitle) {
          mainTitle = subtitle;
          subtitle = '';
        }
      }
      if (hasManualSubtitle) {
        subtitle = manualSubtitle!.trim();
      }
    }
    console.log('Parsed titles => mainTitle:', mainTitle, '| subtitle:', subtitle, '| date:', normalizedDate);

    // Determine final style description: if a library poster is selected, treat its description as the only style source (ignore old templates)
    const styleDescription = templateDescription || '';

    // Branch: Iteration mode → build a dedicated improvement prompt and use image-to-image
    if (iterateFromUrl) {
      console.log('[improve] reqId=%s compose start', reqId, { hasAttachedPhoto: !!imageDataUrl, hasInstructions: !!(improvementInstructions && improvementInstructions.trim()) });
      // Optionally describe a user-attached photo (NOT the poster to improve)
      let additionalImageDescription: string | undefined;
      if (hasImage && imageDataUrl) {
        try {
          additionalImageDescription = await describeImage(imageDataUrl);
          console.log('[improve] reqId=%s attached photo described (len=%s)', reqId, (additionalImageDescription || '').length);
        } catch (e) {
          console.error('Optional attached image description failed:', e);
        }
      }

      // Build an improvement prompt using GPT text (fallback to rule-based builder)
      let improvementPrompt: string;
      try {
        improvementPrompt = await composeImprovementPromptWithGPT({
          userInstructions: (improvementInstructions || '').trim(),
          additionalImageDescription: additionalImageDescription || '',
          styleDescription,
          mainTitle,
          subtitle,
          date: normalizedDate,
        });
        console.log('[improve] reqId=%s improvementPrompt (GPT):\n%s', reqId, improvementPrompt);
      } catch (e) {
        console.error('composeImprovementPromptWithGPT failed, falling back:', e);
        improvementPrompt = buildImprovementPrompt({
          instructions: (improvementInstructions || '').trim(),
          styleDescription,
          mainTitle,
          subtitle,
          date: normalizedDate,
          additionalImageDescription,
        });
        console.log('[improve] reqId=%s improvementPrompt (fallback):\n%s', reqId, improvementPrompt);
      }

      // Generate a single edited image from the reference
      let editedB64: string;
      try {
        console.log('[improve] reqId=%s calling OpenAI image edits', reqId);
        editedB64 = await generateImageEdit(improvementPrompt, iterateFromUrl);
        console.log('[improve] reqId=%s edits success (b64_len=%s)', reqId, editedB64?.length || 0);
      } catch (e) {
        console.error('OpenAI edit failed:', e);
        return new Response(JSON.stringify({ success: false, error: 'Image edit failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Overlay + upload
      const pngBytes: Uint8Array = base64ToUint8Array(editedB64);
      const folder = userId ? `users/${userId}` : `visitors/${visitorId || 'unknown'}`;
      const publicUrl = await uploadBytesToStorage(pngBytes, folder);
      console.log('[improve] reqId=%s upload complete url=%s', reqId, publicUrl);

      const postersWithMeta = [{ url: publicUrl, usedPrompt: improvementPrompt }];
      const imageUrls: string[] = [publicUrl];

      // Persist + decrement attempts (same logic as normal flow)
      if (user) {
        await supabase.rpc('decrement_generations', { user_id_param: user.id });
        const posterRows = postersWithMeta.map(({ url }) => ({
          visitor_id: visitorId,
          url,
          user_id: user.id,
          used_prompt: improvementPrompt,
          template: templateName,
        }));
        await supabase.from('visitor_posters').insert(posterRows);
        console.log('[improve] reqId=%s persist linked to user', reqId);
      } else if (visitorId) {
        const { data: existingVisitor } = await supabase
          .from('visitor_user_links')
          .select('visitor_id, generation_count')
          .eq('visitor_id', visitorId)
          .single();
        if (existingVisitor) {
          await supabase
            .from('visitor_user_links')
            .update({ 
              generation_count: (existingVisitor.generation_count || 0) + 1,
              last_generated_at: new Date().toISOString()
            })
            .eq('visitor_id', visitorId);
        } else {
          await supabase.from('visitor_user_links').insert({ 
            visitor_id: visitorId, 
            generation_count: 1,
            last_generated_at: new Date().toISOString()
          });
        }
        const posterRows = postersWithMeta.map(({ url }) => ({
          visitor_id: visitorId,
          url,
          used_prompt: improvementPrompt,
          template: templateName,
        }));
        await supabase.from('visitor_posters').insert(posterRows);
        console.log('[improve] reqId=%s persist linked to visitor', reqId);
      }

      console.log('[improve] reqId=%s success', reqId, { imageUrls });
      return new Response(
        JSON.stringify({ success: true, imageUrls }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate prompts (1 for free, 4 for paid) using GPT-4
    console.log('template description');
    const promptVariations = await generatePromptVariations(
      effectivePrompt,
      styleDescription,
      mainTitle,
      subtitle,
      normalizedDate,
      isPaid ? 4 : 1
    );
    console.log('Generated prompt variationsss:', promptVariations);

    // Decide how many images to generate depending on user status
    const variationsToUse = promptVariations;

    // Génère, superpose le logo et uploade en parallèle, sans conserver d'intermédiaires volumineux
    const folder = userId ? `users/${userId}` : `visitors/${visitorId || 'unknown'}`;
    const generationResults = await Promise.all(
      variationsToUse.map(async (variation) => {
        try {
          let b64 = await generateImage(variation);
          // Overlay -> retourne directement des bytes PNG (évite conversions base64 inutiles)
          const pngBytes: Uint8Array = base64ToUint8Array(b64);
          const publicUrl = await uploadBytesToStorage(pngBytes, folder);
          // Aide le GC en relâchant les gros buffers
          b64 = '';
          return { url: publicUrl, usedPrompt: variation };
        } catch (e) {
          console.error('Pipeline failed for a variation:', e);
          return null;
        }
      })
    );

    const postersWithMeta = generationResults.filter((r) => r && (r as any).url) as { url: string; usedPrompt: string }[];
    const imageUrls: string[] = postersWithMeta.map((r) => r.url);

  console.log('Generated image URLs (public):', imageUrls);

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
      // Utilisateur connecté - décrémenter ses tentatives
      await supabase.rpc('decrement_generations', { user_id_param: user.id });
      // Associer les posters générés à l'utilisateur
      const posterRows = postersWithMeta.map(({ url }) => ({
        visitor_id: visitorId,
        url,
        user_id: user.id,
        used_prompt: prompt,
        template: templateName,
      }));
      await supabase.from('visitor_posters').insert(posterRows);
    } else if (visitorId) {
      // Visiteur anonyme - incrémenter le compteur de tentatives
      const { data: existingVisitor } = await supabase
        .from('visitor_user_links')
        .select('visitor_id, generation_count')
        .eq('visitor_id', visitorId)
        .single();

      if (existingVisitor) {
        // Mettre à jour le compteur existant
        await supabase
          .from('visitor_user_links')
          .update({ 
            generation_count: (existingVisitor.generation_count || 0) + 1,
            last_generated_at: new Date().toISOString()
          })
          .eq('visitor_id', visitorId);
      } else {
        // Créer une nouvelle entrée
        await supabase.from('visitor_user_links').insert({ 
          visitor_id: visitorId, 
          generation_count: 1,
          last_generated_at: new Date().toISOString()
        });
      }
      
      // Enregistrer les posters comme anonymes
      const posterRows = postersWithMeta.map(({ url }) => ({
        visitor_id: visitorId,
        url,
        used_prompt: prompt,
        template: templateName,
      }));
      await supabase.from('visitor_posters').insert(posterRows);
    }

    // Send StartTrial via Meta CAPI for unpaid visitor successful generation
    try {
      const META_PIXEL_ID = Deno.env.get('META_PIXEL_ID') || Deno.env.get('VITE_META_PIXEL_ID');
      const META_CAPI_ACCESS_TOKEN = Deno.env.get('META_CAPI_ACCESS_TOKEN');
      const META_TEST_EVENT_CODE = Deno.env.get('META_TEST_EVENT_CODE');
      if (!isPaid && visitorId && META_PIXEL_ID && META_CAPI_ACCESS_TOKEN) {
        const userAgent = req.headers.get('user-agent') || undefined;
        const ip = (req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || '').split(',')[0] || undefined;
        const eventId = fbEventId || crypto.randomUUID();
        const user_data: Record<string, unknown> = {
          client_user_agent: userAgent,
          client_ip_address: ip,
          fbp: fbp || undefined,
          fbc: fbc || undefined,
        };
        const payload: any = {
          data: [
            {
              event_name: 'StartTrial',
              event_time: Math.floor(Date.now() / 1000),
              action_source: 'website',
              event_source_url: pageUrl || 'https://neoma-ai.fr/',
              event_id: eventId,
              user_data,
              custom_data: {
                content_type: 'product',
                content_ids: [templateName || 'poster']
              }
            }
          ]
        };
        await fetch(`https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events?access_token=${META_CAPI_ACCESS_TOKEN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(META_TEST_EVENT_CODE ? { ...payload, test_event_code: META_TEST_EVENT_CODE } : payload)
        });
      }
    } catch (e) {
      console.error('Meta CAPI StartTrial failed', e);
    }


    return new Response(
      JSON.stringify({ success: true, imageUrls: imageUrls ?? [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-posters function:', error);
    return new Response(JSON.stringify({
      error: (error as any).message || 'Failed to generate posters'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateTitle(prompt: string): Promise<string> {
  const systemPrompt = `Tu es un expert en création de titres pour des affiches. 
  
  À partir du prompt de l'utilisateur, génère un titre court et percutant (1-3 mots maximum) qui capture le le lieu du prompt. Utilise tes connaissances pour rajouter le pays ou le lieu ou autre faisant sens par rapport au prompt (1-2 mots maximum), par exemple si c'est une ville tu peux rajouter le pays ou la région. 
  
  Pas de titre ennuyant, pas de phrase, juste le lieu principalement. 
  
  Exemples de bons titres :
  - "Paris, France"
  - "Les Arcs, Alpes"
  - "Paris, ville des lumières"
  - "Plage des Estagnot, Hossegor"
  - "Côte d'Azur, Nice"
  - "Terraza du Petit St-Jean, Biarritz"
  - "Hossegor, Landes"

  Exemples de mauvais titres :
  - "Tennis au soleil"
  - "Paris Balade de touristes"
  - "Spot de surf à Bondi"


  
  Retourne uniquement le titre et le subtitle separé par une virgule, sans guillemets ni formatage supplémentaire.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 100
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || `OpenAI returned ${response.status}`
    );
  }

  if (!data.choices?.length) {
    throw new Error('OpenAI response missing choices');
  }

  const title = data.choices[0].message.content.trim();
  return title;
}

async function generatePromptVariations(originalPrompt: string, templateDescription: string, mainTitle: string, subtitle: string, date?: string, numPrompts: number = 4): Promise<string[]> {
  const systemPromptOld = `You are a creative poster design expert. Given a user's prompt and template style, create 4 prompts for gpt-image to generate posters in the "${templateDescription}" style.

Each prompt should:
- Be specific and detailed for the poster design
- Include composition, colors, typography hints
- Maintain the "${templateDescription}" aesthetic !!!
- Be unique and creative variations of the original idea
- Use the prompt that will follow
The objective is to take the following idea and very importantly to make it in the aesthetic of "${templateDescription}" !
Return 4 slightly different from each other prompts, one prompt per line so that i can separate after, no numbering or formatting.`;

  const returnInstruction = numPrompts === 1
    ? 'Return one complete prompt that describes the entire poster. Output it as a JSON array with exactly 1 string and no extra text or numbering.'
    : `Return ${numPrompts} slightly different prompts (different background, different perspective, different composition, but same title and subtitle), that each describe the entire poster. Output them as a JSON array with exactly ${numPrompts} strings and no extra text or numbering.`;

  const systemPrompt = `You are a creative poster-design expert. Given a user's prompt, a main title and subtitle${date && date.trim() ? ' and a date' : ''}, and the template style, create ${numPrompts} prompt${numPrompts > 1 ? 's' : ''} for GPT-Image that will generate posters in the "${templateDescription}" style.

  Each prompt must:
    •\tBe specific and detailed for the poster design (composition, colour palette, typography hints).
    •\tRigorously maintain the "${templateDescription}" aesthetic.
    •\tInclude the main title "${mainTitle}" prominently, and directly underneath include the subtitle "${subtitle}" in smaller letters (at least half the size of the main title). IMPORTANT: Do not include any comma in the rendered titles.
    ${date && date.trim() ? `•\tUnder the subtitle, include the date "${date.trim()}" in very small letters (smaller than the subtitle), aligned with the text block.` : ''}
    •\tIf the title : "${mainTitle}", corresponds to a place, monument, or specific location, make sure the generated prompt visually reflects that.
    •\tDo not include any other title than these two${date && date.trim() ? ' (the date is not a title)' : ''}.
    •\tOffer unique, creative variations of the original idea. 
    •\tThe answer must be in english.
    •\tIncorporate the user's prompt that will follow.
    •\tIf people are present, they should occupy no more than one-fifth of the scene. The remaining space should focus on a rich, detailed, and visually complete landscape description.
    The most important is to take the aesthetic described "${templateDescription}" !!
  
   ${returnInstruction}`

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

  return variations.slice(0, numPrompts);
}



async function describeImage(imageDataOrUrl: string): Promise<string> {
  if (!openAIApiKey) throw new Error('OPENAI_API_KEY not set');
  // Accept HTTP(S) URL, Data URL (data:image/*;base64,....) or raw base64.
  let imageUrlForApi: string;
  if (imageDataOrUrl.startsWith('http://') || imageDataOrUrl.startsWith('https://')) {
    imageUrlForApi = imageDataOrUrl;
  } else if (imageDataOrUrl.startsWith('data:')) {
    imageUrlForApi = imageDataOrUrl;
  } else {
    imageUrlForApi = `data:image/jpeg;base64,${imageDataOrUrl}`;
  }

  const messages = [
    {
      role: 'user',
      content: [
        { type: 'text', text: `Describe only the main visible elements in the image.
	•	If one or more people appear:
➝ Provide a minimal and factual description: gender, approximate age, hair color and style, one or two clothing details.
➝ Use a telegraphic format — no full sentences, only keywords separated by commas.
	•	If no humans appear and the subject is a building:
➝ Provide a detailed description: architectural style (modern, old, gothic, Haussmannian, industrial, etc.), dominant materials (stone, glass, concrete, wood), number of floors, overall condition (new, worn, renovated), main colors, and distinctive features (balconies, columns, sloped roof, windows, etc.).
	•	No emotional or narrative interpretation.

Examples:
	•	“man, brown hair, medium length curly, black striped shirt”
	•	“woman, blond hair, tied up, red dress”
	•	“Haussmannian building, beige stone, 6 floors, wrought-iron balconies, tall windows, gray mansard roof”
	•	“modern skyscraper, blue glass, 40 floors, smooth facade, concrete base”` },
        { type: 'image_url', image_url: { url: imageUrlForApi } },
      ],
    },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.4,
      max_tokens: 200,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `OpenAI vision returned ${response.status}`);
  }
  const text = data?.choices?.[0]?.message?.content?.trim?.() || '';
  return text;
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
  return base64;

  //return data.data[0].url;
}

// Compose an improvement prompt using GPT (text) to precisely instruct an image edit
async function composeImprovementPromptWithGPT(args: { userInstructions: string; additionalImageDescription?: string; styleDescription: string; mainTitle: string; subtitle: string; date?: string }): Promise<string> {
  if (!openAIApiKey) throw new Error('OPENAI_API_KEY not set');
  const { userInstructions, additionalImageDescription, styleDescription, mainTitle, subtitle, date } = args;
  const system = `You are a senior prompt engineer creating prompts for GPT-Image edits.
Your output must be a SINGLE plain text prompt (no JSON, no notes) that:
- Enforces: "Keep the reference image EXACTLY as-is (composition, framing, palette, typography)."
- Applies ONLY the requested modifications.
- Preserves the aesthetic : ${styleDescription || '(style unspecified)'}.
- If provided, includes text layout: main title "${mainTitle || ''}" prominently, subtitle "${subtitle || ''}" directly below (≥2x smaller),${date && date.trim() ? ` and a small date "${date.trim()}" under the block` : ''}.
- If an extra user photo description is provided, integrate it as additional context, not as a replacement of the reference image.`;

  const details: string[] = [];
  if (additionalImageDescription && additionalImageDescription.trim()) {
    details.push(`Attached photo (context): ${additionalImageDescription.trim()}`);
  }
  if (userInstructions && userInstructions.trim()) {
    details.push(`Requested changes: ${userInstructions.trim()}`);
  } else {
    details.push('Requested changes: none specified (make minimal/no change).');
  }

  const user = details.join('\n');

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.6,
      max_tokens: 400,
    }),
  });
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error?.message || `OpenAI returned ${resp.status}`);
  }
  const content: string = data?.choices?.[0]?.message?.content?.trim?.();
  if (!content) throw new Error('Empty prompt content');
  return content;
}

// Build a unified prompt for improvement mode that strictly preserves the reference
function buildImprovementPrompt(args: { instructions: string; styleDescription: string; mainTitle: string; subtitle: string; date?: string; additionalImageDescription?: string }) {
  const { instructions, styleDescription, mainTitle, subtitle, date, additionalImageDescription } = args;
  const lines: string[] = [];
  lines.push('IMPORTANT: Conserver STRICTEMENT l\'image de référence (composition, cadrage, palette, typographie).');
  lines.push('Appliquer uniquement les modifications demandées ci-dessous, sans altérer l\'identité visuelle.');
  if (mainTitle && subtitle) {
    lines.push(`Texte à afficher: Titre "${mainTitle}" au premier plan, sous-titre "${subtitle}" juste en dessous (au moins deux fois plus petit).`);
  } else if (mainTitle) {
    lines.push(`Texte à afficher: Titre "${mainTitle}".`);
  }
  if (date && date.trim()) {
    lines.push(`Ajouter la date "${date.trim()}" en lettres très petites sous le bloc de texte.`);
  }
  if (styleDescription && styleDescription.trim()) {
    lines.push(`Conserver le style: ${styleDescription.trim()}`);
  }
  if (additionalImageDescription && additionalImageDescription.trim()) {
    lines.push(`Contexte (photo jointe): ${additionalImageDescription.trim()}`);
  }
  if (instructions && instructions.trim()) {
    lines.push(`Modifications demandées: ${instructions.trim()}`);
  }
  // Final directive
  lines.push('Ne PAS transformer la scène originale: uniquement les ajouts/corrections explicitement listés.');
  return lines.join('\n');
}

// Edit an existing image by providing a reference image along with a prompt
async function generateImageEdit(prompt: string, referenceImageUrlOrData: string): Promise<string> {
  if (!openAIApiKey) throw new Error('OPENAI_API_KEY not set');

  const form = new FormData();
  form.append('model', 'gpt-image-1');
  form.append('prompt', prompt);
  form.append('size', '1024x1536');
  form.append('n', '1');
  form.append('quality', 'medium');

  const blob = await fetchImageBlob(referenceImageUrlOrData);
  form.append('image', blob, 'reference.png');

  const resp = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
    },
    body: form,
  });
  const data = await resp.json();
  if (!resp.ok) {
    console.error('OpenAI image edit failed:', data);
    throw new Error(data?.error?.message || `OpenAI image edit API returned ${resp.status}`);
  }
  if (!data.data || !data.data.length || !data.data[0].b64_json) {
    console.error('No image data in OpenAI edit response:', data);
    throw new Error('No edited image returned by OpenAI');
  }
  return data.data[0].b64_json as string;
}

async function fetchImageBlob(imageUrlOrData: string): Promise<Blob> {
  // Accept http(s) URL, data URL or raw base64
  if (imageUrlOrData.startsWith('http://') || imageUrlOrData.startsWith('https://')) {
    const r = await fetch(imageUrlOrData);
    if (!r.ok) throw new Error(`Failed to fetch reference image: ${r.status}`);
    const ab = await r.arrayBuffer();
    return new Blob([ab], { type: r.headers.get('content-type') || 'image/png' });
  }
  if (imageUrlOrData.startsWith('data:')) {
    // convert data URL to blob
    const res = await fetch(imageUrlOrData);
    const ab = await res.arrayBuffer();
    return new Blob([ab], { type: 'image/png' });
  }
  // Raw base64
  const bytes = base64ToUint8Array(imageUrlOrData);
  return new Blob([bytes], { type: 'image/png' });
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

let cachedLogoBytes: Uint8Array | null = null;

async function getLogoBytes(): Promise<Uint8Array> {
  if (cachedLogoBytes) return cachedLogoBytes;
  if (!logoUrl) {
    throw new Error('LOGO_URL env var not set for generate-posters function');
  }
  const resp = await fetch(logoUrl);
  if (!resp.ok) {
    throw new Error(`Failed to fetch logo from ${logoUrl}: ${resp.status}`);
  }
  const buf = new Uint8Array(await resp.arrayBuffer());
  cachedLogoBytes = buf;
  return buf;
}

// Cache de logos redimensionnés par hauteur cible pour éviter de recalculer
const resizedLogoCache = new Map<number, Uint8Array>();

async function addLogoToBase64ImageReturnBytes(base64Poster: string): Promise<Uint8Array> {
  const posterBytes = base64ToUint8Array(base64Poster);
  const posterImg = await Image.decode(posterBytes);

  const logoBytes = await getLogoBytes();
  const targetLogoHeight = Math.max(24, Math.round(posterImg.height * 0.08));

  // Récupère un logo déjà redimensionné si disponible
  let resizedLogoBytes = resizedLogoCache.get(targetLogoHeight) || null;
  if (!resizedLogoBytes) {
    let logoImg = await Image.decode(logoBytes);
    const scale = targetLogoHeight / logoImg.height;
    const targetLogoWidth = Math.max(24, Math.round(logoImg.width * scale));
    logoImg = logoImg.resize(targetLogoWidth, targetLogoHeight);
    resizedLogoBytes = await logoImg.encode();
    resizedLogoCache.set(targetLogoHeight, resizedLogoBytes);
  }

  const logoImgDecoded = await Image.decode(resizedLogoBytes);

  // Bottom-left with padding ~2% of min dimension
  const padding = Math.max(25, Math.round(Math.min(posterImg.width, posterImg.height) * 0.04));
  const x = padding;
  const y = posterImg.height - logoImgDecoded.height - padding;

  posterImg.composite(logoImgDecoded, x, y);

  const outBytes = await posterImg.encode();
  return outBytes;
}

async function uploadBytesToStorage(bytes: Uint8Array, folder: string): Promise<string> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const filename = `${folder}/${crypto.randomUUID()}.png`;
  const { error: uploadError } = await supabase
    .storage
    .from('posters')
    .upload(filename, bytes, { contentType: 'image/png', upsert: false });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from('posters').getPublicUrl(filename);
  return data.publicUrl;
}


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
  hasImage?: boolean;
  imageDataUrl?: string;
  visitorId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, templateName, templateDescription, hasImage, imageDataUrl, visitorId }: GenerateRequest = await req.json();

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

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

    // Feature premium: description d'image réservée aux utilisateurs payants
    if (hasImage && !isPaid) {
      return new Response(JSON.stringify({ success: false, error: 'Premium required for image upload.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If an image is provided, describe it with GPT-4o-mini and merge into the prompt
    let effectivePrompt = prompt || '';
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

    // Generate a title based on the user's prompt
    console.log('Generating title from prompt...');
    const generatedTitle = await generateTitle(effectivePrompt);
    console.log('Generated title:', generatedTitle);
    // Split title into main and subtitle around the first comma
    let mainTitle = '';
    let subtitle = '';
    if (generatedTitle && typeof generatedTitle === 'string') {
      const [rawMain, ...rest] = generatedTitle.split(',');
      mainTitle = (rawMain || '').trim().replace(/^['"]|['"]$/g, '');
      subtitle = (rest.join(',') || '').trim().replace(/^['"]|['"]$/g, '');
      // If no main title found, fallback to whole string
      if (!mainTitle && subtitle) {
        mainTitle = subtitle;
        subtitle = '';
      }
    }
    console.log('Parsed titles => mainTitle:', mainTitle, '| subtitle:', subtitle);

    // Generate 4 different prompts using GPT-4
    console.log('template description');
    const promptVariations = await generatePromptVariations(effectivePrompt, templateDescription, mainTitle, subtitle);
    console.log('Generated prompt variationsss:', promptVariations);

    // Decide how many images to generate depending on user status
    const variationsToUse = isPaid ? promptVariations : [promptVariations[0]];

    // Génère, superpose le logo et uploade en parallèle, sans conserver d'intermédiaires volumineux
    const folder = userId ? `users/${userId}` : `visitors/${visitorId || 'unknown'}`;
    const generationResults = await Promise.all(
      variationsToUse.map(async (variation) => {
        try {
          let b64 = await generateImage(variation);
          // Overlay -> retourne directement des bytes PNG (évite conversions base64 inutiles)
          let pngBytes: Uint8Array;
          try {
            pngBytes = await addLogoToBase64ImageReturnBytes(b64);
          } catch (e) {
            console.error('Logo overlay failed:', e);
            // fallback: upload l'image telle quelle
            pngBytes = base64ToUint8Array(b64);
          }
          const publicUrl = await uploadBytesToStorage(pngBytes, folder);
          // Aide le GC en relâchant les gros buffers
          b64 = '';
          pngBytes = new Uint8Array(0);
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
  
  À partir du prompt de l'utilisateur, génère un titre court et percutant (1-3 mots maximum) qui capture le le lieu du prompt. Utilise tes connaissances pour rajouter le pays ou le lieu ou autre faisant sens par rapport au prompt (1-2 mots maximum). 
  
  Pas de titre ennuyant, pas de phrase, juste le lieu principalement. 
  
  Exemples de bons titres :
  - "Paris, France"
  - "Paris, ville des lumières"
  - "Plage des Estagnot, Hossegor"
  - "Côte d'Azur, Nice"
  - "Terraza du Petit St-Jean, Biarritz"
  - "Bord de mer, Hossegor"

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

async function generatePromptVariations(originalPrompt: string, templateDescription: string, mainTitle: string, subtitle: string): Promise<string[]> {
  const systemPromptOld = `You are a creative poster design expert. Given a user's prompt and template style, create 4 prompts for gpt-image to generate posters in the "${templateDescription}" style.

Each prompt should:
- Be specific and detailed for the poster design
- Include composition, colors, typography hints
- Maintain the "${templateDescription}" aesthetic !!!
- Be unique and creative variations of the original idea
- Use the prompt that will follow
The objective is to take the following idea and very importantly to make it in the aesthetic of "${templateDescription}" !
Return 4 slightly different from each other prompts, one prompt per line so that i can separate after, no numbering or formatting.`;

  const systemPrompt = `You are a creative poster-design expert. Given a user's prompt, a generated main title and subtitle, and the template style, create 4 prompts for GPT-Image that will generate posters in the "${templateDescription}" style.

  Each prompt must:
    •	Be specific and detailed for the poster design (composition, colour palette, typography hints).
    •	Rigorously maintain the "${templateDescription}" aesthetic.
    •	Include the main title "${mainTitle}" prominently, and directly underneath include the subtitle "${subtitle}" in smaller letters (at least half the size of the main title). IMPORTANT: Do not include any comma in the rendered titles.
    •	Do not include any other title than these two.
    •	Offer unique, creative variations of the original idea.
    •	Incorporate the user's prompt that will follow.
    The most important is to take the aesthetic described "${templateDescription}" !!
  
   Return 4 slightly different (different background, different perspective, different composition, but same title and subtitle), complete prompts that each describe the entire poster. Output them in a table formatted exactly like ["prompt1", "prompt2", "prompt3", "prompt4"], with one prompt per line and no numbering or extra formatting.`

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



async function describeImage(imageDataUrl: string): Promise<string> {
  if (!openAIApiKey) throw new Error('OPENAI_API_KEY not set');
  // Accept Data URL (data:image/*;base64,....). If not, wrap as JPEG data URL by default.
  const imageUrlData = imageDataUrl.startsWith('data:')
    ? imageDataUrl
    : `data:image/jpeg;base64,${imageDataUrl}`;

  const messages = [
    {
      role: 'user',
      content: [
        { type: 'text', text: `Décris uniquement les éléments principaux visibles dans l’image.  

- Si une ou plusieurs personnes apparaissent :  
  ➝ Donne une description minimale et factuelle : sexe, âge approximatif, couleur et style de cheveux, un ou deux détails vestimentaires.  
  ➝ Format télégraphique, sans phrases, seulement des mots-clés séparés par des virgules.  

- Si aucun humain n’apparaît et que c’est un bâtiment :  
  ➝ Donne une description détaillée : style architectural (moderne, ancien, gothique, haussmannien, industriel, etc.), matériaux dominants (pierre, verre, béton, bois), nombre d’étages, état général (neuf, vétuste, rénové), couleurs principales, éléments particuliers (balcons, colonnes, toit en pente, vitres, etc.).  

- Pas d’interprétation émotionnelle ou narrative.  

Exemples :  
- "homme, cheveux bruns, mi-longs bouclés, chemise noire rayée"  
- "femme, cheveux blonds, attachés, robe rouge"  
- "immeuble haussmannien, pierre beige, 6 étages, balcons en fer forgé, fenêtres hautes, toit mansardé gris"  
- "gratte-ciel moderne, verre bleu, 40 étages, façade lisse, base en béton"` },
        { type: 'image_url', image_url: { url: imageUrlData } },
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
  const padding = Math.max(16, Math.round(Math.min(posterImg.width, posterImg.height) * 0.02));
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

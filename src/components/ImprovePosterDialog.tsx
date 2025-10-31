import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { usePosterStore } from "@/store/usePosterStore";
import { useProfile } from "@/hooks/useProfile";
import { useFingerprint } from "@/hooks/useFingerprint";
import { supabase } from "@/integrations/supabase/client";
import { trackEventWithId, getFbp, getFbc } from "@/lib/metaPixel";
import { findPosterById } from "@/lib/posterCatalog";
import { useSearchParams } from "react-router-dom";

interface ImprovePosterDialogProps {
  open: boolean;
  posterUrl: string | null;
  onClose: () => void;
}

export function ImprovePosterDialog({ open, posterUrl, onClose }: ImprovePosterDialogProps) {
  const { toast } = useToast();
  const visitorId = useFingerprint();
  const { profile } = useProfile();
  const isPaid = !!profile?.is_paid;
  const [searchParams] = useSearchParams();

  const {
    selectedTemplate,
    selectedLibraryPosterId,
    generatedUrls,
    cachedUrls,
    setGeneratedUrls,
    setCachedUrls,
  } = usePosterStore();

  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleIterate = async () => {
    if (!posterUrl) return;
    if (!visitorId) {
      toast({ title: "Chargement…", description: "Identifiant visiteur en cours.", variant: "destructive" });
      return;
    }

    try {
      setIsSubmitting(true);
      // Conserver les résultats actuels en tant qu'anciens avant la nouvelle génération
      try {
        const merged = Array.from(new Set([...(cachedUrls || []), ...(generatedUrls || [])]));
        setCachedUrls(merged);
        setGeneratedUrls([]);
      } catch {}

      const libraryPoster = findPosterById(selectedLibraryPosterId || undefined);
      const useTemplate = !libraryPoster;
      const name = useTemplate ? (selectedTemplate ? 1 : 1) : "LibraryPoster"; // dummy fallback for name when using catalog
      const description = useTemplate ? (selectedTemplate ? ({} as any) : ({} as any)) : (libraryPoster?.stylePrompt || "");
      // Comme PromptBar, retrouvons proprement le templateName et description
      // On réutilise la logique de PromptBar via un import léger pour la description du style
      const templateMeta = (() => {
        // Minimal mirror of getTemplate without re-importing PromptBar templates
        // En itération, si un poster de la librairie est sélectionné → on utilise son stylePrompt
        if (libraryPoster) return { name: "LibraryPoster", description: libraryPoster.stylePrompt };
        // Sinon on reste sur le template courant, dont la description est gérée côté fonction (on ne la connait pas ici)
        return { name: "Vintage", description: "" };
      })();

      const trialEventId = crypto.randomUUID();
      const fbp = getFbp();
      const fbc = getFbc();
      const pageUrl = typeof window !== 'undefined' ? window.location.href : undefined;

      const { data } = await supabase.functions.invoke("generate-posters", {
        body: {
          prompt: "", // prompt vide, l'itération s'appuie sur l'image et les instructions
          templateName: templateMeta.name,
          templateDescription: templateMeta.description,
          libraryPosterId: libraryPoster?.id,
          visitorId,
          iterateFromUrl: posterUrl,
          improvementInstructions: instructions?.trim() || undefined,
          fbEventId: trialEventId,
          fbp,
          fbc,
          pageUrl,
        },
      });

      if (!data?.success) {
        toast({ title: "Limite atteinte", description: "Passez Premium pour continuer.", variant: "destructive" });
        return;
      }

      const urls = Array.isArray(data.imageUrls)
        ? data.imageUrls
        : Array.isArray(data.poster?.image_urls)
          ? data.poster.image_urls
          : [];

      if (!urls.length) {
        toast({ title: "Aucune image", description: "La génération a échoué.", variant: "destructive" });
        return;
      }

      setGeneratedUrls(urls);
      toast({ title: "Amélioration effectuée", description: "Nouvelles variantes générées." });
      setInstructions("");
      try { window.dispatchEvent(new CustomEvent('attempts:refresh')); } catch {}

      try {
        if (!isPaid) {
          const contentId = selectedLibraryPosterId
            ? `library-${selectedLibraryPosterId}`
            : selectedTemplate
              ? `template-${selectedTemplate}`
              : 'poster';
          trackEventWithId('StartTrial', { content_type: 'product', content_ids: [contentId] }, trialEventId);
        }
      } catch {}

      onClose();
    } catch (e) {
      toast({ title: "Erreur", description: (e as Error)?.message || "Échec de l'amélioration.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Améliorer ce poster</DialogTitle>
          <DialogDescription>
            Décris ce que tu veux modifier (couleurs, éléments, ambiance, composition…). Cette itération consommera une tentative.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            {posterUrl && (
              <img src={posterUrl} alt="Poster actuel" className="w-full rounded-xl border object-contain" />
            )}
          </div>
          <div>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Ex: Rendre le ciel plus orangé, ajouter 2 surfeurs au loin, réduire la taille des personnages au premier plan."
              className="w-full h-40 rounded-xl border border-gray-200 bg-white/90 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
            />
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleIterate}
            disabled={isSubmitting || !posterUrl}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {isSubmitting ? 'Génération…' : 'Améliorer'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ImprovePosterDialog;


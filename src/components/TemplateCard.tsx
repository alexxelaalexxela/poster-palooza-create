import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";

interface Template {
  id: number;
  name: string;
  image: string;
  description: string;  // prompt utilisé
}

interface TemplateCardProps {
  template: Template;
}

const TemplateCard = ({ template }: TemplateCardProps) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFlipped(!flipped)}
      className="
        w-32 aspect-[2/3] shrink-0 relative overflow-hidden
        transition-transform duration-300 hover:-translate-y-0.5
        snap-start focus:outline-none
        border-[4px] border-black
      "
      style={{ perspective: "1000px" }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ---------- Face avant ---------- */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden", backgroundColor: "black" }}
        >
          <img
            src={template.image}
            alt={template.name}
            className="object-cover w-full h-full"
          />

          {/* Indice « Cliquer » – fixe */}
          {!flipped && (
            <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 text-[0.8rem] font-semibold text-white pointer-events-none">
              <RotateCw className="w-4 h-4" />
              Voir Prompt
            </div>
          )}
        </div>

        {/* ---------- Face arrière ---------- */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Image floutée */}
          <img
            src={template.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-md scale-110"
          />

          {/* Texte – plus petit, scroll vertical possible */}
          <div
            className="
              relative z-10 w-full h-full px-3 py-2 overflow-y-auto
              flex flex-col gap-2 text-left text-[0.7rem] leading-tight
              text-white 
            "
          >
            <div>
              <strong>Template&nbsp;:</strong>&nbsp;{template.name}
            </div>
            <div>
              <strong>Prompt&nbsp;:</strong>
              <span className="block mt-0.5">{template.description}</span>

            </div>
          </div>
        </div>
      </motion.div>
    </button>
  );
};

export default TemplateCard;
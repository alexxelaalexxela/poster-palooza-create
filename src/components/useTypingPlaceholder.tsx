import { useState, useEffect } from "react";

type Phase = "typing" | "pausing" | "deleting";

export const useTypingPlaceholder = (
    examples: string[],
    isLocked: boolean,
    typing = 70,   // ms entre lettres
    pause = 300   // pause en fin de phrase
) => {
    const [exampleIndex, setExampleIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [phase, setPhase] = useState<Phase>("typing");

    const current = examples[exampleIndex];
    const placeholder =
        charIndex === 0 && phase === "deleting"
            ? "Décrivez votre idée…"
            : current.slice(0, charIndex);

    useEffect(() => {
        if (isLocked) return;                      // l’utilisateur écrit, on stoppe
        let timeout: ReturnType<typeof setTimeout>;

        if (phase === "typing") {
            if (charIndex < current.length) {
                timeout = setTimeout(() => setCharIndex(charIndex + 1), typing);
            } else {
                timeout = setTimeout(() => setPhase("pausing"), pause);
            }
        } else if (phase === "pausing") {
            timeout = setTimeout(() => setPhase("deleting"), pause);
        } else if (phase === "deleting") {
            if (charIndex > 0) {
                timeout = setTimeout(() => setCharIndex(charIndex - 1), typing / 2);
            } else {
                setPhase("typing");
                setExampleIndex((exampleIndex + 1) % examples.length);
            }
        }

        return () => clearTimeout(timeout);
    }, [phase, charIndex, current, isLocked, typing, pause, exampleIndex, examples.length]);

    return placeholder;
};
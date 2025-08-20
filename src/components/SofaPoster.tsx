/****************************************************************
 * PosterWall.tsx – v3 (aucune bordure blanche ; contours carrés)
 ****************************************************************/

import React from 'react';
import { usePosterStore, type Format } from '@/store/usePosterStore';
import { Check } from 'lucide-react';

interface PosterWallProps {
    posterUrl: string | null;
    sofaImage?: string;
    compact?: boolean;
}

const PosterWall: React.FC<PosterWallProps> = ({ posterUrl, sofaImage = "./images/Sofa9.png", compact = false }) => {
    const { selectedFormat, setSelectedFormat } = usePosterStore();
    const isActive = (f: Format) => selectedFormat === f;

    /* Image miniature */
    const baseImg =
        'w-full h-auto object-contain transition-transform duration-300';

    /* Indicateur circulaire + coche (sans bordure blanche) */
    const Indicator = (fmt: Format) => (
        <span
            className={`absolute bottom-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300
        ${isActive(fmt)
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'bg-gray-200 text-transparent'
                }`}
        >
            {isActive(fmt) && <Check size={14} strokeWidth={3} />}
        </span>
    );

    /* Conteneur cliquable pour chaque format */
    const PosterSlot = (fmt: Format, style: React.CSSProperties) => (

        <div
            role="button"
            tabIndex={0}
            aria-label={`Choisir format ${fmt}`}
            onClick={() => setSelectedFormat(fmt)}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedFormat(fmt)}
            className="absolute cursor-pointer outline-none"
            style={style}
        >
            <img
                src={posterUrl ?? ''}
                alt={`Poster ${fmt}`}
                className={`${baseImg} ${isActive(fmt) ? 'scale-105 shadow-[0_0_0_6px_rgba(99,102,241,0.6)]' : ''
                    }`}
            />
            {Indicator(fmt)}
        </div>
    );

    return (

        <div className="w-full flex justify-center">

            <div
                className={`
                            relative mx-auto
                            w-full sm:max-w-[420px]      /* limite la largeur jusqu'à 640 px */
                            md:max-w-none               /* supprime toute limite dès 768 px */
                            ${compact ? 'md:w-[70%]' : 'md:w-[85%]'}
                            ${compact ? '' : 'md:origin-top md:origin-top md:transform md:scale-[.75] md:-translate-y-10 md:-mb-32'}
                        `}
            >
                {/* Image de fond sans coins arrondis */}
                <img src={sofaImage} alt="Poster wall" className="w-full " />

                {/* Vignettes */}
                {PosterSlot('A0', { bottom: '55.3%', left: '3%', width: '18.5%' })}
                {PosterSlot('A1', { bottom: '55.3%', left: '27.6%', width: '16%' })}
                {PosterSlot('A2', { bottom: '55.3%', left: '49.7%', width: '13.9%' })}
                {PosterSlot('A3', { bottom: '55.3%', left: '69.7%', width: '12.4%' })}
                {PosterSlot('A4', { bottom: '55.3%', left: '88.1%', width: '9.83%' })}
            </div>
        </div >
    );
};

export default PosterWall;
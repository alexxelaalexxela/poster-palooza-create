import React from 'react';

interface WatermarkProps {
  visible?: boolean;
  text?: string;
  opacity?: number; // 0..1
  tileSize?: number; // px
  fontSize?: number; // px
}

/**
 * Watermark overlay to discourage screenshots/downloads for unpaid users.
 * Place inside a relatively positioned container.
 */
export const Watermark: React.FC<WatermarkProps> = ({
  visible = true,
  text = 'Aperçu • Neoma',
  opacity = 0.14,
  tileSize = 260,
  fontSize = 18,
}) => {
  if (!visible) return null;

  const safeText = String(text).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${tileSize}' height='${tileSize}' viewBox='0 0 ${tileSize} ${tileSize}'>` +
      `<defs>` +
        `<style>` +
          `text { font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }` +
        `</style>` +
      `</defs>` +
      `<g transform='rotate(-30 ${tileSize/2} ${tileSize/2})'>` +
        `<text x='10' y='${tileSize/2}' fill='black' fill-opacity='${opacity}' font-size='${fontSize}'>${safeText}</text>` +
      `</g>` +
    `</svg>`
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      style={{
        backgroundImage: `url("data:image/svg+xml,${svg}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: `${tileSize}px ${tileSize}px`,
      }}
    />
  );
};

export default Watermark;



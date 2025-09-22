export interface WatermarkOptions {
  text?: string;
  tile?: number;
  opacity?: number; // 0..1
  fontSize?: number; // px
}

/**
 * Create a watermarked preview data URL of an image.
 * Returns null if the image cannot be drawn (CORS) or on error.
 */
export async function createWatermarkedPreview(
  imageUrl: string,
  { text = 'apercu Neoma', tile = 120, opacity = 0.18, fontSize = 14 }: WatermarkOptions = {}
): Promise<string | null> {
  try {
    if (!imageUrl) return null;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const loadPromise = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Image load failed'));
    });
    img.src = imageUrl;
    await loadPromise;

    const maxDim = 800; // small preview for Stripe
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const targetW = Math.max(1, Math.round(img.width * scale));
    const targetH = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw original
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, targetW, targetH);

    // Watermark grid
    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${Math.max(0, Math.min(1, opacity))})`;
    ctx.font = `${fontSize}px Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`;
    ctx.textBaseline = 'middle';
    const rad = -30 * Math.PI / 180;

    const stepX = tile;
    const stepY = tile;
    for (let y = -stepY; y < targetH + stepY; y += stepY) {
      for (let x = -stepX; x < targetW + stepX; x += stepX) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rad);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
    }
    ctx.restore();

    return canvas.toDataURL('image/png');
  } catch (_e) {
    return null;
  }
}



/** Solid surface ink, independent of the surrounding section's text palette. */
export function readableSurfaceColors(background: string | undefined, backdrop = '#ffffff') {
  const match = /^#([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.exec((background || '').trim());
  if (!match) return null;
  const hex = match[1]!.length <= 4
    ? match[1]!.split('').map(c => c + c).join('') : match[1]!;
  const alpha = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
  let base = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(backdrop)?.[1] || 'ffffff';
  if (base.length === 3) base = base.split('').map(c => c + c).join('');
  const rgb = [0, 2, 4].map(i => (parseInt(hex.slice(i, i + 2), 16) * alpha
    + parseInt(base.slice(i, i + 2), 16) * (1 - alpha)) / 255);
  const linear = rgb.map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luminance = linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722;
  const ratio = (ink: number) => (Math.max(luminance, ink) + 0.05) / (Math.min(luminance, ink) + 0.05);
  const dark = ratio(0.008815) >= ratio(0.95356);
  const ink = Math.max(ratio(0.008815), ratio(0.95356)) >= 4.5
    ? dark ? '#0f172a' : '#f8fafc'
    : ratio(0) >= ratio(1) ? '#000000' : '#ffffff';
  const muted = dark ? '#475569' : '#cbd5e1';
  const mutedLum = dark ? 0.088565 : 0.657213;
  return { ink, muted: ratio(mutedLum) >= 4.5 ? muted : ink };
}

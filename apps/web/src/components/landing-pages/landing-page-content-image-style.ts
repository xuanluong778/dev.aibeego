import type { CSSProperties } from 'react';
import type { LandingPageImageStyle } from '@marketingspa/shared';

export function lpImgStyle(style?: LandingPageImageStyle): CSSProperties {
  const flip = String(style?.flip || '');
  const sx = flip.includes('x') ? -1 : 1;
  const sy = flip.includes('y') ? -1 : 1;
  const z = style?.zIndex != null && style.zIndex !== '' ? Number(style.zIndex) : undefined;
  return {
    objectFit: style?.fit === 'contain' ? 'contain' : 'cover',
    objectPosition: style?.position || 'center',
    borderRadius: style?.borderRadius || undefined,
    backgroundColor: style?.bgColor || undefined,
    transform: sx !== 1 || sy !== 1 ? `scale(${sx}, ${sy})` : undefined,
    zIndex: Number.isFinite(z) ? z : undefined,
  };
}

export function lpImgMotionAttr(style?: LandingPageImageStyle): string | undefined {
  const motion = style?.motion;
  return typeof motion === 'string' && motion && motion !== 'none' ? motion : undefined;
}

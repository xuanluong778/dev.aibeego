'use client';

/**
 * Shape / box chrome catalog for Landing Page Builder «Đồ họa».
 * Inserts a CTA shape-only block (empty text + style.lpBox marker).
 * UI panel lives in landing-page-graphics-library.tsx — do not delete presets here.
 */

import type { CSSProperties } from 'react';

export type LandingPageBoxChromeStyle = {
  /** Marker — required for shape-only render. */
  lpBox: string;
  width?: string;
  height?: string;
  background?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  backgroundPosition?: string;
  border?: string;
  borderRadius?: string;
  boxShadow?: string;
  clipPath?: string;
  opacity?: number;
  /** Photo frame — accepts imageUrl fill. */
  lpFrame?: boolean;
  /** Grid layout e.g. "2x2" — cells store URLs in lpGridImages JSON. */
  lpGrid?: string;
  lpGridImages?: string;
};

export type LandingPageBoxPreset = {
  id: string;
  label: string;
  category: 'basic' | 'radius' | 'clip';
  style: LandingPageBoxChromeStyle;
};

export type BoxPresetTab = 'basic' | 'radius' | 'clip';

function box(
  id: string,
  label: string,
  category: LandingPageBoxPreset['category'],
  style: Omit<LandingPageBoxChromeStyle, 'lpBox'> & { lpBox?: string },
): LandingPageBoxPreset {
  return {
    id,
    label,
    category,
    style: { ...style, lpBox: style.lpBox || id },
  };
}

const GRAY = '#d1d5db';
const GRAY_SOFT = '#e5e7eb';
const BLUE = '#1e3a8a';
const BLUE_MID = '#2563eb';
const BLACK = '#0f172a';
const PINK = '#f9a8d4';
const ORANGE = '#f97316';
const TEAL = '#0f766e';
const PURPLE = '#7c3aed';
const GREEN = '#16a34a';
const BROWN = '#92400e';
const MINT = '#86efac';
const SKY = '#7dd3fc';

/** Placeholder landscape for clip-shape previews. */
const LANDSCAPE =
  'linear-gradient(180deg, #7dd3fc 0%, #7dd3fc 42%, #86efac 42%, #4ade80 100%)';

export const LP_BOX_PRESETS: LandingPageBoxPreset[] = [
  // —— Cơ bản (ảnh 1) ——
  box('sq-solid', 'Vuông đặc', 'basic', {
    width: '88px',
    height: '88px',
    background: GRAY_SOFT,
    borderRadius: '4px',
  }),
  box('sq-outline', 'Vuông viền', 'basic', {
    width: '88px',
    height: '88px',
    background: '#fff',
    border: `1.5px solid ${GRAY}`,
    borderRadius: '4px',
  }),
  box('cir-solid', 'Tròn đặc', 'basic', {
    width: '88px',
    height: '88px',
    background: GRAY_SOFT,
    borderRadius: '999px',
  }),
  box('cir-outline', 'Tròn viền', 'basic', {
    width: '88px',
    height: '88px',
    background: '#fff',
    border: `1.5px solid ${GRAY}`,
    borderRadius: '999px',
  }),
  box('rect-solid', 'Chữ nhật đặc', 'basic', {
    width: '140px',
    height: '56px',
    background: GRAY_SOFT,
    borderRadius: '4px',
  }),
  box('rect-outline', 'Chữ nhật viền', 'basic', {
    width: '140px',
    height: '56px',
    background: '#fff',
    border: `1.5px solid ${GRAY}`,
    borderRadius: '4px',
  }),
  box('rect-shadow-soft', 'Bóng mềm', 'basic', {
    width: '140px',
    height: '56px',
    background: '#fff',
    borderRadius: '6px',
    boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
  }),
  box('rect-shadow-hard', 'Bóng cứng', 'basic', {
    width: '140px',
    height: '56px',
    background: '#fff',
    borderRadius: '4px',
    boxShadow: '6px 6px 0 rgba(15,23,42,0.18)',
  }),
  box('rect-blue', 'Xanh đặc', 'basic', {
    width: '140px',
    height: '56px',
    background: BLUE,
    borderRadius: '4px',
  }),
  box('rect-blue-outline', 'Xanh viền', 'basic', {
    width: '140px',
    height: '56px',
    background: '#fff',
    border: `2px solid ${BLUE}`,
    borderRadius: '4px',
  }),
  box('rect-black', 'Đen đặc', 'basic', {
    width: '140px',
    height: '56px',
    background: BLACK,
    borderRadius: '4px',
  }),
  box('rect-black-outline', 'Đen viền', 'basic', {
    width: '140px',
    height: '56px',
    background: '#fff',
    border: `2px solid ${BLACK}`,
    borderRadius: '4px',
  }),
  box('bar-gray', 'Thanh xám', 'basic', {
    width: '160px',
    height: '40px',
    background: GRAY,
    borderRadius: '4px',
  }),
  box('bar-black', 'Thanh đen', 'basic', {
    width: '160px',
    height: '40px',
    background: BLACK,
    borderRadius: '4px',
  }),
  box('bar-pink', 'Thanh hồng', 'basic', {
    width: '160px',
    height: '40px',
    background: PINK,
    borderRadius: '4px',
  }),
  box('bar-orange', 'Thanh cam', 'basic', {
    width: '160px',
    height: '40px',
    background: ORANGE,
    borderRadius: '4px',
  }),

  // —— Bo góc / trang trí (ảnh 2–3) ——
  box('dash-rect', 'Nét đứt', 'radius', {
    width: '140px',
    height: '48px',
    background: 'transparent',
    border: `2px dashed ${BLACK}`,
    borderRadius: '4px',
  }),
  box('cir-sky-outline', 'Tròn xanh nhạt', 'radius', {
    width: '72px',
    height: '72px',
    background: 'transparent',
    border: `2px solid ${SKY}`,
    borderRadius: '999px',
  }),
  box('sq-teal', 'Vuông teal', 'radius', {
    width: '72px',
    height: '72px',
    background: TEAL,
    borderRadius: '12px',
  }),
  box('pill-blue', 'Pill xanh', 'radius', {
    width: '140px',
    height: '48px',
    background: BLUE_MID,
    borderRadius: '999px',
  }),
  box('leaf-sq-blue', 'Lá vuông xanh', 'radius', {
    width: '72px',
    height: '72px',
    background: BLUE_MID,
    borderRadius: '0 36px 0 36px',
  }),
  box('leaf-rect-blue', 'Lá chữ nhật xanh', 'radius', {
    width: '140px',
    height: '56px',
    background: BLUE_MID,
    borderRadius: '0 28px 0 28px',
  }),
  box('leaf-rect-purple', 'Lá tím dài', 'radius', {
    width: '160px',
    height: '48px',
    background: PURPLE,
    borderRadius: '0 24px 0 24px',
  }),
  box('leaf-sq-purple', 'Lá vuông tím', 'radius', {
    width: '72px',
    height: '72px',
    background: PURPLE,
    borderRadius: '0 36px 0 36px',
  }),
  box('corner-sq-green', 'Góc dưới xanh', 'radius', {
    width: '72px',
    height: '72px',
    background: GREEN,
    borderRadius: '0 0 36px 0',
  }),
  box('corner-rect-green', 'CN góc xanh', 'radius', {
    width: '140px',
    height: '56px',
    background: GREEN,
    borderRadius: '0 0 28px 0',
  }),
  box('pill-brown', 'Pill nâu', 'radius', {
    width: '140px',
    height: '48px',
    background: BROWN,
    borderRadius: '999px',
  }),
  box('pill-brown-outline', 'Pill nâu viền', 'radius', {
    width: '140px',
    height: '48px',
    background: 'transparent',
    border: `2px solid ${BROWN}`,
    borderRadius: '999px',
  }),
  box('sq-orange-shadow', 'Vuông cam bóng', 'radius', {
    width: '72px',
    height: '72px',
    background: ORANGE,
    borderRadius: '8px',
    boxShadow: '4px 4px 0 rgba(15,23,42,0.2)',
  }),
  box('rect-orange-shadow', 'CN cam bóng', 'radius', {
    width: '140px',
    height: '56px',
    background: ORANGE,
    borderRadius: '8px',
    boxShadow: '4px 4px 0 rgba(15,23,42,0.2)',
  }),
  box('rect-dark-teal', 'CN teal đậm', 'radius', {
    width: '140px',
    height: '48px',
    background: TEAL,
    borderRadius: '4px',
  }),
  box('sq-teal-outline', 'Vuông teal viền', 'radius', {
    width: '72px',
    height: '72px',
    background: 'transparent',
    border: `2px solid ${TEAL}`,
    borderRadius: '4px',
  }),
  box('cir-mint', 'Tròn mint', 'radius', {
    width: '72px',
    height: '72px',
    background: MINT,
    borderRadius: '999px',
  }),
  box('u-mint-sm', 'U mint nhỏ', 'radius', {
    width: '72px',
    height: '72px',
    background: MINT,
    borderRadius: '0 0 999px 999px',
  }),
  box('u-mint-lg', 'U mint lớn', 'radius', {
    width: '72px',
    height: '100px',
    background: MINT,
    borderRadius: '0 0 999px 999px',
  }),
  box('u-mint-outline', 'U mint viền', 'radius', {
    width: '72px',
    height: '100px',
    background: 'transparent',
    border: `2px solid ${MINT}`,
    borderRadius: '0 0 999px 999px',
  }),
  box('quad-tl-pink', 'Cung trên trái', 'radius', {
    width: '72px',
    height: '72px',
    background: PINK,
    borderRadius: '999px 0 0 0',
  }),
  box('quad-tr-pink', 'Cung trên phải', 'radius', {
    width: '72px',
    height: '72px',
    background: PINK,
    borderRadius: '0 999px 0 0',
  }),
  box('dome-pink', 'Vòm hồng', 'radius', {
    width: '88px',
    height: '56px',
    background: PINK,
    borderRadius: '999px 999px 0 0',
  }),
  box('frame-rect', 'Khung chữ nhật', 'radius', {
    width: '100px',
    height: '72px',
    background: LANDSCAPE,
    borderRadius: '0',
  }),
  box('frame-circle', 'Khung tròn', 'radius', {
    width: '80px',
    height: '80px',
    background: LANDSCAPE,
    borderRadius: '999px',
  }),
  box('frame-round', 'Khung bo', 'radius', {
    width: '100px',
    height: '72px',
    background: LANDSCAPE,
    borderRadius: '16px',
  }),
  box('frame-arch', 'Khung vòm', 'radius', {
    width: '80px',
    height: '100px',
    background: LANDSCAPE,
    borderRadius: '999px 999px 0 0',
  }),
  box('frame-u', 'Khung chữ U', 'radius', {
    width: '80px',
    height: '100px',
    background: LANDSCAPE,
    borderRadius: '0 0 999px 999px',
  }),
  box('frame-tr', 'Bo góc phải', 'radius', {
    width: '100px',
    height: '72px',
    background: LANDSCAPE,
    borderRadius: '0 40px 0 0',
  }),
  box('frame-tl', 'Bo góc trái', 'radius', {
    width: '100px',
    height: '72px',
    background: LANDSCAPE,
    borderRadius: '40px 0 0 0',
  }),
  box('frame-3r', 'Ba góc bo', 'radius', {
    width: '100px',
    height: '72px',
    background: LANDSCAPE,
    borderRadius: '20px 20px 20px 0',
  }),
  box('frame-qtr-tr', '1/4 tròn TR', 'radius', {
    width: '80px',
    height: '80px',
    background: LANDSCAPE,
    borderRadius: '0 100% 0 0',
  }),
  box('frame-qtr-bl', '1/4 tròn BL', 'radius', {
    width: '80px',
    height: '80px',
    background: LANDSCAPE,
    borderRadius: '0 0 0 100%',
  }),

  // —— Clip path (ảnh 4–6) ——
  box('clip-square', 'Vuông', 'clip', {
    width: '88px',
    height: '88px',
    background: LANDSCAPE,
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
  }),
  box('clip-round-sq', 'Vuông bo', 'clip', {
    width: '88px',
    height: '88px',
    background: LANDSCAPE,
    borderRadius: '18px',
  }),
  box('clip-circle', 'Tròn', 'clip', {
    width: '88px',
    height: '88px',
    background: LANDSCAPE,
    borderRadius: '50%',
  }),
  box('clip-trap', 'Hình thang', 'clip', {
    width: '100px',
    height: '72px',
    background: LANDSCAPE,
    clipPath: 'polygon(15% 0, 85% 0, 100% 100%, 0 100%)',
  }),
  box('clip-tri-down', 'Tam giác ↓', 'clip', {
    width: '88px',
    height: '88px',
    background: LANDSCAPE,
    clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
  }),
  box('clip-diamond', 'Kim cương', 'clip', {
    width: '88px',
    height: '88px',
    background: LANDSCAPE,
    clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
  }),
  box('clip-pentagon', 'Ngũ giác', 'clip', {
    width: '88px',
    height: '88px',
    background: LANDSCAPE,
    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
  }),
  box('clip-hex-v', 'Lục giác dọc', 'clip', {
    width: '80px',
    height: '92px',
    background: LANDSCAPE,
    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  }),
  box('clip-hex-h', 'Lục giác ngang', 'clip', {
    width: '100px',
    height: '72px',
    background: LANDSCAPE,
    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  }),
  box('clip-octagon', 'Bát giác', 'clip', {
    width: '88px',
    height: '88px',
    background: LANDSCAPE,
    clipPath:
      'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
  }),
  box('clip-star4', 'Sao 4 cánh', 'clip', {
    width: '88px',
    height: '88px',
    background: LANDSCAPE,
    clipPath: 'polygon(50% 0%, 65% 35%, 100% 50%, 65% 65%, 50% 100%, 35% 65%, 0% 50%, 35% 35%)',
  }),
  box('clip-star5', 'Sao 5 cánh', 'clip', {
    width: '88px',
    height: '88px',
    background: LANDSCAPE,
    clipPath:
      'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  }),
  box('clip-star6', 'Sao 6 cánh', 'clip', {
    width: '88px',
    height: '88px',
    background: LANDSCAPE,
    clipPath:
      'polygon(50% 0%, 66% 25%, 98% 25%, 78% 50%, 98% 75%, 66% 75%, 50% 100%, 34% 75%, 2% 75%, 22% 50%, 2% 25%, 34% 25%)',
  }),
  box('clip-star8', 'Sao 8 cánh', 'clip', {
    width: '88px',
    height: '88px',
    background: LANDSCAPE,
    clipPath:
      'polygon(50% 0%, 63% 20%, 85% 15%, 80% 37%, 100% 50%, 80% 63%, 85% 85%, 63% 80%, 50% 100%, 37% 80%, 15% 85%, 20% 63%, 0% 50%, 20% 37%, 15% 15%, 37% 20%)',
  }),
  box('clip-burst', 'Burst', 'clip', {
    width: '88px',
    height: '88px',
    background: LANDSCAPE,
    clipPath:
      'polygon(50% 0%,55% 18%,70% 6%,68% 25%,90% 20%,80% 35%,100% 50%,80% 65%,90% 80%,68% 75%,70% 94%,55% 82%,50% 100%,45% 82%,30% 94%,32% 75%,10% 80%,20% 65%,0% 50%,20% 35%,10% 20%,32% 25%,30% 6%,45% 18%)',
  }),
  box('clip-burst24', 'Sao nhiều cánh', 'clip', {
    width: '88px',
    height: '88px',
    background: LANDSCAPE,
    clipPath:
      'polygon(50% 0%,53% 10%,62% 3%,60% 14%,75% 8%,68% 18%,88% 15%,78% 25%,97% 25%,85% 35%,100% 42%,88% 48%,100% 58%,85% 62%,97% 75%,78% 72%,88% 85%,68% 78%,75% 92%,60% 82%,62% 97%,53% 86%,50% 100%,47% 86%,38% 97%,40% 82%,25% 92%,32% 78%,12% 85%,22% 72%,3% 75%,15% 62%,0% 58%,12% 48%,0% 42%,15% 35%,3% 25%,22% 25%,12% 15%,32% 18%,25% 8%,40% 14%,38% 3%,47% 10%)',
  }),
  box('clip-shield-wide', 'Khiên rộng', 'clip', {
    width: '100px',
    height: '72px',
    background: LANDSCAPE,
    clipPath: 'polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)',
  }),
  box('clip-scallop', 'Tròn sóng', 'clip', {
    width: '88px',
    height: '88px',
    background: LANDSCAPE,
    clipPath:
      'polygon(50% 0%,58% 6%,68% 2%,72% 12%,84% 10%,84% 22%,96% 28%,90% 38%,100% 50%,90% 62%,96% 72%,84% 78%,84% 90%,72% 88%,68% 98%,58% 94%,50% 100%,42% 94%,32% 98%,28% 88%,16% 90%,16% 78%,4% 72%,10% 62%,0% 50%,10% 38%,4% 28%,16% 22%,16% 10%,28% 12%,32% 2%,42% 6%)',
  }),
  box('clip-callout-r', 'Callout phải', 'clip', {
    width: '110px',
    height: '72px',
    background: LANDSCAPE,
    clipPath: 'polygon(0 0, 78% 0, 78% 55%, 100% 70%, 78% 70%, 78% 100%, 0 100%)',
  }),
  box('clip-callout-l', 'Callout trái', 'clip', {
    width: '110px',
    height: '72px',
    background: LANDSCAPE,
    clipPath: 'polygon(22% 0, 100% 0, 100% 100%, 22% 100%, 22% 70%, 0 70%, 22% 55%)',
  }),
  box('clip-arrow-up', 'Mũi tên ↑', 'clip', {
    width: '72px',
    height: '100px',
    background: LANDSCAPE,
    clipPath: 'polygon(50% 0, 100% 40%, 70% 40%, 70% 100%, 30% 100%, 30% 40%, 0 40%)',
  }),
  box('clip-arrow-down', 'Mũi tên ↓', 'clip', {
    width: '72px',
    height: '100px',
    background: LANDSCAPE,
    clipPath: 'polygon(30% 0, 70% 0, 70% 60%, 100% 60%, 50% 100%, 0 60%, 30% 60%)',
  }),
  box('clip-arrow-h', 'Mũi tên ↔', 'clip', {
    width: '120px',
    height: '56px',
    background: LANDSCAPE,
    clipPath: 'polygon(0 50%, 22% 0, 22% 30%, 78% 30%, 78% 0, 100% 50%, 78% 100%, 78% 70%, 22% 70%, 22% 100%)',
  }),
  box('clip-arrow-v', 'Mũi tên ↕', 'clip', {
    width: '56px',
    height: '120px',
    background: LANDSCAPE,
    clipPath: 'polygon(50% 0, 100% 22%, 70% 22%, 70% 78%, 100% 78%, 50% 100%, 0 78%, 30% 78%, 30% 22%, 0 22%)',
  }),
  box('clip-tag', 'Tag mũi tên', 'clip', {
    width: '120px',
    height: '56px',
    background: LANDSCAPE,
    clipPath: 'polygon(0 0, 78% 0, 100% 50%, 78% 100%, 0 100%)',
  }),
  box('clip-chevron', 'Chevron', 'clip', {
    width: '120px',
    height: '56px',
    background: LANDSCAPE,
    clipPath: 'polygon(0 0, 78% 0, 100% 50%, 78% 100%, 0 100%, 22% 50%)',
  }),
  box('clip-banner', 'Banner 2 đầu', 'clip', {
    width: '130px',
    height: '48px',
    background: LANDSCAPE,
    clipPath: 'polygon(12% 0, 88% 0, 100% 50%, 88% 100%, 12% 100%, 0 50%)',
  }),
  box('clip-capsule', 'Viên nang', 'clip', {
    width: '130px',
    height: '48px',
    background: LANDSCAPE,
    borderRadius: '999px',
  }),
  box('clip-speech', 'Bong bóng thoại', 'clip', {
    width: '110px',
    height: '80px',
    background: LANDSCAPE,
    clipPath: 'polygon(0 0, 100% 0, 100% 72%, 28% 72%, 18% 100%, 22% 72%, 0 72%)',
  }),
  box('clip-speech-round', 'Bong bóng tròn', 'clip', {
    width: '110px',
    height: '80px',
    background: LANDSCAPE,
    clipPath: 'ellipse(48% 40% at 50% 42%)',
  }),
  box('clip-heart', 'Trái tim', 'clip', {
    width: '88px',
    height: '88px',
    background: LANDSCAPE,
    clipPath:
      'polygon(50% 92%, 10% 55%, 5% 30%, 20% 8%, 40% 12%, 50% 28%, 60% 12%, 80% 8%, 95% 30%, 90% 55%)',
  }),
  box('clip-cross', 'Dấu cộng', 'clip', {
    width: '88px',
    height: '88px',
    background: LANDSCAPE,
    clipPath:
      'polygon(35% 0, 65% 0, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0 65%, 0 35%, 35% 35%)',
  }),
  box('clip-cloud', 'Đám mây', 'clip', {
    width: '110px',
    height: '72px',
    background: LANDSCAPE,
    clipPath:
      'polygon(28% 70%, 18% 55%, 12% 40%, 22% 22%, 38% 18%, 48% 8%, 62% 12%, 75% 8%, 88% 22%, 92% 40%, 85% 55%, 78% 70%, 60% 78%, 40% 78%)',
  }),
  box('clip-shield', 'Khiên', 'clip', {
    width: '80px',
    height: '96px',
    background: LANDSCAPE,
    clipPath: 'polygon(0 0, 100% 0, 100% 62%, 50% 100%, 0 62%)',
  }),
  box('clip-ribbon', 'Ruy băng', 'clip', {
    width: '100px',
    height: '88px',
    background: LANDSCAPE,
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)',
  }),
  box('clip-scallop-sq', 'Vuông lõm góc', 'clip', {
    width: '88px',
    height: '88px',
    background: LANDSCAPE,
    clipPath:
      'polygon(12% 0, 88% 0, 100% 12%, 100% 88%, 88% 100%, 12% 100%, 0 88%, 0 12%)',
  }),
  box('clip-bevel', 'Vuông vát', 'clip', {
    width: '88px',
    height: '88px',
    background: LANDSCAPE,
    clipPath: 'polygon(18% 0, 82% 0, 100% 18%, 100% 82%, 82% 100%, 18% 100%, 0 82%, 0 18%)',
  }),
  box('clip-peak', 'Huy hiệu đỉnh', 'clip', {
    width: '110px',
    height: '72px',
    background: LANDSCAPE,
    clipPath: 'polygon(0 20%, 50% 0, 100% 20%, 100% 80%, 50% 100%, 0 80%)',
  }),
  box('clip-para-r', 'Hình bình hành →', 'clip', {
    width: '120px',
    height: '56px',
    background: LANDSCAPE,
    clipPath: 'polygon(18% 0, 100% 0, 82% 100%, 0 100%)',
  }),
  box('clip-para-l', 'Hình bình hành ←', 'clip', {
    width: '120px',
    height: '56px',
    background: LANDSCAPE,
    clipPath: 'polygon(0 0, 82% 0, 100% 100%, 18% 100%)',
  }),
  box('clip-trap-up', 'Thang hẹp trên', 'clip', {
    width: '110px',
    height: '64px',
    background: LANDSCAPE,
    clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)',
  }),
  box('clip-trap-down', 'Thang hẹp dưới', 'clip', {
    width: '110px',
    height: '64px',
    background: LANDSCAPE,
    clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)',
  }),
  box('clip-u-bottom', 'U đáy', 'clip', {
    width: '88px',
    height: '100px',
    background: LANDSCAPE,
    borderRadius: '0 0 999px 999px',
  }),

  // —— Lưới (grids) ——
  box('grid-2x2', 'Lưới 2×2', 'clip', {
    width: '160px',
    height: '160px',
    background: '#f1f5f9',
    borderRadius: '8px',
    lpGrid: '2x2',
    lpGridImages: '[]',
  }),
  box('grid-1x2', 'Lưới 1×2', 'clip', {
    width: '160px',
    height: '80px',
    background: '#f1f5f9',
    borderRadius: '8px',
    lpGrid: '1x2',
    lpGridImages: '[]',
  }),
  box('grid-2x1', 'Lưới 2×1', 'clip', {
    width: '100px',
    height: '160px',
    background: '#f1f5f9',
    borderRadius: '8px',
    lpGrid: '2x1',
    lpGridImages: '[]',
  }),
  box('grid-3x1', 'Lưới 3×1', 'clip', {
    width: '200px',
    height: '72px',
    background: '#f1f5f9',
    borderRadius: '8px',
    lpGrid: '3x1',
    lpGridImages: '[]',
  }),
  box('grid-1x3', 'Lưới 1×3', 'clip', {
    width: '72px',
    height: '200px',
    background: '#f1f5f9',
    borderRadius: '8px',
    lpGrid: '1x3',
    lpGridImages: '[]',
  }),
];

/** Mark photo-frame presets (id prefix or explicit flag). */
export function isLandingPageFramePreset(preset: LandingPageBoxPreset): boolean {
  return Boolean(preset.style.lpFrame) || preset.id.startsWith('frame-');
}

export function isLandingPageGridPreset(preset: LandingPageBoxPreset): boolean {
  return Boolean(preset.style.lpGrid) || preset.id.startsWith('grid-');
}

export function isLandingPageBoxStyle(
  style: Record<string, unknown> | null | undefined,
): style is LandingPageBoxChromeStyle & Record<string, unknown> {
  return Boolean(style && typeof style.lpBox === 'string' && style.lpBox);
}

export function boxPreviewStyle(style: LandingPageBoxChromeStyle): CSSProperties {
  return {
    width: style.width || '88px',
    height: style.height || '56px',
    background: style.background || (style.backgroundImage ? 'transparent' : GRAY_SOFT),
    backgroundImage: style.backgroundImage,
    backgroundSize: style.backgroundSize || (style.backgroundImage ? 'contain' : undefined),
    backgroundRepeat: style.backgroundRepeat || (style.backgroundImage ? 'no-repeat' : undefined),
    backgroundPosition: style.backgroundPosition || (style.backgroundImage ? 'center' : undefined),
    border: style.border || 'none',
    borderRadius: style.borderRadius || '0',
    boxShadow: style.boxShadow,
    clipPath: style.clipPath,
    opacity: style.opacity,
    boxSizing: 'border-box',
    display: 'block',
    flexShrink: 0,
  };
}

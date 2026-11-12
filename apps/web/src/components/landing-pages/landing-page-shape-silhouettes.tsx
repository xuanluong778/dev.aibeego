'use client';

/**
 * Black silhouette shape catalog for «Hình dạng» (Canva-style groups).
 * Inserted via existing CTA shape-only engine (style.lpBox).
 */

import type { LandingPageBoxPreset } from './landing-page-box-presets';

export type LandingPageShapeGroupId =
  | 'lines'
  | 'basic'
  | 'polygons'
  | 'stars'
  | 'arrows'
  | 'flowchart'
  | 'bubbles'
  | 'clouds'
  | 'hearts'
  | 'banners'
  | 'teardrops'
  | 'gears'
  | 'square-stars'
  | 'natural'
  | 'abstract';

export type LandingPageShapeGroup = {
  id: LandingPageShapeGroupId;
  label: string;
};

export const LP_SHAPE_GROUPS: LandingPageShapeGroup[] = [
  { id: 'lines', label: 'Đường kẻ' },
  { id: 'basic', label: 'Hình dạng cơ bản' },
  { id: 'polygons', label: 'Đa giác' },
  { id: 'stars', label: 'Hình ngôi sao' },
  { id: 'arrows', label: 'Mũi tên' },
  { id: 'flowchart', label: 'Hình dạng sơ đồ quy trình' },
  { id: 'bubbles', label: 'Bong bóng trò chuyện' },
  { id: 'clouds', label: 'Đám mây' },
  { id: 'hearts', label: 'Hình trái tim' },
  { id: 'banners', label: 'Banner' },
  { id: 'teardrops', label: 'Giọt nước mắt' },
  { id: 'gears', label: 'Bánh răng' },
  { id: 'square-stars', label: 'Sao vuông' },
  { id: 'natural', label: 'Hình dạng tự nhiên' },
  { id: 'abstract', label: 'Hình dạng trừu tượng' },
];

const INK = '#0f172a';
const SZ = '72px';
const WIDE = '120px';
const TALL = '88px';

export type LandingPageShapeSilhouette = {
  id: string;
  label: string;
  group: LandingPageShapeGroupId;
  preset: LandingPageBoxPreset;
};

function sil(
  id: string,
  label: string,
  group: LandingPageShapeGroupId,
  style: Omit<LandingPageBoxPreset['style'], 'lpBox'> & { lpBox?: string },
): LandingPageShapeSilhouette {
  const preset: LandingPageBoxPreset = {
    id,
    label,
    category: 'clip',
    style: {
      width: SZ,
      height: SZ,
      background: INK,
      ...style,
      lpBox: style.lpBox || id,
    },
  };
  return { id, label, group, preset };
}

/** Solid black silhouettes matching reference rows. */
export const LP_SHAPE_SILHOUETTES: LandingPageShapeSilhouette[] = [
  // —— Đường kẻ ——
  sil('shape-line-solid', 'Đường liền', 'lines', {
    width: WIDE,
    height: '3px',
    borderRadius: '2px',
  }),
  sil('shape-line-dash', 'Đường đứt', 'lines', {
    width: WIDE,
    height: '0px',
    background: 'transparent',
    border: `2.5px dashed ${INK}`,
  }),
  sil('shape-line-dot', 'Đường chấm', 'lines', {
    width: WIDE,
    height: '0px',
    background: 'transparent',
    border: `2.5px dotted ${INK}`,
  }),
  sil('shape-line-arrow-fill', 'Mũi tên đặc', 'lines', {
    width: WIDE,
    height: '18px',
    clipPath: 'polygon(0 38%, 72% 38%, 72% 8%, 100% 50%, 72% 92%, 72% 62%, 0 62%)',
  }),
  sil('shape-line-arrow-open', 'Mũi tên mở', 'lines', {
    width: WIDE,
    height: '18px',
    clipPath: 'polygon(0 42%, 78% 42%, 78% 18%, 100% 50%, 78% 82%, 78% 58%, 0 58%)',
  }),

  // —— Cơ bản ——
  sil('shape-sq', 'Vuông', 'basic', { borderRadius: '2px' }),
  sil('shape-sq-round', 'Vuông bo', 'basic', { borderRadius: '16px' }),
  sil('shape-circle', 'Tròn', 'basic', { borderRadius: '999px' }),
  sil('shape-tri-up', 'Tam giác ↑', 'basic', {
    clipPath: 'polygon(50% 6%, 94% 90%, 6% 90%)',
  }),
  sil('shape-tri-down', 'Tam giác ↓', 'basic', {
    clipPath: 'polygon(6% 10%, 94% 10%, 50% 94%)',
  }),

  // —— Đa giác ——
  sil('shape-pentagon', 'Ngũ giác', 'polygons', {
    clipPath: 'polygon(50% 4%, 96% 38%, 78% 96%, 22% 96%, 4% 38%)',
  }),
  sil('shape-hex-flat', 'Lục giác ngang', 'polygons', {
    width: '88px',
    height: '72px',
    clipPath: 'polygon(22% 0, 78% 0, 100% 50%, 78% 100%, 22% 100%, 0 50%)',
  }),
  sil('shape-hex-point', 'Lục giác dọc', 'polygons', {
    width: '72px',
    height: '88px',
    clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)',
  }),
  sil('shape-octagon', 'Bát giác', 'polygons', {
    clipPath:
      'polygon(30% 0, 70% 0, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0 70%, 0 30%)',
  }),
  sil('shape-nonagon', 'Đa giác', 'polygons', {
    clipPath:
      'polygon(50% 2%, 78% 12%, 96% 38%, 92% 68%, 70% 94%, 50% 100%, 30% 94%, 8% 68%, 4% 38%, 22% 12%)',
  }),

  // —— Ngôi sao ——
  sil('shape-star4', 'Sao 4', 'stars', {
    clipPath: 'polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)',
  }),
  sil('shape-star5', 'Sao 5', 'stars', {
    clipPath:
      'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  }),
  sil('shape-star6', 'Sao 6', 'stars', {
    clipPath:
      'polygon(50% 0%, 66% 25%, 98% 25%, 78% 50%, 98% 75%, 66% 75%, 50% 100%, 34% 75%, 2% 75%, 22% 50%, 2% 25%, 34% 25%)',
  }),
  sil('shape-star8', 'Sao 8', 'stars', {
    clipPath:
      'polygon(50% 0%, 63% 20%, 85% 15%, 80% 37%, 100% 50%, 80% 63%, 85% 85%, 63% 80%, 50% 100%, 37% 80%, 15% 85%, 20% 63%, 0% 50%, 20% 37%, 15% 15%, 37% 20%)',
  }),
  sil('shape-burst', 'Burst', 'stars', {
    clipPath:
      'polygon(50% 0%, 56% 16%, 72% 8%, 68% 24%, 88% 28%, 74% 40%, 92% 52%, 72% 54%, 76% 72%, 58% 62%, 50% 82%, 42% 62%, 24% 72%, 28% 54%, 8% 52%, 26% 40%, 12% 28%, 32% 24%, 28% 8%, 44% 16%)',
  }),

  // —— Mũi tên ——
  sil('shape-arrow-r', 'Mũi tên phải', 'arrows', {
    width: WIDE,
    height: '48px',
    clipPath: 'polygon(0 28%, 62% 28%, 62% 0, 100% 50%, 62% 100%, 62% 72%, 0 72%)',
  }),
  sil('shape-arrow-l', 'Mũi tên trái', 'arrows', {
    width: WIDE,
    height: '48px',
    clipPath: 'polygon(38% 0, 38% 28%, 100% 28%, 100% 72%, 38% 72%, 38% 100%, 0 50%)',
  }),
  sil('shape-arrow-u', 'Mũi tên lên', 'arrows', {
    width: '48px',
    height: TALL,
    clipPath: 'polygon(50% 0, 100% 38%, 72% 38%, 72% 100%, 28% 100%, 28% 38%, 0 38%)',
  }),
  sil('shape-arrow-d', 'Mũi tên xuống', 'arrows', {
    width: '48px',
    height: TALL,
    clipPath: 'polygon(28% 0, 72% 0, 72% 62%, 100% 62%, 50% 100%, 0 62%, 28% 62%)',
  }),
  sil('shape-arrow-h2', 'Mũi tên 2 chiều', 'arrows', {
    width: WIDE,
    height: '40px',
    clipPath:
      'polygon(0 50%, 18% 8%, 18% 32%, 82% 32%, 82% 8%, 100% 50%, 82% 92%, 82% 68%, 18% 68%, 18% 92%)',
  }),

  // —— Flowchart ——
  sil('shape-flow-hex', 'Lục giác quy trình', 'flowchart', {
    width: '100px',
    height: '56px',
    clipPath: 'polygon(18% 0, 82% 0, 100% 50%, 82% 100%, 18% 100%, 0 50%)',
  }),
  sil('shape-flow-pill', 'Viên nang', 'flowchart', {
    width: '110px',
    height: '44px',
    borderRadius: '999px',
  }),
  sil('shape-flow-round-rect', 'Chữ nhật bo', 'flowchart', {
    width: '110px',
    height: '52px',
    borderRadius: '14px',
  }),
  sil('shape-flow-diamond', 'Hình thoi', 'flowchart', {
    clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
  }),
  sil('shape-flow-doc', 'Tài liệu', 'flowchart', {
    width: '72px',
    height: '88px',
    clipPath: 'polygon(0 0, 100% 0, 100% 78%, 75% 88%, 50% 78%, 25% 88%, 0 78%)',
  }),

  // —— Bubbles ——
  sil('shape-bubble-rect', 'Bong bóng chữ nhật', 'bubbles', {
    width: '100px',
    height: '72px',
    clipPath: 'polygon(0 0, 100% 0, 100% 68%, 28% 68%, 18% 100%, 22% 68%, 0 68%)',
  }),
  sil('shape-bubble-oval', 'Bong bóng oval', 'bubbles', {
    width: '100px',
    height: '72px',
    borderRadius: '50%',
    clipPath: 'ellipse(48% 40% at 50% 42%)',
  }),
  sil('shape-bubble-thought', 'Bong bóng suy nghĩ', 'bubbles', {
    width: '100px',
    height: '80px',
    clipPath:
      'polygon(18% 18%, 32% 8%, 50% 12%, 68% 6%, 84% 16%, 92% 34%, 88% 52%, 74% 62%, 58% 58%, 42% 64%, 26% 56%, 14% 42%, 12% 28%)',
  }),
  sil('shape-bubble-round', 'Bong bóng bo', 'bubbles', {
    width: '100px',
    height: '72px',
    borderRadius: '18px',
    clipPath: 'polygon(6% 8%, 94% 8%, 94% 62%, 34% 62%, 22% 92%, 28% 62%, 6% 62%)',
  }),
  sil('shape-bubble-circle', 'Bong bóng tròn', 'bubbles', {
    borderRadius: '999px',
    clipPath: 'polygon(8% 12%, 92% 12%, 92% 62%, 42% 62%, 28% 92%, 36% 62%, 8% 62%)',
  }),

  // —— Clouds ——
  sil('shape-cloud-1', 'Mây 1', 'clouds', {
    width: '100px',
    height: '64px',
    clipPath:
      'polygon(12% 55%, 18% 38%, 32% 28%, 42% 18%, 58% 14%, 72% 22%, 84% 34%, 92% 48%, 88% 68%, 72% 78%, 48% 82%, 28% 76%, 14% 68%)',
  }),
  sil('shape-cloud-2', 'Mây 2', 'clouds', {
    width: '100px',
    height: '58px',
    borderRadius: '40% 40% 40% 40% / 60% 60% 40% 40%',
  }),
  sil('shape-cloud-3', 'Mây 3', 'clouds', {
    width: '110px',
    height: '56px',
    clipPath:
      'polygon(8% 60%, 14% 42%, 28% 32%, 40% 22%, 55% 18%, 70% 24%, 82% 36%, 90% 52%, 86% 72%, 70% 82%, 45% 86%, 22% 78%, 10% 70%)',
  }),
  sil('shape-cloud-4', 'Mây 4', 'clouds', {
    width: '96px',
    height: '52px',
    clipPath:
      'polygon(10% 50%, 20% 30%, 38% 22%, 55% 16%, 72% 24%, 86% 38%, 90% 58%, 78% 74%, 55% 80%, 32% 76%, 14% 66%)',
  }),
  sil('shape-cloud-5', 'Mây 5', 'clouds', {
    width: '104px',
    height: '60px',
    clipPath:
      'polygon(15% 48%, 22% 28%, 40% 18%, 58% 12%, 75% 20%, 88% 36%, 92% 55%, 84% 72%, 62% 80%, 38% 78%, 18% 66%)',
  }),

  // —— Hearts ——
  sil('shape-heart-1', 'Tim 1', 'hearts', {
    clipPath:
      'polygon(50% 92%, 8% 55%, 8% 32%, 22% 18%, 38% 18%, 50% 30%, 62% 18%, 78% 18%, 92% 32%, 92% 55%)',
  }),
  sil('shape-heart-2', 'Tim 2', 'hearts', {
    width: '80px',
    height: '72px',
    clipPath:
      'polygon(50% 95%, 5% 52%, 5% 28%, 20% 12%, 40% 14%, 50% 28%, 60% 14%, 80% 12%, 95% 28%, 95% 52%)',
  }),
  sil('shape-heart-3', 'Tim 3', 'hearts', {
    width: '68px',
    height: '80px',
    clipPath:
      'polygon(50% 90%, 12% 55%, 10% 30%, 25% 14%, 42% 16%, 50% 28%, 58% 16%, 75% 14%, 90% 30%, 88% 55%)',
  }),
  sil('shape-heart-4', 'Tim 4', 'hearts', {
    clipPath:
      'polygon(50% 88%, 15% 58%, 12% 35%, 26% 20%, 40% 22%, 50% 34%, 60% 22%, 74% 20%, 88% 35%, 85% 58%)',
  }),
  sil('shape-heart-5', 'Tim 5', 'hearts', {
    width: '84px',
    height: '70px',
    clipPath:
      'polygon(50% 94%, 6% 50%, 10% 26%, 28% 12%, 45% 18%, 50% 30%, 55% 18%, 72% 12%, 90% 26%, 94% 50%)',
  }),

  // —— Banners ——
  sil('shape-banner-notch', 'Banner 2 đầu', 'banners', {
    width: WIDE,
    height: '40px',
    clipPath: 'polygon(0 0, 100% 0, 88% 50%, 100% 100%, 0 100%, 12% 50%)',
  }),
  sil('shape-banner-chevron', 'Banner nhọn', 'banners', {
    width: '56px',
    height: TALL,
    clipPath: 'polygon(0 0, 100% 0, 100% 72%, 50% 100%, 0 72%)',
  }),
  sil('shape-banner-bookmark', 'Banner bookmark', 'banners', {
    width: '52px',
    height: TALL,
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)',
  }),
  sil('shape-banner-tall', 'Banner dài', 'banners', {
    width: '40px',
    height: '110px',
    clipPath: 'polygon(0 0, 100% 0, 100% 82%, 50% 100%, 0 82%)',
  }),
  sil('shape-banner-round', 'Banner bo đáy', 'banners', {
    width: '56px',
    height: TALL,
    borderRadius: '6px 6px 999px 999px',
  }),

  // —— Teardrops ——
  sil('shape-drop-1', 'Giọt 1', 'teardrops', {
    clipPath: 'polygon(50% 0, 92% 62%, 78% 92%, 50% 100%, 22% 92%, 8% 62%)',
  }),
  sil('shape-drop-2', 'Giọt 2', 'teardrops', {
    borderRadius: '50% 50% 50% 50% / 15% 15% 70% 70%',
  }),
  sil('shape-drop-3', 'Giọt 3', 'teardrops', {
    clipPath: 'ellipse(42% 48% at 50% 55%)',
    borderRadius: '50% 50% 50% 0',
  }),
  sil('shape-drop-4', 'Giọt 4', 'teardrops', {
    width: '64px',
    height: '88px',
    clipPath: 'polygon(50% 2%, 88% 55%, 72% 95%, 50% 88%, 28% 95%, 12% 55%)',
  }),
  sil('shape-drop-5', 'Giọt 5', 'teardrops', {
    clipPath: 'polygon(58% 0, 95% 58%, 70% 100%, 35% 92%, 8% 55%, 28% 22%)',
  }),

  // —— Gears ——
  sil('shape-gear-1', 'Bánh răng 1', 'gears', {
    clipPath:
      'polygon(50% 0, 58% 10%, 72% 6%, 76% 18%, 90% 22%, 86% 34%, 98% 42%, 90% 52%, 98% 62%, 86% 68%, 90% 80%, 76% 82%, 72% 94%, 58% 90%, 50% 100%, 42% 90%, 28% 94%, 24% 82%, 10% 80%, 14% 68%, 2% 62%, 10% 52%, 2% 42%, 14% 34%, 10% 22%, 24% 18%, 28% 6%, 42% 10%)',
  }),
  sil('shape-gear-2', 'Bánh răng 2', 'gears', {
    clipPath:
      'polygon(50% 2%, 60% 12%, 74% 8%, 80% 20%, 94% 26%, 88% 38%, 100% 48%, 88% 58%, 94% 72%, 80% 76%, 74% 90%, 60% 86%, 50% 98%, 40% 86%, 26% 90%, 20% 76%, 6% 72%, 12% 58%, 0 48%, 12% 38%, 6% 26%, 20% 20%, 26% 8%, 40% 12%)',
  }),
  sil('shape-gear-3', 'Bánh răng 3', 'gears', {
    borderRadius: '30%',
    clipPath:
      'polygon(48% 0, 56% 8%, 68% 4%, 74% 14%, 88% 14%, 88% 26%, 98% 32%, 94% 44%, 100% 52%, 94% 60%, 98% 72%, 88% 76%, 88% 88%, 74% 88%, 68% 98%, 56% 94%, 48% 100%, 40% 94%, 28% 98%, 22% 88%, 10% 88%, 10% 76%, 2% 72%, 6% 60%, 0 52%, 6% 44%, 2% 32%, 10% 26%, 10% 14%, 22% 14%, 28% 4%, 40% 8%)',
  }),
  sil('shape-gear-4', 'Bánh răng 4', 'gears', {
    clipPath:
      'polygon(50% 0%, 61% 8%, 75% 4%, 82% 16%, 96% 20%, 92% 34%, 100% 45%, 92% 56%, 96% 70%, 82% 74%, 75% 88%, 61% 84%, 50% 96%, 39% 84%, 25% 88%, 18% 74%, 4% 70%, 8% 56%, 0% 45%, 8% 34%, 4% 20%, 18% 16%, 25% 4%, 39% 8%)',
  }),
  sil('shape-gear-5', 'Bánh răng 5', 'gears', {
    borderRadius: '40%',
    boxShadow: `inset 0 0 0 14px ${INK}, inset 0 0 0 22px #fff`,
  }),

  // —— Square / geometric stars ——
  sil('shape-sqstar-thin', 'Sao tia', 'square-stars', {
    clipPath:
      'polygon(50% 0, 54% 40%, 100% 50%, 54% 60%, 50% 100%, 46% 60%, 0 50%, 46% 40%)',
  }),
  sil('shape-sqstar-chunk', 'Sao dày', 'square-stars', {
    clipPath:
      'polygon(50% 0, 62% 28%, 95% 28%, 70% 48%, 80% 82%, 50% 62%, 20% 82%, 30% 48%, 5% 28%, 38% 28%)',
  }),
  sil('shape-sqstar-5', 'Sao hình học', 'square-stars', {
    clipPath:
      'polygon(50% 5%, 65% 35%, 98% 38%, 72% 58%, 80% 92%, 50% 74%, 20% 92%, 28% 58%, 2% 38%, 35% 35%)',
  }),
  sil('shape-sqstar-8', 'Sao 8 cánh', 'square-stars', {
    clipPath:
      'polygon(50% 0, 60% 25%, 85% 15%, 75% 40%, 100% 50%, 75% 60%, 85% 85%, 60% 75%, 50% 100%, 40% 75%, 15% 85%, 25% 60%, 0 50%, 25% 40%, 15% 15%, 40% 25%)',
  }),
  sil('shape-sqstar-cross', 'Sao chữ thập', 'square-stars', {
    clipPath:
      'polygon(35% 0, 65% 0, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0 65%, 0 35%, 35% 35%)',
  }),

  // —— Natural ——
  sil('shape-flower-6', 'Hoa 6 cánh', 'natural', {
    clipPath:
      'polygon(50% 8%, 62% 28%, 88% 22%, 78% 45%, 95% 58%, 72% 62%, 72% 88%, 50% 72%, 28% 88%, 28% 62%, 5% 58%, 22% 45%, 12% 22%, 38% 28%)',
  }),
  sil('shape-flower-5', 'Hoa 5 cánh', 'natural', {
    clipPath:
      'polygon(50% 5%, 62% 32%, 92% 28%, 75% 52%, 88% 80%, 50% 65%, 12% 80%, 25% 52%, 8% 28%, 38% 32%)',
  }),
  sil('shape-flower-round', 'Hoa tròn', 'natural', {
    borderRadius: '40%',
    boxShadow: `12px 0 0 -2px ${INK}, -12px 0 0 -2px ${INK}, 0 12px 0 -2px ${INK}, 0 -12px 0 -2px ${INK}, 9px 9px 0 -2px ${INK}, -9px 9px 0 -2px ${INK}, 9px -9px 0 -2px ${INK}, -9px -9px 0 -2px ${INK}`,
  }),
  sil('shape-clover', 'Cỏ 4 lá', 'natural', {
    clipPath:
      'polygon(50% 48%, 28% 18%, 18% 8%, 8% 22%, 18% 38%, 35% 48%, 18% 58%, 8% 72%, 22% 88%, 38% 78%, 50% 55%, 62% 78%, 78% 88%, 92% 72%, 82% 58%, 65% 48%, 82% 38%, 92% 22%, 78% 8%, 62% 18%)',
  }),
  sil('shape-leaf-nat', 'Lá tự nhiên', 'natural', {
    width: '64px',
    height: '96px',
    borderRadius: '80% 0 80% 0',
  }),

  // —— Abstract ——
  sil('shape-abs-squircle', 'Squircle lõm', 'abstract', {
    clipPath:
      'polygon(12% 0, 88% 0, 100% 12%, 100% 88%, 88% 100%, 12% 100%, 0 88%, 0 12%, 18% 28%, 28% 18%)',
    borderRadius: '28%',
  }),
  sil('shape-abs-bowl', 'Bát cong', 'abstract', {
    width: '100px',
    height: '56px',
    borderRadius: '8px 8px 50% 50%',
  }),
  sil('shape-abs-crescent', 'Lưỡi liềm', 'abstract', {
    borderRadius: '999px',
    boxShadow: `18px 0 0 -2px #fff, 18px 0 0 0 ${INK}`,
    background: INK,
  }),
  sil('shape-abs-wave', 'Sóng Z', 'abstract', {
    width: '100px',
    height: '56px',
    clipPath: 'polygon(0 20%, 35% 20%, 55% 70%, 100% 70%, 100% 90%, 45% 90%, 25% 40%, 0 40%)',
  }),
  sil('shape-abs-poly', 'Polygon nhọn', 'abstract', {
    clipPath: 'polygon(8% 30%, 35% 5%, 78% 12%, 98% 48%, 72% 95%, 28% 88%, 2% 58%)',
  }),
];

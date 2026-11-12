'use client';

/**
 * «Ảnh» category presets — real stock photos + visible watercolor/texture/sticker assets.
 * Inserted as CTA shape-only blocks; free-drag / resize / rotate via existing engine.
 */

import type { LandingPageBoxPreset } from './landing-page-box-presets';

export type LandingPagePhotoGroupId =
  | 'tools'
  | 'suggested'
  | 'trending'
  | 'watercolor'
  | 'textures'
  | 'lifestyle'
  | 'stickers'
  | 'florals';

export type LandingPagePhotoGroup = {
  id: LandingPagePhotoGroupId;
  label: string;
};

export const LP_PHOTO_GROUPS: LandingPagePhotoGroup[] = [
  { id: 'suggested', label: 'Đề xuất' },
  { id: 'trending', label: 'Thịnh hành' },
  { id: 'watercolor', label: 'Màu nước' },
  { id: 'textures', label: 'Texture & giấy' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'stickers', label: 'Sticker' },
  { id: 'florals', label: 'Hoa & lá' },
];

export type LandingPagePhotoPreset = {
  id: string;
  label: string;
  group: LandingPagePhotoGroupId;
  premium?: boolean;
  preset: LandingPageBoxPreset;
};

function svgUri(svg: string): string {
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}")`;
}

function u(id: string, w = 400): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
}

function photo(
  id: string,
  label: string,
  group: LandingPagePhotoGroupId,
  style: LandingPageBoxPreset['style'],
  premium?: boolean,
): LandingPagePhotoPreset {
  return {
    id,
    label,
    group,
    premium,
    preset: {
      id,
      label,
      category: 'clip',
      style: {
        width: '120px',
        height: '88px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(15,23,42,0.14)',
        ...style,
        lpBox: style.lpBox || id,
      },
    },
  };
}

/** Real photo thumbnail (visible in library + on canvas). */
function stock(
  id: string,
  label: string,
  group: LandingPagePhotoGroupId,
  unsplashPath: string,
  opts?: { premium?: boolean; w?: string; h?: string; portrait?: boolean },
): LandingPagePhotoPreset {
  return photo(
    id,
    label,
    group,
    {
      lpBox: id,
      width: opts?.w || (opts?.portrait ? '72px' : '120px'),
      height: opts?.h || (opts?.portrait ? '110px' : '88px'),
      background: '#e4e4e7',
      backgroundImage: `url(${u(unsplashPath)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      borderRadius: '8px',
    },
    opts?.premium,
  );
}

function wash(
  id: string,
  label: string,
  group: LandingPagePhotoGroupId,
  background: string,
  opts?: {
    premium?: boolean;
    w?: string;
    h?: string;
    backgroundSize?: string;
  },
): LandingPagePhotoPreset {
  return photo(
    id,
    label,
    group,
    {
      lpBox: id,
      width: opts?.w || '120px',
      height: opts?.h || '88px',
      background,
      backgroundSize: opts?.backgroundSize,
      border: '1px solid rgba(15,23,42,0.08)',
    },
    opts?.premium,
  );
}

function sticker(
  id: string,
  label: string,
  group: LandingPagePhotoGroupId,
  svg: string,
  size = '88px',
  premium?: boolean,
): LandingPagePhotoPreset {
  return photo(
    id,
    label,
    group,
    {
      lpBox: id,
      width: size,
      height: size,
      background: '#fafafa',
      backgroundImage: svgUri(svg),
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      borderRadius: '8px',
      border: '1px solid #e4e4e7',
      boxShadow: 'none',
    },
    premium,
  );
}

/** Visible photo / texture catalog for box «Ảnh». */
export const LP_PHOTO_PRESETS: LandingPagePhotoPreset[] = [
  // —— Đề xuất ——
  stock('ph-suggest-abstract-pink', 'Hồng abstract', 'suggested', 'photo-1557683316-973673baf926'),
  stock('ph-suggest-soft-peach', 'Peach soft', 'suggested', 'photo-1558591710-4b4a1ae0f04d'),
  stock('ph-suggest-lavender', 'Lavender mist', 'suggested', 'photo-1579546929518-9e396f3cc809'),
  stock('ph-suggest-coral', 'Coral wash', 'suggested', 'photo-1614850523459-c2f4c699c52e'),
  stock('ph-suggest-bloom', 'Hoa pastel', 'suggested', 'photo-1490750967868-88aa4486c946', {
    portrait: true,
  }),
  stock('ph-suggest-sky', 'Trời xanh', 'suggested', 'photo-1504608524841-42fe6f032b4b'),

  // —— Thịnh hành ——
  stock('ph-trend-ripple', 'Sóng nước', 'trending', 'photo-1505142468610-359e7d316be0', {
    premium: true,
  }),
  stock('ph-trend-brunch', 'Bàn brunch', 'trending', 'photo-1495474472287-4d71bcdd2085', {
    premium: true,
  }),
  stock('ph-trend-reeds', 'Cỏ biển', 'trending', 'photo-1507525428034-b723cf961d3e', {
    premium: true,
    portrait: true,
  }),
  stock('ph-trend-beach', 'Bờ biển', 'trending', 'photo-1507525428034-b723cf961d3e', {
    premium: true,
    portrait: true,
  }),
  stock('ph-trend-coast', 'Hoàng hôn biển', 'trending', 'photo-1507525428034-b723cf961d3e', {
    premium: true,
  }),
  stock('ph-trend-coast2', 'Hoàng hôn đá', 'trending', 'photo-1469474968028-56623f02e42e', {
    premium: true,
  }),
  sticker(
    'ph-trend-stars',
    'Sao sticker',
    'trending',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 64"><g fill="#f5f5f4" stroke="#0f172a" stroke-width="3"><path d="M22 8l4 12h12l-10 8 4 12-10-7-10 7 4-12-10-8h12z"/><path d="M62 4l5 14h14l-11 9 4 14-12-8-12 8 4-14-11-9h14z"/><path d="M102 10l3 10h10l-8 6 3 10-8-6-8 6 3-10-8-6h10z"/></g></svg>`,
    '110px',
    true,
  ),
  stock('ph-trend-bokeh', 'Hoa bokeh', 'trending', 'photo-1490750967868-88aa4486c946'),
  stock('ph-trend-latte', 'Latte & bánh', 'trending', 'photo-1495474472287-4d71bcdd2085', {
    portrait: true,
  }),
  stock('ph-trend-candle', 'Nến ấm', 'trending', 'photo-1602607388654-da61bcb3bbcf', {
    portrait: true,
  }),
  stock('ph-trend-strawberries', 'Dâu tây', 'trending', 'photo-1464965911861-746a04b4bca6', {
    premium: true,
  }),
  stock('ph-trend-sunflare', 'Lá nắng', 'trending', 'photo-1441974231531-c6227db76b6e', {
    premium: true,
  }),

  // —— Màu nước (CSS washes — saturated so thumbnails show) ——
  wash(
    'ph-wc-pink1',
    'Hồng wash 1',
    'watercolor',
    'radial-gradient(ellipse at 25% 20%, #fb7185 0%, #fda4af 35%, #ffe4e6 70%, #fff1f2 100%)',
    { w: '72px', h: '110px' },
  ),
  wash(
    'ph-wc-pink2',
    'Hồng vàng',
    'watercolor',
    'radial-gradient(ellipse at 50% 40%, #fef08a 0%, transparent 40%), radial-gradient(ellipse at 20% 80%, #fb7185 0%, #fecdd3 50%, #fff 100%)',
  ),
  wash(
    'ph-wc-peach',
    'Peach wash',
    'watercolor',
    'radial-gradient(ellipse at 30% 30%, #fdba74 0%, #fb923c 40%, #fed7aa 75%, #fff7ed 100%)',
  ),
  wash(
    'ph-wc-lavender',
    'Lavender',
    'watercolor',
    'radial-gradient(ellipse at 40% 20%, #c4b5fd 0%, #a78bfa 35%, #ede9fe 70%, #f5f3ff 100%)',
  ),
  wash(
    'ph-wc-mint',
    'Mint wash',
    'watercolor',
    'radial-gradient(ellipse at 60% 30%, #6ee7b7 0%, #a7f3d0 40%, #ecfdf5 80%, #fff 100%)',
  ),
  wash(
    'ph-wc-purple',
    'Tím đậm',
    'watercolor',
    'radial-gradient(ellipse at 50% 0%, #e879f9 0%, #a21caf 45%, #4a044e 100%)',
    { premium: true },
  ),
  wash(
    'ph-wc-blue',
    'Xanh mist',
    'watercolor',
    'radial-gradient(ellipse at 30% 40%, #38bdf8 0%, #7dd3fc 40%, #e0f2fe 80%, #fff 100%)',
  ),
  wash(
    'ph-wc-multi',
    'Vàng hồng xanh',
    'watercolor',
    'linear-gradient(120deg, #fde047 0%, #fb7185 40%, #60a5fa 100%)',
  ),
  wash(
    'ph-wc-magenta',
    'Magenta',
    'watercolor',
    'radial-gradient(circle at 40% 40%, #f472b6, #db2777 55%, #831843)',
    { premium: true },
  ),
  wash(
    'ph-wc-dark-red',
    'Đỏ tối',
    'watercolor',
    'radial-gradient(ellipse at 50% 30%, #ef4444 0%, #7f1d1d 55%, #1c1917 100%)',
    { premium: true },
  ),
  wash(
    'ph-wc-earth',
    'Đất & vàng',
    'watercolor',
    'linear-gradient(135deg, #a16207 0%, #78350f 40%, #44403c 100%)',
    { premium: true },
  ),
  wash(
    'ph-wc-sky-v',
    'Trời dọc',
    'watercolor',
    'linear-gradient(180deg, #38bdf8 0%, #bae6fd 45%, #fff 100%)',
    { w: '72px', h: '110px' },
  ),
  wash(
    'ph-wc-strokes',
    'Nét cọ peach',
    'watercolor',
    'linear-gradient(90deg, transparent 10%, #fdba74 12% 28%, transparent 30%), linear-gradient(90deg, transparent 40%, #fb923c 42% 55%, transparent 57%), linear-gradient(#fff7ed, #fff7ed)',
  ),
  stock('ph-wc-stock-pink', 'Màu nước stock', 'watercolor', 'photo-1557683316-973673baf926', {
    premium: true,
  }),
  stock('ph-wc-stock-blue', 'Xanh abstract', 'watercolor', 'photo-1557682250-33bd709cbe85', {
    premium: true,
  }),

  // —— Texture & giấy ——
  stock('ph-tex-crumple', 'Giấy nhăn', 'textures', 'photo-1516541196182-6bdb0516ed27'),
  stock('ph-tex-marble', 'Marble trắng', 'textures', 'photo-1618221195710-dd6b41faaea6'),
  stock('ph-tex-kraft', 'Kraft', 'textures', 'photo-1586075010923-2dd457ba0392'),
  stock('ph-tex-concrete', 'Bê tông', 'textures', 'photo-1545235617-9465d2a55698'),
  stock('ph-tex-fabric', 'Vải kem', 'textures', 'photo-1558618666-fcd25c85f82e'),
  stock('ph-tex-wood', 'Gỗ sáng', 'textures', 'photo-1516541196182-6bdb0516ed27'),
  wash(
    'ph-tex-grid',
    'Giấy ô',
    'textures',
    'linear-gradient(#d4d4d8 1px, transparent 1px), linear-gradient(90deg, #d4d4d8 1px, transparent 1px), #fafafa',
    { backgroundSize: '16px 16px, 16px 16px, auto' },
  ),
  wash(
    'ph-tex-lined',
    'Vở kẻ xanh',
    'textures',
    'repeating-linear-gradient(transparent 0 22px, #93c5fd 22px 23px), #eff6ff',
  ),
  wash(
    'ph-tex-gingham-pink',
    'Caro hồng',
    'textures',
    'repeating-linear-gradient(90deg, #fda4af 0 10px, #fff 10px 20px), repeating-linear-gradient(#fda4af 0 10px, #fff 10px 20px)',
  ),
  wash(
    'ph-tex-gingham-green',
    'Caro xanh',
    'textures',
    'repeating-linear-gradient(90deg, #86efac 0 10px, #fff 10px 20px), repeating-linear-gradient(#86efac 0 10px, #fff 10px 20px)',
  ),
  wash(
    'ph-tex-noise-dark',
    'Hạt tối',
    'textures',
    'radial-gradient(circle, #52525b 1.2px, transparent 1.2px), #18181b',
    { premium: true, backgroundSize: '6px 6px, auto' },
  ),
  wash(
    'ph-tex-aged',
    'Giấy cổ',
    'textures',
    'radial-gradient(ellipse at 20% 30%, #a16207aa, transparent 50%), radial-gradient(ellipse at 80% 70%, #78350f88, transparent 45%), #e7d3a8',
  ),
  stock('ph-tex-parchment', 'Parchment', 'textures', 'photo-1586075010923-2dd457ba0392'),
  stock('ph-tex-pink-linen', 'Vải hồng', 'textures', 'photo-1558618666-fcd25c85f82e'),

  // —— Lifestyle ——
  stock('ph-life-workspace', 'Bàn làm việc', 'lifestyle', 'photo-1498050108023-c5249f4df085', {
    premium: true,
  }),
  stock('ph-life-desk-flat', 'Flat lay bàn', 'lifestyle', 'photo-1486312338219-ce68d2c6f44d', {
    premium: true,
  }),
  stock('ph-life-coffee', 'Cà phê tay', 'lifestyle', 'photo-1495474472287-4d71bcdd2085', {
    portrait: true,
  }),
  stock('ph-life-canal', 'Kênh Amsterdam', 'lifestyle', 'photo-1534351590666-13e3c462af2f', {
    premium: true,
    portrait: true,
  }),
  stock('ph-life-lemons', 'Chanh nắng', 'lifestyle', 'photo-1590502593747-42a451730859', {
    premium: true,
  }),
  stock('ph-life-pink-arch', 'Kiến trúc hồng', 'lifestyle', 'photo-1511818966892-d7d671e672a2', {
    premium: true,
  }),
  stock('ph-life-sky', 'Mây trời', 'lifestyle', 'photo-1504608524841-42fe6f032b4b', {
    portrait: true,
  }),
  stock('ph-life-rainbow', 'Cầu vồng', 'lifestyle', 'photo-1504608524841-42fe6f032b4b', {
    premium: true,
    portrait: true,
  }),
  stock('ph-life-sunset-birds', 'Hoàng hôn', 'lifestyle', 'photo-1495616811223-4d98c6e9c869', {
    portrait: true,
  }),
  stock('ph-life-shadow', 'Bóng cành', 'lifestyle', 'photo-1516541196182-6bdb0516ed27', {
    premium: true,
  }),
  stock('ph-life-plane', 'Cửa sổ máy bay', 'lifestyle', 'photo-1436491865332-7a61a109cc05'),
  stock('ph-life-skyscraper', 'Tòa nhà', 'lifestyle', 'photo-1486406146926-c627a92ad1ab'),
  stock('ph-life-tulips', 'Tulip sweater', 'lifestyle', 'photo-1490750967868-88aa4486c946', {
    premium: true,
  }),
  stock('ph-life-books', 'Chồng sách', 'lifestyle', 'photo-1512820790803-83ca734da794'),
  stock('ph-life-polaroid', 'Polaroid tường', 'lifestyle', 'photo-1452587925148-ce544e77e70d'),
  stock('ph-life-open-book', 'Sách mở', 'lifestyle', 'photo-1512820790803-83ca734da794'),
  stock('ph-life-minimal-room', 'Phòng tối giản', 'lifestyle', 'photo-1586023492125-27b2c045efd7', {
    premium: true,
  }),
  stock('ph-life-shells', 'Vỏ sò cát', 'lifestyle', 'photo-1507525428034-b723cf961d3e', {
    premium: true,
    portrait: true,
  }),
  stock('ph-life-watering', 'Bình tưới hoa', 'lifestyle', 'photo-1416879595882-3373a0480b5b', {
    premium: true,
  }),
  stock('ph-life-jewelry', 'Trang sức', 'lifestyle', 'photo-1515562141207-7a88fb7ce338', {
    premium: true,
    portrait: true,
  }),
  stock('ph-suggest-mesh', 'Mesh gradient', 'suggested', 'photo-1618005182384-a83a8bd57fbe'),
  stock('ph-suggest-waves', 'Sóng soft', 'suggested', 'photo-1557682224-5b8590cd9ec5'),
  stock('ph-trend-coffee-sun', 'Cà phê nắng', 'trending', 'photo-1495474472287-4d71bcdd2085'),
  stock('ph-trend-white-bloom', 'Hoa trắng', 'trending', 'photo-1496060169242-812dad1aa528'),

  // —— Stickers ——
  sticker(
    'ph-st-washi-blue',
    'Washi caro xanh',
    'stickers',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 36"><defs><pattern id="g" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#eff6ff"/><rect width="4" height="4" fill="#60a5fa"/><rect x="4" y="4" width="4" height="4" fill="#60a5fa"/></pattern></defs><path d="M4 8l6-6h120l6 6v20l-6 6H10l-6-6z" fill="url(#g)" stroke="#2563eb" stroke-width="2"/></svg>`,
    '120px',
    true,
  ),
  sticker(
    'ph-st-lace',
    'Ren trắng',
    'stickers',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 28"><path d="M0 14c8-10 16 10 24 0s16 10 24 0 16 10 24 0 16 10 24 0 16 10 24 0 16 10 20 0" fill="none" stroke="#94a3b8" stroke-width="3"/><path d="M0 18c8-8 16 8 24 0s16 8 24 0 16 8 24 0 16 8 24 0 16 8 24 0 16 8 20 0" fill="none" stroke="#cbd5e1" stroke-width="2"/></svg>`,
    '120px',
    true,
  ),
  sticker(
    'ph-st-notes',
    'Nốt nhạc giấy',
    'stickers',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80"><rect x="8" y="10" width="84" height="60" rx="4" fill="#d6b88a" stroke="#0f172a" stroke-width="2"/><path d="M35 55v-28l28 4v28" fill="none" stroke="#0f172a" stroke-width="3"/><circle cx="35" cy="55" r="6" fill="#0f172a"/><circle cx="63" cy="59" r="6" fill="#0f172a"/></svg>`,
    '96px',
    true,
  ),
  sticker(
    'ph-st-punct',
    '!?',
    'stickers',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 70"><text x="10" y="52" font-size="48" font-family="Georgia,serif" font-weight="700" fill="#fff" stroke="#0f172a" stroke-width="4">!?</text></svg>`,
    '88px',
    true,
  ),
  sticker(
    'ph-st-flower',
    'Hoa sticker',
    'stickers',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><g fill="#fde68a" stroke="#0f172a" stroke-width="3"><circle cx="40" cy="22" r="12"/><circle cx="58" cy="40" r="12"/><circle cx="40" cy="58" r="12"/><circle cx="22" cy="40" r="12"/></g><circle cx="40" cy="40" r="10" fill="#f59e0b" stroke="#0f172a" stroke-width="3"/></svg>`,
    '80px',
    true,
  ),
  sticker(
    'ph-st-rays',
    'Tia giấy',
    'stickers',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="#e7e5e4" stroke="#0f172a" stroke-width="2.5"><rect x="46" y="8" width="8" height="36" rx="2"/><rect x="46" y="56" width="8" height="36" rx="2"/><rect x="8" y="46" width="36" height="8" rx="2"/><rect x="56" y="46" width="36" height="8" rx="2"/><rect x="18" y="18" width="8" height="30" rx="2" transform="rotate(-45 22 33)"/><rect x="68" y="18" width="8" height="30" rx="2" transform="rotate(45 72 33)"/></g></svg>`,
    '88px',
    true,
  ),
  sticker(
    'ph-st-kraft-torn',
    'Giấy kraft rách',
    'stickers',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80"><path d="M6 16c10-8 20 4 30-2s20 6 28-4 18 8 26 0 16 10 24 2v52c-10 8-18-2-28 4s-20-6-30 2-18-8-28-2-14 6-22 0z" fill="#c4a574" stroke="#0f172a" stroke-width="2"/></svg>`,
    '110px',
    true,
  ),
  sticker(
    'ph-st-geo',
    'Hình giấy quạt',
    'stickers',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="#e7e5e4" stroke="#0f172a" stroke-width="3"><path d="M50 10 L62 70 L38 70z"/><path d="M22 28 L55 78 L18 72z"/><path d="M78 28 L82 72 L45 78z"/></g></svg>`,
    '88px',
    true,
  ),
  sticker(
    'ph-st-orange-flower',
    'Hoa cam',
    'stickers',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90"><g fill="#fb923c" stroke="#0f172a" stroke-width="2.5"><ellipse cx="40" cy="28" rx="14" ry="18"/><ellipse cx="58" cy="42" rx="14" ry="18" transform="rotate(60 58 42)"/><ellipse cx="50" cy="62" rx="14" ry="18" transform="rotate(120 50 62)"/><ellipse cx="30" cy="62" rx="14" ry="18" transform="rotate(180 30 62)"/><ellipse cx="22" cy="42" rx="14" ry="18" transform="rotate(240 22 42)"/></g><circle cx="40" cy="45" r="8" fill="#fde047" stroke="#0f172a" stroke-width="2"/><path d="M40 55 v28" stroke="#166534" stroke-width="3"/><ellipse cx="32" cy="70" rx="8" ry="4" fill="#22c55e" stroke="#0f172a" stroke-width="1.5"/></svg>`,
    '88px',
    true,
  ),

  // —— Hoa & lá ——
  sticker(
    'ph-fl-sprig',
    'Cành hoa hồng',
    'florals',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 100"><path d="M32 95 V20" stroke="#4d7c0f" stroke-width="2" fill="none"/><ellipse cx="24" cy="40" rx="8" ry="4" fill="#65a30d" transform="rotate(-30 24 40)"/><ellipse cx="40" cy="55" rx="8" ry="4" fill="#65a30d" transform="rotate(25 40 55)"/><circle cx="32" cy="18" r="10" fill="#fb7185"/><circle cx="28" cy="28" r="7" fill="#fda4af"/></svg>`,
    '72px',
  ),
  sticker(
    'ph-fl-tulips',
    'Tulip hồng',
    'florals',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 100"><g stroke="#4d7c0f" stroke-width="2" fill="none"><path d="M25 95 V40"/><path d="M45 95 V35"/><path d="M65 95 V42"/></g><ellipse cx="25" cy="32" rx="10" ry="14" fill="#fb7185"/><ellipse cx="45" cy="28" rx="10" ry="14" fill="#fda4af"/><ellipse cx="65" cy="34" rx="10" ry="14" fill="#f472b6"/></svg>`,
    '80px',
  ),
  sticker(
    'ph-fl-lily',
    'Lily hồng',
    'florals',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90"><g fill="#f472b6"><ellipse cx="45" cy="28" rx="12" ry="22"/><ellipse cx="62" cy="40" rx="12" ry="22" transform="rotate(60 62 40)"/><ellipse cx="55" cy="60" rx="12" ry="22" transform="rotate(120 55 60)"/><ellipse cx="35" cy="60" rx="12" ry="22" transform="rotate(180 35 60)"/><ellipse cx="28" cy="40" rx="12" ry="22" transform="rotate(240 28 40)"/></g><circle cx="45" cy="45" r="6" fill="#fde047"/></svg>`,
    '88px',
  ),
  sticker(
    'ph-fl-leaf',
    'Lá xanh',
    'florals',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><ellipse cx="50" cy="30" rx="42" ry="18" fill="#22c55e"/><path d="M12 30 H88" stroke="#166534" stroke-width="2"/><path d="M40 18 Q50 30 40 42M60 18 Q50 30 60 42" stroke="#166534" stroke-width="1.2" fill="none"/></svg>`,
    '100px',
  ),
  sticker(
    'ph-fl-heart-wc',
    'Tim màu nước',
    'florals',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 72"><defs><linearGradient id="h" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fb7185"/><stop offset="1" stop-color="#c084fc"/></linearGradient></defs><path d="M40 62 S10 42 10 26 A14 14 0 0 1 40 22 A14 14 0 0 1 70 26 C70 42 40 62 40 62z" fill="url(#h)"/></svg>`,
    '80px',
  ),
  sticker(
    'ph-fl-corner',
    'Khung góc lá',
    'florals',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M8 8c20 4 36 20 40 40" fill="none" stroke="#b45309" stroke-width="2"/><ellipse cx="20" cy="28" rx="10" ry="4" fill="#b45309" transform="rotate(-40 20 28)"/><ellipse cx="36" cy="44" rx="10" ry="4" fill="#a16207" transform="rotate(-10 36 44)"/><path d="M92 92c-20-4-36-20-40-40" fill="none" stroke="#b45309" stroke-width="2"/><ellipse cx="80" cy="72" rx="10" ry="4" fill="#b45309" transform="rotate(140 80 72)"/></svg>`,
    '96px',
  ),
  stock('ph-fl-blossoms', 'Hoa anh đào', 'florals', 'photo-1490750967868-88aa4486c946', {
    portrait: true,
  }),
  stock('ph-fl-white-flower', 'Hoa trắng', 'florals', 'photo-1496060169242-812dad1aa528'),
  stock('ph-fl-green-leaf', 'Lá photo', 'florals', 'photo-1441974231531-c6227db76b6e'),
  wash(
    'ph-fl-mountain-pink',
    'Núi hồng',
    'florals',
    'linear-gradient(180deg, #fda4af, #fb7185 40%, #e11d48 70%, #9f1239)',
    { w: '72px', h: '110px' },
  ),
  wash(
    'ph-fl-landscape-band',
    'Dải cảnh',
    'florals',
    'linear-gradient(180deg, #93c5fd 0 28%, #bbf7d0 28% 48%, #fda4af 48% 68%, #fde047 68%)',
    { w: '88px', h: '88px' },
  ),
];

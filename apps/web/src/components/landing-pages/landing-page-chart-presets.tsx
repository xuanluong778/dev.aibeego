'use client';

/**
 * «Biểu đồ» category — Canva-style chart icon presets (SVG).
 * Inserted as CTA shape-only blocks; free-drag / resize / rotate via existing engine.
 */

import type { LandingPageBoxPreset } from './landing-page-box-presets';

export type LandingPageChartGroupId =
  | 'bars'
  | 'lines'
  | 'pie'
  | 'area'
  | 'scatter'
  | 'hierarchy'
  | 'race'
  | 'infographic';

export type LandingPageChartGroup = {
  id: LandingPageChartGroupId;
  label: string;
};

export const LP_CHART_GROUPS: LandingPageChartGroup[] = [
  { id: 'bars', label: 'Biểu đồ cột' },
  { id: 'lines', label: 'Biểu đồ đường' },
  { id: 'pie', label: 'Biểu đồ tròn và biểu đồ donut' },
  { id: 'area', label: 'Biểu đồ miền' },
  { id: 'scatter', label: 'Biểu đồ phân tán và biểu đồ chấm' },
  { id: 'hierarchy', label: 'Biểu đồ phân cấp' },
  { id: 'race', label: 'Biểu đồ cột chạy đua theo thời gian' },
  { id: 'infographic', label: 'Biểu đồ infographic' },
];

export type LandingPageChartPreset = {
  id: string;
  label: string;
  group: LandingPageChartGroupId;
  preset: LandingPageBoxPreset;
};

const B = '#60a5fa';
const P = '#c4b5fd';
const O = '#fdba74';
const B_D = '#3b82f6';

function svgUri(svg: string): string {
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}")`;
}

function chart(
  id: string,
  label: string,
  group: LandingPageChartGroupId,
  svg: string,
  size = '96px',
): LandingPageChartPreset {
  return {
    id,
    label,
    group,
    preset: {
      id,
      label,
      category: 'clip',
      style: {
        lpBox: id,
        width: size,
        height: size,
        background: 'transparent',
        backgroundImage: svgUri(svg),
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        borderRadius: '0',
      },
    },
  };
}

export const LP_CHART_PRESETS: LandingPageChartPreset[] = [
  // —— Biểu đồ cột ——
  chart(
    'cht-bar-v',
    'Thanh',
    'bars',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect x="14" y="28" width="14" height="52" rx="3" fill="${B}"/><rect x="34" y="40" width="14" height="40" rx="3" fill="${B}"/><rect x="54" y="48" width="14" height="32" rx="3" fill="${B}"/><rect x="74" y="58" width="14" height="22" rx="3" fill="${B}"/></svg>`,
  ),
  chart(
    'cht-bar-h',
    'Hàng',
    'bars',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect x="12" y="16" width="68" height="12" rx="3" fill="${B}"/><rect x="12" y="34" width="52" height="12" rx="3" fill="${B}"/><rect x="12" y="52" width="40" height="12" rx="3" fill="${B}"/><rect x="12" y="70" width="28" height="12" rx="3" fill="${B}"/></svg>`,
  ),
  chart(
    'cht-bar-grouped-v',
    'Thanh danh mục',
    'bars',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect x="12" y="36" width="10" height="44" rx="2" fill="${B}"/><rect x="24" y="48" width="10" height="32" rx="2" fill="${P}"/><rect x="36" y="56" width="10" height="24" rx="2" fill="${O}"/><rect x="54" y="28" width="10" height="52" rx="2" fill="${B}"/><rect x="66" y="40" width="10" height="40" rx="2" fill="${P}"/><rect x="78" y="50" width="10" height="30" rx="2" fill="${O}"/></svg>`,
  ),
  chart(
    'cht-bar-grouped-h',
    'Hàng danh mục',
    'bars',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect x="12" y="14" width="56" height="10" rx="2" fill="${B}" opacity=".9"/><rect x="12" y="26" width="40" height="10" rx="2" fill="${P}" opacity=".85"/><rect x="12" y="38" width="28" height="10" rx="2" fill="${O}" opacity=".9"/><rect x="12" y="54" width="64" height="10" rx="2" fill="${B}" opacity=".9"/><rect x="12" y="66" width="48" height="10" rx="2" fill="${P}" opacity=".85"/><rect x="12" y="78" width="32" height="10" rx="2" fill="${O}" opacity=".9"/></svg>`,
  ),
  chart(
    'cht-bar-stacked-v',
    'Thanh xếp chồng',
    'bars',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><g><rect x="18" y="20" width="16" height="24" rx="2" fill="${O}"/><rect x="18" y="44" width="16" height="18" rx="0" fill="${P}"/><rect x="18" y="62" width="16" height="18" rx="2" fill="${B}"/></g><g><rect x="42" y="32" width="16" height="16" rx="2" fill="${O}"/><rect x="42" y="48" width="16" height="16" fill="${P}"/><rect x="42" y="64" width="16" height="16" rx="2" fill="${B}"/></g><g><rect x="66" y="28" width="16" height="20" rx="2" fill="${O}"/><rect x="66" y="48" width="16" height="14" fill="${P}"/><rect x="66" y="62" width="16" height="18" rx="2" fill="${B}"/></g></svg>`,
  ),
  chart(
    'cht-bar-stacked-h',
    'Hàng xếp chồng',
    'bars',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect x="12" y="20" width="28" height="14" rx="2" fill="${B}"/><rect x="40" y="20" width="22" height="14" fill="${P}"/><rect x="62" y="20" width="18" height="14" rx="2" fill="${O}"/><rect x="12" y="42" width="22" height="14" rx="2" fill="${B}"/><rect x="34" y="42" width="28" height="14" fill="${P}"/><rect x="62" y="42" width="14" height="14" rx="2" fill="${O}"/><rect x="12" y="64" width="34" height="14" rx="2" fill="${B}"/><rect x="46" y="64" width="18" height="14" fill="${P}"/><rect x="64" y="64" width="16" height="14" rx="2" fill="${O}"/></svg>`,
  ),

  // —— Biểu đồ đường ——
  chart(
    'cht-line',
    'Biểu đồ đường',
    'lines',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><polyline points="12,72 28,58 44,62 60,36 76,42 88,22" fill="none" stroke="${B}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="72" r="4" fill="${B}"/><circle cx="28" cy="58" r="4" fill="${B}"/><circle cx="44" cy="62" r="4" fill="${B}"/><circle cx="60" cy="36" r="4" fill="${B}"/><circle cx="76" cy="42" r="4" fill="${B}"/><circle cx="88" cy="22" r="4" fill="${B}"/></svg>`,
  ),
  chart(
    'cht-line-multi',
    'Biểu đồ nhiều đường',
    'lines',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><polyline points="10,70 30,50 50,58 70,30 88,40" fill="none" stroke="${B}" stroke-width="3.5" stroke-linecap="round"/><polyline points="10,78 30,68 50,42 70,48 88,28" fill="none" stroke="${P}" stroke-width="3.5" stroke-linecap="round"/><polyline points="10,55 30,60 50,48 70,55 88,50" fill="none" stroke="${O}" stroke-width="3.5" stroke-linecap="round"/><circle cx="50" cy="58" r="3.5" fill="${B}"/><circle cx="50" cy="42" r="3.5" fill="${P}"/><circle cx="50" cy="48" r="3.5" fill="${O}"/></svg>`,
  ),
  chart(
    'cht-line-smooth',
    'Đường cong',
    'lines',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><path d="M10 70 C28 70 28 40 48 40 S68 70 86 28" fill="none" stroke="${B_D}" stroke-width="4" stroke-linecap="round"/><circle cx="10" cy="70" r="4" fill="${B_D}"/><circle cx="48" cy="40" r="4" fill="${B_D}"/><circle cx="86" cy="28" r="4" fill="${B_D}"/></svg>`,
  ),

  // —— Pie / Donut ——
  chart(
    'cht-pie',
    'Biểu đồ tròn',
    'pie',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="48" cy="48" r="36" fill="${B}"/><path d="M48 48 L48 12 A36 36 0 0 1 80 66 Z" fill="${P}"/><path d="M48 48 L80 66 A36 36 0 0 1 28 76 Z" fill="${O}"/></svg>`,
  ),
  chart(
    'cht-donut',
    'Biểu đồ donut',
    'pie',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="48" cy="48" r="36" fill="${B}"/><path d="M48 48 L48 12 A36 36 0 0 1 80 66 Z" fill="${P}"/><path d="M48 48 L80 66 A36 36 0 0 1 28 76 Z" fill="${O}"/><circle cx="48" cy="48" r="16" fill="#fff"/></svg>`,
  ),
  chart(
    'cht-pie-half',
    'Nửa tròn',
    'pie',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><path d="M12 64 A36 36 0 0 1 84 64 L48 64 Z" fill="${B}"/><path d="M48 64 L84 64 A36 36 0 0 1 60 32 Z" fill="${P}"/><path d="M48 64 L60 32 A36 36 0 0 1 12 64 Z" fill="${O}"/></svg>`,
  ),

  // —— Area ——
  chart(
    'cht-area-stacked',
    'Biểu đồ vùng xếp chồng',
    'area',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><path d="M8 78 L8 50 L28 42 L48 48 L68 30 L88 38 L88 78 Z" fill="${B}"/><path d="M8 50 L28 42 L48 48 L68 30 L88 38 L88 55 L68 48 L48 62 L28 58 L8 62 Z" fill="${P}"/><path d="M8 40 L28 28 L48 36 L68 18 L88 28 L88 38 L68 30 L48 48 L28 42 L8 50 Z" fill="${O}"/></svg>`,
  ),
  chart(
    'cht-area-overlap',
    'Biểu đồ vùng chồng',
    'area',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><path d="M8 78 L8 48 L30 36 L52 48 L74 28 L88 36 L88 78 Z" fill="${B}" opacity=".85"/><path d="M8 78 L8 58 L28 50 L50 32 L72 42 L88 30 L88 78 Z" fill="${P}" opacity=".75"/></svg>`,
  ),
  chart(
    'cht-area-stream',
    'Biểu đồ dòng chảy',
    'area',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><path d="M8 40 C24 28 40 52 56 40 S80 28 88 36 L88 52 C80 44 72 60 56 52 S24 64 8 56 Z" fill="${B}"/><path d="M8 52 C24 44 40 68 56 56 S80 48 88 56 L88 70 C80 62 72 76 56 68 S24 80 8 72 Z" fill="${P}"/><path d="M8 68 C24 60 40 82 56 72 S80 66 88 72 L88 84 C72 78 56 90 40 84 S16 88 8 82 Z" fill="${O}"/></svg>`,
  ),
  chart(
    'cht-area-simple',
    'Biểu đồ miền',
    'area',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><path d="M10 72 L10 50 L32 38 L52 46 L72 24 L86 32 L86 72 Z" fill="${B}" opacity=".9"/><polyline points="10,50 32,38 52,46 72,24 86,32" fill="none" stroke="${B_D}" stroke-width="3" stroke-linecap="round"/></svg>`,
  ),

  // —— Scatter / bubble / dots ——
  chart(
    'cht-scatter',
    'Biểu đồ phân tán',
    'scatter',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="22" cy="68" r="5" fill="${B}"/><circle cx="34" cy="54" r="5" fill="${B}"/><circle cx="42" cy="62" r="4" fill="${B}"/><circle cx="52" cy="44" r="5" fill="${B}"/><circle cx="60" cy="36" r="4.5" fill="${B}"/><circle cx="70" cy="28" r="5" fill="${B}"/><circle cx="78" cy="38" r="4" fill="${B}"/><circle cx="48" cy="52" r="4" fill="${B}"/></svg>`,
  ),
  chart(
    'cht-bubble',
    'Biểu đồ bong bóng',
    'scatter',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="32" cy="52" r="22" fill="${B}" opacity=".9"/><circle cx="60" cy="36" r="16" fill="${O}" opacity=".9"/><circle cx="66" cy="62" r="14" fill="${P}" opacity=".9"/><circle cx="42" cy="28" r="9" fill="${B}" opacity=".7"/></svg>`,
  ),
  chart(
    'cht-dot-plot',
    'Biểu đồ chấm',
    'scatter',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><g fill="${B}"><circle cx="28" cy="72" r="5"/><circle cx="28" cy="58" r="5"/><circle cx="28" cy="44" r="5"/><circle cx="28" cy="30" r="5"/></g><g fill="${P}"><circle cx="48" cy="72" r="5"/><circle cx="48" cy="58" r="5"/><circle cx="48" cy="44" r="5"/></g><g fill="${O}"><circle cx="68" cy="72" r="5"/><circle cx="68" cy="58" r="5"/><circle cx="68" cy="44" r="5"/><circle cx="68" cy="30" r="5"/><circle cx="68" cy="18" r="5"/></g></svg>`,
  ),
  chart(
    'cht-dot-strip',
    'Chấm ngang',
    'scatter',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><g fill="${B}"><circle cx="18" cy="30" r="5"/><circle cx="32" cy="30" r="5"/><circle cx="46" cy="30" r="5"/><circle cx="60" cy="30" r="5"/></g><g fill="${P}"><circle cx="24" cy="50" r="5"/><circle cx="38" cy="50" r="5"/><circle cx="52" cy="50" r="5"/></g><g fill="${O}"><circle cx="20" cy="70" r="5"/><circle cx="34" cy="70" r="5"/><circle cx="48" cy="70" r="5"/><circle cx="62" cy="70" r="5"/><circle cx="76" cy="70" r="5"/></g></svg>`,
  ),

  // —— Hierarchy ——
  chart(
    'cht-circle-pack',
    'Biểu đồ các vòng tròn',
    'hierarchy',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="40" cy="48" r="28" fill="${B}"/><circle cx="68" cy="30" r="14" fill="${O}"/><circle cx="72" cy="62" r="12" fill="${P}"/><circle cx="28" cy="26" r="10" fill="#fde68a"/></svg>`,
  ),
  chart(
    'cht-treemap',
    'Biểu đồ dạng cây',
    'hierarchy',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect x="10" y="12" width="76" height="42" rx="4" fill="${B}"/><rect x="10" y="58" width="40" height="26" rx="4" fill="${P}"/><rect x="54" y="58" width="32" height="26" rx="4" fill="${O}"/></svg>`,
  ),
  chart(
    'cht-nested-circles',
    'Vòng tròn xếp lồng',
    'hierarchy',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="30" cy="50" r="22" fill="${B}"/><circle cx="24" cy="44" r="5" fill="#93c5fd"/><circle cx="34" cy="54" r="5" fill="#93c5fd"/><circle cx="36" cy="42" r="4" fill="#bfdbfe"/><circle cx="62" cy="34" r="16" fill="${P}"/><circle cx="58" cy="30" r="4" fill="#ddd6fe"/><circle cx="66" cy="38" r="4" fill="#ddd6fe"/><circle cx="68" cy="68" r="14" fill="${O}"/><circle cx="64" cy="64" r="3.5" fill="#fed7aa"/><circle cx="72" cy="70" r="3.5" fill="#fed7aa"/></svg>`,
  ),
  chart(
    'cht-sunburst',
    'Sunburst',
    'hierarchy',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="48" cy="48" r="36" fill="${B}"/><path d="M48 48 L48 12 A36 36 0 0 1 78 28 Z" fill="${P}"/><path d="M48 48 L78 28 A36 36 0 0 1 78 68 Z" fill="${O}"/><path d="M48 48 L78 68 A36 36 0 0 1 48 84 Z" fill="#93c5fd"/><circle cx="48" cy="48" r="14" fill="#fff"/><circle cx="48" cy="48" r="8" fill="${B_D}"/></svg>`,
  ),

  // —— Bar race ——
  chart(
    'cht-race-blue',
    'Biểu đồ cột chạy đua',
    'race',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".35" stop-color="${B}"/></linearGradient></defs><rect x="8" y="14" width="72" height="10" rx="5" fill="url(#g1)"/><rect x="8" y="30" width="58" height="10" rx="5" fill="url(#g1)"/><rect x="8" y="46" width="80" height="10" rx="5" fill="url(#g1)"/><rect x="8" y="62" width="48" height="10" rx="5" fill="url(#g1)"/><rect x="8" y="78" width="64" height="10" rx="5" fill="url(#g1)"/></svg>`,
  ),
  chart(
    'cht-race-multi',
    'Thanh động nhiều màu',
    'race',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><linearGradient id="gb" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="${B}"/></linearGradient><linearGradient id="go" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="${O}"/></linearGradient><linearGradient id="gp" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="${P}"/></linearGradient></defs><rect x="8" y="16" width="76" height="11" rx="5" fill="url(#gb)"/><rect x="8" y="36" width="58" height="11" rx="5" fill="url(#go)"/><rect x="8" y="56" width="70" height="11" rx="5" fill="url(#gp)"/><rect x="8" y="76" width="48" height="11" rx="5" fill="url(#gb)"/></svg>`,
  ),

  // —— Infographic ——
  chart(
    'cht-info-donut',
    'Donut progress',
    'infographic',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="48" cy="48" r="30" fill="none" stroke="#dbeafe" stroke-width="14"/><path d="M48 18 A30 30 0 1 1 22 66" fill="none" stroke="${B}" stroke-width="14" stroke-linecap="round"/></svg>`,
  ),
  chart(
    'cht-info-gauge',
    'Đồng hồ đo',
    'infographic',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><path d="M18 68 A34 34 0 0 1 78 68" fill="none" stroke="#dbeafe" stroke-width="14" stroke-linecap="round"/><path d="M18 68 A34 34 0 0 1 70 40" fill="none" stroke="${B}" stroke-width="14" stroke-linecap="round"/></svg>`,
  ),
  chart(
    'cht-info-bar',
    'Thanh tiến độ',
    'infographic',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect x="8" y="40" width="80" height="18" rx="9" fill="#dbeafe"/><rect x="8" y="40" width="52" height="18" rx="9" fill="${B}"/></svg>`,
  ),
  chart(
    'cht-info-arc',
    'Cung tiến độ',
    'infographic',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><path d="M20 72 A36 36 0 0 1 76 72" fill="none" stroke="#bfdbfe" stroke-width="12" stroke-linecap="round"/><path d="M20 72 A36 36 0 0 1 62 28" fill="none" stroke="${B}" stroke-width="12" stroke-linecap="round"/></svg>`,
  ),
  chart(
    'cht-info-ring-thick',
    'Vòng dày',
    'infographic',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="48" cy="48" r="28" fill="none" stroke="#dbeafe" stroke-width="18"/><circle cx="48" cy="48" r="28" fill="none" stroke="${B}" stroke-width="18" stroke-dasharray="120 176" stroke-linecap="round" transform="rotate(-90 48 48)"/></svg>`,
  ),
];

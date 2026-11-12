#!/usr/bin/env node
/**
 * Generate SVG thumb + long preview images for landing page templates.
 *   node scripts/generate-landing-page-template-previews.cjs
 *
 * Drop real WebP later at the same path (change catalog extension) — SVG is a fill-in.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'apps/web/public/landing-pages/templates');
const shared = require('../packages/shared/dist/index.js');

const {
  LANDING_PAGE_SYSTEM_TEMPLATES,
  LANDING_PAGE_THEME_PRESETS,
} = shared;

fs.mkdirSync(outDir, { recursive: true });

const SECTION_COLORS = {
  Header: '#0F172A',
  Hero: null, // primary
  Benefits: '#F1F5F9',
  Features: '#E2E8F0',
  Product: '#F8FAFC',
  Pricing: '#FEF3C7',
  Testimonials: '#EEF2FF',
  Gallery: '#FCE7F3',
  Video: '#ECFDF5',
  Process: '#E0F2FE',
  Speaker: '#FFEDD5',
  Guarantee: '#DCFCE7',
  FAQ: '#F1F5F9',
  LeadForm: null, // primary light
  CTA: null,
  Footer: '#0F172A',
};

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sectionHeight(type) {
  switch (type) {
    case 'Hero':
      return 220;
    case 'Header':
      return 44;
    case 'LeadForm':
      return 160;
    case 'CTA':
      return 100;
    case 'Footer':
      return 56;
    case 'Pricing':
      return 140;
    case 'Gallery':
    case 'Video':
      return 130;
    case 'FAQ':
      return 120;
    default:
      return 100;
  }
}

function buildLongSvg(tpl) {
  const tokens = tpl.spec.themeTokens || LANDING_PAGE_THEME_PRESETS[tpl.theme] || LANDING_PAGE_THEME_PRESETS.MODERN;
  const primary = tokens.primary || '#F97316';
  const secondary = tokens.secondary || '#0F172A';
  const bg = tokens.background || '#F8FAFC';
  const width = 720;
  const blocks = (tpl.spec.blocks || []).filter((b) => b.enabled !== false);
  let y = 0;
  const parts = [];

  parts.push(
    `<rect width="${width}" height="PLACEHOLDER_H" fill="${esc(bg)}"/>`,
  );

  for (const block of blocks) {
    const h = sectionHeight(block.type);
    let fill = SECTION_COLORS[block.type];
    if (fill == null) {
      if (block.type === 'Hero' || block.type === 'CTA') fill = primary;
      else if (block.type === 'LeadForm') fill = '#FFFFFF';
      else fill = '#F1F5F9';
    }
    const textColor =
      block.type === 'Hero' || block.type === 'CTA' || block.type === 'Header' || block.type === 'Footer'
        ? '#FFFFFF'
        : secondary;

    parts.push(
      `<rect x="0" y="${y}" width="${width}" height="${h}" fill="${esc(fill)}" opacity="${
        block.type === 'LeadForm' ? '1' : '0.92'
      }"/>`,
    );

    if (block.type === 'LeadForm') {
      parts.push(
        `<rect x="180" y="${y + 16}" width="360" height="${h - 32}" rx="12" fill="#FFFFFF" stroke="${esc(
          primary,
        )}" stroke-width="3"/>`,
      );
    }

    if (block.type === 'Hero') {
      parts.push(
        `<rect x="40" y="${y + 36}" width="320" height="18" rx="4" fill="#FFFFFF" opacity="0.95"/>`,
        `<rect x="40" y="${y + 66}" width="260" height="10" rx="3" fill="#FFFFFF" opacity="0.55"/>`,
        `<rect x="40" y="${y + 90}" width="260" height="10" rx="3" fill="#FFFFFF" opacity="0.45"/>`,
        `<rect x="40" y="${y + 130}" width="140" height="36" rx="8" fill="#FFFFFF"/>`,
        `<rect x="420" y="${y + 40}" width="240" height="140" rx="12" fill="#FFFFFF" opacity="0.25"/>`,
      );
    } else if (block.type === 'Pricing') {
      parts.push(
        `<rect x="60" y="${y + 30}" width="180" height="90" rx="10" fill="#FFFFFF" opacity="0.9"/>`,
        `<rect x="270" y="${y + 20}" width="180" height="110" rx="10" fill="#FFFFFF"/>`,
        `<rect x="480" y="${y + 30}" width="180" height="90" rx="10" fill="#FFFFFF" opacity="0.9"/>`,
      );
    } else if (block.type === 'Gallery') {
      for (let i = 0; i < 4; i++) {
        parts.push(
          `<rect x="${40 + i * 165}" y="${y + 28}" width="150" height="80" rx="8" fill="#FFFFFF" opacity="0.7"/>`,
        );
      }
    } else if (block.type !== 'Header' && block.type !== 'Footer') {
      parts.push(
        `<rect x="48" y="${y + 22}" width="200" height="12" rx="3" fill="${esc(textColor)}" opacity="0.85"/>`,
        `<rect x="48" y="${y + 48}" width="${width - 96}" height="8" rx="2" fill="${esc(
          textColor,
        )}" opacity="0.25"/>`,
        `<rect x="48" y="${y + 64}" width="${width - 160}" height="8" rx="2" fill="${esc(
          textColor,
        )}" opacity="0.18"/>`,
      );
    } else {
      parts.push(
        `<text x="40" y="${y + h / 2 + 5}" fill="${esc(textColor)}" font-family="system-ui,sans-serif" font-size="14" font-weight="700">${esc(
          block.headline || block.type,
        ).slice(0, 40)}</text>`,
      );
    }

    // Section label chip
    parts.push(
      `<text x="12" y="${y + 14}" fill="${
        block.type === 'Hero' || block.type === 'CTA' ? '#FFFFFF' : secondary
      }" font-family="system-ui,sans-serif" font-size="9" opacity="0.55">${esc(block.type)}</text>`,
    );

    y += h;
  }

  const height = Math.max(y, 400);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(
    tpl.name,
  )}">
  <title>${esc(tpl.name)}</title>
  ${parts.join('\n  ').replace('PLACEHOLDER_H', String(height))}
</svg>
`;
  return { svg, height, width };
}

function buildThumbSvg(tpl, long) {
  const tokens = tpl.spec.themeTokens || LANDING_PAGE_THEME_PRESETS[tpl.theme] || LANDING_PAGE_THEME_PRESETS.MODERN;
  const primary = tokens.primary || '#F97316';
  const secondary = tokens.secondary || '#0F172A';
  const w = 640;
  const h = 400;
  // Show top portion of long preview as nested image via clipped rects (self-contained)
  const cropH = Math.min(long.height, Math.round(long.height * 0.35));
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${esc(primary)}"/>
      <stop offset="100%" stop-color="${esc(secondary)}"/>
    </linearGradient>
    <clipPath id="c"><rect width="${w}" height="${h}" rx="0"/></clipPath>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <g clip-path="url(#c)" transform="translate(24,24) scale(${(w - 48) / long.width})">
    ${long.svg
      .replace(/<\?xml[^>]*>/, '')
      .replace(/<svg[^>]*>/, '')
      .replace(/<\/svg>/, '')
      .split('\n')
      .slice(0, 40)
      .join('\n')}
  </g>
  <rect x="24" y="24" width="${w - 48}" height="${h - 48}" fill="none" stroke="#fff" stroke-opacity="0.25" rx="8"/>
  <rect x="0" y="${h - 64}" width="${w}" height="64" fill="#0F172A" opacity="0.55"/>
  <text x="28" y="${h - 28}" fill="#FFFFFF" font-family="system-ui,sans-serif" font-size="18" font-weight="700">${esc(
    tpl.name,
  ).slice(0, 42)}</text>
  <text x="28" y="${h - 48}" fill="#FFFFFF" font-family="system-ui,sans-serif" font-size="11" opacity="0.8">${esc(
    tpl.category,
  )} · ${esc(tpl.theme)}</text>
</svg>
`;
}

let n = 0;
for (const tpl of LANDING_PAGE_SYSTEM_TEMPLATES) {
  const long = buildLongSvg(tpl);
  const thumb = buildThumbSvg(tpl, long);
  const longPath = path.join(outDir, `${tpl.slug}-long.svg`);
  const thumbPath = path.join(outDir, `${tpl.slug}-thumb.svg`);
  fs.writeFileSync(longPath, long.svg);
  fs.writeFileSync(thumbPath, thumb);
  n += 1;
}

console.log(`Generated ${n} template preview pairs in ${outDir}`);
console.log(`TOTAL_TEMPLATES=${LANDING_PAGE_SYSTEM_TEMPLATES.length}`);

#!/usr/bin/env node
/**
 * Contact sheet from existing WebP long previews (200 templates × 3 cols by category).
 *   node scripts/generate-landing-page-contact-sheet.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const shared = require('../packages/shared/dist/index.js');
const { LANDING_PAGE_SYSTEM_TEMPLATES } = shared;
const previewDir = path.join(root, 'apps/web/public/landing-pages/templates');
const outDir = path.join(root, '.tmp/global-visual-qa');

function loadSharp() {
  const candidates = [
    path.join(root, 'node_modules/.pnpm/sharp@0.35.4_@types+node@22.20.0/node_modules/sharp'),
    path.join(root, 'node_modules/sharp'),
  ];
  for (const p of candidates) {
    try {
      return require(p);
    } catch {
      /* try next */
    }
  }
  throw new Error('sharp not found — run pnpm install at repo root');
}

async function main() {
  const sharp = loadSharp();
  fs.mkdirSync(outDir, { recursive: true });
  const templates = [...LANDING_PAGE_SYSTEM_TEMPLATES].sort((a, b) =>
    a.category.localeCompare(b.category) || a.slug.localeCompare(b.slug),
  );
  const thumbW = 220;
  const thumbH = 330;
  const cols = 10;
  const rows = Math.ceil(templates.length / cols);
  const composites = [];
  let missing = 0;

  for (let i = 0; i < templates.length; i++) {
    const t = templates[i];
    const longPath = path.join(previewDir, `${t.slug}-long.webp`);
    if (!fs.existsSync(longPath)) {
      missing += 1;
      continue;
    }
    const col = i % cols;
    const row = Math.floor(i / cols);
    const buf = await sharp(longPath).resize(thumbW, thumbH, { fit: 'cover' }).toBuffer();
    composites.push({ input: buf, left: col * thumbW, top: row * thumbH });
  }

  const out = path.join(outDir, 'contact-sheet-all-templates.jpg');
  await sharp({
    create: {
      width: cols * thumbW,
      height: rows * thumbH,
      channels: 3,
      background: '#0f172a',
    },
  })
    .composite(composites)
    .jpeg({ quality: 85 })
    .toFile(out);

  console.log(`CONTACT_SHEET ${out} tiles=${composites.length} missing=${missing}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

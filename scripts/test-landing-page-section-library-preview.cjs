#!/usr/bin/env node
/**
 * Section Library — Xem trước must open a real lightbox, not a hover no-op.
 *   node scripts/test-landing-page-section-library-preview.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const modal = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-section-library-modal.tsx'),
  'utf8',
);
const preview = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-section-library-preview.tsx'),
  'utf8',
);

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log(ok ? 'PASS' : 'FAIL', name, detail || '');
}

gate(
  'PREVIEW_BTN',
  modal.includes('data-lp-section-library-preview-btn="1"') &&
    modal.includes('onOpenPreview') &&
    modal.includes('openLightbox'),
  'Card Xem trước opens lightbox',
);
gate(
  'LIGHTBOX',
  modal.includes('data-lp-section-library-lightbox="1"') &&
    modal.includes("size=\"full\"") &&
    modal.includes('Đóng preview'),
  'Lightbox covers library with full section renderer',
);
gate(
  'OVERLAY_Z',
  modal.includes('absolute inset-0 z-20') &&
    modal.includes('pointer-events-auto') &&
    modal.includes('isolate'),
  'Hover overlay stacks above live thumbnail',
);
gate(
  'INERT_THUMB',
  preview.includes('data-lp-section-library-preview-inert="1"') &&
    preview.includes("size?: 'card' | 'panel' | 'full'"),
  'Card renderer cannot steal preview clicks',
);
gate(
  'ESC_LIGHTBOX_FIRST',
  modal.includes('lightboxIdRef') &&
    modal.includes("addEventListener('keydown', onKey, true)"),
  'Escape closes preview before the library',
);

const failed = Object.keys(gates).filter((k) => !gates[k].ok);
if (failed.length) {
  console.error('FAIL', failed.join(', '));
  process.exit(1);
}
console.log('PASS section library preview');

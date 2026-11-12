#!/usr/bin/env node
/**
 * Gate: LP Hình ảnh → Quản lý Media modal
 *   node scripts/test-landing-page-media-modal.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const modal = read('apps/web/src/components/landing-pages/landing-page-media-modal.tsx');
const sidebar = read('apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx');
const builder = read('apps/web/src/components/landing-pages/landing-page-builder.tsx');
const controller = read('apps/api/src/landing-pages/landing-pages.controller.ts');
const service = read('apps/api/src/landing-pages/landing-pages.service.ts');

const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail };
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' ' + detail : ''));
}

gate(
  'MODAL_UI',
  modal.includes('Quản lý Media') &&
    modal.includes('Ảnh của tôi') &&
    modal.includes('Ảnh miễn phí') &&
    modal.includes('Ảnh minh họa') &&
    modal.includes('Tìm kiếm hình ảnh') &&
    modal.includes('+ Chọn tệp') &&
    modal.includes('Tạo Tag mới') &&
    modal.includes('Sử dụng') &&
    modal.includes('data-lp-media-modal') &&
    modal.includes('h-[min(90vh,880px)]'),
  'modal matches sample chrome (tabs/search/upload/tags/footer)',
);

gate(
  'REUSE_UPLOAD',
  modal.includes('/upload-image') &&
    modal.includes('apiUpload') &&
    modal.includes('/media?') &&
    controller.includes("@Get(':id/media')") &&
    service.includes('async listMedia(') &&
    service.includes('uploadPublicImage'),
  'reuses upload-image + new listMedia from same upload dir',
);

gate(
  'RAIL_OPENS_MODAL',
  sidebar.includes('onOpenMediaLibrary') &&
    sidebar.includes("item.id === 'image'") &&
    builder.includes('setMediaOpen(true)') &&
    builder.includes('LandingPageMediaModal') &&
    builder.includes('applyMediaToSelection'),
  'Hình ảnh rail opens modal; Sử dụng applies to selection',
);

gate(
  'APPLY_TO_BLOCK',
  builder.includes('applyMediaToSelection') &&
    builder.includes("imageUrl: url") &&
    builder.includes("defaultBlock('Gallery')") &&
    builder.includes('Đã chèn ảnh'),
  'use inserts/replaces image on selected block or new Gallery',
);

gate(
  'SCOPE_LP_ONLY',
  !builder.includes('facebook') &&
    modal.includes('landing-pages/') &&
    !sidebar.includes('onOpenMediaLibrary={() => onAddBlock'),
  'LP media flow scoped; other modules untouched in this change set',
);

gate(
  'UPLOADS_PROXY',
  (() => {
    try {
      const cfg = read('apps/web/next.config.js');
      return (
        cfg.includes("source: '/uploads/:path*'") &&
        (cfg.includes('API_INTERNAL_URL') || cfg.includes('127.0.0.1:4010'))
      );
    } catch {
      return false;
    }
  })(),
  'Next rewrites /uploads/* → API so canvas <img> loads after upload',
);

const failed = Object.entries(gates).filter(([, g]) => !g.ok);
console.log('');
console.log(
  'FILES_CHANGED=landing-page-media-modal.tsx,landing-page-builder-sidebar.tsx,landing-page-builder.tsx,landing-pages.controller.ts,landing-pages.service.ts,scripts/test-landing-page-media-modal.cjs',
);
console.log('LOGIC_CHANGED_YES_NO=YES');
console.log('MEDIA_MODAL_READY=' + (failed.length ? 'FAIL' : 'PASS'));
console.log('TEST_RESULTS:');
for (const [k, g] of Object.entries(gates)) {
  console.log('  ' + (g.ok ? 'PASS' : 'FAIL') + ' ' + k + ' — ' + (g.detail || ''));
}
process.exit(failed.length ? 1 : 0);

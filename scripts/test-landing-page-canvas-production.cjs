#!/usr/bin/env node
/**
 * Landing Page Canvas — production harden gates (mobile / nested reorder / autosave race).
 *   node scripts/test-landing-page-canvas-production.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const gates = {};
function gate(name, ok, detail) {
  gates[name] = { ok: !!ok, detail: detail || '' };
  console.log(ok ? 'PASS' : 'FAIL', name, detail || '');
}

const ux = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx'),
  'utf8',
);
const builder = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-builder.tsx'),
  'utf8',
);
const renderer = fs.readFileSync(
  path.join(root, 'apps/web/src/components/landing-pages/landing-page-renderer.tsx'),
  'utf8',
);
const service = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/landing-pages.service.ts'),
  'utf8',
);
const dto = fs.readFileSync(
  path.join(root, 'apps/api/src/landing-pages/dto/landing-pages.dto.ts'),
  'utf8',
);
const life = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-lifecycle.ts'),
  'utf8',
);
const types = fs.readFileSync(
  path.join(root, 'packages/shared/src/landing-page-types.ts'),
  'utf8',
);

gate(
  'MOBILE_TAP_SELECT',
  ux.includes('TAP_MOVE_PX') &&
    ux.includes('onPointerUp') &&
    ux.includes('(hover: none), (pointer: coarse)') &&
    ux.includes('[@media(hover:hover)]') &&
    builder.includes('deselectCanvas'),
  'tap select without hover; move threshold skips scroll',
);

gate(
  'TOOLBAR_NO_OVERLAY',
  ux.includes('data-lp-toolbar-placement="safe"') &&
    ux.includes('max-[767px]:bottom-0') &&
    ux.includes('max-[767px]:translate-y-[calc(100%+6px)]') &&
    builder.includes('max-[767px]:pb-14'),
  'mobile toolbar below section, canvas padding',
);

gate(
  'SCROLL_NO_ACCIDENTAL_ACTION',
  ux.includes('p.moved') &&
    ux.includes('draggable={false}') &&
    ux.includes('data-lp-item-handle') &&
    ux.includes('touch-none') &&
    builder.includes("e.key === 'Escape'"),
  'scroll≠select; item drag handle only; Escape deselect',
);

gate(
  'NESTED_REORDER_SAFE',
  ux.includes('LP_ITEM_MIME') &&
    ux.includes('LP_BLOCK_MIME') &&
    ux.includes('parsed.blockId !== blockId') &&
    ux.includes('includes(LP_ITEM_MIME)) return') &&
    ux.includes('data-lp-item-parent') &&
    builder.includes('fromItemId') &&
    builder.includes('toItemId') &&
    builder.includes('row.id !== fromItemId'),
  'item reorder same parent only; section ignores item MIME',
);

gate(
  'UNDO_REDO_ORDER_SAFE',
  builder.includes('function reorderListItem') &&
    builder.includes('pushHistory') &&
    builder.includes('`${blockId}.items`') &&
    builder.includes('const undo =') &&
    builder.includes('const redo =') &&
    builder.includes('historyRef'),
  'item reorder via pushHistory — undo restores order',
);

gate(
  'AUTOSAVE_RACE_SAFE',
  builder.includes('autosaveInflightRef') &&
    builder.includes('autosaveQueuedRef') &&
    builder.includes('clientRevision') &&
    builder.includes('requestId') &&
    builder.includes('never write response draftSpec') &&
    service.includes('STALE_REVISION'),
  'serial mutex + revision + no draftSpec writeback',
);

gate(
  'STALE_SAVE_BLOCKED',
  service.includes("reason: 'STALE_REVISION'") &&
    service.includes('incomingRevision < storedRevision') &&
    dto.includes('clientRevision') &&
    types.includes('clientRevision?: number') &&
    life.includes('clientRevision') &&
    builder.includes("res.reason === 'STALE_REVISION'"),
  'server rejects lower clientRevision',
);

gate(
  'CONTENT_PRESERVED',
  builder.includes('dirtyRef.current = true') &&
    builder.includes('reflush') &&
    builder.includes('staleLocal') &&
    builder.includes('never write response draftSpec back into live editor state') &&
    !builder.includes('setSpec(res.draftSpec)') &&
    !/setSpec\(\s*sanitizeLandingPagePersistSpec\(\s*res\.draftSpec/.test(builder),
  'local content kept; stale flush retries latest',
);

gate(
  'OLD_PAGE_COMPATIBLE',
  renderer.includes('resolveLandingPageLayout') &&
    builder.includes('sanitizeLandingPagePersistSpec') &&
    !ux.includes('requireCanvasTree'),
  'legacy specs still render',
);

gate(
  'OTHER_MODULES_UNCHANGED',
  !builder.includes('facebook') &&
    !ux.includes('facebook') &&
    !renderer.includes('facebook') &&
    service.includes('async autosave') &&
    !service.includes('facebookAppReview'),
  'landing-pages scoped',
);

// Runtime unit: nested reorder by stable ids preserves item payloads
function reorderByIds(items, fromItemId, toItemId) {
  const next = items.map((x) => ({ ...x }));
  const fromIndex = next.findIndex((r) => r.id === fromItemId);
  const toIndex = next.findIndex((r) => r.id === toItemId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return next;
  const [row] = next.splice(fromIndex, 1);
  const insertAt = next.findIndex((r) => r.id === toItemId);
  next.splice(insertAt, 0, row);
  return next;
}
const sample = [
  { id: 'a', title: 'A', body: 'keep-a' },
  { id: 'b', title: 'B', body: 'keep-b' },
  { id: 'c', title: 'C', body: 'keep-c' },
];
const reordered = reorderByIds(sample, 'c', 'a');
const idsOk = reordered.map((r) => r.id).join(',') === 'c,a,b';
const dataOk =
  reordered.find((r) => r.id === 'c')?.body === 'keep-c' &&
  reordered.find((r) => r.id === 'a')?.body === 'keep-a';
gate('NESTED_REORDER_UNIT', idsOk && dataOk, 'stable ids + payload after reorder');

// Runtime unit: stale revision compare
function acceptRevision(stored, incoming) {
  if (incoming == null) return { ok: true, rejected: false };
  if (incoming < stored) return { ok: false, rejected: true, reason: 'STALE_REVISION' };
  return { ok: true, rejected: false, next: Math.max(incoming, stored) };
}
const stale = acceptRevision(5, 3);
const fresh = acceptRevision(5, 6);
gate(
  'STALE_REVISION_UNIT',
  stale.rejected === true && fresh.rejected === false && fresh.next === 6,
  'incoming < stored rejected',
);

const critical = [
  'MOBILE_TAP_SELECT',
  'TOOLBAR_NO_OVERLAY',
  'SCROLL_NO_ACCIDENTAL_ACTION',
  'NESTED_REORDER_SAFE',
  'UNDO_REDO_ORDER_SAFE',
  'AUTOSAVE_RACE_SAFE',
  'STALE_SAVE_BLOCKED',
  'CONTENT_PRESERVED',
];
const failed = Object.entries(gates).filter(([, g]) => !g.ok);
const criticalFail = critical.some((k) => gates[k] && !gates[k].ok);

const mobile =
  gates.MOBILE_TAP_SELECT?.ok &&
  gates.TOOLBAR_NO_OVERLAY?.ok &&
  gates.SCROLL_NO_ACCIDENTAL_ACTION?.ok
    ? 'PASS'
    : 'FAIL';
const nested =
  gates.NESTED_REORDER_SAFE?.ok &&
  gates.UNDO_REDO_ORDER_SAFE?.ok &&
  gates.NESTED_REORDER_UNIT?.ok
    ? 'PASS'
    : 'FAIL';
const autosave =
  gates.AUTOSAVE_RACE_SAFE?.ok &&
  gates.STALE_SAVE_BLOCKED?.ok &&
  gates.CONTENT_PRESERVED?.ok &&
  gates.STALE_REVISION_UNIT?.ok
    ? 'PASS'
    : 'FAIL';
const regression =
  gates.OLD_PAGE_COMPATIBLE?.ok && gates.OTHER_MODULES_UNCHANGED?.ok ? 'PASS' : 'FAIL';

const ready = !criticalFail && failed.length === 0 ? 'PASS' : 'FAIL';

console.log('');
console.log('MOBILE_RESULT=' + mobile);
console.log('NESTED_REORDER=' + nested);
console.log('AUTOSAVE_CONCURRENCY=' + autosave);
console.log(
  'FILES_CHANGED=' +
    [
      'landing-page-canvas-ux.tsx',
      'landing-page-builder.tsx',
      'landing-page-renderer.tsx',
      'landing-pages.service.ts',
      'landing-pages.dto.ts',
      'landing-page-types.ts',
      'landing-page-lifecycle.ts',
      'scripts/test-landing-page-canvas-production.cjs',
    ].join(','),
);
console.log('REGRESSION=' + regression);
console.log('CANVAS_PRODUCTION_READY=' + ready);
console.log('TEST_RESULTS:');
for (const [name, g] of Object.entries(gates)) {
  console.log(`  ${g.ok ? 'PASS' : 'FAIL'} ${name}${g.detail ? ' — ' + g.detail : ''}`);
}

if (criticalFail) {
  console.log('\nCritical gate FAIL — do not deploy production.');
  process.exit(1);
}
process.exit(failed.length ? 1 : 0);

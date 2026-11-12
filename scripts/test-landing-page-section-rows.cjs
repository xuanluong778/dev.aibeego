#!/usr/bin/env node
// Unit checks for the opt-in section row/column model (packages/shared/dist must be built).
const assert = require('node:assert/strict');
const s = require('../packages/shared/dist');
let n = 0;
const t = (name, fn) => { fn(); n++; console.log('PASS', name); };
const el = (id, placement) => ({ id, type: 'Benefits', enabled: true, headline: '', subheadline: id, items: [], sectionPlacement: placement });
const END = { sectionId: 'h', anchor: { kind: 'end' }, edge: 'after' };
const host = { id: 'h', type: 'Hero', enabled: true, headline: 'H' };
const other = { id: 'o', type: 'Benefits', enabled: true, headline: 'O', items: [] };
const legacy = () => [host, el('a', END), other, el('x', { sectionId: 'o', anchor: { kind: 'end' }, edge: 'after' })];
const cols = (blocks, id) => s.sectionRowColumns(blocks, blocks.find((b) => b.id === id).sectionPlacement);
const layout = (blocks, rowOf) => blocks.filter((b) => b.sectionPlacement?.row?.id === rowOf).map((b) => b.id + ':' + b.sectionPlacement.row.c).join(' ');

t('legacy placement round-trips unchanged (no row, no columnIndex added)', () => {
  assert.deepEqual(s.sanitizeSectionPlacement(END), END);
  assert.deepEqual(s.sanitizeSectionPlacement({ ...END, columnIndex: 2 }), { ...END, columnIndex: 2 });
  assert.deepEqual(s.sanitizeSectionPlacement({ ...END, columnIndex: null }), { ...END, columnIndex: 0 });
});
t('row survives sanitize; bad row is dropped', () => {
  assert.deepEqual(s.sanitizeSectionPlacement({ ...END, row: { id: 'row_1', c: 2 } }).row, { id: 'row_1', c: 2 });
  assert.equal(s.sanitizeSectionPlacement({ ...END, row: { id: '<x>', c: 1 } }).row, undefined);
  assert.equal(s.sanitizeSectionPlacement({ ...END, row: { id: 'r', c: 99 } }).row.c, 3);
});
t('full spec sanitize keeps row', () => {
  const base = s.createBlankLandingPageSpec();
  const hero = base.blocks.find((b) => b.type === 'Hero');
  const spec = { ...base, blocks: [...base.blocks, el('e1', { sectionId: hero.id, anchor: { kind: 'end' }, edge: 'after', row: { id: 'row_a', c: 1 } })] };
  const out = s.sanitizeLandingPagePersistSpec(spec);
  assert.deepEqual(out.blocks.find((b) => b.id === 'e1').sectionPlacement.row, { id: 'row_a', c: 1 });
});
let b = legacy();
t('1 → 2 columns: right of legacy element converts only it', () => {
  b = s.placeInSectionRow(b, el('b', END), { kind: 'column', refId: 'a', side: 'right' });
  const rid = b.find((x) => x.id === 'a').sectionPlacement.row.id;
  assert.equal(layout(b, rid), 'a:0 b:1');
  assert.deepEqual(cols(b, 'a'), [0, 1]);
  assert.deepEqual(b.find((x) => x.id === 'x').sectionPlacement, { sectionId: 'o', anchor: { kind: 'end' }, edge: 'after' }, 'other section untouched');
  assert.equal(s.sectionSlotKey(b.find((x) => x.id === 'a').sectionPlacement), JSON.stringify(END), 'same slot as before');
});
const rid = () => b.find((x) => x.id === 'a').sectionPlacement.row.id;
t('2 → 3 columns: left of first', () => {
  b = s.placeInSectionRow(b, el('c', END), { kind: 'column', refId: 'a', side: 'left' });
  assert.equal(layout(b, rid()), 'a:1 b:2 c:0');
});
t('3 → 4 columns: between', () => {
  b = s.placeInSectionRow(b, el('d', END), { kind: 'column', refId: 'a', side: 'right' });
  assert.equal(layout(b, rid()), 'a:1 b:3 c:0 d:2');
  assert.deepEqual(cols(b, 'a'), [0, 1, 2, 3]);
});
t('5th column refused with message', () => {
  assert.throws(() => s.placeInSectionRow(b, el('e', END), { kind: 'column', refId: 'a', side: 'right' }), /4 cột/);
});
t('stack inside column keeps column count', () => {
  b = s.placeInSectionRow(b, el('s1', END), { kind: 'stack', refId: 'b', edge: 'after' });
  assert.equal(b.find((x) => x.id === 's1').sectionPlacement.row.c, 3);
  assert.deepEqual(cols(b, 'a'), [0, 1, 2, 3]);
  const ids = b.map((x) => x.id);
  assert.equal(ids.indexOf('s1'), ids.indexOf('b') + 1);
});
t('new row after: separate row id, after last member', () => {
  b = s.placeInSectionRow(b, el('r2', END), { kind: 'row', refId: 'a', edge: 'after' });
  const p = b.find((x) => x.id === 'r2').sectionPlacement;
  assert.notEqual(p.row.id, rid());
  assert.equal(p.row.c, 0);
  const ids = b.map((x) => x.id);
  assert(ids.indexOf('r2') > Math.max(...['a', 'b', 'c', 'd', 's1'].map((i) => ids.indexOf(i))));
  assert.deepEqual(cols(b, 'a'), [0, 1, 2, 3], 'old row unchanged');
});
t('move column out → row rebalances to 3, no duplicate/loss', () => {
  const before = b.length;
  b = s.moveIntoSectionRow(b, 'c', { kind: 'column', refId: 'r2', side: 'right' });
  assert.equal(b.length, before);
  assert.equal(new Set(b.map((x) => x.id)).size, b.length);
  assert.deepEqual(cols(b, 'a').length, 3);
  assert.deepEqual(cols(b, 'r2'), [0, 1]);
});
t('next column insert compacts 0..n-1', () => {
  b = s.placeInSectionRow(b, el('f', END), { kind: 'column', refId: 'a', side: 'left' });
  const ids = ['f', 'a', 'd', 'b'].map((i) => b.find((x) => x.id === i).sectionPlacement.row.c);
  assert.deepEqual(ids, [0, 1, 2, 3]);
});
t('move onto itself is a no-op', () => {
  assert.equal(s.moveIntoSectionRow(b, 'a', { kind: 'stack', refId: 'a', edge: 'after' }), b);
});
t('removing a column element rebalances (rendered columns)', () => {
  const after = s.removeSectionElements(b, ['d']);
  assert.equal(cols(after, 'a').length, 3);
});
t('free-layout flags stripped on move into row', () => {
  const free = el('fr', { ...END, anchor: { kind: 'end' } });
  free.style = { lpCanvasAbsolute: '1', lpCanvasX: '10', lpCanvasY: '20', color: 'red' };
  free.positionMode = 'free';
  const out = s.placeInSectionRow(b, free, { kind: 'stack', refId: 'a', edge: 'before' }).find((x) => x.id === 'fr');
  assert.equal(out.style.lpCanvasAbsolute, undefined);
  assert.equal(out.style.color, 'red');
  assert.equal(out.positionMode, undefined);
});
t('rowOp sanitize', () => {
  assert.deepEqual(s.sanitizeSectionRowOp({ kind: 'column', refId: 'a', side: 'left' }), { kind: 'column', refId: 'a', side: 'left' });
  assert.equal(s.sanitizeSectionRowOp({ kind: 'column', refId: 'a', side: 'up' }), undefined);
});
console.log(`PASS | section rows unit checks (${n})`);

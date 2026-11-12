// Pure-function checks for placeToolbarTopRight (transpiled on the fly).
const ts = require('typescript');
const fs = require('fs'), assert = require('assert/strict');
const src = fs.readFileSync(require('path').resolve(__dirname, '../apps/web/src/components/landing-pages/landing-page-section-insert-target.ts'), 'utf8');
const js = ts.transpileModule(src, { compilerOptions: { module: 'commonjs', target: 'es2020' } }).outputText;
const m = { exports: {} }; new Function('module', 'exports', 'require', js)(m, m.exports, (id) => require(id === '@marketingspa/shared' ? require('path').resolve(__dirname, '../packages/shared/dist') : id));
const { placeToolbarTopRight: f } = m.exports;
const B = { left: 100, top: 100, width: 800, height: 600 }, W = 44, H = 178, G = 8;
const at = (anchor, obstacles) => f({ anchor, bounds: B, toolbarW: W, toolbarH: H, obstacles });
let r = at({ left: 200, top: 150, width: 300, height: 100 });
assert.deepEqual(r, { left: 500 + G, top: 150, side: 'right' }, 'outside right, top aligned, clear of resize handles');
r = at({ left: 200, top: 20, width: 300, height: 200 });          // top scrolled above bounds
assert.equal(r.top, 100, 'pinned to visible top'); assert.equal(r.left, 500 + G);
assert.equal(at({ left: 200, top: -400, width: 300, height: 200 }), null, 'fully above → hidden');
assert.equal(at({ left: 200, top: 800, width: 300, height: 100 }), null, 'fully below → hidden');
assert.equal(at({ left: 1000, top: 200, width: 100, height: 100 }), null, 'fully right → hidden');
r = at({ left: 700, top: 150, width: 200, height: 100 });          // no room right/above → left
assert.deepEqual(r, { left: 700 - G - W, top: 150, side: 'left' });
r = at({ left: 100, top: 150, width: 800, height: 300 });          // full width, no room above → below its bottom-right
assert.deepEqual(r, { left: 900 - W, top: 450 + G, side: 'bottom' });
r = at({ left: 100, top: 100, width: 800, height: 600 });          // nothing free → inside top-right corner
assert.deepEqual(r, { left: 900 - W, top: 100, side: 'inside' });
r = at({ left: 200, top: 650, width: 300, height: 100 });          // near bottom → stays inside bounds
assert.ok(r.top + H <= B.top + B.height + 0.5, 'never below bounds');
r = at({ left: 200, top: 150, width: 300, height: 100 }, [{ left: 510, top: 140, width: 100, height: 120 }]);
assert.equal(r.side, 'left', 'neighbouring box on the right → next free side, never over the box');
assert.equal(at({ left: 200, top: 150, width: 300, height: 100 }, [{ left: 200, top: 150, width: 300, height: 100 }]).side, 'right', 'the target itself is not an obstacle');
r = at({ left: 200, top: 150, width: 300, height: 100 }, [{ left: 150, top: 120, width: 400, height: 300 }]); // text inside a card
assert.deepEqual(r, { left: 550 + G, top: 120, side: 'right' }, 'docks to the containing card, not over it');
r = at({ left: 200, top: 150, width: 300, height: 100 }, [{ left: 180, top: 130, width: 340, height: 140 }]); // own padded shell (20px)
assert.deepEqual(r, { left: 520 + G, top: 130, side: 'right' }, 'docks to its own padded shell edge');
r = at({ left: 200, top: 150, width: 300, height: 100 }, [{ left: 180, top: 130, width: 340, height: 140 }, { left: 540, top: 120, width: 100, height: 200 }]);
assert.notEqual(r.side, 'right', 'own shell docking still avoids the neighbour');
assert.equal(f({ anchor: { left: 0, top: 0, width: 50, height: 50 }, bounds: { left: 0, top: 0, width: 30, height: 50 }, toolbarW: W, toolbarH: H }), null, 'bounds too small');
console.log('PASS | placeToolbarTopRight unit checks (16)');

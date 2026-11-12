const assert = require('node:assert/strict');
const path = require('node:path');
const shared = require('../packages/shared/dist');

// 1. Test computeFreeSnap movement bounds
const { computeFreeSnap, ELEMENT_FREE_MAX_X_PX } = shared;

const canvas = { id: 'surface', left: 0, top: 0, width: 1400, height: 800 };
const safeArea = { left: 100, width: 1200, right: 1300 };
const movingBox = { id: 'box-item', left: 150, top: 200, width: 350, height: 250 };

// Proposed move far to the right (e.g. into the right column / towards right safe area edge)
const proposedX = 900;
const proposedY = 200;

const snapResult = computeFreeSnap({
  moving: movingBox,
  proposedX,
  proposedY,
  canvas,
  siblings: [],
  threshold: 10,
  safeArea,
  safeAreaThreshold: 7,
});

assert(snapResult.x >= 900, `Expected box to be able to move to x >= 900, but got x = ${snapResult.x}`);
console.log('PASS computeFreeSnap allows dragging box to the right without getting blocked');

// Proposed move near safe area right edge: 1300 - 350 = 950.
const nearEdgeSnap = computeFreeSnap({
  moving: movingBox,
  proposedX: 948, // within 7px of 950
  proposedY: 200,
  canvas,
  siblings: [],
  threshold: 10,
  safeArea,
  safeAreaThreshold: 7,
});

assert.equal(nearEdgeSnap.x, 950, `Expected box to snap to safe area right edge at 950, got ${nearEdgeSnap.x}`);
assert(nearEdgeSnap.guides.some(g => g.orientation === 'v' && g.position === 1300), 'Expected safeArea vertical guide to be present');
console.log('PASS computeFreeSnap cleanly snaps to safe area guide when near right edge');

// Beyond safe area (into right canvas margin e.g. 1000px, where right edge is 1350 <= canvas 1400)
const marginSnap = computeFreeSnap({
  moving: movingBox,
  proposedX: 1020,
  proposedY: 200,
  canvas,
  siblings: [],
  threshold: 10,
  safeArea,
  safeAreaThreshold: 7,
});

assert.equal(marginSnap.x, 1020, `Expected box to be able to move beyond safe area up to canvas width (1400 - 350 = 1050), got ${marginSnap.x}`);
console.log('PASS computeFreeSnap allows movement beyond safe area margin without artificial clamp');

console.log('\nALL BOX FREE DRAG BOUND TESTS PASSED!');


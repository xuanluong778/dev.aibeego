#!/usr/bin/env node
const assert = require('assert');
const path = require('path');

// Test packages/shared build export
const { duplicateLandingPageNestedItem } = require(path.join(__dirname, '../packages/shared/dist/landing-page-lifecycle.js'));

console.log('--- Testing duplicateLandingPageNestedItem ---');

// 1. Free positioned box with explicit dimensions
const freeBox = {
  id: 'item-source-1',
  title: 'Chuyên nghiệp',
  description: 'Giao diện chuẩn conversion.',
  positionMode: 'free',
  freeLayout: {
    x: 200,
    y: 150,
    width: 340,
    height: 260,
    rotate: 0,
    reserveHeight: 260,
  },
};

const duplicatedFreeBox = duplicateLandingPageNestedItem(freeBox);

assert.notStrictEqual(duplicatedFreeBox.id, freeBox.id, 'Duplicated item must have new unique ID');
assert.strictEqual(duplicatedFreeBox.positionMode, 'free', 'Duplicated item must retain positionMode="free"');
assert(duplicatedFreeBox.freeLayout, 'Duplicated item must retain freeLayout');
assert.strictEqual(duplicatedFreeBox.freeLayout.width, 340, 'Duplicated item must retain original width 340px');
assert.strictEqual(duplicatedFreeBox.freeLayout.height, 260, 'Duplicated item must retain original height 260px');
assert.strictEqual(duplicatedFreeBox.freeLayout.reserveHeight, 260, 'Duplicated item must retain reserveHeight 260px');
assert.strictEqual(duplicatedFreeBox.freeLayout.x, 224, 'Duplicated item x should be offset by 24px');
assert.strictEqual(duplicatedFreeBox.freeLayout.y, 174, 'Duplicated item y should be offset by 24px');
assert.strictEqual(duplicatedFreeBox.title, 'Chuyên nghiệp');
assert.strictEqual(duplicatedFreeBox.description, 'Giao diện chuẩn conversion.');

console.log('✓ PASS: duplicateLandingPageNestedItem preserves freeLayout dimensions and offsets position');

// 2. Flow box (no freeLayout)
const flowBox = {
  id: 'item-source-2',
  title: 'Tiêu chuẩn',
  description: 'Mô tả tiêu chuẩn',
};

const duplicatedFlowBox = duplicateLandingPageNestedItem(flowBox);
assert.notStrictEqual(duplicatedFlowBox.id, flowBox.id);
assert.strictEqual(duplicatedFlowBox.positionMode, undefined);
assert.strictEqual(duplicatedFlowBox.freeLayout, undefined);

console.log('✓ PASS: duplicateLandingPageNestedItem preserves flow behavior for flow items');

console.log('ALL TESTS PASSED!');


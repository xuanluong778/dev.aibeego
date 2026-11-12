import assert from 'node:assert/strict';
import type { LandingPageBlock } from '../packages/shared/src/landing-page-types.ts';
import {
  applySectionSettingsChange,
  readSectionSettings,
  sectionLayerBoxStyle,
  sectionMediaPaint,
  sectionSettingsActive,
  sectionSettingsInsets,
  sectionTitle,
} from '../apps/web/src/components/landing-pages/landing-page-section-settings.ts';

const block = {
  id: 'benefits-1',
  type: 'Benefits',
  enabled: true,
  spacing: 'md',
  background: null,
} as LandingPageBlock;

assert.equal(sectionTitle(block), 'Section Benefits');
assert.equal(sectionSettingsActive(block.style), false);

const colored = applySectionSettingsChange(block, { background: '#FFC70080' });
assert.equal(colored.background, '#FFC70080');
assert.equal((colored.style as { opacity?: number }).opacity, undefined);
assert.equal(sectionSettingsActive(colored.style), true);

const withMedia = applySectionSettingsChange(
  { ...block, ...colored } as LandingPageBlock,
  { mediaOn: true, kind: 'image', imageUrl: 'https://cdn.example.com/a.jpg', opacity: 35 },
);
const media = sectionMediaPaint({ ...block, ...withMedia } as LandingPageBlock);
assert.ok(media);
assert.equal(media.kind, 'image');
assert.equal(media.opacity, 0.35);
assert.equal((withMedia.style as { opacity?: number }).opacity, undefined);
const layer = sectionLayerBoxStyle({ ...block, ...withMedia } as LandingPageBlock);
assert.equal(layer.opacity, undefined);
assert.equal(layer.pointerEvents, 'none');

const hidden = applySectionSettingsChange(block, { visibility: 'mobile' });
const rs = hidden.responsiveStyle as {
  desktop?: { display?: string };
  tablet?: { display?: string };
  mobile?: { display?: string };
};
assert.equal(rs.desktop?.display, 'none');
assert.equal(rs.tablet?.display, 'none');
assert.equal(rs.mobile, undefined);
assert.equal(readSectionSettings({ ...block, ...hidden } as LandingPageBlock).visibility, 'mobile');

const frame = applySectionSettingsChange(block, { span: 'frame', padX: 8, padY: 4 });
const insets = sectionSettingsInsets({ style: frame.style });
assert.match(String(insets.left), /72rem/);
assert.equal(insets.top, '4%');

const borderOff = applySectionSettingsChange(
  { ...block, ...colored } as LandingPageBlock,
  { borderOn: true, borderWidth: 3, borderStyle: 'dashed', borderColor: '#111111' },
);
assert.match(String((borderOff.style as { border?: string }).border), /3px dashed/);
const kept = applySectionSettingsChange({ ...block, ...borderOff } as LandingPageBlock, { borderOn: false });
assert.equal((kept.style as { border?: string }).border, undefined);
assert.equal((kept.style as { lpBorderWidth?: number }).lpBorderWidth, 3);

const bad = applySectionSettingsChange(block, { imageUrl: 'javascript:alert(1)', mediaOn: true });
assert.equal((bad.style as { backgroundImage?: string }).backgroundImage, undefined);

console.log('section-settings: ok');

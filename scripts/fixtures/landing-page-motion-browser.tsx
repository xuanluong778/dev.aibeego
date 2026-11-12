// Bundle for browser QA only. Production continues to use LandingPageRenderer normally.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { LandingPageRenderer } from '../../apps/web/src/components/landing-pages/landing-page-renderer';
import { LandingPageMotionPanel } from '../../apps/web/src/components/landing-pages/landing-page-motion-panel';
import * as runtime from '../../apps/web/src/components/landing-pages/landing-page-motion-runtime';
import * as motion from '../../packages/shared/src/landing-page-motion';
import { createEmptyLandingPageSpec } from '../../packages/shared/src/landing-page-lifecycle';
Object.assign(window, {
  React,
  createRoot,
  LandingPageRenderer,
  LandingPageMotionPanel,
  runtime,
  motion,
  createEmptyLandingPageSpec,
});

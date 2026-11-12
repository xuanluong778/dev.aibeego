/** Renderer + compact panel acceptance. API-free; full Builder route QA runs separately at release. */
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
const { chromium } = require('playwright');
const bundle = process.env.LP_MOTION_QA_BUNDLE;
if (!bundle)
  throw new Error(
    'Set LP_MOTION_QA_BUNDLE to scripts/fixtures/landing-page-motion-browser.tsx bundle',
  );
const out = process.env.LP_MOTION_QA_OUT || '/tmp/aibeego-lp-motion-compact-browser';
fs.mkdirSync(out, { recursive: true });
const css = (process.env.LP_MOTION_QA_CSS || '')
  .split(path.delimiter)
  .filter(Boolean)
  .map((p) => fs.readFileSync(p, 'utf8'))
  .join('\n');
const results = [];
const pass = (name) => {
  results.push(name);
  console.log('PASS', name);
};
async function pageFor(browser, width = 1440) {
  const p = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  p.errors = [];
  p.on('pageerror', (e) => p.errors.push(e.message));
  await p.route('**/*', (r) => r.abort());
  await p.setContent(
    '<style>html{--radius:.5rem}body{margin:0;font-family:Arial,sans-serif}#scroll{height:700px;overflow-y:auto}#app{width:100%}</style><div id="scroll"><div id="app"></div></div><div id="panel"></div>',
  );
  if (css) await p.addStyleTag({ content: css });
  await p.addScriptTag({ path: bundle });
  await p.evaluate(() => {
    const ActualDate = Date;
    window.Date = class extends ActualDate {
      constructor(...args) {
        super(...(args.length ? args : [Date.UTC(2026, 10, 10, 8)]));
      }
      static now() {
        return ActualDate.UTC(2026, 10, 10, 8);
      }
    };
    window.fixture = () => {
      const spec = createEmptyLandingPageSpec();
      spec.themeTokens = { ...spec.themeTokens, fontFamily: 'Arial, sans-serif' };
      const svg =
        'data:image/svg+xml,' +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#21634f"/><circle cx="300" cy="200" r="75" fill="#ffbd72"/></svg>',
        );
      spec.blocks = [
        {
          id: 'header',
          type: 'Header',
          enabled: true,
          logoText: 'Aibeego QA',
          navItems: [{ id: 'nav', label: 'Contact', href: '#lead-form' }],
        },
        {
          id: 'hero',
          type: 'Hero',
          enabled: true,
          headline: 'Tiêu đề kiểm thử chuyển động',
          subheadline: 'Mô tả và bố cục giữ nguyên',
          ctaLabel: 'Liên hệ ngay',
          ctaUrl: '#lead-form',
          imageUrl: svg,
          imageStyle: { flip: 'x' },
          trustPoints: ['Tin cậy'],
          style: { minHeight: '700px' },
        },
        {
          id: 'cards',
          type: 'Benefits',
          enabled: true,
          headline: 'Thẻ nội dung',
          items: [
            { id: 'a', title: 'Tiêu đề thẻ', description: 'Mô tả trong thẻ', imageUrl: svg },
            { id: 'b', title: 'Thẻ khác', description: 'Mô tả khác' },
          ],
        },
        {
          id: 'grid',
          type: 'CTA',
          enabled: true,
          headline: '',
          body: '',
          ctaLabel: '',
          style: {
            lpBox: 'sq-solid',
            lpGrid: '2x2',
            lpGridImages: JSON.stringify([svg, svg, svg, svg]),
            width: '200px',
            height: '160px',
          },
        },
        {
          id: 'frame',
          type: 'CTA',
          enabled: true,
          headline: '',
          body: '',
          ctaLabel: '',
          imageUrl: svg,
          style: { lpBox: 'sq-solid', lpFrame: true, width: '200px', height: '140px' },
        },
        {
          id: 'plans',
          type: 'Pricing',
          enabled: true,
          headline: 'Gói dịch vụ',
          plans: [
            {
              id: 'p',
              name: 'Gói Pro',
              price: '100',
              features: ['Dịch vụ'],
              ctaLabel: 'Chọn gói',
              ctaUrl: '#lead-form',
            },
          ],
        },
        { id: 'video', type: 'Video', enabled: true, headline: 'Video', posterUrl: svg },
        {
          id: 'timer',
          type: 'Countdown',
          enabled: true,
          headline: 'Ưu đãi',
          endsAt: '2027-12-31T00:00:00Z',
          styleVariant: 'boxes',
          showDays: true,
          showHours: true,
          showMinutes: true,
          showSeconds: true,
        },
        {
          id: 'form',
          type: 'LeadForm',
          enabled: true,
          headline: 'Tư vấn',
          fields: [
            { id: 'email', name: 'email', fieldType: 'email', label: 'Email', required: true },
          ],
          submitLabel: 'Gửi đăng ký',
          footerText: 'Thông tin bảo mật',
        },
        {
          id: 'attached',
          type: 'Benefits',
          enabled: true,
          headline: 'Phần tử chèn',
          subheadline: 'Nội dung portal',
          items: [],
          sectionPlacement: { sectionId: 'hero', anchor: { kind: 'end' }, edge: 'after' },
        },
      ];
      return spec;
    };
    window.mount = (options = {}) => {
      window.reactRoot?.unmount();
      document.getElementById('scroll').scrollTop = 0;
      window.spec = fixture();
      window.options = options;
      if (options.target) {
        const [id, key] = options.target;
        const block = spec.blocks.find((b) => b.id === id);
        block.style = motion.patchLandingPageMotion(block.style, key, {
          preset: options.preset || 'fade',
          trigger: options.trigger || 'scroll',
          duration: options.duration || 200,
          delay: options.delay || 0,
        });
      }
      reactRoot = createRoot(document.getElementById('app'));
      window.render = () =>
        reactRoot.render(
          React.createElement(LandingPageRenderer, {
            spec,
            mode: options.mode || 'public',
            viewport: innerWidth < 640 ? 'mobile' : innerWidth < 1024 ? 'tablet' : 'desktop',
            interactive: !!options.editing,
          }),
        );
      render();
    };
    window.nodeFor = (id, key) => runtime.findLpMotionNode(document.getElementById('app'), id, key);
  });
  return p;
}
async function mount(p, options = {}) {
  await p.evaluate((o) => mount(o), options);
  await p.locator('[data-lp-block-id="hero"]').first().waitFor();
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(70);
}
async function finish(p) {
  await p.waitForFunction(() => !document.querySelector('[data-lp-motion-running]'));
  await p.waitForTimeout(30);
}
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.LP_QA_CHROME || '/snap/chromium/current/usr/lib/chromium-browser/chrome',
    args: ['--no-sandbox'],
  });
  try {
    if (process.env.LP_MOTION_QA_PANEL_ONLY !== '1') {
      for (const width of (process.env.LP_MOTION_QA_SKIP_PRESETS === '1' ? [] : [1440, 820, 390])) {
        const p = await pageFor(browser, width);
        await p.addStyleTag({
          content:
            '*,::before,::after{animation-play-state:paused!important;transition:none!important}',
        });
        await mount(p);
        await p.evaluate(async () => {
          await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
        });
        const before = await p.screenshot({
          path: path.join(out, `${width}-none.png`),
          animations: 'disabled',
        });
        for (const preset of [
          'fade',
          'slide-down',
          'slide-up',
          'slide-right',
          'slide-left',
          'zoom-in',
          'zoom-out',
          'slide-down-right',
          'slide-down-left',
          'slide-up-right',
          'slide-up-left',
        ]) {
          await mount(p, { target: ['hero', 'field:headline'], preset, duration: 250 });
          await p.waitForFunction(() =>
            nodeFor('hero', 'field:headline')?.hasAttribute('data-lp-motion-running'),
          );
          const sample = await p.evaluate(() => {
            const n = nodeFor('hero', 'field:headline'),
              s = getComputedStyle(n);
            return {
              scale: s.scale,
              keys: n
                .getAnimations()
                .flatMap((animation) => animation.effect.getKeyframes().flatMap(Object.keys)),
            };
          });
          if (preset === 'zoom-in') assert.ok(Number(sample.scale) < 1);
          if (preset === 'zoom-out') assert.ok(Number(sample.scale) > 1);
          assert.ok(
            !sample.keys.some((key) =>
              ['left', 'top', 'width', 'height', 'margin', 'transform'].includes(key),
            ),
            'only compositor motion, no geometry/design transform animation',
          );
          assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
          await finish(p);
          assert.ok(
            before.equals(
              await p.screenshot({
                path: path.join(out, `${width}-${preset}.png`),
                animations: 'disabled',
              }),
            ),
            `${width} ${preset} restores original pixels`,
          );
        }
        await mount(p, { mode: 'preview' });
        assert.ok(
          before.equals(
            await p.screenshot({
              path: path.join(out, `${width}-preview.png`),
              animations: 'disabled',
            }),
          ),
        );
        assert.deepEqual(p.errors, []);
        await p.close();
        pass(
          `${width}px: eleven motion presets, compositor properties, no overflow and original/preview/public pixels identical`,
        );
      }

      for (const width of [1440, 820, 390]) {
        const samplePage = await pageFor(browser, width);
        await mount(samplePage, { target: ['hero', 'field:headline'], editing: true });
        const samples = await samplePage.evaluate(() => {
          const node = nodeFor('hero', 'field:headline');
          const origin = node.getBoundingClientRect();
          const run = (duration) => runtime.tryLpMotion({ blockId: 'hero', element: 'headline', field: 'headline' }, { preset: 'slide-up', trigger: 'scroll', duration, delay: 0 });
          const at = (time) => {
            for (const animation of node.getAnimations()) if (animation.animationName?.startsWith('aibeego-lpm-')) { animation.pause(); animation.currentTime = time; }
            return node.getBoundingClientRect().top - origin.top;
          };
          run(600);
          const distance = at(0), fast = at(150);
          const positions = [0, 50, 150, 300, 450, 600].map(at);
          run(1200);
          const slow = at(150);
          runtime.tryLpMotion({ blockId: 'hero', element: 'headline', field: 'headline' });
          const restored = node.getBoundingClientRect();
          return { distance, fast, slow, positions, restored: Math.abs(restored.top-origin.top)<.01 && Math.abs(restored.width-origin.width)<.01, temporaryStyleRemoved: !node.style.getPropertyValue('--aibeego-lpm-distance') };
        });
        assert.ok(samples.distance >= 55 && samples.distance <= 97, `${width}px visibly moves 56-96px`);
        assert.ok(samples.slow > samples.fast + 5, 'slower duration moves less over the same elapsed time');
        assert.ok(samples.positions.every((n, i, a) => n >= -.01 && (i === 0 || n <= a[i-1] + .01)), 'motion approaches design position without overshoot');
        assert.ok(samples.restored && samples.temporaryStyleRemoved);
        assert.deepEqual(samplePage.errors, []);
        await samplePage.close();
        pass(`${width}px: measured 56-96px travel, slower speed verified at equal time, smooth monotonic return without layout drift`);
      }
      for (const context of ['nested', 'window']) {
        const scrollPage = await pageFor(browser);
        if (context === 'window') await scrollPage.evaluate(() => Object.assign(document.getElementById('scroll').style, { height: 'auto', overflow: 'visible' }));
        await mount(scrollPage, { target: ['cards', 'field:itemDesc:a'], preset: 'slide-up', duration: 550 });
        await scrollPage.waitForFunction(() => nodeFor('cards', 'field:itemDesc:a')?.hasAttribute('data-lp-motion-pending'));
        await scrollPage.evaluate(() => {
          const node = nodeFor('cards', 'field:itemDesc:a'), root = runtime.lpMotionScrollRoot(node);
          const bottom = root ? root.getBoundingClientRect().bottom : innerHeight;
          const delta = node.getBoundingClientRect().top - bottom + 20;
          if (root) root.scrollTop += delta; else scrollBy(0, delta);
        });
        await scrollPage.waitForTimeout(120);
        assert.equal(await scrollPage.locator('[data-lp-motion-running]').count(), 0, '20px entry at lower edge must not consume the entrance');
        assert.equal(await scrollPage.evaluate(() => getComputedStyle(nodeFor('cards', 'field:itemDesc:a')).opacity), '0', 'offscreen waiting content does not flash before its entrance');
        await scrollPage.evaluate(() => { const root=runtime.lpMotionScrollRoot(nodeFor('cards','field:itemDesc:a')); if(root) root.scrollTop+=120; else scrollBy(0,120); });
        await scrollPage.waitForFunction(() => nodeFor('cards', 'field:itemDesc:a')?.hasAttribute('data-lp-motion-running'));
        assert.equal(await scrollPage.evaluate(() => nodeFor('cards','field:itemDesc:a').style.getPropertyValue('--aibeego-lpm-opacity')), '1', 'pending opacity must not leak into final appearance');
        await finish(scrollPage);
        assert.equal(await scrollPage.evaluate(() => getComputedStyle(nodeFor('cards','field:itemDesc:a')).opacity), '1');
        await scrollPage.evaluate(() => { const root=runtime.lpMotionScrollRoot(nodeFor('cards','field:itemDesc:a')); if(root) root.scrollTop=0; else scrollTo(0,0); });
        await scrollPage.waitForTimeout(50);
        await scrollPage.evaluate(() => nodeFor('cards','field:itemDesc:a').scrollIntoView({block:'center'}));
        await scrollPage.waitForTimeout(80);
        assert.equal(await scrollPage.locator('[data-lp-motion-running],[data-lp-motion-pending]').count(), 0);
        assert.deepEqual(scrollPage.errors, []);
        await scrollPage.close();
        pass(`${context} viewport: waits past lower edge, no pre-entry flash, visible after completion, runs once`);
      }
      const pendingPage = await pageFor(browser);
      await mount(pendingPage, { target: ['form','form'] });
      await pendingPage.waitForFunction(() => nodeFor('form','form')?.hasAttribute('data-lp-motion-pending'));
      await pendingPage.emulateMedia({ reducedMotion: 'reduce' });
      await pendingPage.waitForFunction(() => !document.querySelector('[data-lp-motion-pending]'));
      assert.equal(await pendingPage.evaluate(() => getComputedStyle(nodeFor('form','form')).opacity), '1');
      await pendingPage.emulateMedia({ reducedMotion: 'no-preference' });
      await mount(pendingPage, { target: ['form','form'] });
      await pendingPage.waitForFunction(() => nodeFor('form','form')?.hasAttribute('data-lp-motion-pending'));
      await pendingPage.evaluate(() => { window.pendingNode=nodeFor('form','form'); reactRoot.unmount(); });
      assert.equal(await pendingPage.evaluate(() => pendingNode.hasAttribute('data-lp-motion-pending')),false);
      await pendingPage.close();
      pass('pending appearance is restored on reduced-motion change and unmount');


      const rangePage=await pageFor(browser,390);
      const scrollRange=await rangePage.evaluate(()=>{
        document.body.style.margin='0';document.body.innerHTML='<div id="range-root"><header id="sticky" style="height:40px;position:sticky;top:0">Header</header><div style="height:1200px"></div><div id="last" style="height:200px">Last section</div></div>';
        const root=document.getElementById('range-root'),last=document.getElementById('last'),header=document.getElementById('sticky');
        const before=document.documentElement.scrollHeight;scrollTo(0,500);const stickyBefore=header.getBoundingClientRect().top;
        root.setAttribute('data-lp-motion-clipping','1');
        const cancel=runtime.playLpMotion(last,{preset:'slide-up',duration:1200,delay:0,trigger:'scroll'},()=>{});
        for(const a of last.getAnimations()){a.pause();a.currentTime=0}
        const during=document.documentElement.scrollHeight,stickyDuring=header.getBoundingClientRect().top;
        cancel();root.removeAttribute('data-lp-motion-clipping');
        return {before,during,after:document.documentElement.scrollHeight,stickyBefore,stickyDuring};
      });
      assert.equal(scrollRange.during,scrollRange.before,'last-section motion must not extend the scroll range');
      assert.equal(scrollRange.after,scrollRange.before);
      assert.equal(scrollRange.stickyDuring,scrollRange.stickyBefore,'clipping must not change sticky header scroll behavior');
      await rangePage.close();
      pass('large last-section movement preserves document scroll range and sticky header position');

      const p = await pageFor(browser);
      const targets = [
        ['header', 'section'],
        ['hero', 'section'],
        ['hero', 'field:headline'],
        ['hero', 'field:subheadline'],
        ['hero', 'image'],
        ['hero', 'field:ctaLabel'],
        ['hero', 'item:trust-icon-0'],
        ['hero', 'field:trustPoint:0'],
        ['cards', 'item:a'],
        ['cards', 'field:itemTitle:a'],
        ['cards', 'field:itemDesc:a'],
        ['grid', 'grid:2'],
        ['frame', 'image'],
        ['plans', 'field:planName:p'],
        ['plans', 'field:planPrice:p'],
        ['plans', 'field:planCta:p'],
        ['video', 'section'],
        ['timer', 'countdown:ngày'],
        ['timer', 'field:countdownCell:Ngày'],
        ['form', 'section'],
        ['form', 'form'],
        ['form', 'field:headline'],
        ['form', 'field:fieldLabel:email'],
        ['form', 'field:submitLabel'],
        ['form', 'field:footerText'],
        ['attached', 'field:headline'],
      ];
      for (const target of targets) {
        console.log('TARGET',...target);
        await mount(p, { target, preset: 'slide-up-right', duration: 350 });
        try { await p.waitForFunction((target) => !!nodeFor(...target), target,{timeout:2500}); }
        catch(error){fs.writeFileSync(path.join(out,'missing-target.html'),await p.content());throw new Error(`Missing native target ${target.join('::')}: ${error.message}`); }
        assert.ok(await p.evaluate(target => {
          const node = nodeFor(...target);
          return !['inline', 'contents'].includes(getComputedStyle(node).display) || /^(IMG|SVG|VIDEO|CANVAS)$/.test(node.tagName);
        }, target), `Target must support spatial transforms: ${target.join('::')}`);
        await p.evaluate(
          (target) => nodeFor(...target).scrollIntoView({ block: 'center' }),
          target,
        );
        await p.waitForFunction(
          (target) =>
            nodeFor(...target)?.getAttribute('data-lp-motion-running') === 'slide-up-right',
          target,
        );
        await finish(p);
      }
      pass(
        'all 26 native targets resolve and animate independently, including text/image/button/icon/grid/frame/video/countdown/form/portal',
      );
      await mount(p, { target: ['cards', 'field:itemDesc:a'], trigger: 'load', duration: 350 });
      await p.waitForTimeout(100);
      assert.equal(await p.locator('[data-lp-motion-running]').count(), 0);
      await p.evaluate(() =>
        nodeFor('cards', 'field:itemDesc:a').scrollIntoView({ block: 'center' }),
      );
      await p.waitForFunction(() => document.querySelector('[data-lp-motion-running]'));
      await finish(p);
      await p.evaluate(() => (document.getElementById('scroll').scrollTop = 0));
      await p.waitForTimeout(60);
      await p.evaluate(() =>
        nodeFor('cards', 'field:itemDesc:a').scrollIntoView({ block: 'center' }),
      );
      await p.waitForTimeout(80);
      assert.equal(await p.locator('[data-lp-motion-running]').count(), 0);
      pass(
        'legacy load is normalized to viewport, scroll observer uses actual scroller, runs once',
      );
      await mount(p, { target: ['form', 'form'], preset: 'fade', duration: 1000, delay: 400 });
      await p.evaluate(() => nodeFor('form', 'form').scrollIntoView({ block: 'center' }));
      await p.waitForFunction(() => document.querySelector('[data-lp-motion-running]'));
      await p.locator('input[type=email]').focus();
      assert.equal(await p.locator('[data-lp-motion-running]').count(), 0);
      await p.locator('input[type=email]').fill('qa@example.invalid');
      pass('form focus cancels motion immediately and input remains usable');
      await p.emulateMedia({ reducedMotion: 'reduce' });
      await mount(p, { target: ['hero', 'field:headline'] });
      assert.equal(await p.locator('[data-lp-motion-running],[data-lp-motion-pending]').count(), 0);
      await p.emulateMedia({ reducedMotion: 'no-preference' });
      await p.evaluate(() => {
        window.IO = window.IntersectionObserver;
        window.IntersectionObserver = undefined;
      });
      await mount(p, { target: ['hero', 'field:headline'] });
      assert.equal(await p.locator('[data-lp-motion-running]').count(), 0);
      await p.evaluate(() => (window.IntersectionObserver = window.IO));
      pass('reduced motion and missing IntersectionObserver leave content visible');
      await mount(p, { target: ['hero', 'field:headline'], editing: true });
      await p.waitForTimeout(100);
      assert.equal(await p.locator('[data-lp-motion-running]').count(), 0);
      await p.addStyleTag({
        content:
          '@keyframes qa-legacy{from{transform:rotate(7deg)}to{transform:rotate(7deg)}} [data-lp-field-anchor="headline"]{animation:qa-legacy 10s linear infinite;animation-timeline:view();}',
      });
      await p.evaluate(() =>
        runtime.tryLpMotion(
          { blockId: 'hero', element: 'headline', field: 'headline' },
          { preset: 'slide-down-left', trigger: 'scroll', duration: 300, delay: 0 },
        ),
      );
      await p.waitForFunction(() => document.querySelector('[data-lp-motion-running]'));
      assert.ok(
        await p.evaluate(() => {
          const s = getComputedStyle(nodeFor('hero', 'field:headline'));
          return (
            s.animationName.includes('qa-legacy') &&
            s.animationName.includes('aibeego-lpm-slide-down-left') &&
            s.animationTimeline.includes('view()')
          );
        }),
      );
      await finish(p);
      assert.equal(
        await p.evaluate(() => getComputedStyle(nodeFor('hero', 'field:headline')).animationName),
        'qa-legacy',
      );
      pass('editor stays still unless clicked; legacy transform/timeline restored after motion');
      await p.evaluate(() => {
        const IO = window.IntersectionObserver;
        window.observed = [];
        window.IntersectionObserver = class extends IO {
          constructor(...a) {
            super(...a);
            observed.push(this);
          }
          disconnect() {
            this.disconnected = true;
            return super.disconnect();
          }
        };
      });
      await mount(p, { target: ['form', 'form'] });
      await p.evaluate(() => reactRoot.unmount());
      assert.ok(await p.evaluate(() => observed.length && observed.every((o) => o.disconnected)));
      assert.deepEqual(p.errors, []);
      await p.close();
      pass('observers disconnected on unmount');
    }
    const panel = await pageFor(browser);
    await panel.addStyleTag({
      content:
        'html{--radius:.5rem}body{background:#0A3D30}#scroll{width:calc(100% - 340px)}#panel{position:fixed;right:0;top:0;width:320px;max-width:100%;padding:12px;background:#0A3D30;color:white}',
    });
    await panel.evaluate(() => {
      window.changes = [];
      window.auditions = 0;
      window.panelTarget = { blockId: 'hero', element: 'headline', field: 'headline' };
      mount({ editing: true });
      document
        .getElementById('app')
        .addEventListener(runtime.LP_MOTION_TRY_EVENT, () => auditions++);
      window.panelRoot = createRoot(document.getElementById('panel'));
      window.renderPanel = (disabled = false) =>
        panelRoot.render(
          React.createElement(LandingPageMotionPanel, {
            block: spec.blocks.find((b) => b.id === panelTarget.blockId),
            target: panelTarget,
            disabled,
            onChange: (target, value) => {
              changes.push({ target, value });
              spec = {
                ...spec,
                blocks: spec.blocks.map((b) =>
                  b.id === target.blockId
                    ? {
                        ...b,
                        style: motion.patchLandingPageMotion(
                          b.style,
                          motion.lpMotionLocalKey(target),
                          value,
                        ),
                      }
                    : b,
                ),
              };
              render();
              renderPanel();
            },
          }),
        );
      renderPanel();
    });
    await panel.locator('[data-lp-motion-preset-grid]').waitFor();
    assert.equal(await panel.locator('input[data-lp-motion-preset]').count(), 12);
    assert.equal(
      await panel.locator('[data-lp-motion-try],[data-lp-motion-trigger-group]').count(),
      0,
    );
    const cards = await panel.locator('[data-lp-motion-choice]').evaluateAll((nodes) =>
      nodes.map((node) => {
        const r = node.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height, text: node.children[1].textContent };
      }),
    );
    assert.ok(cards.slice(0, 4).every((c) => c.y === cards[0].y));
    assert.equal(cards[4].x, cards[0].x);
    assert.ok(cards[4].y > cards[0].y);
    assert.ok(cards.every((c) => c.h <= 50 && c.text === ''));
    await panel.locator('[data-lp-motion-choice="zoom-in"]').hover();
    await panel
      .locator('[data-lp-motion-choice="zoom-in"] [role=tooltip]')
      .waitFor({ state: 'visible' });
    assert.equal(await panel.evaluate(() => changes.length), 0);
    await panel.locator('[data-lp-motion-choice="fade"]').click();
    await panel.waitForFunction(
      () => nodeFor('hero', 'field:headline')?.getAttribute('data-lp-motion-running') === 'fade',
    );
    await panel.waitForTimeout(100);
    assert.equal(await panel.locator('[data-lp-motion-running]').count(), 1);
    assert.equal(await panel.evaluate(() => changes.length), 1);
    assert.equal(await panel.evaluate(() => changes[0].value.trigger), 'scroll');
    await panel.locator('[data-lp-motion-choice="fade"]').click();
    await panel.waitForFunction(() => auditions >= 2);
    assert.equal(await panel.evaluate(() => changes.length), 1);
    await finish(panel);
    pass(
      'compact panel: twelve icon-only choices/four per row, hover tooltip, automatic smooth replay on repeated click without extra history',
    );
    await panel.locator('[data-lp-motion-duration]').fill('950');
    assert.equal(await panel.evaluate(() => changes.length), 1);
    await panel.locator('[data-lp-motion-duration]').press('Enter');
    assert.equal(await panel.evaluate(() => changes.length), 2);
    await panel.getByRole('radio', { name: 'Hiện dần', exact: true }).focus();
    await panel.keyboard.press('ArrowRight');
    await panel.waitForFunction(() => changes.length === 3);
    assert.equal(await panel.evaluate(() => changes.at(-1).value.preset), 'slide-down');
    await finish(panel);
    await panel.locator('[data-lp-motion-choice="none"]').click();
    await panel.waitForFunction(() => changes.length === 4);
    assert.equal(await panel.evaluate(() => changes.at(-1).value), undefined);
    assert.equal(await panel.locator('[data-lp-motion-duration]').isDisabled(), true);
    assert.equal(await panel.locator('[data-lp-motion-running]').count(), 0);
    await panel.locator('[data-lp-motion-choice="slide-up"]').click();
    await finish(panel);
    for (const width of [320, 280]) {
      await panel.evaluate((w) => (document.getElementById('panel').style.width = w + 'px'), width);
      assert.ok(await panel.locator('#panel').evaluate((n) => n.scrollWidth <= n.clientWidth));
      await panel
        .locator('#panel')
        .screenshot({ path: path.join(out, `motion-panel-${width}.png`) });
    }

    await panel.locator('[data-lp-motion-duration]').fill('957');
    await panel.locator('[data-lp-motion-duration]').press('Enter');
    await finish(panel);
    const beforeFocus = await panel.evaluate(() => changes.length);
    await panel.locator('[data-lp-motion-speed]').focus();
    assert.equal(Number(await panel.locator('[data-lp-motion-speed]').inputValue()),957);
    await panel.locator('[data-lp-motion-delay]').focus();
    assert.equal(await panel.evaluate(() => changes.length),beforeFocus,'focus/blur must preserve exact hand-entered milliseconds');
    const beforeSpeed = await panel.evaluate(() => changes.length);
    await panel.locator('[data-lp-motion-speed]').focus();
    await panel.keyboard.down('ArrowRight');
    assert.equal(await panel.evaluate(() => changes.length),beforeSpeed, 'keyboard speed edit stays local until confirmed');
    await panel.keyboard.up('ArrowRight');
    await panel.waitForFunction((n) => changes.length===n+1,beforeSpeed);
    await panel.waitForFunction(() => document.querySelector('[data-lp-motion-running]'));
    assert.equal(await panel.evaluate(() => nodeFor('hero','field:headline').getAnimations().find(a=>a.animationName?.startsWith('aibeego-lpm-')).effect.getTiming().duration), Number(await panel.locator('[data-lp-motion-duration]').inputValue()));
    await finish(panel);
    const speedRange=await panel.locator('[data-lp-motion-speed]').boundingBox();
    const beforeDrag=await panel.evaluate(() => changes.length);
    await panel.mouse.move(speedRange.x+speedRange.width*.8,speedRange.y+speedRange.height/2);
    await panel.mouse.down();
    await panel.mouse.move(speedRange.x+speedRange.width*.4,speedRange.y+speedRange.height/2,{steps:8});
    assert.equal(await panel.evaluate(() => changes.length),beforeDrag,'slider drag does not create intermediate undo entries');
    await panel.mouse.up();
    await panel.waitForFunction(n=>changes.length===n+1,beforeDrag);
    await panel.locator('[data-lp-motion-delay]').focus();
    assert.equal(await panel.evaluate(() => changes.length),beforeDrag+1,'release and blur commit once');
    await finish(panel);
    pass('fast/slow slider supports mouse and keyboard, syncs duration, auto-previews and commits once per gesture');

    await panel.evaluate(() => renderPanel(true));
    assert.equal(
      await panel.getByRole('radio', { name: 'Hiện dần', exact: true }).isDisabled(),
      true,
    );
    assert.deepEqual(panel.errors, []);
    await panel.close();
    pass('timing commits once, native keyboard, none removes, lock and 320/280px layout pass');
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const fs = require('node:fs'),
  path = require('node:path'),
  http = require('node:http'),
  assert = require('node:assert/strict'),
  { createRequire } = require('node:module'),
  { chromium } = require('playwright');
const root = path.resolve(__dirname, '..'),
  out = process.env.LP_DROP_QA_OUT || path.join(root, '.tmp/drop-indicator-qa');
fs.mkdirSync(out, { recursive: true });
const req = createRequire(path.join(root, 'apps/web/package.json')),
  w = req('next/dist/compiled/webpack/webpack');
w.init();
(async () => {
  await new Promise((resolve, reject) =>
    w.webpack(
      {
        mode: 'development',
        devtool: false,
        target: 'web',
        context: root,
        entry: path.join(root, 'scripts/helpers/landing-page-drop-indicator-entry.tsx'),
        output: { path: out, filename: 'test.js' },
        resolve: {
          extensions: ['.tsx', '.ts', '.js', '.json'],
          alias: {
            '@': path.join(root, 'apps/web/src'),
            '@marketingspa/shared$': path.join(root, 'scripts/helpers/landing-page-dnd-shared.ts'),
          },
          modules: [path.join(root, 'apps/web/node_modules'), 'node_modules'],
        },
        module: {
          rules: [
            {
              test: /\.tsx?$/,
              exclude: /node_modules/,
              use: {
                loader: path.join(root, 'scripts/helpers/landing-page-modal-layout-loader.cjs'),
              },
            },
          ],
        },
      },
      (e, s) =>
        e || s.hasErrors()
          ? reject(e || Error(s.toString({ all: false, errors: true })))
          : resolve(),
    ),
  );
  const server = http.createServer((request, response) => {
    response.setHeader(
      'Content-Type',
      request.url.endsWith('.js')
        ? 'application/javascript; charset=utf-8'
        : 'text/html; charset=utf-8',
    );
    response.end(
      request.url.endsWith('.js')
        ? fs.readFileSync(path.join(out, 'test.js'))
        : '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;font-family:system-ui}</style></head><body><div id="root"></div><script src="/test.js"></script></body></html>',
    );
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({
    executablePath: '/snap/chromium/current/usr/lib/chromium-browser/chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  const errors = [],
    report = { steps: [] };
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    for (const viewport of [
      { width: 1280, height: 850 },
      { width: 390, height: 480 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('http://127.0.0.1:' + server.address().port);
      const marker = page.locator('[data-lp-sidebar-drop-indicator]');
      const scenarios = [
        { background: '#ffffff', color: 'rgb(255, 255, 255)' },
        { background: '#212830', color: 'rgb(255, 255, 255)' },
        { background: '#79b18b', color: 'rgb(255, 255, 255)' },
        { background: '#f7f7f7', color: 'rgb(255, 255, 255)' },
        { background: '#ffffff', color: 'rgb(255, 255, 255)', layer: true },
      ];
      for (const zoom of [1, 0.75])
        for (const scenario of scenarios) {
          await page.evaluate(
            ({ zoom, scenario }) => {
              window.__zoom(zoom);
              window.__background(scenario.background, scenario.layer);
            },
            { zoom, scenario },
          );
          const tile = page.locator('#text-tile');
          await tile.scrollIntoViewIfNeeded();
          const source = await tile.boundingBox();
          await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
          await page.mouse.down();
          await page.mouse.move(source.x + source.width / 2 + 22, source.y + source.height / 2, {
            steps: 4,
          });
          const heading = page.locator('[data-lp-block-id="form"] h2');
          await heading.scrollIntoViewIfNeeded();
          const title = await heading.boundingBox();
          await page.mouse.move(title.x + title.width / 2, title.y + title.height - 2, {
            steps: 12,
          });
          await page.mouse.move(title.x + title.width / 2 + 1, title.y + title.height - 1);
          await marker.waitFor();
          const bar = marker.locator('[data-lp-drop-bar]'),
            b = await bar.boundingBox(),
            target = await page.evaluate(() => window.__target);
          assert.equal(await marker.getAttribute('data-lp-drop-section'), 'form');
          assert.equal(await marker.getAttribute('data-lp-drop-mode'), 'section-element');
          assert.equal(await marker.locator('div').count(), 1, 'Exactly one visual indicator');
          assert.equal(
            await marker.locator('[data-lp-drop-region],[data-lp-drop-hint]').count(),
            0,
          );
          assert.equal(
            await page.locator('[data-lp-sidebar-drag-preview]').count(),
            0,
            'No floating drag card',
          );
          assert.equal(Math.round(b.height), 20);
          assert(
            Math.abs(b.y - (title.y + title.height)) < 1,
            'Bar is immediately below the heading',
          );
          assert.equal(
            await bar.evaluate((e) => getComputedStyle(e).backgroundColor),
            scenario.color,
          );
          assert.equal(
            await bar.evaluate((e) => getComputedStyle(e).borderTopStyle),
            'dashed',
          );
          assert.equal(await bar.locator('[data-lp-drop-plus]').innerText(), '+');
          assert.equal(target.position.anchor.kind, 'field');
          assert.equal(target.position.anchor.field, 'headline');
          assert.equal(target.position.edge, 'after');
          assert(await marker.evaluate((e) => getComputedStyle(e).pointerEvents === 'none'));
          assert(
            await page.evaluate(
              ({ x, y }) =>
                !document.elementFromPoint(x, y)?.closest('[data-lp-sidebar-drop-indicator]'),
              { x: b.x + b.width / 2, y: b.y + 10 },
            ),
          );
          if (!scenario.layer && zoom === 1 && ['#ffffff', '#79b18b'].includes(scenario.background))
            await page.screenshot({
              path: path.join(
                out,
                'bar-' + viewport.width + '-' + scenario.background.slice(1) + '.png',
              ),
            });
          await page.mouse.up();
          await marker.waitFor({ state: 'detached' });
          const drops = await page.evaluate(() => window.__drops);
          assert.equal(drops.at(-1).blockId, 'form');
          assert.equal(drops.at(-1).anchor.field, 'headline');
          assert.equal(drops.at(-1).edge, 'after');
          report.steps.push({
            viewport,
            zoom,
            background: scenario.background,
            layer: !!scenario.layer,
            color: scenario.color,
            height: 20,
            singleBar: true,
            noFloatingCard: true,
            pointerPassThrough: true,
            nativeDrop: 'after-headline',
          });
          // The same contrast and geometry rules apply to column insertion bars.
          await tile.scrollIntoViewIfNeeded();
          const vs = await tile.boundingBox();
          await page.mouse.move(vs.x + vs.width / 2, vs.y + vs.height / 2);
          await page.mouse.down();
          await page.mouse.move(vs.x + vs.width / 2 + 22, vs.y + vs.height / 2, { steps: 4 });
          const section = page.locator('[data-lp-section-chrome][data-lp-block-id="form"]');
          await section.scrollIntoViewIfNeeded();
          const sr = await section.boundingBox();
          await page.mouse.move(sr.x + 5, sr.y + sr.height / 2, { steps: 12 });
          await page.mouse.move(sr.x + 6, sr.y + sr.height / 2 + 1);
          await marker.waitFor();
          await page.waitForFunction(
            () =>
              document
                .querySelector('[data-lp-sidebar-drop-indicator]')
                ?.getAttribute('data-lp-drop-orientation') === 'vertical',
          );
          assert.equal(await marker.getAttribute('data-lp-drop-orientation'), 'vertical');
          const vb = marker.locator('[data-lp-drop-line]'),
            vr = await vb.boundingBox();
          assert.equal(
            await vb.evaluate((e) => getComputedStyle(e).backgroundColor),
            scenario.color,
          );
          assert.equal(
            await vb.evaluate((e) => getComputedStyle(e).borderLeftStyle),
            'dashed',
          );
          assert.equal(await vb.locator('[data-lp-drop-plus]').innerText(), '+');
          assert.equal(Math.round(vr.width), 20);
          assert(vr.x >= sr.x && vr.x + vr.width <= sr.x + sr.width + 1);
          const vt = await page.evaluate(() => window.__target);
          assert.equal(vt.position.columnIndex, 0);
          assert.equal(vt.position.splitColumns, 2);
          await page.mouse.up();
          await marker.waitFor({ state: 'detached' });
          report.steps.push({
            viewport,
            zoom,
            background: scenario.background,
            layer: !!scenario.layer,
            orientation: 'vertical',
            color: scenario.color,
            width: 20,
            nativeDrop: 'new-column-0',
          });
          console.log(
            'PASS single 20px bar after heading, color, scroll/zoom and native drop',
            viewport.width,
            zoom,
            scenario.background,
            !!scenario.layer,
          );
        }
    }
    assert.deepEqual(errors, []);
    report.passed = true;
  } finally {
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(report, null, 2));
    await browser.close();
    server.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

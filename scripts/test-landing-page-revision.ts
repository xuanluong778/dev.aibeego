import { createRequire } from 'node:module';
const requireFixture = createRequire(import.meta.url);
const sourceHarness = requireFixture('./helpers/landing-page-source-harness.cjs');
import { decideDraftRecovery } from '../apps/web/src/components/landing-pages/landing-page-draft-recovery.ts';
import {
  decideLandingPageAutosave,
  publishRevisionAllowed,
  readLandingPageRequestId,
  readLandingPageRevision,
} from '../apps/api/src/landing-pages/landing-page-revision.ts';

function assert(cond: boolean, message: string) {
  if (!cond) throw new Error(message);
}

const stored = { meta: { clientRevision: 5, lastAutosaveRequestId: 'req-a' } };
assert(readLandingPageRevision(stored) === 5, 'read revision');
assert(readLandingPageRequestId(stored) === 'req-a', 'read request id');

const first = decideLandingPageAutosave({
  storedRevision: 5,
  storedRequestId: null,
  baseRevision: 5,
  incomingRevision: 6,
  requestId: 'tab-a',
});
assert(first.action === 'accept' && first.nextRevision === 6, 'first tab accepts');

const second = decideLandingPageAutosave({
  storedRevision: 6,
  storedRequestId: 'tab-a',
  baseRevision: 5,
  incomingRevision: 6,
  requestId: 'tab-b',
});
assert(second.action === 'reject' && second.storedRevision === 6, 'second tab does not overwrite');

const retry = decideLandingPageAutosave({
  storedRevision: 6,
  storedRequestId: 'tab-a',
  storedRequestHash: 'same-operation-receipt',
  requestHash: 'same-operation-receipt',
  baseRevision: 5,
  incomingRevision: 6,
  requestId: 'tab-a',
});
assert(
  retry.action === 'idempotent' && retry.nextRevision === 6,
  'same request retries without overwrite',
);

const flush = decideLandingPageAutosave({
  storedRevision: 6,
  storedRequestId: 'tab-a',
  baseRevision: 6,
  incomingRevision: 6,
  requestId: 'tab-a-2',
});
assert(flush.action === 'unchanged' && flush.nextRevision === 6, 'publish flush does not bump');

const nextEdit = decideLandingPageAutosave({
  storedRevision: 6,
  storedRequestId: 'tab-a',
  baseRevision: 6,
  incomingRevision: 8,
  requestId: 'tab-a-3',
});
assert(
  nextEdit.action === 'accept' && nextEdit.nextRevision === 8,
  'later edits from the same base land',
);

assert(publishRevisionAllowed(8, 8) === 'ok', 'publish the saved revision');
assert(publishRevisionAllowed(7, 8) === 'not_saved', 'publish waits until autosave lands');
assert(publishRevisionAllowed(9, 8) === 'stale', 'publish does not ship another tab');
assert(publishRevisionAllowed(9, null) === 'ok', 'legacy publish uses the stored draft');

assert(
  decideDraftRecovery({
    serverRevision: 4,
    local: {
      pageId: 'p',
      spec: { version: 1, blocks: [] } as never,
      baseRevision: 4,
      clientRevision: 6,
      savedAt: '',
    },
  }) === 'restore-local',
  'unsaved local draft restores when the server has not moved',
);
assert(
  decideDraftRecovery({
    serverRevision: 6,
    local: {
      pageId: 'p',
      spec: { version: 1, blocks: [] } as never,
      baseRevision: 6,
      clientRevision: 6,
      savedAt: '',
    },
  }) === 'use-server',
  'local draft already saved is ignored',
);
assert(
  decideDraftRecovery({
    serverRevision: 7,
    local: {
      pageId: 'p',
      spec: { version: 1, blocks: [] } as never,
      baseRevision: 4,
      clientRevision: 9,
      savedAt: '',
    },
  }) === 'conflict',
  'local draft does not auto-replace a newer server draft',
);

async function testSourceIsolation() {
  const { vm, path, root, parse, definition, evaluate, method, shared } = sourceHarness;
  const pack = parse(
    path.join(root, 'apps/api/src/landing-pages/landing-page-template-pack.service.ts'),
  );
  const ctx = vm.createContext({
    LandingPageTemplatePublishStatus: { PUBLISHED: 'PUBLISHED' },
    TEMPLATE_PACK_MANAGED_TAG: 'managed',
    BadRequestException: Error,
  });
  for (const name of ['mapStrings', 'stripAssetKeys', 'uniqueTags', 'thumbFromSpec'])
    ctx[name] = evaluate(definition(pack, name), ctx);
  const template = {
    id: 'template',
    slug: 'template',
    tags: [],
    assetKey: 'fixture',
    definition: shared.createEmptyLandingPageSpec(),
  };
  const writes: unknown[] = [];
  // Access to a user-page model throws even if the implementation tries to hide
  // that access behind an alias. Only template writes are allowed in this mock.
  const prisma = new Proxy(
    {
      landingPageTemplate: {
        update: async (query: unknown) => {
          writes.push(query);
          return template;
        },
      },
    },
    {
      get(target, key) {
        if (key === 'landingPage') throw new Error('template operation wrote a user page');
        return Reflect.get(target, key);
      },
    },
  );
  const receiver = {
    prisma,
    assertAdmin() {},
    parseUpload: () => ({
      manifest: { slug: 'template', name: 'Fixture', tags: [] },
      template: template.definition,
    }),
    findAdminTemplate: async () => template,
    assertManifest() {},
    snapshot: async () => {},
    applyAssets: async () => template.definition,
    serializeAdmin: (value: unknown) => value,
  };
  await method(pack, 'importUpdate', ctx).call(receiver, { id: 'admin' }, 'template', undefined);
  await method(pack, 'publish', ctx).call(receiver, { id: 'admin' }, 'template');
  assert(writes.length === 2, 'template update and publish write template rows only');
  // The source restore transaction/row lock and publishedSpec isolation are
  // executed with transaction spies in the dedicated version-restore test.
  const restoreTests = requireFixture('./test-landing-page-version-restore-revision.cjs');
  await restoreTests.run();
  console.log('landing page revision tests: PASS (source policy + template isolation)');
}
void testSourceIsolation();

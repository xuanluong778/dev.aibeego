import assert from 'node:assert/strict';
import { after } from 'node:test';
import { as, pub } from './api';
import { actual } from './trace';
import { autosaveBody, makeSpec, newPageBody, type FakeSpec } from '../fixtures/specs';
import { uniq } from '../fixtures/run';

export type Client = Awaited<ReturnType<typeof as>>;

const created: Array<{ client: Client; id: string }> = [];

/** Gọi 1 lần ở đầu file test: dọn mọi trang test đã tạo (POST /landing-pages/:id/delete). */
export function useCleanup() {
  after(async () => {
    for (const { client, id } of created.splice(0)) {
      try {
        await client.post(`/landing-pages/${id}/delete`, undefined, { quiet: true });
      } catch {
        /* dọn dẹp không được làm hỏng kết quả */
      }
    }
  });
}

const ok = (s: number) => s >= 200 && s < 300;

export async function newPage(client: Client, name = uniq('LPT trang')) {
  const r = await client.post('/landing-pages', newPageBody(name));
  assert.ok(ok(r.status), `tạo trang phải thành công, nhận HTTP ${r.status}`);
  created.push({ client, id: r.body.id });
  return r.body as { id: string; slug: string; name: string; status: string };
}

export async function getPage(client: Client, id: string) {
  const r = await client.get(`/landing-pages/${id}`);
  assert.equal(r.status, 200);
  return r.body as { id: string; slug: string; name: string; status: string; draftSpec: FakeSpec & { meta?: { clientRevision?: number } }; publishedSpec: FakeSpec | null };
}

export const revisionOf = (p: { draftSpec?: { meta?: { clientRevision?: number } } }) => p.draftSpec?.meta?.clientRevision ?? 0;

export async function autosave(client: Client, id: string, a: { spec: FakeSpec; base: number; revision: number; requestId: string; name?: string }) {
  return client.post(`/landing-pages/${id}/autosave`, autosaveBody(a));
}

/** Tạo trang, đặt tiêu đề, lưu (revision 1) và trả về để các case sau dùng tiếp. */
export async function newSavedPage(client: Client, headline: string) {
  const page = await newPage(client);
  const r = await autosave(client, page.id, { spec: makeSpec({ headline }), base: 0, revision: 1, requestId: `req-${page.id.slice(-6)}-1` });
  assert.equal(r.body.rejected, false);
  return { ...page, revision: 1 as number };
}

export async function publish(client: Client, id: string, clientRevision?: number, note?: string) {
  return client.post(`/landing-pages/${id}/publish`, { ...(clientRevision !== undefined ? { clientRevision } : {}), ...(note ? { note } : {}) });
}

export async function publicGet(slug: string) {
  const r = await pub.get(`/landing-pages/public/${encodeURIComponent(slug)}`);
  actual('public status', r.status);
  return r;
}

export { makeSpec };

/** Danh sách lead của tổ chức (GET /leads?search=...). Chấp nhận các dạng {items}|{data}|mảng. */
export async function findLeads(client: Client, search: string) {
  const r = await client.get('/leads', { query: { search, limit: 20 } });
  assert.equal(r.status, 200);
  const b = r.body;
  const items = Array.isArray(b) ? b : (b.items ?? b.data ?? b.leads ?? []);
  return items as any[];
}

/** Gửi form công khai với IP giả riêng. */
export async function submitLead(slug: string, body: unknown, ip: string) {
  return pub.post(`/landing-pages/public/${encodeURIComponent(slug)}/lead`, body, { headers: { 'X-Forwarded-For': ip } });
}
export async function trackEvent(slug: string, body: unknown, ip: string) {
  return pub.post(`/landing-pages/public/${encodeURIComponent(slug)}/events`, body, { headers: { 'X-Forwarded-For': ip } });
}

/** Tạo + xuất bản 1 trang có form, trả về {id, slug}. */
export async function publishedPage(client: Client, headline = 'LEAD-PAGE') {
  const page = await newSavedPage(client, headline);
  const r = await publish(client, page.id, 1);
  assert.ok(r.status < 300, `xuất bản phải thành công, nhận ${r.status}`);
  return page;
}

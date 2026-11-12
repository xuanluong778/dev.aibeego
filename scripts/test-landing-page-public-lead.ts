import assert from 'node:assert/strict';
import { interpretPublicLeadResponse } from '../apps/web/src/components/landing-pages/landing-page-public-lead.ts';

const ok = interpretPublicLeadResponse(200, { ok: true, leadId: '1' } as { ok?: boolean; message?: string });
assert.equal(ok.ok, true);
assert.match(ok.message, /Cảm ơn/);

const failed = interpretPublicLeadResponse(500, { ok: false, message: 'CRM lỗi' });
assert.equal(failed.ok, false);
assert.equal(failed.message, 'CRM lỗi');
assert.doesNotMatch(failed.message, /Cảm ơn/);

const empty = interpretPublicLeadResponse(200, null);
assert.equal(empty.ok, false);

const denied = interpretPublicLeadResponse(429, { message: 'Thông tin vừa được gửi. Vui lòng đợi một lát trước khi gửi lại.' });
assert.equal(denied.ok, false);
assert.match(denied.message, /đợi/);

console.log('public lead response OK');

/**
 * In toàn bộ DỮ LIỆU GIẢ (fixtures) mà bộ test dùng.  Chạy:
 *   cd packages/database && npx tsx ../../tests/landing-page/tools/show-data.ts
 */
import { ACCOUNTS } from '../fixtures/accounts';
import { RUN_ID, uniq, uniqSlug } from '../fixtures/run';
import { SMOKE, makeSpec, newPageBody, autosaveBody } from '../fixtures/specs';
import { VALID_LEAD, LEAD_CASES, FAKE_IPS, FAKE_EVENT, freshIp, freshPhone, freshEmail } from '../fixtures/leads';
import { MOTION_INPUTS, MOTION_KEYS, PRESETS } from '../fixtures/motion';
import { DOMAIN_INPUTS, INTERNAL_DOMAINS } from '../fixtures/domains';
import { manifestOf, templateOf, HTML_SAMPLE, PNG_1PX, validPack } from '../fixtures/packs';
import { readZip } from '../../../apps/api/src/landing-pages/template-pack';

const section = (title: string, value: unknown) => {
  console.log(`\n## ${title}\n`);
  console.log('```json\n' + JSON.stringify(value, null, 2) + '\n```');
};

console.log('# DỮ LIỆU GIẢ (FAKE) DÙNG TRONG BỘ TEST LANDING PAGE');
section('RUN_ID và cách đặt tên dữ liệu tạo ra trong mỗi lần chạy', { RUN_ID, uniq: uniq('LPT trang'), uniqSlug: uniqSlug('lpt-slug') });
section('Tài khoản (mật khẩu lấy từ biến môi trường, không có trong mã)', ACCOUNTS);
section('Dữ liệu cố định của chuỗi smoke', SMOKE);
section('Body tạo trang trống: POST /landing-pages', newPageBody('SMOKE LP 20261111-01'));
section('Spec trang mẫu (draftSpec) do makeSpec() sinh ra', makeSpec({ headline: 'Tiêu đề thử nghiệm', revision: 0 }));
section('Body autosave: POST /landing-pages/:id/autosave', autosaveBody({ spec: makeSpec({ headline: 'AS-01' }), base: 0, revision: 1, requestId: 'req-0001', name: 'Tên mới' }));
section('Lead hợp lệ: POST /landing-pages/public/:slug/lead', VALID_LEAD);
section('Các biến thể lead (biên/spam/làm sạch)', LEAD_CASES);
section('Dữ liệu sinh ngẫu nhiên mỗi lần gọi (tránh đụng giới hạn tần suất / chống lặp)', { IP_qua_X_Forwarded_For: freshIp(), SDT: freshPhone(), email: freshEmail(), IP_cố_định: FAKE_IPS });
section('Sự kiện theo dõi: POST /landing-pages/public/:slug/events', FAKE_EVENT);
section('Motion: 11 kiểu hiệu ứng', PRESETS);
section('Motion: đầu vào "bẩn" → kết quả mong đợi sau khi làm sạch', MOTION_INPUTS);
section('Motion: khóa phần tử hợp lệ / không hợp lệ', MOTION_KEYS);
section('Tên miền: đầu vào → chuẩn hóa → hợp lệ?', DOMAIN_INPUTS);
section('Tên miền nội bộ bị chặn (SSRF)', INTERNAL_DOMAINS);
section('Gói mẫu ZIP: manifest.json', manifestOf());
section('Gói mẫu ZIP: template.json', templateOf());
section('Gói mẫu ZIP tự dựng bằng validPack(): danh sách tệp bên trong', Object.fromEntries([...readZip(validPack('lpt-demo'))].map(([n, b]) => [n, `${b.length} byte`])));
section('HTML mẫu (gói chỉ có index.html)', HTML_SAMPLE);
section('Ảnh PNG 1x1 dùng làm asset', { bytes: PNG_1PX.length });

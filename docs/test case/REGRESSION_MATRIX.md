# Ma trận regression: sửa tính năng nào thì chạy test nào

Cập nhật: 11/11/2026. Phạm vi: toàn hệ thống, chi tiết nhất cho module Landing Page.
Tài liệu này được lập bằng cách đọc thư mục `scripts/` và các tài liệu audit có sẵn. **Chưa chạy lại toàn bộ test để lấy baseline mới** (xem mục 5).

## 1. Cách đọc tài liệu này

Mỗi test thuộc một trong 4 lớp, từ rẻ đến đắt:

| Lớp | Là gì | Cần gì để chạy | Chi phí |
|---|---|---|---|
| L0 | Kiểm tra kiểu và build (`tsc`, build image) | Mã nguồn | Thấp, nhưng build web tốn nhiều đĩa |
| L1 | Test nguồn/đơn vị offline (`test-*.cjs`, `test-*.ts`) đọc mã và chạy logic thuần | `node`, `tsx` | Rất thấp |
| L2 | Test trình duyệt (`qa-landing-page-*-browser.cjs`) chạy trên **route Builder thật**, API bị chặn/giả lập, không ghi dữ liệu thật | Playwright + một container web đang chạy | Trung bình |
| L3 | Audit catalog và thử trên production (`validate-*`, script audit 600 trang) | Container web, đôi khi DB | Cao |

Quy tắc: luôn chạy L0 và L1 liên quan; chạy L2 khi động vào Builder/Renderer; chạy L3 khi động vào catalog template hoặc trước khi deploy.

## 2. Danh sách test suite (thư mục `scripts/`)

Tổng cộng khoảng 408 script test/QA/kiểm tra.

| Nhóm | Số file (xấp xỉ) | Tiền tố / ví dụ |
|---|---|---|
| Landing Page: test nguồn/đơn vị | 132 | `test-landing-page-*` |
| Landing Page: trình duyệt/QA | 29 | `qa-landing-page-*` |
| Agency Portfolio (mẫu thử nghiệm riêng) | 6 | `qa-agency-portfolio-*`, `test-agency-portfolio-standard.cjs` |
| Landing Page: validate catalog | 3 | `validate-landing-page-template-*` |
| Ads (Meta, Google, tổng hợp) | 28 + 10 | `test-ads-*`, `test-meta-*`, `test-facebook-*`, `test-google-ads-*` |
| Marketing Autopilot | 20 | `test-marketing-autopilot-*` |
| Messaging / Zalo | 12 + 30 | `test-messaging-*`, `test-zalo-*` |
| Teleprompter | 18 | `test-teleprompter-*` |
| Funnel | 13 | `test-funnel-*` |
| Assistant | 11 | `test-assistant-*` |
| Work management / HRM | 9 | `test-work-*`, `test-hrm-*` |
| Bảo mật, đăng nhập, phân quyền | 12 | `test-p0-security`, `test-wave1-security`, `test-login-rate-limit`, `test-upload-security-e2e`, `test-platform-admin-rbac` |
| Credit, gói, thanh toán, admin | 14 | `test-credit-*`, `test-subscription-*`, `test-sepay-billing`, `test-admin-*` |
| Email | 8 | `test-email-*`, `test-brevo-*` |
| CRM, CSKH, auto-post, affiliate | 22 | `test-crm-*`, `test-cskh-*`, `test-auto-post-*`, `test-affiliate-*` |
| Nội dung, video, opinion | 14 | `test-video-*`, `test-opinion-*`, `test-content-marketing-logic` |
| Giao diện chung (sidebar, locale) | 6 | `test-ui-*`, `test-sidebar-upgrade-nav`, `test-main-app-sidebar-collapse` |

Lệnh có sẵn trong `package.json` gốc: `test:landing-page-saas`, `test:landing-page-tenant`, `test:landing-page-inspector-modes`, cùng nhiều `test:*` cho các module khác.
Bộ chạy gộp offline cho Landing Page: `node scripts/run-landing-page-local-tests.cjs [thư mục báo cáo]` (chạy toàn bộ `test-landing-page-*`, chặn mạng và DB; bỏ qua 3 suite cần môi trường cô lập).

## 3. Cách chạy test trình duyệt (L2)

Các suite L2 cần một container web chạy ảnh hiện tại, API bị trỏ vào địa chỉ chết để không có ghi thật:

```
docker run -d --name qa-web -p 127.0.0.1:13041:3000 -e API_INTERNAL_URL=http://127.0.0.1:1 marketingaz-web:<tag>
LP_ROWS_QA_ORIGIN=http://127.0.0.1:13041 node scripts/qa-landing-page-section-rows-browser.cjs
docker rm -f qa-web
```

Biến môi trường origin theo từng suite:

| Suite | Biến | Ghi chú |
|---|---|---|
| `qa-landing-page-section-rows-browser` | `LP_ROWS_QA_ORIGIN` | |
| `qa-landing-page-element-toolbar-browser` | `LP_TOOLBAR_QA_ORIGIN` | thêm `LP_TOOLBAR_QA_TAG` |
| `qa-landing-page-pointer-resize-browser` | `LP_POINTER_QA_ORIGIN` | |
| `qa-landing-page-drop-layout-browser` | `LP_DROP_QA_ORIGIN` | |
| `qa-landing-page-canvas-groups-browser` | `LP_GROUP_QA_ORIGIN` | |
| `qa-landing-page-client-route-browser` | `LP_CLIENT_QA_ORIGIN` | |
| `qa-landing-page-box-pass-browser` | `LP_PASS_QA_ORIGIN` | trước đây đã FAIL cả trên bản cũ (lỗi có sẵn) |
| `qa-landing-page-template-bulk-ui` | `LP_BULK_QA_ORIGIN` | dùng API giả |
| `qa-landing-page-no-overlap-browser` | `LP_OVERLAP_QA_ORIGIN`, `LP_OVERLAP_QA_PAGE_FILE` | cần file JSON trang thật, bắt buộc |
| `qa-landing-page-text-columns` | `LP_TEXT_QA_CONFIG` | cần API + PostgreSQL cô lập, không chạy trên production |

Lưu ý: dọn container QA sau khi chạy. Ổ đĩa máy chủ từng đầy 100% vì build, hiện còn rất ít chỗ trống.

## 4. Ma trận: sửa cái gì thì chạy cái gì

Cột "Bắt buộc" là tối thiểu trước khi coi là xong. Cột "Nên chạy" là mở rộng khi thay đổi lớn.

### 4.1 Mọi thay đổi (nền)
- Bắt buộc: `tsc --noEmit` cho `packages/shared`, `apps/api`, `apps/web` (so với số lỗi có sẵn, không để phát sinh lỗi mới trong file đã sửa).
- Bắt buộc nếu sửa API: `test-landing-page-tenant-isolation.cjs` (kiểm tra tách dữ liệu giữa tổ chức).
- Sau deploy: gọi `/login` trả 200, kiểm tra log API, đếm bản ghi mẫu hệ thống (kỳ vọng 200).

### 4.2 Catalog template (nội dung, ảnh, cấu trúc 200 mẫu)
Áp dụng khi sửa: `landing-page-commercial-*.ts`, `landing-page-template-expand.ts`, `landing-page-category-architectures.ts`, `landing-page-verified-backdrops.ts`, thư viện ảnh.

| Bắt buộc | Nên chạy |
|---|---|
| `validate-landing-page-template-catalog.cjs` | `validate-landing-page-template-production.cjs`, `validate-landing-page-template-gallery-production.cjs` |
| `test-landing-page-template-engine.cjs`, `test-landing-page-template-foundation.cjs` | `test-landing-page-template-differentiation.cjs`, `test-landing-page-template-gallery.cjs`, `test-landing-page-template-ui.cjs` |
| `qa-landing-page-real-catalog.cjs` | `qa-landing-page-catalog-responsive.cjs`, `qa-landing-page-visual-diversity.cjs`, `qa-landing-page-global-visual.cjs` |
| Audit toàn catalog 200 mẫu × 3 khung hình (tràn ngang, thiếu form, câu thiết kế rò rỉ, trường form sai ngành) | Chụp mắt thường một mẫu mỗi ngành |

Ghi chú: các test `foundation`, `engine`, `differentiation`, `gallery`, `ui` đang FAIL từ trước vì kiểm tra chuỗi phiên bản catalog cũ (ví dụ `gallery-v7`). Chưa có baseline xác nhận, xem mục 5. Nếu catalog đổi phiên bản, phải cập nhật `LANDING_PAGE_TEMPLATE_CATALOG_VERSION` và các test gắn cứng chuỗi này.

### 4.3 Renderer và CSS dùng chung (hero, card, pricing, gallery, form hiển thị)
Áp dụng khi sửa: `landing-page-renderer.tsx`, `landing-page-*-css.ts`, `landing-page-legacy-css-scope.ts`.

| Bắt buộc | Nên chạy |
|---|---|
| `test-landing-page-builder-preview-public-parity.cjs`, `test-landing-page-live-parity.cjs` | `test-landing-page-public-free-position.cjs`, `test-landing-page-public-meta-keep.cjs` |
| `qa-landing-page-catalog-responsive.cjs` | `qa-landing-page-agency-responsive.cjs`, `qa-landing-page-batch1-responsive.cjs`, `qa-landing-page-batch2-responsive.cjs`, `qa-landing-page-spa-responsive.cjs` |
| `qa-agency-portfolio-isolation.cjs`, `qa-agency-portfolio-standard.cjs`, `test-agency-portfolio-standard.cjs` (pilot không được bị CSS dùng chung kéo theo) | `qa-agency-portfolio-visual.cjs`, `qa-agency-portfolio-visibility.cjs` |
| Audit 200 mẫu (L3) | `test-landing-page-motion.cjs`, `qa-landing-page-motion-browser.cjs` nếu đụng animation |

Rủi ro đã gặp: sửa renderer có thể làm form vốn bị ẩn xuất hiện lại trên trang cũ của khách. Cần xem lại vài trang thật sau khi deploy.

### 4.4 Builder: kéo thả, free-drag, resize, xoay
Áp dụng khi sửa: `landing-page-free-drag.tsx`, `landing-page-canvas-ux.tsx`, drag/resize engine.

| Bắt buộc | Nên chạy |
|---|---|
| `qa-landing-page-pointer-resize-browser.cjs` | `qa-landing-page-box-pass-browser.cjs` (đã FAIL sẵn, so với baseline) |
| `qa-landing-page-drop-layout-browser.cjs` | `qa-landing-page-no-overlap-browser.cjs` |
| `qa-landing-page-canvas-groups-browser.cjs` | `qa-landing-page-text-columns.cjs` (cần môi trường cô lập) |
| `test-landing-page-drag-resize-engine.cjs`, `test-landing-page-element-free-drag.cjs`, `test-landing-page-free-drag-move-size.cjs` | `test-landing-page-free-drag-center-guides.cjs`, `test-landing-page-resize-rotate.cjs`, `test-landing-page-resize-after-rotate.cjs`, `test-landing-page-item-resize-shrink.cjs`, `test-landing-page-heading-box-resize-shrink.cjs` |
| `test-landing-page-no-overlap.cjs`, `test-landing-page-section-overlap.cjs` | `test-landing-page-free-position-canvas.cjs`, `test-landing-page-free-toggle-no-collision.cjs` |

Lỗi cũ liên quan (cần giữ không tái phát): chuột bị "dính" sau khi thả (marquee mất sự kiện pointerup); LeadForm không di chuyển được; chọn nhầm element khi kéo.

### 4.5 Builder: toolbar element, menu, chọn element
| Bắt buộc | Nên chạy |
|---|---|
| `qa-landing-page-element-toolbar-browser.cjs` | `test-landing-page-element-toolbar-placement.cjs` |
| `test-landing-page-builder-toolbar.cjs`, `test-landing-page-toolbar-float.cjs` | `test-landing-page-toolbar-no-scroll.cjs`, `test-landing-page-toolbar-sidebar-edge-sync.cjs` |
| `test-landing-page-canvas-selection.cjs`, `test-landing-page-canvas-context-menu.cjs` | `test-landing-page-heading-toolbar.cjs`, `test-landing-page-text-toolbar.cjs`, `test-landing-page-content-image-toolbar.cjs` |

### 4.6 Builder: hàng/cột trong section, chia cột, section
| Bắt buộc | Nên chạy |
|---|---|
| `qa-landing-page-section-rows-browser.cjs` | `qa-landing-page-text-columns.cjs` |
| `test-landing-page-section-rows.cjs`, `test-landing-page-column-split.cjs` | `test-landing-page-section-elements.cjs`, `test-landing-page-section-settings.mts`, `test-landing-page-section-background.cjs` |
| `test-landing-page-section-content-overflow.cjs` | `test-landing-page-sections-responsive.cjs`, `test-landing-page-content-safe-area.cjs` |

### 4.7 Builder: lưu, autosave, publish, lịch sử, phiên bản
Đây là vùng rủi ro mất dữ liệu cao nhất. Chạy đủ.

| Bắt buộc | Nên chạy |
|---|---|
| `test-landing-page-autosave-stuck.cjs`, `test-landing-page-autosave-identity.cjs` | `test-landing-page-autosave-identity-e2e.cjs` (cần môi trường cô lập) |
| `test-landing-page-publish-flush.cjs`, `test-landing-page-revision.ts`, `test-landing-page-version-restore-revision.cjs` | `test-landing-page-draft-recovery.ts`, `test-landing-page-undo-page-isolation.cjs` |
| `test-landing-page-history-live-edit.cjs`, `qa-landing-page-client-route-browser.cjs` | `test-landing-page-history-live-edit-browser.cjs`, `test-landing-page-next-chunk-reload.cjs` |

### 4.8 Form thu lead và trang công khai
| Bắt buộc | Nên chạy |
|---|---|
| `test-landing-page-public-lead.ts` | `test-landing-page-agency-client-export.cjs`, `test-landing-page-public-meta-keep.cjs` |
| `test-landing-page-tenant-isolation.cjs` | `test-landing-page-url-doctor.cjs`, `test-landing-page-doctor-gates.cjs` (cần môi trường cô lập) |
| Gửi thử form trên một trang đã xuất bản (thủ công, trang thử) | `test-leads-ux.ts`, `test-funnel-form-capture.ts` nếu đụng CRM |

### 4.9 Thư viện section, thư viện thành phần, thanh bên
| Bắt buộc | Nên chạy |
|---|---|
| `test-landing-page-section-library-parity.cjs`, `test-landing-page-section-library-quality.cjs`, `test-landing-page-section-library-preview.cjs` | `qa-landing-page-section-library-matrix-browser.cjs`, `qa-landing-page-section-library-parity-browser.cjs`, `qa-landing-page-section-library-quality-browser.cjs`, `qa-landing-page-section-library-quality-editor.cjs`, `qa-landing-page-section-library-quality-interactions.cjs` |
| `test-landing-page-add-components-dnd.cjs`, `test-landing-page-add-components-grid.cjs` | `test-landing-page-sidebar-dnd.cjs`, `test-landing-page-section-preset-dnd.cjs`, `test-landing-page-sidebar-compact.cjs`, `test-landing-page-builder-fixed-panels.cjs` |

### 4.10 Tạo trang mới (từ mẫu, trang trống, AI)
| Bắt buộc | Nên chạy |
|---|---|
| `test-landing-page-blank-create.cjs` | `test-landing-page-create-template-picker.cjs`, `test-landing-page-create-ai-first.cjs` |
| `test-landing-page-create-storage.ts`, `qa-landing-page-category-labels-browser.cjs` | `test-landing-page-create-persistence-browser.ts`, `test-landing-page-ai-create-browser.ts` |

### 4.11 Quản lý template của admin (sửa mẫu gốc, tải tất cả, upload hàng loạt, gói ZIP)
Áp dụng khi sửa: `landing-page-template-pack.service.ts`, `template-pack.ts`, `manage-templates/page.tsx`, trang Templates, các endpoint `templates/*` trong controller.

| Bắt buộc | Nên chạy |
|---|---|
| `test-landing-page-template-pack.ts` | `test-landing-page-template-upload-http.cjs` |
| `test-landing-page-template-bulk-upload.cjs`, `test-landing-page-template-bulk-dedup.cjs`, `test-landing-page-template-bulk-folders.cjs` | `qa-landing-page-template-bulk-ui.cjs`, `qa-landing-page-upload-limits.cjs` |
| `test-platform-admin-rbac.ts` (chỉ SUPER_ADMIN dùng được) | `test-landing-page-template-export-colors.cjs` |
| Kiểm tra thủ công: sửa mẫu rồi lưu, mẫu đã lưu không bị API ghi đè khi khởi động lại; trang làm việc `tpl-edit-*` không hiện trong danh sách và không publish được | Test trên mẫu thử có slug riêng, xóa sau khi xong |

Lưu ý quan trọng: đã có sẵn chức năng upload mẫu hàng loạt do công việc trước đó (xem các tài liệu `landing-page-template-bulk-*-20261109.md`). Chức năng "Upload hàng loạt" thêm gần đây ở trang Quản lý Templates (endpoint `templates/packs/bulk`) có thể trùng chức năng; cần đối chiếu hai bộ test này khi chỉnh. Xem mục 5.

### 4.12 Đồng bộ catalog khi khởi động API
Áp dụng khi sửa `ensureSystemTemplates` hoặc `LANDING_PAGE_TEMPLATE_CATALOG_VERSION`.
- Bắt buộc: đổi phiên bản catalog trên môi trường thử và kiểm tra: số mẫu hệ thống đúng (200), mẫu có tag `pack:managed` (đã chỉnh tay) **không** bị ghi đè, trang của khách không đổi.
- Nên chạy: `validate-landing-page-template-catalog.cjs`.

### 4.13 Điều hướng, sidebar, nhãn giao diện
- Bắt buộc: `test-main-app-sidebar-collapse.cjs`, `test-sidebar-upgrade-nav.cjs`, `test-all-sidebar-tabs-restore.ts`.
- Nên chạy: `test-ui-locale-persist.ts`, `test-ui-regression-restore.ts`.
- Nhớ: menu Landing Page đã Việt hóa, không đổi nhãn tab cũ khi không được yêu cầu.

### 4.14 Các module ngoài Landing Page (khi sửa chung cho nhiều module)
| Khi sửa | Bắt buộc |
|---|---|
| Đăng nhập, phân quyền, tách tổ chức, upload | `test-p0-security.ts`, `test-wave1-security.ts`, `test-login-rate-limit.ts`, `test-upload-security-e2e.cjs`, `test-platform-admin-rbac.ts` |
| Credit, gói, thanh toán | `test-credit-regression.ts`, `test-credit-service.ts`, `test-subscription-*.ts`, `test-sepay-billing.ts` |
| Funnel/CRM/Lead | `test-funnel-closed-loop.ts`, `test-crm-appointment-automation.ts`, `test-leads-ux.ts` |
| Messaging/Zalo | `test-messaging-*` và `test-zalo-*` tương ứng (nhiều test gọi dịch vụ ngoài, chỉ chạy `-live`/`-e2e` khi chủ động) |
| Ads | `test-ads-*`, `test-google-ads-*` tương ứng |

## 5. Giới hạn và việc còn thiếu (đọc kỹ)

1. **Chưa có baseline xanh.** Audit nội bộ ngày 30/10/2026 (`scripts/landing-page-test-audit.md`) ghi: trong 99 script đã rà, 34 PASS, 2 FAIL do lỗi sản phẩm, 61 FAIL do matcher lỗi thời, 2 BLOCKED. Tài liệu này chưa chạy lại bộ test nên không khẳng định test nào hiện đang PASS. Cần chạy `run-landing-page-local-tests.cjs` một lần, ghi kết quả vào bảng baseline, rồi mới dùng ma trận này để so sánh "mới hỏng" với "hỏng từ trước".
2. **Test lỗi thời không đáng tin để chặn.** Nhiều test kiểm tra theo chuỗi mã nguồn hoặc phiên bản cũ (ví dụ `gallery-v7`, số action AI). Với chúng, coi FAIL là "cần kiểm tra", chưa phải "đã hồi quy". Hướng tốt: thay dần bằng test hành vi (nhóm `qa-*-browser`).
3. **Một số suite cần môi trường cô lập** (API + PostgreSQL riêng): `test-landing-page-autosave-identity-e2e`, `test-landing-page-doctor-gates`, `test-landing-page-saas-ready` (tự build API), `qa-landing-page-text-columns`. Không chạy trên máy đang chạy production.
4. **Chưa có test cho:** luồng sửa mẫu gốc (openEditSession/saveFromSession) và `exportAll`/`importBulk` trong repo (đã kiểm tra thủ công bằng script tạm, không lưu lại); audit 200 mẫu hiện nằm ngoài repo tại `/root/qa/` (`audit.cjs`, `shot.cjs`, `orphan.cjs`). Nên chuyển vào `scripts/` để dùng chung.
5. **Chưa gắn video lỗi vào ma trận.** Có 11 video `.wmv` trong `docs/` (kéo box, kéo element, thả chia cột, toolbar, chỉnh section, thêm thành phần, văn bản). Bảng ánh xạ video → test dưới đây là **dự kiến theo tên file**, chưa đối chiếu nội dung video:

| Video | Test liên quan (dự kiến) |
|---|---|
| `keo-box.wmv`, `keo-box-2.wmv` | 4.4: `pointer-resize`, `box-pass`, `drag-resize-engine` |
| `keo-element.wmv` | 4.4: `element-free-drag`, `free-drag-move-size`, `canvas-groups` |
| `keo-tha-chia-cot-element.wmv` | 4.6: `drop-layout`, `section-rows`, `text-columns`, `column-split` |
| `toolbar.wmv`, `toolbar-get.wmv` | 4.5: `element-toolbar`, `builder-toolbar` |
| `chinh-sua-section.wmv` | 4.6: `section-settings`, `section-background` |
| `them-thanh-phan.wmv` | 4.9: `add-components-dnd`, `add-components-grid` |
| `landing page text.wmv`, `tab văn bản.wmv` | 4.5: `text-toolbar`, `heading-toolbar`; `text-center-drag-browser` |
| `landing page.wmv` | chưa rõ, cần xem video |

## 6. Quy trình đề xuất mỗi lần thêm tính năng

1. Xác định hàng tương ứng trong mục 4 (một thay đổi có thể chạm nhiều hàng, hợp các tập test lại).
2. Chạy L0 và các test "Bắt buộc" của L1. Sửa đến khi không phát sinh FAIL mới so với baseline.
3. Nếu động vào Builder/Renderer: dựng container QA (mục 3) và chạy các suite L2 "Bắt buộc".
4. Nếu động vào catalog: chạy audit catalog L3 trước khi build image production.
5. Sau khi deploy: kiểm tra mục 4.1 (hậu deploy) và thử bằng tài khoản thật những luồng liên quan.
6. Ghi kết quả (PASS/FAIL, số liệu, tag image) vào một tài liệu `docs/<tính-năng>-<ngày>.md` như các tài liệu hiện có.

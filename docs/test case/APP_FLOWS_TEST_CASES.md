# Danh sách flow của ứng dụng và test case tương ứng

Cập nhật: 11/11/2026. Dùng cùng với `docs/test case/REGRESSION_MATRIX.md` (ma trận "sửa X thì chạy test nào"). Chi tiết từng flow (bước test và sơ đồ sequence) nằm ở thư mục `docs/test case/flows/`.

## Cách đọc và độ tin cậy

- **Nguồn flow:** menu (`apps/web/src/config/navigation.ts`), các route trong `apps/web/src/app`, các module trong `apps/api/src`.
- **Nguồn test:** thư mục `scripts/`. Việc ghép test với flow dựa trên **tên file và nhóm tiền tố**, chưa mở và đọc từng test, chưa chạy lại. Một số test có thể không phủ hết ý nghĩa của tên.
- **Ký hiệu:**
  - `[A]` = đã có test tự động (ghi tên file).
  - `[T]` = chưa thấy test tự động, cần kiểm tra thủ công hoặc viết test mới.
  - `[L]` = test gọi dịch vụ ngoài/live (Meta, Google, Zalo, Brevo...), chỉ chạy khi chủ động, không đưa vào chạy tự động hằng ngày.
- **Mức ưu tiên:** P0 = mất tiền/dữ liệu/bảo mật; P1 = luồng chính của khách; P2 = phụ trợ.
- Chưa có baseline xanh cho phần lớn test (xem `REGRESSION_MATRIX.md`, mục 5). FAIL của test cũ chưa chắc là hồi quy mới.

---

## Bản đồ nhanh: 13 nhóm, 64 flow (F01 đến F52 và LP01 đến LP12)

| Nhóm | Flow |
|---|---|
| A. Tài khoản và gói | F01 Đăng ký, F02 Đăng nhập, F03 Phân quyền/tách tổ chức, F04 Cài đặt, F05 Gói/thanh toán, F06 Credit AI, F07 Affiliate |
| B. Tổng quan và AI | F08 Tổng quan, F09 Marketing Autopilot, F10 Trợ lý AI, F11 Kho kiến thức (RAG) |
| C. CRM | F12 Khách hàng 360, F13 Lead, F14 Funnel, F15 Lịch hẹn và dịch vụ |
| D. Landing Page | LP01 đến LP12 (12 flow con) |
| E. Nội dung | F16 Tạo nội dung quảng cáo, F17 Xây dựng thương hiệu, F18 Kiểm tra chính sách quảng cáo, F19 Video transcript, F20 Thư viện nội dung, F21 Đăng bài tự động và lịch, F22 Kết nối fanpage, F23 Teleprompter |
| F. Quảng cáo | F24 Ads Meta, F25 Ads Google, F26 Attribution/ROAS |
| G. Nhắn tin | F27 Chiến dịch nhắn hàng loạt, F28 File đối tượng, F29 Tin nhắn tự động, F30 Chatbot CSKH, F31 Email marketing, F32 Zalo marketing, F33 Hộp thư (messages) |
| H. Nhân sự | F34 Nhân viên, F35 Ca làm, F36 Chấm công, F37 Nghỉ phép/OT |
| I. Quản lý công việc | F38 Dự án, F39 Việc của tôi, F40 Dashboard công việc, F41 Lịch công việc |
| J. Bán hàng | F42 Đơn hàng, F43 Sản phẩm, F44 Tồn kho, F45 Nhập/xuất kho, F46 Kiểm kê, F47 Mua hàng, F48 Báo cáo bán hàng |
| K. Tài chính | F49 Doanh thu/P&L, F50 Mục tiêu kinh doanh |
| L. Quản trị nền tảng | F51 Admin (người dùng, tổ chức, gói, thanh toán, credit, audit, jobs, tích hợp) |
| M. Trang công khai | F52 Trang công khai (`/p`, `/f`, hủy đăng ký email, callback Meta, điều khoản/riêng tư) |

---

## A. Tài khoản và gói

### F01 Đăng ký (OTP) — P0
| TC | Mô tả | Kết quả mong đợi | Test |
|---|---|---|---|
| F01-1 | Đăng ký bằng email, nhận OTP, nhập đúng | Tạo tài khoản và tổ chức, đăng nhập được | [A] `test-auth-registration-otp.ts` |
| F01-2 | OTP sai/hết hạn/dùng lại | Bị từ chối, không tạo tài khoản | [A] cùng file |
| F01-3 | Gửi OTP liên tục | Bị giới hạn tần suất | [A] `test-login-rate-limit.ts` |
| F01-4 | Màn đăng ký hiển thị đúng, nhãn tiếng Việt | Không lỗi giao diện | [T] |

### F02 Đăng nhập — P0
| TC | Mô tả | Kết quả mong đợi | Test |
|---|---|---|---|
| F02-1 | Đăng nhập email/mật khẩu đúng | Vào được ứng dụng | [T] (có khả năng nằm trong `test-p0-security.ts`) |
| F02-2 | Sai mật khẩu nhiều lần | Khóa tạm/giới hạn | [A] `test-login-rate-limit.ts` |
| F02-3 | Đăng nhập Google | Tạo/ghép tài khoản đúng | [A] `test-auth-google.ts` |
| F02-4 | Thiếu cấu hình Google Client ID | Không hiện lỗi cấu hình, nút Google hoạt động | [T] kiểm tra thủ công sau mỗi lần build web |
| F02-5 | Làm mới token/đăng xuất | Phiên bị hủy đúng | [T] |

### F03 Phân quyền và tách tổ chức — P0
| TC | Mô tả | Kết quả mong đợi | Test |
|---|---|---|---|
| F03-1 | Người dùng tổ chức A không đọc được dữ liệu tổ chức B | Trả 403/404 | [A] `test-p0-security.ts`, `test-wave1-security.ts` |
| F03-2 | Landing page tách theo tổ chức | Không thấy trang/lead chéo | [A] `test-landing-page-tenant-isolation.cjs` |
| F03-3 | Chỉ SUPER_ADMIN vào trang admin và các endpoint mẫu | Người khác bị chặn | [A] `test-platform-admin-rbac.ts` |
| F03-4 | Phân quyền theo vai trò ở quản lý công việc | Đúng quyền | [A] `test-work-management-rbac.ts` |
| F03-5 | Phiên trợ lý AI tách tổ chức | Không lộ dữ liệu chéo | [A] `test-assistant-session-tenant.ts` |
| F03-6 | Upload file độc hại/quá lớn | Bị từ chối | [A] `test-upload-security-e2e.cjs` |
| F03-7 | Mã hóa dữ liệu nhạy cảm | Giải mã đúng, sai khóa thì lỗi | [A] `test-encryption-aes-gcm.ts` |

### F04 Cài đặt (tài khoản, ngôn ngữ, kiến thức, kết nối, API, hệ thống) — P1
| TC | Mô tả | Kết quả mong đợi | Test |
|---|---|---|---|
| F04-1 | Đổi ngôn ngữ giao diện và giữ sau khi tải lại | Giữ lựa chọn | [A] `test-ui-locale-persist.ts` |
| F04-2 | Cập nhật hồ sơ tài khoản | Lưu thành công | [T] |
| F04-3 | Tạo/thu hồi khóa API | Hoạt động đúng | [T] |
| F04-4 | Kết nối bên ngoài (Facebook, Google, Zalo) | Kết nối/ngắt đúng | [A][L] xem F22, F25, F32 |

### F05 Gói, dùng thử và thanh toán — P0
| TC | Mô tả | Kết quả mong đợi | Test |
|---|---|---|---|
| F05-1 | Hiển thị gói hiện tại/trạng thái | Đúng gói, ngày hết hạn | [A] `test-subscription-display.cjs`, `test-account-subscription-status.ts` |
| F05-2 | Hạn chế tính năng khi hết gói | Bị chặn đúng | [A] `test-subscription-gate.ts` |
| F05-3 | Dùng thử 3 ngày | Cấp và hết hạn đúng | [A] `test-trial-3d.ts` |
| F05-4 | Thanh toán SePay và QR | Ghi nhận giao dịch đúng, không trùng | [A] `test-sepay-billing.ts`, `test-msp-pricing-qr.ts` |
| F05-5 | Cấp credit khi mua/gia hạn gói | Đúng số lượng | [A] `test-subscription-auto-credit.ts`, `test-subscription-credit.ts` |

### F06 Credit AI — P0
| TC | Mô tả | Kết quả mong đợi | Test |
|---|---|---|---|
| F06-1 | Trừ credit khi dùng tính năng AI | Trừ đúng, không âm | [A] `test-credit-service.ts`, `test-credit-regression.ts` |
| F06-2 | Hiển thị số dư | Khớp với dữ liệu | [A] `test-credit-ui.ts` |
| F06-3 | Admin tặng credit | Cộng đúng, có ghi nhận | [A] `test-admin-gift-credit.ts` |

### F07 Affiliate — P1
| TC | Mô tả | Kết quả mong đợi | Test |
|---|---|---|---|
| F07-1 | Đăng ký qua link giới thiệu, ghi nhận thống kê | Đúng người giới thiệu | [A] `test-affiliate-signup-stats.ts`, `test-affiliate.ts` |
| F07-2 | Logic hiển thị giao diện affiliate | Số liệu khớp | [A] `test-affiliate-ui-logic.ts` |
| F07-3 | Hoa hồng/rút tiền | Tính và duyệt đúng | [T] |

---

## B. Tổng quan và AI

### F08 Tổng quan và trung tâm module — P2
| TC | Mô tả | Test |
|---|---|---|
| F08-1 | Các ô số liệu ở trang tổng quan hiển thị đúng | [A] `test-module-overview-boxes.ts` |
| F08-2 | Toàn bộ tab sidebar còn hoạt động, không bị mất sau khi sửa menu | [A] `test-all-sidebar-tabs-restore.ts`, `test-sidebar-upgrade-nav.cjs`, `test-main-app-sidebar-collapse.cjs` |
| F08-3 | Hồi quy giao diện chung | [A] `test-ui-regression-restore.ts` |

### F09 Marketing Autopilot — P1
| TC | Mô tả | Test |
|---|---|---|
| F09-1 | Tạo/sửa/xóa dự án và lọc danh sách | [A] `test-marketing-autopilot-project-crud.ts`, `test-marketing-autopilot-project-list-filters.ts` |
| F09-2 | Gợi ý hành động tiếp theo (NBA) | [A] `test-marketing-autopilot-nba-v2.ts`, `test-marketing-autopilot-nba-v2-complete.ts` |
| F09-3 | Lập kế hoạch bằng AI, đối tượng, nháp nội dung | [A] `test-marketing-autopilot-llm-planner.ts`, `test-marketing-autopilot-ai-audience.ts`, `test-marketing-autopilot-content-draft.ts`, `test-marketing-autopilot-draft-create-e2e.ts` |
| F09-4 | Duyệt và thực thi, hàng rào an toàn | [A] `test-marketing-autopilot-approval-e2e.ts`, `test-marketing-autopilot-executor-e2e.ts`, `test-marketing-autopilot-execution-guardrail-e2e.ts` |
| F09-5 | Vòng kết quả và học từ kết quả | [A] `test-marketing-autopilot-outcome-loop-e2e.ts`, `test-marketing-autopilot-outcome-loop-regression.ts`, `test-marketing-autopilot-outcome-learning.ts` |
| F09-6 | Mô phỏng ngân sách, mission, tài sản thật | [A] `test-marketing-autopilot-budget-sim.ts`, `test-marketing-autopilot-mission-e2e.ts`, `test-marketing-autopilot-real-assets-e2e.ts` |
| F09-7 | MVP tổng thể | [A] `test-marketing-autopilot-mvp.ts`, `test-marketing-context-engine.ts` |

### F10 Trợ lý AI — P1
| TC | Mô tả | Test |
|---|---|---|
| F10-1 | Điều phối và chọn công cụ | [A] `test-assistant-orchestrator.ts`, `test-assistant-tools.ts`, `test-assistant-runtime.ts` |
| F10-2 | Công cụ theo miền dữ liệu | [A] `test-assistant-domain-tools.ts` |
| F10-3 | Thao tác ghi dữ liệu và xác nhận | [A] `test-assistant-write.ts`, `test-assistant-write-flow.ts` |
| F10-4 | Báo cáo và ý định nội dung | [A] `test-assistant-report.ts`, `test-assistant-content-intent.ts` |
| F10-5 | Giao diện widget trợ lý, canary | [A] `test-assistant-ui.ts`, `test-assistant-canary.ts`, `qa-assistant-widget-restore.cjs` |
| F10-6 | Tách phiên theo tổ chức | [A] `test-assistant-session-tenant.ts` |

### F11 Kho kiến thức (RAG) — P1
| TC | Mô tả | Test |
|---|---|---|
| F11-1 | Thêm tài liệu, truy vấn trả lời đúng nguồn | [A] `test-rag-kb-all-features.ts`, `test-cskh-rag-kb.ts` |
| F11-2 | Tách kiến thức theo tổ chức | [A] `test-cskh-project-isolation.ts`, `test-cskh-kb-tenant-digi.ts` |

---

## C. CRM

### F12 Khách hàng 360 — P0
| TC | Mô tả | Test |
|---|---|---|
| F12-1 | Hồ sơ 360 gộp đúng các kênh | [A] `test-customer-360-omnichannel.ts`, `test-customer-360-ssot.ts` |
| F12-2 | Khóa và chống trùng khách | [A] `test-customer-360-lock-unique.ts` |
| F12-3 | Luồng end-to-end trên production | [A][L] `test-customer-360-production-e2e.ts` |
| F12-4 | Hành trình khách hàng | [A] `test-customer-journey.ts` |
| F12-5 | Danh tính liên hệ qua kênh nhắn tin | [A] `test-messaging-contact-identity.ts` |
| F12-6 | Danh sách/trang chi tiết khách hiển thị đúng | [T] |

### F13 Lead — P1
| TC | Mô tả | Test |
|---|---|---|
| F13-1 | Danh sách lead, lọc, đổi trạng thái | [A] `test-leads-ux.ts` |
| F13-2 | Lead từ form landing page vào đúng tổ chức và nguồn | [A] `test-landing-page-public-lead.ts` |
| F13-3 | Chấm điểm lead và bảng lead funnel | [A] `test-funnel-lead-scoring.ts`, `test-funnel-lead-dashboard.ts` |

### F14 Funnel — P1
| TC | Mô tả | Test |
|---|---|---|
| F14-1 | Tạo, kiểm tra hợp lệ, xóa funnel | [A] `test-funnel-validator.ts`, `test-funnel-delete.ts` |
| F14-2 | Canvas và chạy funnel | [A] `test-funnel-canvas-runtime.ts`, `test-funnel-design-toggle.cjs`, `test-funnel-inline-edit.cjs` |
| F14-3 | Thu lead từ form funnel | [A] `test-funnel-form-capture.ts` |
| F14-4 | Tự động hóa, vòng khép kín | [A] `test-funnel-automation.ts`, `test-funnel-closed-loop.ts` |
| F14-5 | Phân tích, tư vấn, vòng đời end-to-end | [A] `test-funnel-analytics.ts`, `test-funnel-consultant.ts`, `test-funnel-lifecycle-e2e.ts` |

### F15 Lịch hẹn và dịch vụ — P1
| TC | Mô tả | Test |
|---|---|---|
| F15-1 | Tự động hóa lịch hẹn trong CRM | [A] `test-crm-appointment-automation.ts` |
| F15-2 | Phân công và SLA | [A] `test-assignment-sla.ts` |
| F15-3 | Tạo/sửa/hủy lịch, nhắc lịch | [T] |

---

## D. Landing Page (flow quan trọng nhất, chi tiết hơn)

### LP01 Tạo trang mới (từ mẫu, trang trống, AI, URL) — P1
| TC | Mô tả | Kết quả mong đợi | Test |
|---|---|---|---|
| LP01-1 | Tạo trang trống | Mở builder với trang trống, không lỗi 400 | [A] `test-landing-page-blank-create.cjs` |
| LP01-2 | Tạo từ mẫu | Trang mới là bản sao, đúng nội dung mẫu | [A] `test-landing-page-create-template-picker.cjs` |
| LP01-3 | Tạo bằng AI trước | Có bản nháp đúng ngành | [A] `test-landing-page-create-ai-first.cjs`, `test-landing-page-ai-generation.ts`, `test-landing-page-ai-create-browser.ts` |
| LP01-4 | Gợi ý brief bằng AI | Có gợi ý hợp lý | [A] `test-landing-page-ai-brief-suggest.ts`, `test-landing-page-ai-brief-suggest-browser.ts` |
| LP01-5 | Giữ dữ liệu form tạo khi tải lại | Giữ nội dung | [A] `test-landing-page-create-storage.ts`, `test-landing-page-create-persistence-browser.ts` |
| LP01-6 | Nhãn danh mục tiếng Việt | Đúng | [A] `qa-landing-page-category-labels-browser.cjs` |

### LP02 Thư viện Templates (xem, lọc, xem trước, dùng mẫu) — P1
| TC | Mô tả | Test |
|---|---|---|
| LP02-1 | Catalog đủ 200 mẫu, slug không trùng, đúng cấu trúc | [A] `validate-landing-page-template-catalog.cjs` |
| LP02-2 | Lọc theo ngành/kiểu, tìm kiếm | [A] `test-landing-page-template-ui.cjs` (có thể lỗi thời) |
| LP02-3 | Xem trước đúng nội dung, đúng khung hình | [A] `test-landing-page-template-gallery.cjs`, `qa-landing-page-real-catalog.cjs` |
| LP02-4 | Mỗi mẫu khác nhau về cấu trúc, không tràn ngang, có form, form đúng ngành | [A] `qa-landing-page-catalog-responsive.cjs`, `qa-landing-page-visual-diversity.cjs`, `test-landing-page-template-differentiation.cjs`; audit 200 mẫu × 3 khung hình (script nằm ngoài repo) |
| LP02-5 | Mẫu pilot Agency Portfolio không bị CSS dùng chung kéo theo | [A] `qa-agency-portfolio-isolation.cjs`, `qa-agency-portfolio-standard.cjs`, `test-agency-portfolio-standard.cjs` |
| LP02-6 | Sau khi dùng mẫu, trang mới không ghi đè mẫu gốc hay trang khách cũ | [T] |

### LP03 Builder: chỉnh sửa nội dung và phần tử — P1
| TC | Mô tả | Test |
|---|---|---|
| LP03-1 | Chọn element, menu chuột phải, toolbar | [A] `test-landing-page-canvas-selection.cjs`, `test-landing-page-canvas-context-menu.cjs`, `qa-landing-page-element-toolbar-browser.cjs` |
| LP03-2 | Kéo thả, kéo tự do, resize, xoay | [A] `qa-landing-page-pointer-resize-browser.cjs`, `qa-landing-page-drop-layout-browser.cjs`, `test-landing-page-element-free-drag.cjs`, `test-landing-page-resize-rotate.cjs` |
| LP03-3 | Chuột không bị "dính" sau khi thả, khung chọn không kẹt | [A] `qa-landing-page-canvas-groups-browser.cjs`, `test-landing-page-canvas-ux.cjs` |
| LP03-4 | Văn bản: toolbar, box, chọn/resize, căn giữa | [A] `test-landing-page-text-toolbar.cjs`, `test-landing-page-heading-toolbar.cjs`, `test-landing-page-text-box-select-resize.cjs`, `test-landing-page-text-center-drag-browser.cjs` |
| LP03-5 | Ảnh, icon, đồ họa, thư viện media | [A] `test-landing-page-content-image-toolbar.cjs`, `test-landing-page-media-modal.cjs`, `test-landing-page-icon-symbols.cjs`, `test-landing-page-graphics-library.cjs` |
| LP03-6 | Nút, tiêu đề, preset | [A] `test-landing-page-button-presets.cjs`, `test-landing-page-title-presets.cjs`, `test-landing-page-box-presets.cjs` |
| LP03-7 | Ẩn/khóa element, vị trí nâng cao | [A] `test-landing-page-element-visibility-lock.cjs`, `test-landing-page-lock-and-advanced-position.cjs`, `test-landing-page-hidden-text.cjs` |
| LP03-8 | Không chồng lấn element | [A] `test-landing-page-no-overlap.cjs`, `qa-landing-page-no-overlap-browser.cjs` |
| LP03-9 | Element LeadForm kéo/di chuyển được, không còn toolbar đầu element | [T] (đã kiểm tra thủ công khi sửa; chưa có test tự động) |

### LP04 Builder: section, hàng/cột, thư viện section, thêm thành phần — P1
| TC | Mô tả | Test |
|---|---|---|
| LP04-1 | Hàng và cột trong section, di chuyển hàng | [A] `qa-landing-page-section-rows-browser.cjs`, `test-landing-page-section-rows.cjs` |
| LP04-2 | Chia cột, thả vào cột | [A] `test-landing-page-column-split.cjs`, `qa-landing-page-text-columns.cjs` (môi trường cô lập) |
| LP04-3 | Cài đặt, nền, tràn nội dung của section | [A] `test-landing-page-section-settings.mts`, `test-landing-page-section-background.cjs`, `test-landing-page-section-content-overflow.cjs`, `test-landing-page-section-overlap.cjs` |
| LP04-4 | Thư viện section (xem trước, chất lượng, đồng bộ) | [A] `test-landing-page-section-library-parity.cjs`, `test-landing-page-section-library-quality.cjs`, `test-landing-page-section-library-preview.cjs`, `qa-landing-page-section-library-*-browser.cjs` |
| LP04-5 | Thêm thành phần từ thanh bên (kéo thả, lưới) | [A] `test-landing-page-add-components-dnd.cjs`, `test-landing-page-add-components-grid.cjs`, `test-landing-page-sidebar-dnd.cjs`, `test-landing-page-section-preset-dnd.cjs` |
| LP04-6 | Thanh bên và inspector (chế độ, thiết kế, theo ngữ cảnh) | [A] `test-landing-page-inspector-modes.cjs`, `test-landing-page-inspector-design-tab.cjs`, `test-landing-page-inspector-context-aware.cjs`, `test-landing-page-sidebar-compact.cjs`, `test-landing-page-builder-fixed-panels.cjs` |
| LP04-7 | Theme switcher, khung thiết bị (desktop/tablet/mobile) | [A] `test-landing-page-theme-switcher.cjs`, `test-landing-page-device-frame.cjs`, `test-landing-page-builder-responsive.cjs`, `qa-landing-page-builder-responsive.cjs` |
| LP04-8 | Xem trước toàn màn hình giống bản công khai | [A] `test-landing-page-preview-mode.cjs`, `test-landing-page-preview-toggle.cjs`, `test-landing-page-builder-preview-public-parity.cjs`, `test-landing-page-live-parity.cjs` |

### LP05 Lưu, tự động lưu, lịch sử, khôi phục, xuất bản — P0
| TC | Mô tả | Test |
|---|---|---|
| LP05-1 | Autosave không kẹt, không tăng revision khi xung đột | [A] `test-landing-page-autosave-stuck.cjs`, `test-landing-page-autosave-identity.cjs` |
| LP05-2 | Xung đột bản cũ bị từ chối ở phía server | [A] `test-landing-page-revision.ts`; `autosave-identity-e2e` cần môi trường cô lập |
| LP05-3 | Lưu hết trước khi xuất bản, xuất bản thành công | [A] `test-landing-page-publish-flush.cjs` |
| LP05-4 | Undo/Redo, lịch sử khi sửa trực tiếp | [A] `test-landing-page-history-live-edit.cjs`, `test-landing-page-history-live-edit-browser.cjs` |
| LP05-5 | Khôi phục phiên bản và revision | [A] `test-landing-page-version-restore-revision.cjs`, `test-landing-page-undo-page-isolation.cjs` |
| LP05-6 | Khôi phục bản nháp khi mất kết nối/tải lại | [A] `test-landing-page-draft-recovery.ts`, `test-landing-page-next-chunk-reload.cjs` |
| LP05-7 | Trang tải ổn định, không lỗi client | [A] `qa-landing-page-client-route-browser.cjs` |

### LP06 Form thu lead trên trang công khai → CRM — P0
| TC | Mô tả | Test |
|---|---|---|
| LP06-1 | Gửi form tạo lead đúng tổ chức, đúng nguồn trang | [A] `test-landing-page-public-lead.ts` |
| LP06-2 | Form ngắn đúng ngành (khóa học không có "Công ty/Quy mô") | [A] audit 200 mẫu (script ngoài repo); [T] chưa có test trong repo |
| LP06-3 | Form hiển thị trong hero, không biến mất, không nhảy vị trí | [T] (nằm trong audit 200 mẫu, chưa có test riêng) |
| LP06-4 | Chống spam/gửi lặp | [T] |
| LP06-5 | Xuất lead cho khách agency | [A] `test-landing-page-agency-client-export.cjs` |

### LP07 Trang công khai, domain, SEO, tên miền — P1
| TC | Mô tả | Test |
|---|---|---|
| LP07-1 | `/p/<slug>` hiển thị giống builder, giữ meta | [A] `test-landing-page-public-meta-keep.cjs`, `test-landing-page-public-free-position.cjs` |
| LP07-2 | Link preview có token, hết hạn | [T] |
| LP07-3 | Tên miền tùy chỉnh (xác minh, trạng thái) | [T] (trang domain) |
| LP07-4 | SEO, canonical, robots | [T] |
| LP07-5 | Kiểm tra URL (URL doctor) | [A] `test-landing-page-url-doctor.cjs` |

### LP08 Trang của tôi, tổng quan, analytics — P2
| TC | Mô tả | Test |
|---|---|---|
| LP08-1 | Bảng danh sách trang, lọc, trạng thái | [A] `test-landing-page-pages-table-redesign.cjs` |
| LP08-2 | Thống kê tổng quan | [A] `test-landing-page-overview-stats.cjs` |
| LP08-3 | Analytics (lượt xem, chuyển đổi) | [T] |
| LP08-4 | Trang tạm của sửa mẫu (`tpl-edit-*`) không hiện trong danh sách và dashboard | [T] |

### LP09 Admin: quản lý template (sửa mẫu gốc, tải tất cả, upload hàng loạt) — P1
| TC | Mô tả | Test |
|---|---|---|
| LP09-1 | Chỉ SUPER_ADMIN thấy tab "Quản lý Templates" và dùng được endpoint | [A] `test-platform-admin-rbac.ts` (phần chung); [T] riêng cho tab này |
| LP09-2 | Tải một mẫu và tải tất cả (ZIP) | [A] `test-landing-page-template-pack.ts`; "tải tất cả" [T] |
| LP09-3 | Upload hàng loạt: tạo mới, cập nhật, file lỗi không dừng cả lô | [A] `test-landing-page-template-bulk-upload.cjs`, `test-landing-page-template-bulk-dedup.cjs`, `test-landing-page-template-bulk-folders.cjs`, `qa-landing-page-template-bulk-ui.cjs`, `test-landing-page-template-upload-http.cjs`, `qa-landing-page-upload-limits.cjs` |
| LP09-4 | Sửa mẫu gốc: mở phiên, lưu nháp, lưu và xuất bản, có lịch sử phiên bản | [T] (đã kiểm tra bằng script tạm, chưa lưu vào repo) |
| LP09-5 | Mẫu đã sửa tay không bị ghi đè khi API khởi động lại với catalog mới | [T] |
| LP09-6 | Màu sắc khi xuất mẫu | [A] `test-landing-page-template-export-colors.cjs` |
| LP09-7 | Trang khách đã tạo từ mẫu cũ không đổi khi sửa mẫu | [T] |

### LP10 AI trong builder (viết lại, Page Doctor, brief) — P2
| TC | Mô tả | Test |
|---|---|---|
| LP10-1 | AI viết lại nội dung tại chỗ | [A] `test-landing-page-inline-ai.cjs`, `test-landing-page-inline-ai-context.cjs` |
| LP10-2 | Page Doctor (kiểm tra và áp dụng sửa) | [A] `test-landing-page-doctor-gates.cjs` (môi trường cô lập) |
| LP10-3 | Áp dụng hồ sơ doanh nghiệp vào trang | [A] `test-landing-page-business-profile.cjs` |

### LP11 Hiệu ứng (motion) — P2
| TC | Mô tả | Test |
|---|---|---|
| LP11-1 | Hiệu ứng vào cho section và element, tùy chọn bật | [A] `test-landing-page-motion.cjs`, `qa-landing-page-motion-browser.cjs`, `qa-landing-page-motion-cascade-browser.cjs` |

### LP12 Chất lượng giao diện toàn cục — P1
| TC | Mô tả | Test |
|---|---|---|
| LP12-1 | Responsive theo từng nhóm template | [A] `qa-landing-page-agency-responsive.cjs`, `qa-landing-page-spa-responsive.cjs`, `qa-landing-page-batch1-responsive.cjs`, `qa-landing-page-batch2-responsive.cjs` |
| LP12-2 | Kiểm tra hình ảnh toàn cục | [A] `qa-landing-page-global-visual.cjs`, `test-landing-page-design-audit.cjs` |
| LP12-3 | Sẵn sàng cho SaaS (tổng hợp) | [A] `test-landing-page-saas-ready.cjs` (tự build API, không chạy trên máy đang chạy production) |

---

## E. Nội dung và đăng bài

### F16 Tạo nội dung quảng cáo — P1
| TC | Mô tả | Test |
|---|---|---|
| F16-1 | Logic tạo nội dung theo ngành và kênh | [A] `test-content-marketing-logic.cjs`, `test-advanced-channel-variants.ts` |
| F16-2 | Bài quảng cáo theo sản phẩm/dịch vụ, phân tích URL | [A] `test-ad-product-service-posts.ts`, `test-ad-url-analyze.ts` |

### F17 Xây dựng thương hiệu cá nhân / chủ đề — P2
| TC | Mô tả | Test |
|---|---|---|
| F17-1 | Chủ đề thương hiệu, danh xưng cá nhân | [A] `test-brand-topic-themes.ts`, `test-personal-titles.ts` |
| F17-2 | Phân tích, tạo, chủ đề quan điểm (opinion) | [A] `test-opinion-analyze.ts`, `test-opinion-generate.ts`, `test-opinion-topics.ts`, `test-opinion-complete.ts` |

### F18 Kiểm tra chính sách quảng cáo Facebook — P1
| TC | Mô tả | Test |
|---|---|---|
| F18-1 | Kiểm tra nội dung theo chính sách | [A] `test-facebook-policy-check.ts` |
| F18-2 | Nhập media và giao diện | [A] `test-facebook-policy-import-media.ts`, `test-facebook-policy-ui.ts` |

### F19 Video transcript — P1
| TC | Mô tả | Test |
|---|---|---|
| F19-1 | Chuyển video thành văn bản, độ chính xác, giữ video | [A] `test-video-transcription.ts`, `test-video-transcription-accuracy.ts`, `test-video-transcription-keepvideo.ts` |
| F19-2 | Lấy từ YouTube | [A][L] `test-video-transcription-youtube-e2e.ts` |

### F20 Thư viện nội dung — P2
| TC | Mô tả | Test |
|---|---|---|
| F20-1 | Lưu, tìm, tái sử dụng nội dung | [T] |

### F21 Đăng bài tự động và lịch — P0
| TC | Mô tả | Test |
|---|---|---|
| F21-1 | Đăng bài tự động, phân quyền trạng thái | [A] `test-auto-post.cjs`, `test-auto-post-status-rbac.ts` |
| F21-2 | Đăng thật end-to-end | [A][L] `test-auto-post-publish-e2e.ts` |
| F21-3 | Lên lịch, hủy lịch, đăng đúng giờ | [T] |

### F22 Kết nối fanpage — P0
| TC | Mô tả | Test |
|---|---|---|
| F22-1 | Meta OAuth callback, đăng nhập Facebook cho doanh nghiệp | [A] `test-auto-post-meta-callbacks.ts`, `test-auto-post-facebook-login-for-business.ts`, `test-assert-auto-post-meta-oauth.ts` |
| F22-2 | Danh sách trang, quyền, chi tiết fanpage | [A] `test-auto-post-meta-pages-util.ts`, `test-fanpage-permissions.ts`, `test-fanpage-details.ts`, `test-meta-fanpage.cjs` |
| F22-3 | Trạng thái kênh Facebook trên giao diện | [A] `test-facebook-channel-ui-states.ts` |
| F22-4 | Quyền Meta cho app review | [A][L] `test-pages-manage-posts-review.ts`, `test-pages-read-engagement-review.ts` |

### F23 Teleprompter — P2
| TC | Mô tả | Test |
|---|---|---|
| F23-1 | Kịch bản: API, công cụ, lưu trữ | [A] `test-teleprompter-script-api.ts`, `test-teleprompter-script-tools.ts`, `test-teleprompter-storage.ts` |
| F23-2 | Cuộn, bố cục, ghi hình, bản ghi | [A] `test-teleprompter-scroll-engine.ts`, `test-teleprompter-layout-compositor.ts`, `test-teleprompter-recorder.ts`, `test-teleprompter-recordings.ts`, `test-teleprompter-bridge.ts` |
| F23-3 | Nền: làm mờ, mặt nạ, chuyển động, tùy chỉnh, hiệu năng | [A] `test-teleprompter-background-*.ts` (9 file) |
| F23-4 | Tách theo tổ chức | [A] `test-teleprompter-source-tenant.ts` |

---

## F. Quảng cáo

### F24 Ads Meta — P0
| TC | Mô tả | Test |
|---|---|---|
| F24-1 | Chỉ số chuẩn hóa, đồng bộ hàng đợi | [A] `test-ads-normalized-metrics.ts`, `test-ads-sync-queue.ts`, `test-ad-performance-metrics.cjs` |
| F24-2 | Yêu cầu hành động, hardening Meta | [A] `test-ads-action-request.ts`, `test-ads-meta-harden.ts`, `test-meta-graph-saas-opt.ts` |
| F24-3 | OAuth Meta Ads, app review | [A][L] `test-meta-ads-oauth-redirect.ts`, `test-meta-ads-app-review.ts` |
| F24-4 | API tạo chiến dịch | [A][L] `test-fb-ads-api.js`, `test-fb-create-campaign.js` |
| F24-5 | Hợp nhất, MCP gateway, kiểm toán SaaS | [A] `test-ads-unification.ts`, `test-ads-mcp-gateway.ts`, `test-ads-saas-audit.ts`, `test-ads-saas-phase-a.ts`, `test-ai-ads-manager.cjs` |
| F24-6 | Máy tính mục tiêu quảng cáo | [A] `test-ad-goal-calculator.ts` |

### F25 Ads Google — P0
| TC | Mô tả | Test |
|---|---|---|
| F25-1 | OAuth Google Ads, chuyển hướng | [A] `test-ads-google-oauth.ts`, `test-google-ads-oauth-redirect-e2e.cjs` |
| F25-2 | Trình tạo chiến dịch, tự áp dụng, autopilot | [A] `test-google-ads-campaign-builder.cjs`, `test-google-ads-auto-apply.cjs`, `test-google-ads-autopilot.cjs`, `test-google-ads-auto-e2e.cjs` |
| F25-3 | Engine dữ liệu và tối ưu | [A] `test-google-ads-data-engine.cjs`, `test-google-ads-optimization-engine.cjs` |
| F25-4 | Đa tổ chức và kiểm toán | [A] `test-google-ads-saas-multi-tenant.cjs`, `test-google-ads-full-audit.cjs` |
| F25-5 | Chạy trên production | [A][L] `test-google-ads-prod-e2e.cjs` |

### F26 Attribution/ROAS — P1
| TC | Mô tả | Test |
|---|---|---|
| F26-1 | Quy chiếu nguồn chuyển đổi | [A] `test-marketing-attribution.ts` |
| F26-2 | Số liệu mục tiêu kinh doanh | [A] `test-business-goal-metrics.ts` |

---

## G. Nhắn tin và kênh liên hệ

### F27 Chiến dịch nhắn hàng loạt — P0
| TC | Mô tả | Test |
|---|---|---|
| F27-1 | Tạo chiến dịch, hàng đợi gửi | [A] `test-messaging-campaign.ts`, `test-messaging-campaign-queue.ts` |
| F27-2 | Điều kiện đủ để gửi, chống spam | [A] `test-messaging-eligibility.ts`, `test-messaging-anti-spam.ts` |
| F27-3 | Chạy thử không gửi thật (dry run) | [A] `test-messaging-dryrun-e2e.ts` |
| F27-4 | Cá nhân hóa tên | [A] `test-messaging-name-vars.ts`, `test-messaging-name-personalize-e2e.ts` |
| F27-5 | Gửi hàng loạt thật | [A][L] `test-messaging-bulk-live-e2e.ts` |
| F27-6 | Kết nối kênh, hợp đồng chung | [A] `test-messaging-channel-connections.ts`, `test-messaging-prompt10.ts` |

### F28 File đối tượng — P1
| TC | Mô tả | Test |
|---|---|---|
| F28-1 | Tải file, ghép danh tính, loại trùng | [T] (liên quan `test-messaging-contact-identity.ts`) |

### F29 Tin nhắn tự động (flow tự động) — P1
| TC | Mô tả | Test |
|---|---|---|
| F29-1 | Bảo mật tự động hóa | [A] `test-automation-security.ts` |
| F29-2 | Chạy flow tự động theo điều kiện | [T] |

### F30 Chatbot CSKH — P1
| TC | Mô tả | Test |
|---|---|---|
| F30-1 | Trả lời theo kho kiến thức, tách tổ chức | [A] `test-cskh-rag-kb.ts`, `test-cskh-project-isolation.ts`, `test-cskh-kb-tenant-digi.ts` |
| F30-2 | Gửi trả lời qua Messenger | [A][L] `test-cskh-messenger-send-digi.ts` |
| F30-3 | Widget chatbot nhúng | [T] |

### F31 Email marketing — P1
| TC | Mô tả | Test |
|---|---|---|
| F31-1 | Gửi qua SES/Brevo, cấu hình, định tuyến | [A] `test-email-ses-config.ts`, `test-email-ses-p0.ts`, `test-email-ses-brevo-router.cjs`, `test-email-marketing.ts` |
| F31-2 | Hàng đợi gửi, webhook Brevo | [A] `test-brevo-queue-send.cjs`, `test-brevo-webhook-e2e.cjs` |
| F31-3 | Lên lịch chiến dịch, gửi thật | [A][L] `test-email-campaign-schedule-e2e.cjs`, `test-brevo-email-e2e-live.cjs` |
| F31-4 | Hủy đăng ký email (`/email-unsubscribe`) | [T] |

### F32 Zalo marketing — P1
| TC | Mô tả | Test |
|---|---|---|
| F32-1 | Kết nối OA, làm mới token, ngắt kết nối, kết nối lại chéo tổ chức | [A] `test-zalo-oa-backend.cjs`, `test-zalo-oa-auto-refresh.cjs`, `test-zalo-oa-disconnect.cjs`, `test-zalo-oa-cross-org-reconnect.cjs` |
| F32-2 | OAuth chuyển hướng, chữ ký webhook | [A] `test-zalo-oa-oauth-redirect-e2e.cjs`, `test-zalo-webhook-signature.cjs` |
| F32-3 | Chiến dịch Zalo (3 chế độ) | [A] `test-zalo-marketing.ts`, `test-zalo-marketing-3modes-e2e.cjs` |
| F32-4 | Thử thật trên production | [A][L] `test-zalo-marketing-e2e-live.cjs`, `test-zalo-production-probes.cjs` |

### F33 Hộp thư (messages) — P1
| TC | Mô tả | Test |
|---|---|---|
| F33-1 | Soạn và gửi tin | [A] `test-messages-composer-e2e.cjs` |
| F33-2 | Hộp thư Zalo | [A] `zalo-cskh-inbox-e2e.cjs` |

---

## H. Nhân sự

| Flow | TC chính | Test |
|---|---|---|
| F34 Nhân viên | Tạo, sửa, xem hồ sơ nhân viên | [T] |
| F35 Ca làm | Tạo ca, gán ca, xung đột lịch | [A] `test-hrm-shifts.ts` |
| F36 Chấm công | Vào/ra ca, tính giờ công | [A] `test-hrm-attendance.ts` |
| F37 Nghỉ phép/OT | Gửi, duyệt, số dư phép | [A] `test-hrm-leave.ts` |

## I. Quản lý công việc

| Flow | TC chính | Test |
|---|---|---|
| F38 Dự án | Tạo dự án, thành viên, phân quyền | [A] `test-work-management-rbac.ts`, `test-work-management-collab.ts` |
| F39 Việc của tôi | Chi tiết việc, bình luận, giao việc | [A] `test-work-task-detail.ts`, `test-work-management-full-matrix.ts` |
| F40 Dashboard | Số liệu, phân tích | [A] `test-work-management-insights.ts` |
| F41 Lịch công việc | Hiển thị theo ngày/tuần | [T] |

## J. Bán hàng

| Flow | TC chính | Test |
|---|---|---|
| F42 Đơn hàng | Tạo, sửa, hủy, trạng thái | [T] |
| F43 Sản phẩm | Tạo, sửa, SKU, giá | [T] |
| F44 Tồn kho | Số lượng bán được, hết hạn, cảnh báo thiếu hàng | [A] `test-sales-inventory-harden-e2e.ts` |
| F45 Nhập/xuất kho | Phiếu, cộng/trừ tồn đúng | [A] cùng file (một phần) |
| F46 Kiểm kê | Điều chỉnh chênh lệch | [T] |
| F47 Mua hàng | Đơn mua, nhận hàng | [T] |
| F48 Báo cáo bán hàng | Doanh số, lợi nhuận | [T] |

Ghi chú: nhóm Bán hàng gần như chưa có test tự động, trong khi liên quan tiền và kho (P0).

## K. Tài chính

| Flow | TC chính | Test |
|---|---|---|
| F49 Doanh thu/P&L | Tổng hợp doanh thu và chi phí | [T] |
| F50 Mục tiêu kinh doanh | Số liệu mục tiêu, tiến độ | [A] `test-business-goal-metrics.ts` |

## L. Quản trị nền tảng

### F51 Admin (người dùng, tổ chức, gói, thanh toán, credit, audit, jobs, tích hợp) — P0
| TC | Mô tả | Test |
|---|---|---|
| F51-1 | Quản lý người dùng, quyền | [A] `test-admin-user-mgmt.ts`, `test-platform-admin-rbac.ts` |
| F51-2 | Vận hành admin (tổ chức, gói, jobs) | [A] `test-admin-ops.ts` |
| F51-3 | Tặng credit | [A] `test-admin-gift-credit.ts` |
| F51-4 | Nhật ký kiểm toán, tích hợp, thanh toán | [T] |
| F51-5 | Củng cố giai đoạn 1 và bảo mật tổng | [A] `test-phase1-hardening.ts`, `test-p0-security.ts`, `test-wave1-security.ts`, `test-wave2-precheck.ts`, `test-wave3.ts` |

## M. Trang công khai

### F52 Trang công khai — P0
| TC | Mô tả | Test |
|---|---|---|
| F52-1 | Landing page `/p/<slug>` | xem LP07 |
| F52-2 | Form funnel công khai `/f/<id>` thu lead | [A] `test-funnel-form-capture.ts` |
| F52-3 | Hủy đăng ký email | [T] |
| F52-4 | Callback Facebook, trang điều khoản, riêng tư | [A] `test-auto-post-meta-callbacks.ts`; điều khoản/riêng tư [T] |

---

## Tổng hợp và khoảng trống

| Chỉ số | Giá trị |
|---|---|
| Số flow | 64 (52 flow F và 12 flow Landing Page LP01 đến LP12) |
| Flow đã có test tự động ở mức nào đó | khoảng 40 |
| Flow chưa thấy test tự động | F20, F28, F34, F41, F42, F43, F46, F47, F48, F49 (cần kiểm tra thủ công hoặc viết test mới) |
| Test gọi dịch vụ ngoài (`[L]`) | Meta, Google Ads, Zalo, Brevo, YouTube, Messenger: không đưa vào chạy tự động |

Khoảng trống ưu tiên cao (vừa quan trọng, vừa chưa có test):
1. **Bán hàng và kho (F42 đến F48):** liên quan tiền và tồn kho.
2. **Sửa mẫu gốc và upload hàng loạt trong Landing Page (LP09-4, LP09-5, LP09-7):** chưa có test lưu trong repo.
3. **Form lead trên mẫu (LP06-2, LP06-3):** mới có audit ngoài repo.
4. **Đăng nhập cơ bản (F02-1, F02-4, F02-5)** và **hủy đăng ký email (F31-4, F52-3).**
5. **Trang tạm `tpl-edit-*` không rò vào danh sách (LP08-4).**

Đề xuất: chuyển audit 200 mẫu từ `/root/qa/` vào `scripts/`, lập baseline cho nhóm Landing Page rồi bổ sung dần các test ở danh sách trên.

# Báo cáo nâng cấp module Công việc & Dự án (Aibeego)

**Ngày:** 12/11/2026  
**Tham chiếu:** `aibeego-phan-loai-87-tinh-nang-giao-viec.md` + video mẫu Trello (thư mục Downloads/Công việc)

---

## 1. Mục tiêu

- Đồng bộ giao diện kiểu **bảng việc / thẻ công việc** (mô tả, checklist, thành viên, bình luận, đính kèm).
- **Dễ dùng cho người không rành công nghệ:** nút to, tiếng Việt rõ, hướng dẫn ngắn trên tab Bảng việc.
- Bổ sung phần **còn thiếu ở giao diện** so với API/backend đã có.

---

## 2. Thay đổi kỹ thuật trong lần nâng cấp này

| Hạng mục | Nội dung |
|----------|----------|
| **API** | `GET /api/v1/work-management/employees/:employeeId/stats` — sửa tab HRM “công việc của nhân viên” (trước đó gọi URL không tồn tại). |
| **Hooks** | `useUpdateWorkProject`, `useUnarchiveWorkTask`, `useEmployeeWorkStats`. |
| **UI chung** | `WorkManagementSubNav` — điều hướng 4 tab, nút ~44px, banner hướng dẫn. |
| **Dự án** | `WorkProjectSettingsDialog` — đổi tên/mô tả, lưu trữ dự án, định nghĩa trường tùy chỉnh. |
| **Bảng Kanban** | Lọc theo **trạng thái (cột)**; hiện **dự án đã lưu**; nút **Cài đặt dự án**. |
| **Chi tiết việc** | Panel **theo dõi thời gian**; **sửa bình luận**; **Nhắc tên** bằng chọn nhân viên (thay listbox khó dùng). |
| **Việc của tôi / Lịch / Tổng quan** | Dùng chung `WorkManagementSubNav`. |

---

## 3. Ma trận 87 tính năng (P0 / P1 / P2)

Chú thích: ✅ có đầy đủ (UI + API) · ◐ một phần · ✗ chưa · 🔧 backend có, UI thiếu

### 3.1 P0 — Core (45 tính năng)

| # | Tính năng | Trạng thái | Ghi chú |
|---|-----------|------------|---------|
| 1 | Tên công việc | ✅ | Kanban + modal chi tiết |
| 2 | Mô tả chi tiết | ✅ | Rich text đơn giản trong modal |
| 3 | Nhãn phân loại | ✅ | Popover nhãn + chip màu |
| 4 | Màu sắc nhãn | ◐ | Gắn qua tên nhãn/chuỗi; chưa bảng màu riêng |
| 5 | Độ ưu tiên | ✅ | Lọc + form |
| 6 | Trạng thái công việc | ✅ | Cột Kanban + lọc trạng thái **mới** |
| 7 | Ngày bắt đầu | ✅ | |
| 8 | Deadline | ✅ | Lọc quá hạn / tuần này |
| 9 | Phần trăm hoàn thành | ✅ | Checklist + progress |
| 10 | Người tạo công việc | ✅ | Hiển thị trong metadata / lịch sử |
| 11 | Người giao việc | ✅ | Trường assigner |
| 12 | Người phụ trách chính | ✅ | Nhiều assignee |
| 13 | Người phối hợp | ✅ | Watchers |
| 14 | Chuyển người phụ trách | ✅ | Đổi trong modal |
| 15 | Tạo checklist | ✅ | |
| 16 | Công việc con | ◐ | Checklist; chưa tách thành task độc lập (P1#8) |
| 17–19 | Giao/deadline/tiến độ việc con | ◐ | Chỉ mức checklist |
| 20 | Bình luận | ✅ | |
| 21 | Trả lời bình luận | ✅ | |
| 22 | @Mention | ✅ | Cải thiện UI chọn nhân viên |
| 23 | Chỉnh sửa bình luận | ✅ | **Mới bổ sung UI** |
| 24 | Xóa bình luận | ✅ | |
| 25–28 | File / ảnh / URL / tải xuống | ✅ | Upload task + project docs |
| 29–30 | Nhắc trước deadline / quá hạn | ✅ | Cron worker 15 phút + thông báo in-app |
| 31 | Cập nhật tiến độ | ✅ | |
| 32–35 | Nghiệm thu / duyệt / từ chối / sửa lại | ✅ | Luồng review trong modal |
| 36–40 | Lịch sử tạo/sửa/trạng thái/người/deadline | ◐ | Status/review history; audit đầy đủ ở API |
| 41 | Thông báo công việc | ✅ | Chuông thông báo |
| 42–44 | Lọc NV / trạng thái / deadline | ✅ | Thêm lọc cột |
| 45 | Phân quyền | ✅ | `work.project.*`, `work.task.*` |

**P0 tổng kết:** ~**40/45** đạt đầy đủ hoặc tương đương nghiệp vụ; 5 mục còn ◐ (màu nhãn, việc con độc lập, lịch sử chi tiết từng trường).

### 3.2 P1 — Advanced (32 tính năng)

| Nhóm | Trạng thái | Ghi chú |
|------|------------|---------|
| Trường tùy chỉnh | ◐ | Cấu hình ở **Cài đặt dự án**; nhập trên task form/modal cần hoàn thiện thêm |
| Người theo dõi | ✅ | Watcher |
| Phòng ban | ◐ | Scope HRM; chưa “giao cả phòng ban” một nút |
| Nhận / từ chối việc | ✗ | Chưa workflow xác nhận |
| Yêu cầu hỗ trợ | ✗ | |
| Checklist nâng cao | ◐ | Chưa kéo thả thứ tự / promote thành task |
| Emoji / ghim comment | ◐ | Emoji có; ghim chưa |
| Google Drive | ✗ | Gắn link URL được |
| Phiên bản file | ◐ | Lưu file đơn |
| Gia hạn deadline + lịch sử | 🔧 | API audit; UI gia hạn chưa riêng |
| Lịch ngày/tuần/tháng | ✅ | Tab Lịch |
| Công việc định kỳ | 🔧 | DB + cron; **chưa UI** tạo recurrence |
| Báo cáo / Excel PDF | ✅ | Dashboard + export |
| Workload / time tracking | ◐ | **UI timer mới**; workload trên dashboard |
| Audit viewer | 🔧 | `GET audit-logs`; chưa trang quản trị |

**P1 tổng kết:** ~**12/32** đầy đủ; phần lớn còn lại có nền API/DB hoặc chưa triển khai.

### 3.3 P2 — AI (10 tính năng)

| Trạng thái | Ghi chú |
|------------|---------|
| ✗ / roadmap | Assistant có đọc dashboard/task; chưa AI checklist, auto-assign, auto-state |

---

## 4. Hướng dẫn sử dụng (người dùng cuối)

1. Vào **HRM → Công việc & Dự án → Bảng việc**.
2. Chọn **dự án** ở ô trên cùng (hoặc **Tạo dự án**).
3. **Tạo việc mới** hoặc bấm vào thẻ để mở chi tiết (giống video Trello).
4. Trong chi tiết: **Thêm nhãn / Ngày / Checklist / Thành viên** (dãy nút ngang).
5. **Kéo thẻ** sang cột khác = đổi trạng thái.
6. **Việc của tôi** — việc giao cho bạn; **Tổng quan** — báo cáo team; **Lịch** — theo ngày.
7. **Xuất bản công khai** không liên quan module này (đó là landing page).

---

## 5. Việc nên làm tiếp (ưu tiên)

1. UI **công việc định kỳ** (recurrence) trên form tạo/sửa task.
2. Trang **Audit log** cho quản lý (`work.task.manage`).
3. **Trường tùy chỉnh** hiển thị/sửa trực tiếp trong modal (đã có defs ở dự án).
4. Workflow **xác nhận nhận việc** (P1).
5. Tích hợp **Google Drive** (P1) hoặc hướng dẫn dán link Drive vào mô tả.
6. Nhóm **AI P2** sau khi P0/P1 ổn định.

---

## 6. File nguồn chính

- Web: `apps/web/src/app/(app)/work-management/`, `apps/web/src/components/work-management/`
- API: `apps/api/src/work-management/`
- Schema: `packages/database/prisma/schema.prisma` (khối Work*)

---

*Báo cáo được lập sau đợt nâng cấp UI/ API lần này; ma trận chi tiết có thể cập nhật khi hoàn thiện từng sprint P1.*

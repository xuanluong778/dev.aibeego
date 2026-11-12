# Landing Page Builder — Full Audit (MarketingAutoAZ DEV)

**Phạm vi:** `apps/web/src/components/landing-pages/**`, `apps/web/src/app/(app)/landing-pages/**`, `apps/web/src/app/p/**`, `apps/api/src/landing-pages/**`, `packages/shared/src/landing-page-*.ts`, `scripts/test-landing-page-*.cjs`.

**Nhánh audit:** `claude/lp-debug-20260911-1024` (worktree `/var/www/dev_marketin_usr/data/www/dev.marketingautoaz.com`).

**Phương pháp:** Đọc trực tiếp source hiện tại (không dựa vào báo cáo audit cũ). 5 luồng đọc song song theo từng mảng chức năng + audit trực tiếp phần drag/resize/rotate/reserveHeight/autosave, sau đó verify chéo bằng tay các phát hiện quan trọng nhất (đọc lại đúng dòng code, không tin lời agent). Chỉ audit — **không sửa code, không migrate, không restart PM2, không đụng module khác (Facebook/Meta/OAuth/Ads/Messenger/Autopilot)**.

**Lưu ý về gate cũ:** Phần lớn `scripts/test-landing-page-*.cjs` liên quan drag/resize/free-position (`test-landing-page-free-drag-move-size.cjs`, `test-landing-page-element-free-drag.cjs`, `test-landing-page-section-overlap.cjs`, `test-landing-page-free-position-canvas.cjs`) là **string-matcher thuần** (`fs.readFileSync` + `.includes()`/regex trên text nguồn), không thực thi bất kỳ dòng code nào — chúng PASS miễn là các token/identifier còn tồn tại trong file, kể cả khi logic xung quanh sai. Đây là lý do nhiều bug dưới đây (đặc biệt resize-sau-rotate, advanced-position không clamp) chưa từng bị phát hiện. Không có gate nào kiểm tra Undo/Redo runtime thật. Chi tiết ở mục "Đánh giá chất lượng gate" cuối file.

---

## Đã fix ở phiên trước (Phase 1) — liệt kê để đối chiếu, không tính vào tổng bug mở

```
ID: autosave-stale-revision-force-overwrite [FIXED]
SEVERITY: P0 (đã fix)
SYMPTOM: Khi autosave bị server từ chối vì STALE_REVISION, client tự nâng revision cục bộ vượt server rồi retry ngay bằng nội dung cũ → ghi đè âm thầm bản mới của tab/session khác.
FILE: apps/web/src/components/landing-pages/landing-page-builder.tsx — persist() (STALE_REVISION branch)
STATUS: Đã sửa trong phiên trước — thay bằng saveConflictRef pause + resolveSaveConflict() (banner "Tải bản mới nhất"), không còn tự retry ghi đè. Xem lại bug LP-VER-01 bên dưới: **cùng root cause nhưng lộ qua đường khác (version-restore) mà bản vá này chưa che tới.**
```

---

## P0 — Nghiêm trọng (sai lệch dữ liệu người dùng thấy trên trang published)

### BUG-01
```
ID: public-api-strips-meta
SEVERITY: P0
SYMPTOM: Sau khi publish (hoặc mở link "Xem trước" draft), các phần tử đã ẩn qua canvas hiện lại; mọi định dạng chữ áp qua toolbar nổi (cỡ chữ, màu, đậm/nghiêng, letter-spacing, gradient...) biến mất, quay về mặc định; mọi phần tử đã kéo tự do (free-drag) trong 1 section bung về vị trí mặc định.
ROOT_CAUSE: getPublicBySlug và getPublicByPreviewToken destructure toàn bộ spec.meta rồi dựng lại chỉ giữ layout + category, vứt bỏ inlineTextStyles, elementFreeLayouts, elementHidden, elementLocked, responsiveInlineTextStyles — dù comment ghi ý định chỉ nên strip "builder provenance" (fieldSources/timestamps).
FILE: apps/api/src/landing-pages/landing-pages.service.ts  FUNCTION/LINE: getPublicBySlug 2018-2047 (verified: dòng 2035 `const { meta: _meta, ...rest } = parsed...` chỉ giữ lại layout/category); getPublicByPreviewToken 1544-1559 (logic trùng lặp y hệt)
HOW_TO_REPRODUCE: (a) Ẩn 1 phần tử qua canvas, (b) đổi cỡ chữ/màu 1 headline qua toolbar nổi, (c) kéo nhẹ 1 headline/ảnh trong section. Publish → mở URL public: cả 3 thay đổi biến mất dù `sanitizeInlineTextStylesMap`/`sanitizeElementFreeLayoutsMap`/`sanitizeElementFlagMap` (packages/shared/src/landing-page-lifecycle.ts) vẫn giữ đúng data này trong DB — chỉ bị vứt ở bước đọc public.
MINIMAL_FIX: Đổi từ allowlist 2 field sang blocklist đúng provenance cần strip: `const { fieldSources, profileAppliedAt, lastAiAt, clientRevision, themePreset, themeUserLocked, gallery, ...safeMeta } = parsed.meta || {}; const spec = { ...rest, meta: safeMeta };`. Áp dụng giống hệt cho cả 2 hàm (nên gộp thành 1 private method dùng chung, tránh drift lại).
REGRESSION_RISK: Thấp cho elementHidden (fix ngay lập tức). Với inlineTextStyles/elementFreeLayouts, fix này CẦN nhưng CHƯA ĐỦ — xem BUG-02, BUG-04 bên dưới (renderer vẫn cần đọc được data này ở nhánh public).
```

### BUG-02
```
ID: public-free-position-sections-lost
SEVERITY: P0
SYMPTOM: Section đã đặt vị trí tự do (kéo/resize/rotate) trong Builder hiển thị public ở vị trí flow mặc định — sai vị trí hoàn toàn, có thể chồng lấn/lệch layout so với thiết kế.
ROOT_CAUSE: `SelectableShell` (bọc mọi block cấp cao trong LandingPageRenderer) có nhánh `if (!handlers) return <div ...>{children}</div>` — hoàn toàn không có style định vị. CSS `position:absolute; left; top; width; height; transform:rotate()` (từ `freeLayoutStyle`) chỉ được áp trong `SelectableShellInteractive`, chỉ đạt tới khi `handlers` (canvasHandlers) truthy. Ở render path public, `interactive=false` và không truyền `canvas` → `canvasHandlers` = null → mọi block đi qua nhánh div trần.
FILE: apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx  FUNCTION/LINE: SelectableShell 431-458 (verified trực tiếp: nhánh `!handlers` ở dòng 452-458 trả về div không style); freeLayoutStyle chỉ được gọi từ SelectableShellInteractive.
HOW_TO_REPRODUCE: Bật "Vị trí tự do" cho 1 section, kéo/resize/rotate khỏi vị trí flow. Publish → mở URL public: section quay lại thứ tự flow bình thường, bỏ qua x/y/width/height/rotate.
MINIMAL_FIX: Trong nhánh `!handlers` của SelectableShell, tính và áp `freeLayoutStyle(block.positionMode/freeLayout, false)` trực tiếp từ field của block (KHÔNG nằm trong meta nên KHÔNG bị ảnh hưởng bởi BUG-01) thay vì trả div trần.
REGRESSION_RISK: Trung bình — cần giữ đồng bộ overflow:visible, reserve-height, z-index như bản interactive, và giữ `computeCanvasFreeReserveHeight` khớp giữa 2 mode để container không sập chiều cao khi có phần tử absolute.
```

---

## P1 — Vỡ tính năng lõi

### BUG-03
```
ID: public-inline-text-style-lost
SEVERITY: P1
SYMPTOM: Kể cả sau khi vá BUG-01, định dạng chữ áp qua toolbar nổi (cỡ chữ, đậm, màu, gradient, letter-spacing, line-height, custom width...) vẫn KHÔNG hiển thị public — chỉ hiện trong canvas Builder.
ROOT_CAUSE: `InlineEditable`'s nhánh `!handlers` không hề đọc `spec.meta.inlineTextStyles`. `textStyle = handlers?.getTextStyle?.(...)` luôn `undefined` khi handlers null (luôn đúng ở public/preview). `mergeFieldStyle()` merge `fromToolbar = mergeTextStyle(undefined, undefined, ...)` = undefined → CSS toolbar không được thêm vào `<Comp style>`. Chỉ "Custom CSS" nâng cao (block.style.elementCustomCss) sống sót vì được truyền riêng qua prop `blockStyle`.
FILE: apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx  FUNCTION/LINE: InlineEditable ~1664 (textStyle), 1675-1682 (mergeFieldStyle), nhánh `!handlers` ~1770-1782
HOW_TO_REPRODUCE: Đổi cỡ chữ/màu 1 headline qua toolbar nổi trong canvas. So sánh canvas vs "Xem trước"/public URL — chữ về mặc định theme.
MINIMAL_FIX: Trong nhánh `!handlers`, đọc `spec.meta.inlineTextStyles[`${blockId}::${field}`]` (và `responsiveInlineTextStyles` theo viewport) rồi chạy qua cùng `mergeTextStyle` helper như nhánh interactive — cần truyền `spec.meta.inlineTextStyles` xuống mọi call site hiện chỉ nhận `blockStyle`.
REGRESSION_RISK: Trung bình — chạm vào primitive render text dùng nhiều nhất file; cần đảm bảo không phá nhánh interactive, và chọn đúng biến thể responsive cho SSR (viewport='desktop') lẫn client hydrate.
```

### BUG-04
```
ID: public-element-free-drag-lost
SEVERITY: P1
SYMPTOM: 1 phần tử riêng lẻ (ảnh, button/box, text) đã được nudge/resize/rotate độc lập trong section (không phải cả section) bung về vị trí mặc định trên public.
ROOT_CAUSE: `ElementChrome` có `if (!handlers) return <>{children}</>` — passthrough thuần, bỏ hoàn toàn `shellStyle` từ `useCanvasElementFreeDrag`. `InlineEditable`'s offset free-drag cũng không được áp trong nhánh `!handlers` vì return sớm trước khi tới JSX có free-drag. Cả 2 đọc `handlers?.getElementFreeLayout?.(...)` → null khi handlers null.
FILE: apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx  FUNCTION/LINE: ElementChrome ~1209 (`if (!handlers) return <>{children}</>`); useCanvasElementFreeDrag ~384
HOW_TO_REPRODUCE: Kéo lệch 1 ảnh Hero/1 ô countdown vài px mà không di chuyển cả section. Publish — phần tử về đúng vị trí mặc định.
MINIMAL_FIX: Cùng dạng fix như BUG-02 — đọc offset trực tiếp từ `spec.meta.elementFreeLayouts[`${blockId}::${field}`]` (sau khi BUG-01 hết strip nó) và áp `freeLayoutStyle(layout, false, 'offset')` kể cả khi handlers null.
REGRESSION_RISK: Thấp-trung bình — khu trú ở 2 nhánh return sớm; cần giữ đúng công thức translate3d+rotate như bản interactive để canvas và public khớp pixel.
```

### BUG-05
```
ID: public-headline-bypasses-inline-editable
SEVERITY: P1
SYMPTOM: "Custom CSS" cấp phần tử (textarea CSS thủ công trong tab Design — hoạt động đúng cho LeadForm) KHÔNG có tác dụng trên public riêng cho Hero headline/subheadline/CTA và heading của mọi block dạng List (Benefits/Features/Process/Gallery/Product/Testimonials/Speaker/Pricing/Video/CTA/Guarantee).
ROOT_CAUSE: `buildPageCustomCssBlocks` chèn `<style>` toàn cục với selector `[data-lp-element-id="blockId::headline"] {...!important}` — áp dụng ở cả 2 mode. Nhưng `HeroBlock.renderHeadline/renderSub/cta` và `SectionHead` render thẳng `<h1>/<h2>/<p>{value}</h2>` KHÔNG có attribute `data-lp-element-id` khi `canvas` falsy — chỉ `InlineEditable` (dùng bởi LeadFormCard) mới gắn attribute này. Không có attribute → CSS injected không bao giờ match → im lặng vô tác dụng.
FILE: apps/web/src/components/landing-pages/landing-page-renderer.tsx  FUNCTION/LINE: HeroBlock renderHeadline/renderSub/cta ~736-799; SectionHead ~640-700 (nhánh else khi `!canvas`)
HOW_TO_REPRODUCE: Set Custom CSS cho Hero headline = `text-shadow: 0 0 10px red;`. Hiện đúng trong canvas; publish — headline public không có text-shadow.
MINIMAL_FIX: Route các nhánh fallback này qua `InlineEditable` với `handlers={canvas}`, `blockStyle={block.style}` giống LeadFormCard đang làm, thay vì hand-roll thẻ heading trần, để `data-lp-element-id` luôn có mặt.
REGRESSION_RISK: Trung bình — đây là phần tử render nhiều nhất mọi trang; đổi sang InlineEditable đổi nhẹ cấu trúc DOM (thêm span/data-attr bọc ngoài), có thể ảnh hưởng CSS thủ công khác đang bám theo thẻ heading trần ở nơi khác (vd. export/screenshot).
```

### BUG-06
```
ID: undo-history-leaks-across-pages
SEVERITY: P1
SYMPTOM: Mở Page A trong Builder, sửa vài chỗ, rồi điều hướng client-side (không full reload) sang Page B. Nhấn Ctrl+Z ngay khi Page B vừa load → nội dung Page B bị thay bằng snapshot của Page A. Clipboard (block/style) cũng có thể mang nội dung Page A sang Page B.
ROOT_CAUSE: `<LandingPageBuilder pageId={params.id} />` không có `key={pageId}` ở route component → React tái sử dụng cùng instance khi điều hướng giữa 2 route builder khác id, chỉ đổi prop `pageId`. `load()` reset `dirtyRef/revisionRef/autosaveInflightRef/autosaveQueuedRef/saveConflictRef` khi `pageId` đổi nhưng KHÔNG reset `historyRef.current`/`futureRef.current`/`blockClipboardRef`/`styleClipboardRef`/`doctorIdemRef`. `undo()`/`redo()` pop thẳng từ các ref này, không kiểm tra page-scope.
FILE: apps/web/src/app/(app)/landing-pages/builder/[id]/page.tsx (thiếu `key`); apps/web/src/components/landing-pages/landing-page-builder.tsx  FUNCTION/LINE: load() 418-436 (không reset historyRef/futureRef/clipboards), undo/redo ~864-880
HOW_TO_REPRODUCE: Sửa Page A 2-3 lần (mỗi lần gọi pushHistory). Điều hướng in-app sang Page B (không reload trang). Nhấn Ctrl+Z ngay — `historyRef.current.pop()` trả snapshot Page A, `setSpec(prev)` áp vào Page B, debounce 1200ms sau đó autosave nội dung sai xuống DB của Page B.
MINIMAL_FIX: Đơn giản nhất: thêm `key={pageId}` vào `<LandingPageBuilder pageId={params.id} />` để React unmount/remount hoàn toàn (xoá sạch mọi ref) mỗi lần đổi trang — đúng idiom React chuẩn cho lớp bug này, không cần đổi gì trong landing-page-builder.tsx.
REGRESSION_RISK: Thấp — remount là cách làm chuẩn; chỉ mất state UI tạm thời (vị trí panel, scroll) khi chuyển trang, chấp nhận được.
```

### BUG-07
```
ID: version-restore-no-concurrency-guard-silently-reverted
SEVERITY: P1
SYMPTOM: Khôi phục 1 version cũ qua Version History, ngay sau đó (không cảnh báo gì) nội dung bị trả về đúng trạng thái TRƯỚC khi khôi phục — như thể thao tác Restore "không có tác dụng".
ROOT_CAUSE: `restorePageVersion` ghi thẳng `restoredSpec` (snapshot cũ, giữ nguyên `meta.clientRevision` cũ/thấp từ lúc snapshot) xuống `draftSpec` — HOÀN TOÀN không có check revision/conflict như `/autosave` (verified trực tiếp: dòng 1626-1635 không đụng `clientRevision`; `sanitizeLandingPageSpec` dòng 373-374 giữ nguyên `clientRevision` cũ). Bất kỳ tab nào khác (hoặc autosave debounce đang chờ của chính tab đó) có `revisionRef` cục bộ CAO HƠN (điều bình thường vì đã tiếp tục tăng suốt phiên) sẽ gửi autosave kế tiếp với revision cao hơn số vừa bị hạ thấp → server ACCEPT (vì incoming >= stored) → ghi đè lại đúng bản trước-khi-restore, không có STALE_REVISION nào được raise, không banner conflict nào hiện lên.
FILE: apps/api/src/landing-pages/landing-pages.service.ts  FUNCTION/LINE: restorePageVersion 1584-1654 (verified: không có check/bump clientRevision, khác hẳn autosave() 641-702 có check này); packages/shared/src/landing-page-lifecycle.ts:373-374 (giữ nguyên clientRevision cũ khi sanitize)
HOW_TO_REPRODUCE: Mở cùng 1 draft ở 2 tab (cả 2 đã có clientRevision cao do đã sửa). Tab A: Version History → Restore version cũ. Tab B: sửa 1 chỗ nhỏ (hoặc chỉ cần đợi autosave debounce đang dở với dirtyRef=true) → autosave Tab B chạy, thành công không cảnh báo, đè lại nội dung Tab A vừa khôi phục.
MINIMAL_FIX: `restorePageVersion` phải bump `meta.clientRevision` của bản ghi lên GIÁ TRỊ CAO HƠN storedRevision hiện tại (vd. `Math.max(existingDraftRevision, restoredSnapshotRevision) + 1`) thay vì giữ nguyên số cũ của snapshot — để autosave cũ hơn từ tab khác bị STALE_REVISION đúng cách và đi qua `resolveSaveConflict()` (cơ chế đã có sẵn từ Phase 1).
REGRESSION_RISK: Cần rà các nơi khác đọc `meta.clientRevision` (hiển thị version/diff) trước khi đổi giá trị lúc restore.
```

### BUG-08
```
ID: context-menu-stale-block-on-empty-right-click
SEVERITY: P1
SYMPTOM: Chọn 1 section, sau đó right-click vào khoảng trống canvas (không trúng block nào) — menu chuột phải vẫn hiện đầy đủ hành động (Sao chép/Nhân bản/Xóa) như đang nhắm vào block ĐÃ CHỌN TRƯỚC ĐÓ. Bấm "Xóa"/"Tạo bản sao" sẽ xoá/nhân bản NHẦM block cũ.
ROOT_CAUSE: `onContextMenuCapture` chỉ gọi `actions.onSelectFromTarget(...)` khi `hit.blockId` truthy. `parseContextTarget` trả `blockId: null` khi right-click vào vùng trống (không có ancestor `[data-lp-block-id]`). Khi đó `canvasSelection` KHÔNG được cập nhật/xoá, nên `actions.selectedBlock` vẫn trỏ vào selection CŨ, và menu render đầy đủ action gắn với block cũ đó.
FILE: apps/web/src/components/landing-pages/landing-page-canvas-context-menu.tsx  FUNCTION/LINE: onContextMenuCapture 324-338, parseContextTarget 101-135
HOW_TO_REPRODUCE: Click chọn 1 section. Right-click vào vùng đệm trống của canvas (ngoài mọi section). Quan sát menu vẫn hiện action của block cũ, đang enable. Bấm "Xóa" → block cũ (không phải nơi vừa right-click) bị xoá.
MINIMAL_FIX: Khi `hit.blockId` null, chủ động clear selection trước khi mở menu, hoặc để `ContextMenuContent` tự xác định context "Canvas trống" dựa trên state của chính lần click đó thay vì tin vào prop `selectedBlock` bất đồng bộ từ parent.
REGRESSION_RISK: Nếu deselect ở mọi right-click trống, cần đảm bảo hit-test `.closest('[data-lp-block-id]')` đủ chính xác cho các click gần rìa block để không làm mất selection oan.
```

### BUG-09
```
ID: marquee-select-stuck-on-pointercancel
SEVERITY: P1
SYMPTOM: Sau 1 số thao tác kéo bị ngắt giữa chừng (điển hình nhất: bắt đầu marquee-select trên viewport mobile/touch, trình duyệt cướp gesture thành cuộn trang), TOÀN BỘ canvas ngừng phản hồi click/chọn/kéo ở MỌI section — kéo dài tới khi reload trang.
ROOT_CAUSE (verified trực tiếp): Cờ toàn cục `isLpMarqueeSelecting()`/`setLpMarqueeSelecting()` chặn pointerdown của mọi section VÀ chặn `beginDrag` của free-drag. Cờ chỉ được clear qua `clearMarquee()`, chỉ được gọi từ handler `pointerup`. `attachMarqueeWin()` chỉ đăng ký `window.addEventListener('pointermove'...)` và `('pointerup'...)` — KHÔNG đăng ký `pointercancel`. Container canvas mobile set `touchAction: 'pan-y'` (cho phép cuộn dọc) nên trình duyệt hoàn toàn có thể tự huỷ pointer (`pointercancel`) thay vì gửi `pointerup` khi diễn giải gesture thành cuộn — lúc đó cờ kẹt `true` vĩnh viễn. Đây là bug hồi quy so với chính pattern còn lại của repo: `landing-page-free-drag.tsx` (dòng ~936-947) và `landing-page-builder-sidebar.tsx` (dòng ~589-595) đều nghe cả `pointerup` LẪN `pointercancel` — chỉ riêng marquee bỏ sót.
FILE: apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx  FUNCTION/LINE: attachMarqueeWin 680-707 (verified: chỉ có dòng 701-702 pointermove+pointerup, không có pointercancel); landing-page-canvas-selection.ts 118-127 (cờ toàn cục)
HOW_TO_REPRODUCE: Trên viewport mobile, bắt đầu kéo touch trên vùng nền trống 1 section với đủ độ dịch chuyển dọc để trình duyệt tiếp quản thành cuộn trang (rất dễ xảy ra thật vì container cho phép pan-y). Sau đó mọi tap/kéo trên bất kỳ section nào đều vô hiệu.
MINIMAL_FIX: Thêm `window.addEventListener('pointercancel', onUp)` trong `attachMarqueeWin`, trỏ về cùng `handleSectionPointerUp`/`clearMarquee`, giống pattern đã dùng ở free-drag.tsx.
REGRESSION_RISK: Thấp — chỉ thêm đường dọn dẹp còn thiếu; `handleSectionPointerUp` đã xử lý an toàn trường hợp "không di chuyển đáng kể" (trả về sớm qua clearMarquee()).
```

### BUG-10
```
ID: block-lock-only-guards-delete
SEVERITY: P1
SYMPTOM: Khoá 1 section ("Khóa" trong menu chuột phải) khiến người dùng tưởng section được bảo vệ toàn diện, nhưng vẫn có thể: di chuyển layer lên/xuống, kéo-sắp-xếp lại qua handle toolbar nổi, sửa chữ inline, thay ảnh, hoặc bật free-position — CHỈ hành động Xoá là bị chặn thật.
ROOT_CAUSE (verified trực tiếp bằng grep toàn bộ module): `block.locked` CHỈ được đọc ở đúng 1 nơi — filter trong `removeBlocks` (dòng 1552: `.filter((b) => b.locked === true)`). Không có bất kỳ tham chiếu `.locked` nào khác trong landing-page-builder.tsx (ngoài chỗ ghi ở `toggleBlockLock` dòng 2095), landing-page-canvas-ux.tsx, landing-page-free-drag.tsx, hay landing-page-renderer.tsx. `moveBlock`/`reorderBlockById`, nút Move Up/Down, handle kéo-sắp-xếp, drop-reorder qua sidebar, `toggleBlockFreePosition`, và mọi entry-point sửa chữ inline / thay ảnh — không cái nào kiểm tra `locked`.
FILE: apps/web/src/components/landing-pages/landing-page-builder.tsx  FUNCTION/LINE: toggleBlockLock 2092-2097 vs. removeBlocks 1547-1578 (nơi DUY NHẤT đọc locked); moveBlock 1666-1677; reorderBlockById 1679-1689
HOW_TO_REPRODUCE: Right-click 1 section → "Khóa". Dùng nút ↑/↓ trên toolbar nổi hoặc kéo handle "⠿ Di chuyển" — section vẫn di chuyển bình thường, không cảnh báo. Double-click headline của nó — vẫn sửa được và autosave bình thường.
MINIMAL_FIX: Thêm guard `block.locked` ở đầu `moveBlock`, `reorderBlockById`, nhánh reorder trong drop handler, `toggleBlockFreePosition`, và các entry-point sửa nội dung inline (no-op kèm `setSaveMsg` toast, theo đúng pattern "Section đang khóa — mở khóa trước khi xóa" đã có sẵn cho Xoá), hoặc disable/ẩn các nút Move/handle kéo/free-position-toggle khi `selected?.locked`.
REGRESSION_RISK: Trung bình — cần quyết định rõ phạm vi "khoá" (chỉ chặn di chuyển+xoá, hay chặn cả sửa nội dung) trước khi implement, tránh vừa thiếu vừa thừa so với kỳ vọng người dùng.
```

### BUG-11
```
ID: advanced-position-unclamped-breaks-layout
SEVERITY: P1
SYMPTOM: Khi section đang ở chế độ Free position, gõ trực tiếp 1 giá trị width/height/x/y vào ô số trong tab "Vị trí nâng cao" (Inspector) có thể khiến TOÀN BỘ style định vị của section biến mất ngay lập tức — section bung khỏi vị trí đã đặt, không báo lỗi. Rất dễ vô tình gây ra: gõ "2500" cho Width, hoặc "-100" cho Y (giá trị hoàn toàn hợp lý cho 1 hero tràn viền phía trên canvas).
ROOT_CAUSE (verified trực tiếp): Input số ghi thẳng vào `freeLayout[key]` không hề clamp/validate (builder.tsx dòng 4297-4305). `isPlausibleFreeLayout()` (free-drag.tsx 1287-1305) từ chối NGUYÊN CẢ object layout (không chỉ field lỗi) nếu x<-40, x>2400, y tương tự, hoặc width/height <=0 hoặc >2400. `freeLayoutStyle()` khi bị từ chối trả về `undefined` — không phải style fallback đã clamp. Nơi tiêu thụ (canvas-ux.tsx dòng 738-742): `style={freeLayoutStyle(layout, dragging) || (!layout ? {minHeight:56} : undefined)}` — vì `layout` (object) vẫn truthy dù fail plausibility check, nhánh `!layout` cũng trả undefined → `style` = undefined hoàn toàn → section rơi vào flow thường, mất mọi định vị.
FILE: apps/web/src/components/landing-pages/landing-page-builder.tsx  FUNCTION/LINE: 4297-4305 (accordion "Vị trí nâng cao", onChange từng ô số)
ALSO: apps/web/src/components/landing-pages/landing-page-free-drag.tsx:1287-1305 (isPlausibleFreeLayout), :1307-1339 (freeLayoutStyle); tiêu thụ tại landing-page-canvas-ux.tsx:738-742
HOW_TO_REPRODUCE: Bật Free position cho 1 section. Mở "Vị trí nâng cao", gõ 2500 vào Width (hoặc -100 vào Y). Section lập tức mất toàn bộ định vị, không cảnh báo, không revert.
MINIMAL_FIX: Clamp từng field theo đúng bound mà `isPlausibleFreeLayout` áp (width/height theo kiểu `clampFreeSize`, x/y trong [-40, 2400]) trước khi gọi `updateBlock`, giống cách `InspectorSliderNumber` đã tự clamp input số của nó (landing-page-inspector-ui.tsx:122-126).
REGRESSION_RISK: Thấp nếu clamp ở tầng UI (khớp bound đã dùng nơi khác cho drag-resize). Clamp ngay trong `freeLayoutStyle` rủi ro hơn vì hàm này dùng chung nhiều nơi.
```

### BUG-12
```
ID: theme-switcher-local-undo-redo-desync
SEVERITY: P1
SYMPTOM: Mở panel Theme nhanh, áp 1 theme, bấm nút "Undo" CỦA RIÊNG PANEL (không phải Ctrl+Z toàn cục) để revert. Ngay sau đó bấm Ctrl+Z toàn cục — thay vì lùi tiếp về trước, nó REDO: theme vừa undo hiện lại. Phải bấm Ctrl+Z lần 2 mới thực sự lùi về trạng thái trước khi đổi theme. "Reset" của panel gặp lỗi tương tự.
ROOT_CAUSE: Theme switcher giữ `undoStack` riêng, tách biệt hoàn toàn khỏi `historyRef`/`futureRef` toàn cục của builder. Nhưng `undo()`/`reset()` của nó KHÔNG revert cục bộ thật sự — chúng gọi `onChange(...)` giống hệt `applyPreset()`, và `onChange` nối vào `onThemeChange` của builder, luôn gọi `pushHistory(...)`. `pushHistory` LUÔN push spec hiện tại lên `historyRef` và xoá `futureRef` — tức coi "bấm Undo trong panel theme" là 1 EDIT MỚI (forward), không phải pop lịch sử. Kết quả: áp theme → historyRef=[S0]; bấm Undo-trong-panel → historyRef=[S0, S1(dark)] (S1 được push vì đó là trạng thái NGAY TRƯỚC khi Undo chạy); Ctrl+Z toàn cục pop S1 → áp lại đúng theme vừa cố undo.
FILE: apps/web/src/components/landing-pages/landing-page-theme-switcher.tsx  FUNCTION/LINE: undo() 82-98, reset() 100-123, pushUndo() 50-57
ALSO: apps/web/src/components/landing-pages/landing-page-builder.tsx  FUNCTION/LINE: pushHistory() 408-416, onThemeChange callback ~3600-3616
HOW_TO_REPRODUCE: Mở panel Theme → áp theme "Dark" → bấm "Undo" của panel → bấm Ctrl+Z. Theme Dark hiện lại thay vì lùi xa hơn.
MINIMAL_FIX: Cho `undo()`/`reset()` của switcher 1 đường revert THẬT (bypass pushHistory, gọi setSpec trực tiếp + đồng bộ lại historyRef), hoặc đơn giản nhất: bỏ hẳn undo-stack riêng của switcher, để mọi "undo theme" đi qua đúng 1 cơ chế — Ctrl+Z/Undo toàn cục.
REGRESSION_RISK: Nếu bỏ undo-stack riêng, cần trỏ nút "Undo" của panel về `undo()` toàn cục của builder, và giữ đúng ngữ nghĩa "Reset" (vốn revert về baseline lúc mount, không phải "lùi 1 bước") qua 1 API riêng thay vì pushHistory.
```

---

## P2 — Lỗi hiển thị/khó chịu rõ ràng

### BUG-13
```
ID: publish-no-cache-invalidation
SEVERITY: P2
SYMPTOM: Sau khi bấm Publish, URL public có thể vẫn phục vụ bản CŨ tới 60 giây.
ROOT_CAUSE: apps/web/src/app/p/[slug]/page.tsx fetch với `{ next: { revalidate: 60, tags: [\`lp-public-${slug}\`] } }` — có `tags` ngụ ý dự định gọi `revalidateTag` on-demand ngay sau publish, nhưng KHÔNG tồn tại bất kỳ lệnh gọi `revalidateTag` nào trong toàn repo (grep xác nhận), cũng không có route `/api/revalidate`. Tag hiện là dead code; trang chỉ dựa vào timer 60s.
FILE: apps/web/src/app/p/[slug]/page.tsx  FUNCTION/LINE: fetchPublic 18-29
HOW_TO_REPRODUCE: Publish 1 thay đổi, mở lại URL public từ client đã có cache ISR trước đó (hoặc trong vòng <60s kể từ request trước) — vẫn thấy bản cũ.
MINIMAL_FIX: Sau khi publish() thành công (apps/api/.../landing-pages.service.ts ~724-739), gọi 1 webhook nhỏ tới web app để trigger `revalidateTag` (cần thêm route này, hiện chưa có).
REGRESSION_RISK: Thấp — thuần bổ sung; timer 60s vẫn là lưới an toàn nếu webhook lỗi.
```

### BUG-14
```
ID: builder-no-unload-guard
SEVERITY: P2
SYMPTOM: Người dùng có thay đổi chưa lưu (đang trong cửa sổ debounce 1200ms, hoặc autosave vừa fail để lại dirtyRef=true) đóng tab/điều hướng đi — không có cảnh báo nào, thay đổi mất trắng.
ROOT_CAUSE: Toàn bộ hệ thống dirty-tracking/autosave/conflict đã có sẵn (dirtyRef, saveConflictRef, debounce, retry/backoff) nhưng KHÔNG có `beforeunload` listener nào trong file (grep xác nhận 0 kết quả), cũng không chặn điều hướng route Next.js.
FILE: apps/web/src/components/landing-pages/landing-page-builder.tsx (thiếu hoàn toàn beforeunload guard)
HOW_TO_REPRODUCE: Gõ 1 thay đổi, đóng tab trong vòng ~1.2s (hoặc ngay sau khi giả lập lỗi mạng lúc autosave). Mở lại — thay đổi biến mất, không hề được cảnh báo trước.
MINIMAL_FIX: Thêm `useEffect` đăng ký `window.addEventListener('beforeunload', handler)`, handler check `dirtyRef.current` rồi `e.preventDefault(); e.returnValue=''`, dọn dẹp khi unmount.
REGRESSION_RISK: Rất thấp — thuần bổ sung an toàn UX.
```

### BUG-15
```
ID: canvas-reserve-height-dual-writer-race
SEVERITY: P2
SYMPTOM: Layout giật/nhảy chiều cao section khi kéo/resize (đặc biệt khi autosave chạy nền giữa lúc đang kéo), section có thể chồng lấn/để hở khoảng trống sai.
ROOT_CAUSE: 2 nguồn độc lập cùng ghi `minHeight`/`data-lp-free-reserve-h` lên cùng 1 DOM node `[data-lp-canvas-root]`: (A) `landing-page-renderer.tsx` — React-declarative, tính từ spec đã commit qua `computeCanvasFreeReserveHeight` (không tính rotate), set lại làm inline style MỖI LẦN RENDER; (B) `landing-page-free-drag.tsx`'s `syncCanvasFreeReserve()` — imperative, đo DOM sống (bao gồm rotate), chạy theo rAF trong lúc kéo VÀ từ effect riêng trong builder.tsx theo `[spec.blocks, viewport]`. Bất kỳ re-render nào của LandingPageRenderer do state không liên quan (saveMsg, selection...) sẽ khiến React re-apply giá trị TỪ SPEC CŨ, đè lên giá trị "sống" mà (B) vừa set giữa lúc kéo. Có bằng chứng đây là 2 thế hệ chồng nhau: free-drag.tsx export sẵn component `FlowReserve` (dòng 1442) với comment "React mounts FlowReserve after commit" nhưng KHÔNG hề được import/render ở đâu trong repo — code chết, dấu vết kiến trúc cũ chưa dọn.
FILE: apps/web/src/components/landing-pages/landing-page-renderer.tsx 2409-2424, 2513-2519 (nguồn A); apps/web/src/components/landing-pages/landing-page-free-drag.tsx 511-538 (nguồn B, gọi từ ≥7 nơi); apps/web/src/components/landing-pages/landing-page-builder.tsx 850-856 (effect trùng nhiệm vụ với nguồn A)
HOW_TO_REPRODUCE: Kéo dài 1 section free-position xuống dưới trong lúc để autosave nền trigger (đợi ~1.2s) — quan sát canvas co lại đột ngột rồi bật lại. Xoay 1 section rồi resize — so `data-lp-free-reserve-h` giữa 2 nguồn để thấy lệch giá trị khi có rotate.
MINIMAL_FIX: Chọn 1 nguồn duy nhất làm chủ minHeight (khuyến nghị: giữ nguồn A cho trạng thái đã-commit, để nguồn B chỉ chạy trong lúc DragSession đang active, tắt effect trùng lặp ở builder.tsx). Xoá code chết FlowReserve nếu không dùng lại.
REGRESSION_RISK: Cần test kỹ các case: section free có rotate, nhiều section free chồng nhau, content cao động (ảnh load chậm) — dễ để lại canvas 0 chiều cao nếu rút bớt sai chỗ.
```

### BUG-16
```
ID: dup-nested-item-style-orphaned
SEVERITY: P2
SYMPTOM: Nhân bản 1 section (Benefits/Features/Process/Gallery/Product/Speaker/Pricing...) có item đã style riêng (in đậm/đổi màu qua toolbar inline) hoặc item bị ẩn/khoá — style/trạng thái ẩn-khoá đó KHÔNG theo sang bản sao, item bản sao về mặc định. Data style không bị xoá, chỉ trở thành rác mồ côi vĩnh viễn trong `meta`, phình JSON theo thời gian.
ROOT_CAUSE: `dupBlock()` gọi `duplicateBlock()` (đúng — gán id mới cho mọi item/plan/field lồng bên trong). Nhưng metadata style/ẩn/khoá theo item nằm ở `spec.meta.inlineTextStyles`/`elementHidden`/`elementLocked`, key dạng `${blockId}::itemTitle:${itemId}`. `remapKeyed` helper trong `dupBlock` chỉ rewrite phần prefix `${blockId}::` sang `${copy.id}::`, KHÔNG rewrite phần `itemId` cũ nằm trong suffix — vì items của bản sao đã có id MỚI hoàn toàn, key sau remap (`${copy.id}::itemTitle:<oldItemId>`) không khớp với item nào trong bản sao cả.
FILE: apps/web/src/components/landing-pages/landing-page-builder.tsx  FUNCTION/LINE: dupBlock, remapKeyed 1580-1623 (đặc biệt 1599-1612); packages/shared/src/landing-page-lifecycle.ts duplicateBlock 842-872
HOW_TO_REPRODUCE: Thêm Benefits có ≥2 item. Style tiêu đề 1 item (đổi màu/đậm). Right-click section → "Tạo bản sao". Item tương ứng trong bản sao mất style, bản gốc vẫn còn.
MINIMAL_FIX: Đổi để `duplicateBlock` trả về bảng ánh xạ id-cũ→id-mới của item/plan/field, rồi `remapKeyed` rewrite CẢ prefix blockId LẪN id nhúng trong suffix theo bảng đó.
REGRESSION_RISK: Cần đảm bảo các caller khác của `duplicateBlock` (vd. paste từ clipboard) cũng nhận đúng remap, tránh sửa nửa vời.
```

### BUG-17
```
ID: dup-item-no-style-carryover
SEVERITY: P2
SYMPTOM: Nhân bản 1 card/item riêng lẻ (nút "Nhân bản card" trên chính item) luôn mất style/ẩn/khoá của item đó trên bản sao — còn tệ hơn cả nhân-bản-cả-section (vốn ít nhất có cố gắng, dù sai — xem BUG-16).
ROOT_CAUSE: `dupItem()` gọi `duplicateLandingPageNestedItem()` — chỉ gán id mới rồi chèn vào mảng, không hề đọc/ghi `meta.inlineTextStyles`/`elementHidden`/`elementLocked` gì cả.
FILE: apps/web/src/components/landing-pages/landing-page-builder.tsx  FUNCTION/LINE: dupItem 1625-1664
HOW_TO_REPRODUCE: Style tiêu đề 1 item trong Benefits. Bấm "Nhân bản card" của item đó. Card mới không có style, chỉ card gốc còn giữ.
MINIMAL_FIX: Trong `dupItem`, sau khi có `copy.id`, tra key `${blockId}::itemTitle:${itemId}` (và field khác liên quan) trong các map style/ẩn/khoá, ghi thêm entry tương ứng cho `${blockId}::itemTitle:${copy.id}` trước khi pushHistory.
REGRESSION_RISK: Thấp — cần cẩn thận chỉ copy đúng key của item này, tránh lẫn key của item khác.
```

### BUG-18
```
ID: advanced-position-rotate-bypasses-normalize
SEVERITY: P2
SYMPTOM: Ô "Rotate°" thô trong tab "Vị trí nâng cao" có thể lưu giá trị không giới hạn (vd. 720, -940) vào `freeLayout.rotate`, không nhất quán với mọi nơi khác ghi rotate. Slider Rotate trong tab Design (Transform panel, range -180..180) sau đó hiển thị đúng giá trị thô chưa chuẩn hoá này — slider có thể hiện kẹt ở biên trong khi số lưu thực tế nằm ngoài khoảng đó, và số này tiếp tục trôi xa hơn mỗi lần chỉnh thêm qua ô Advanced.
ROOT_CAUSE: 2 UI inspector khác nhau cùng ghi `block.freeLayout.rotate` với chuẩn hoá khác nhau: ô Advanced ghi `Number(e.target.value)` thẳng, không gọi `normalizeRotate`; kéo-xoay trên canvas luôn gọi `normalizeRotate(s.lastRotate)`; slider tab Design đọc `free!.rotate ?? 0` thô (không normalize) cho `value`, và `patchFree({rotate: n})` của nó cũng bỏ qua normalizeRotate (chỉ "an toàn" vì range slider tự giới hạn -180..180 — nhưng vẫn kế thừa và hiển thị số không giới hạn mà ô Advanced đã ghi trước đó). `isPlausibleFreeLayout` chỉ check `Number.isFinite(rotate)`, không giới hạn khoảng.
FILE: apps/web/src/components/landing-pages/landing-page-builder.tsx  FUNCTION/LINE: 4297-4305 (ô Rotate°) vs. landing-page-inspector-design-tab.tsx:737,766-776 (Transform panel) vs. landing-page-free-drag.tsx:658
HOW_TO_REPRODUCE: Gõ 400 vào ô Rotate° (tab Advanced). Chuyển sang tab Design → Transform: số hiển thị 400 (hoặc slider kẹt biên 180) trong khi giá trị lưu vẫn 400 cho tới lần tương tác slider tiếp theo.
MINIMAL_FIX: Gọi `normalizeRotate` khi ghi ở ô Advanced, và dùng `normalizeRotate(free.rotate ?? 0)` làm `value` cho slider Transform thay vì đọc field thô.
REGRESSION_RISK: Rất thấp — hàm pure đã dùng nhiều nơi, chỉ ngăn trôi số, không đổi cách render (render đã tự normalize).
```

### BUG-19
```
ID: floating-inspector-occludes-canvas-handles
SEVERITY: P2
SYMPTOM: Khi Inspector ở chế độ "Phóng" (floating, có thể kéo tự do khắp màn hình), có thể kéo đè lên đúng vị trí handle resize/rotate của phần tử đang chọn trên canvas. Vì panel floating là khối đặc và nằm ở stacking level cao hơn, click nhắm vào handle bị panel "ăn" mất — không thể thao tác handle bị che.
ROOT_CAUSE: Panel floating là `position:fixed; zIndex:60`, nền đặc, portal vào document.body. Biên kéo thả (`clampFloatingPosition`) chỉ giới hạn theo viewport, không tránh vùng canvas. Trong khi đó chrome resize/rotate (`FreeTransformChrome`) chỉ ở z-[18]/z-[19], và bản thân shell đang kéo tối đa chỉ đạt zIndex 30 (offset) / 50 (absolute) — đều thấp hơn 60 của inspector floating.
FILE: apps/web/src/components/landing-pages/landing-page-builder.tsx  FUNCTION/LINE: 3792-3799 (style panel floating), 482-490 (clampFloatingPosition, không tránh canvas)
HOW_TO_REPRODUCE: Bấm "Phóng" để tách rời Inspector. Kéo panel đè lên góc/handle-xoay của phần tử đang chọn trên canvas. Cố click-kéo handle đó — click bị panel phía trên chặn.
MINIMAL_FIX: Hạ z-index panel floating xuống dưới đỉnh z-index của chrome kéo/resize trong lúc có 1 drag/resize/rotate session đang active, hoặc giới hạn `clampFloatingPosition` tránh cả vùng canvas.
REGRESSION_RISK: Thấp — cần đảm bảo cờ "đang kéo" luôn được clear đúng lúc pointerup/cancel (đã có sẵn qua sự kiện `lp-heading-box-resize-end` và cleanup `sessionRef.current=null`).
```

### BUG-20
```
ID: bg-toolbar-color-picker-floods-undo-history
SEVERITY: P2
SYMPTOM: Sau khi chọn màu nền tuỳ chỉnh cho section qua color-picker gốc trình duyệt, bấm Undo liên tục sẽ đi qua HÀNG CHỤC sắc màu gần giống nhau của cùng 1 lần kéo chọn màu, thay vì lùi về đúng 1 bước edit trước đó; nếu kéo đủ dài, các edit thật hợp lệ trước đó (xoá 1 block, sửa 1 đoạn text...) có thể bị đẩy khỏi lịch sử Undo (cap 50 entry) và không còn truy cập được nữa.
ROOT_CAUSE: `<input type="color">` gọi `onAction({type:'set-color', color:c})` thẳng từ `onChange`, không debounce. Ở trình duyệt Chromium, `onChange` của input color bắn liên tục trong lúc người dùng kéo chọn màu (hàng chục lần/gesture), không chỉ 1 lần lúc commit. Mỗi lần bắn đều đi qua `handleSectionBackgroundAction` → `updateBlock` → `pushHistory`, và `pushHistory` push snapshot đầy đủ + cap 50 entry bằng `.shift()` — 1 lần kéo màu có thể đẩy văng lịch sử cũ có ý nghĩa.
FILE: apps/web/src/components/landing-pages/landing-page-section-background-toolbar.tsx  FUNCTION/LINE: input color onChange 189-195
ALSO: apps/web/src/components/landing-pages/landing-page-builder.tsx  FUNCTION/LINE: handleSectionBackgroundAction case 'set-color' 2265-2269, pushHistory 408-416
HOW_TO_REPRODUCE: Chọn section, mở toolbar "Nền" → "Màu nền" (color picker gốc). Kéo qua vùng gradient/hue vài giây (không chỉ click 1 lần). Đóng picker. Bấm Ctrl+Z nhiều lần — thấy đi qua rất nhiều sắc màu trung gian của cùng 1 lần kéo.
MINIMAL_FIX: Debounce/coalesce thay đổi màu — cập nhật preview cục bộ mỗi onChange nhưng chỉ gọi onAction (push history) lúc blur/commit, hoặc debounce 150-300ms để chỉ màu cuối cùng trong 1 chuỗi kéo được push.
REGRESSION_RISK: Nếu commit-only-on-blur, cần đường preview live riêng (không push history) để canvas vẫn cập nhật mượt khi đang kéo.
```

### BUG-21
```
ID: bg-toolbar-submenu-stuck-open-on-touch
SEVERITY: P2
SYMPTOM: Trên thiết bị cảm ứng, chạm "Căn chỉnh ảnh"/"Lật"/"Chuyển động"/"Vị trí" trong toolbar nền mở ra dropdown không bao giờ tự đóng — nằm chình ình trên màn hình, có thể che nút khác hoặc nội dung canvas cho tới khi chạm trúng 1 item trong menu hoặc bỏ chọn cả toolbar nền.
ROOT_CAUSE: Cơ chế đóng duy nhất của component `Menu` là `onMouseLeave` trên panel dropdown. Thiết bị cảm ứng không bao giờ bắn `mouseleave`/`mouseenter` từ 1 lần chạm, và không có handler outside-tap/blur/Escape nào khác — `open` giữ `true` vô thời hạn sau khi 1 lần chạm mở nó.
FILE: apps/web/src/components/landing-pages/landing-page-section-background-toolbar.tsx  FUNCTION/LINE: Menu 51-74 (onMouseLeave dòng 67)
HOW_TO_REPRODUCE: Trên thiết bị/emulator cảm ứng, chọn nền section, chạm "Chuyển động" để mở dropdown, rồi chạm nơi khác không phải menu item — dropdown vẫn còn hiện.
MINIMAL_FIX: Thêm listener pointerdown/touchstart cấp document (khi `open`) để đóng menu nếu chạm ngoài node của menu, song song giữ `onMouseLeave` cho desktop.
REGRESSION_RISK: Thấp — cần tránh đóng ngay chính lần chạm vừa mở menu (dùng capture-phase check hoặc đăng ký effect sau khi `open` đã true).
```

### BUG-22
```
ID: theme-switcher-undo-stack-lost-on-panel-close
SEVERITY: P2
SYMPTOM: Áp vài theme liên tiếp, đóng panel Theme (toggle icon rail), mở lại, bấm "Undo" — không có tác dụng (im lặng no-op). Bấm "Reset" thì reset về theme đang active tại thời điểm MỞ LẠI panel, không phải theme gốc thật sự của trang từ đầu phiên.
ROOT_CAUSE: `LandingPageThemeSwitcher` được MOUNT có điều kiện (conditional JSX), không chỉ ẩn/hiện — mỗi lần đóng/mở panel tạo instance mới, `undoStack` và `resetBaseline` (đều là `useRef` khởi tạo tại thời điểm mount) bị xoá về rỗng / chụp lại baseline từ theme HIỆN TẠI (có thể đã bị đổi bởi lần thử theme trước).
FILE: apps/web/src/components/landing-pages/landing-page-theme-switcher.tsx  FUNCTION/LINE: undoStack 38, resetBaseline 39-43
ALSO: apps/web/src/components/landing-pages/landing-page-builder-sidebar.tsx  FUNCTION/LINE: 1006-1022 (mount có điều kiện)
HOW_TO_REPRODUCE: Mở panel Theme, áp "Dark". Đóng panel. Mở lại. Bấm "Undo" (không có tác dụng) hoặc "Reset" (reset về Dark thay vì theme gốc thật).
MINIMAL_FIX: Nâng `undoStack`/`resetBaseline` lên cấp cha (ref ở builder/sidebar, khoá theo pageId) để sống sót qua đóng/mở panel, hoặc giữ switcher luôn mount và chỉ ẩn/hiện bằng CSS.
REGRESSION_RISK: Cần đảm bảo stack được clear đúng lúc đổi sang page khác (khớp với fix BUG-06) để không rò rỉ undo-theme của trang này sang trang khác.
```

---

## P3 — Nhỏ / edge-case

### BUG-23
```
ID: resize-after-rotate-wrong-axis
SEVERITY: P1 (xếp P1 vì làm hỏng hẳn thao tác resize ở góc xoay phổ biến 90°/270°, dù tần suất người dùng chạm phải thấp hơn các P1 khác — xem ghi chú xếp hạng cuối)
SYMPTOM: Resize 1 section/element SAU KHI đã xoay (vd. 90°) bằng cách kéo góc/cạnh: kéo đúng hướng mắt thấy (theo handle đã xoay theo hình) không đổi kích thước đúng như mong đợi — ở góc 90°/270° có thể KHÔNG đổi kích thước gì cả dù đang kéo handle.
ROOT_CAUSE (tự phát hiện, verified trực tiếp): Handle resize/rotate (`FreeTransformChrome`) được render là CON của chính div có `transform: rotate()` (`freeLayoutStyle`, mode absolute) — verified: `<FreeTransformChrome>` nằm trong cùng subtree JSX với div `style={freeLayoutStyle(layout, dragging)}` (landing-page-canvas-ux.tsx dòng 724-742, 880-906). CSS transform của cha áp lên toàn bộ con, nên handle VISUALLY xoay theo hình. Nhưng công thức resize trong `applyMove()` (nhánh `kind === 'resize'`) tính `dx = (clientX - startClientX)/scale`, `dy = (clientY - startClientY)/scale` rồi truyền THẲNG vào `applyResizeHandle({handle, dx, dy, ...})` — hoàn toàn trong hệ toạ độ màn hình CHƯA XOAY, không hề chiếu ngược (inverse-rotate) dx/dy về hệ toạ độ cục bộ của box trước khi tính. Ở rotate=90°, trục "rộng ra" cục bộ (handle 'e') về mặt hình ảnh giờ chỉ theo trục Y màn hình — nhưng code chỉ phản ứng với `dx` cho handle 'e' → dx=0 khi kéo đúng hướng hình → KHÔNG đổi width.
FILE: apps/web/src/components/landing-pages/landing-page-free-drag.tsx  FUNCTION/LINE: applyMove, nhánh resize ~dòng 729-803 (không có phép chiếu ngược theo rotate trước khi gọi applyResizeHandle)
HOW_TO_REPRODUCE: Bật Free position cho 1 section, xoay 90° bằng handle xoay. Kéo handle cạnh phải ("e", giờ nằm ở dưới hình do đã xoay theo) theo đúng hướng mắt thấy (kéo xuống) — kích thước KHÔNG đổi (hoặc đổi sai trục nếu ở góc xoay khác 90°/180°/270°).
MINIMAL_FIX: Trước khi gọi `applyResizeHandle`, chiếu (dx, dy) ngược lại theo `-s.rotate` (nhân ma trận xoay nghịch đảo) để có delta trong hệ toạ độ cục bộ của box, rồi mới áp handle logic hiện có.
REGRESSION_RISK: Trung bình — đây là core math của engine resize, cần test kỹ mọi góc xoay (0/45/90/180/270) và mọi handle (n/s/e/w/nw/ne/sw/se) trước khi merge; rotate=0 phải cho kết quả y hệt hiện tại (không hồi quy trường hợp phổ biến nhất).
```

### BUG-24
```
ID: normalize-rotate-360-rounding-edge-case
SEVERITY: P3
SYMPTOM: Sau khi xoay tới gần đúng 1 vòng đủ (360°) theo chiều mà kết thúc bằng 1 giá trị âm rất nhỏ (vd. -0.03°, hoàn toàn có thể xảy ra từ phép tính con trỏ + snap thực tế), badge góc xoay hiển thị trên canvas có thể hiện "360°" thay vì "0°" dù hình đã xoay về đúng vị trí ban đầu trực quan.
ROOT_CAUSE (tự phát hiện, verified bằng toán): `normalizeRotate(deg)`: `d = deg % 360; if (d<0) d+=360; return Math.round(d*10)/10`. Với `deg=-0.03`: `d = -0.03+360 = 359.97` → `Math.round(3599.7)/10 = 3600/10 = 360` — hàm trả về CHÍNH XÁC 360, không phải 0. Thêm vào đó, badge góc xoay trên canvas (`landing-page-canvas-ux.tsx`, `{layout.rotate ? \` · ${Math.round(layout.rotate)}°\` : ''}`) đọc `layout.rotate` THÔ, không gọi lại `normalizeRotate` trước khi hiển thị — trong khi `freeLayoutStyle` (nơi tính CSS transform thật) CÓ gọi `normalizeRotate` nên hình vẫn xoay đúng 0° visually, gây lệch giữa số hiển thị và hình thật.
FILE: packages/shared/src/landing-page-free-position.ts  FUNCTION/LINE: normalizeRotate 244-249
ALSO: apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx  FUNCTION/LINE: badge góc xoay ~dòng 901 (đọc layout.rotate thô)
HOW_TO_REPRODUCE: Khó ép chính xác qua UI thông thường (cần đúng 1 giá trị rotate kết thúc trong khoảng [-0.05, 0) trước khi normalize) — nhưng có thể verify bằng cách gọi `normalizeRotate(-0.03)` trực tiếp trong console/unit test, trả về `360` thay vì `0`.
MINIMAL_FIX: Sau khi tính `d = Math.round(d*10)/10`, thêm 1 bước `if (d >= 360) d -= 360;` để đảm bảo output luôn nằm trong [0, 360). Đồng thời sửa badge để gọi `normalizeRotate(layout.rotate)` trước khi hiển thị thay vì dùng giá trị thô.
REGRESSION_RISK: Rất thấp — chỉ sửa 1 edge-case rounding, không đổi hành vi bình thường.
```

### BUG-25
```
ID: sidebar-dnd-no-drop-target-on-empty-canvas
SEVERITY: P3
SYMPTOM: Nếu trang hiện có 0 block (xoá hết section), kéo-thả phần tử/Section mẫu từ sidebar vào canvas không có tác dụng gì — không highlight, không drop, không phản hồi lỗi. Click-để-thêm vẫn hoạt động nên che khuất phần nào gap này.
ROOT_CAUSE: Toàn bộ xử lý drop preset sidebar (`onDragOver`/`onDrop`) chỉ được gắn trên DOM node của TỪNG block hiện có (landing-page-canvas-ux.tsx dòng 785-862). Container scroll/backdrop của canvas trong builder.tsx không đăng ký `onDragOver`/`onDrop` fallback nào khi danh sách block rỗng.
FILE: apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx  FUNCTION/LINE: onDragOver/onDrop trên từng section 785-862
HOW_TO_REPRODUCE: Xoá hết block trên 1 trang (về 0). Kéo 1 "Section mẫu"/phần tử từ sidebar trái vào canvas trống — không có gì xảy ra.
MINIMAL_FIX: Thêm cặp onDragOver/onDrop trên vùng nền/scroll container của canvas, nhận LP_SIDEBAR_PRESET_MIME và gọi insertSidebarPreset(payload, {mode:'end'}) khi blocks.length===0.
REGRESSION_RISK: Rất thấp — fallback bổ sung, chỉ kích hoạt khi danh sách rỗng.
```

### BUG-26
```
ID: heading-resize-pointer-capture-leak-on-null-wrap
SEVERITY: P3 (khả năng tái hiện qua UI bình thường: thấp — nhưng lỗi trong code là thật)
SYMPTOM: Trong điều kiện timing hiếm, handle resize của 1 heading text box có thể bị "kẹt" giữ pointer capture, khiến pointer move/click tiếp theo trên phần tử đó (hoặc rộng hơn tuỳ trình duyệt) không phản hồi bình thường cho tới khi có thay đổi state khác giải phóng nó.
ROOT_CAUSE: `onHandleDown` gọi `captureEl.setPointerCapture(e.pointerId)` NGAY LẬP TỨC, rồi mới check `if (!wrap) return;`. Nếu `wrapRef.current` là null đúng lúc đó, hàm return sớm TRƯỚC KHI tạo session, TRƯỚC KHI gắn listener pointermove/up/cancel, và — quan trọng — KHÔNG BAO GIỜ gọi `releasePointerCapture`. Mọi exit path khác của hook đều release capture trong `onUp`; riêng nhánh early-return này bỏ sót hoàn toàn.
FILE: apps/web/src/components/landing-pages/landing-page-canvas-ux.tsx  FUNCTION/LINE: onHandleDown, dòng 1463-1474 (leak ở early return dòng 1474)
HOW_TO_REPRODUCE (chưa xác nhận đầy đủ đường tái hiện qua thao tác chuột thường, vì handle bình thường luôn là con của wrap nên wrap hiếm khi null lúc handle click được): cần 1 pointerdown trúng handle đúng lúc `wrapRef.current` chưa gắn/vừa gỡ (vd. re-render nhanh unmount/remount wrapper đồng thời với pointerdown, như bật/tắt edit-mode heading rất nhanh ngay lúc nhấn handle).
MINIMAL_FIX: Chuyển check `if (!wrap) return;` lên TRƯỚC lệnh `setPointerCapture`, hoặc gọi `captureEl.releasePointerCapture(e.pointerId)` ngay trong nhánh early-return khi wrap null.
REGRESSION_RISK: Không đáng kể — chỉ sắp lại thứ tự/thêm guard cho 1 nhánh early-return.
```

### BUG-27
```
ID: advanced-position-fields-inconsistent-with-drag-clamp-bounds
SEVERITY: P3
SYMPTOM: Giá trị nhập được qua ô width/height trong tab Advanced (tối đa tới 2400, không clamp gì khác — xem BUG-11) có thể vượt xa giới hạn mà chính box đó đạt được nếu kéo resize bằng tay trên canvas (giới hạn mềm FREE_SIZE_MAX_W/H = 1200). 1 box được đặt 2000px qua ô nhập sau đó không thể co lại nhất quán bằng kéo tay vì 2 giới hạn khác nhau.
ROOT_CAUSE: 2 giới hạn khác nhau cùng chi phối `freeLayout.width/height`: ngưỡng từ-chối-cứng của `isPlausibleFreeLayout` (2400) so với clamp-mềm của engine kéo-resize (`FREE_SIZE_MAX_W/H = 1200` trong `clampFreeSize`). Ô Advanced không áp dụng giới hạn nào trong 2 cái.
FILE: apps/web/src/components/landing-pages/landing-page-builder.tsx  FUNCTION/LINE: 4276-4309
HOW_TO_REPRODUCE: Gõ 2000 vào ô Width (tab Advanced) cho 1 box free-position. Sau đó chạm vào handle resize của chính nó lần đầu — kích thước "nhảy" xuống giới hạn 1200 ngay khi chạm.
MINIMAL_FIX: Dùng lại `clampFreeSize` (hoặc hằng số của nó) trong onChange width/height của tab Advanced để cả 2 đường ghi thống nhất giới hạn.
REGRESSION_RISK: Tối thiểu — chỉ siết lại 1 giới hạn vốn đã không nhất quán.
```

---

## SUSPECTED — chưa xác nhận được đường tái hiện cụ thể (không tính vào tổng bug)

- `custom-css-debounce-lost-on-selection-change` (P2 nếu tái hiện được) — `landing-page-inspector-design-tab.tsx:893-909`: effect đổi selection và cleanup unmount đều clear debounce timer mà không flush patch đang chờ (chỉ `onBlur` mới flush). Trong thao tác chuột thường, đổi selection luôn kèm blur tự nhiên nên chưa tìm được đường tái hiện chỉ-bằng-chuột; vẫn là code path thật đáng vá phòng ngừa.
- `heading-resize-scale-shortcircuit-on-translated-wrap` (latent) — `readCanvasPointerScale` (free-drag.tsx:488-503) bắt đầu duyệt tổ tiên TỪ CHÍNH element thay vì `parentElement`, có thể nhầm transform di chuyển của chính nó thành tỉ lệ zoom canvas — hiện KHÔNG có tính năng zoom canvas nào trong code nên chưa phải bug sống, nhưng sẽ vỡ ngay khi có ai thêm zoom.
- `heading-resize-ignores-rotation-if-ever-set` — không tái hiện được vì heading hiện không có đường nào set rotate qua UI hiện tại (`HeadingBoxResizeChrome` không có handle xoay). Ghi nhận phòng ngừa.
- Double pointerup listener overlap giữa section's own `onPointerUp` và `data-lp-section-bg-hit` inner div (canvas-ux.tsx ~748-749, ~1017-1023) — có khả năng vô hại do thứ tự React handler, chưa verify được bằng chạy thực tế trình duyệt.
- `moveBlock`/`reorderBlockById` đọc `spec.blocks` (closure state) trong khi `removeBlocks`/`dupBlock` đọc `specRef.current.blocks` (ref luôn mới nhất) — không nhất quán pattern, chưa tìm được kịch bản gây sai lệch thực tế với thao tác đơn lẻ thông thường.
- `lastTargetRef` trong `landing-page-canvas-context-menu.tsx` (dòng 333) được gán nhưng không đọc lại ở đâu — nghi là code sót từ 1 lần fix dở dang cho đúng bug BUG-08.

---

## Đánh giá chất lượng gate (`scripts/test-landing-page-*.cjs`)

| Script | Loại | Ghi chú |
|---|---|---|
| test-landing-page-resize-rotate.cjs | HYBRID | Phần lớn gate là string-matcher; có 1 khối `RESIZE_MATH` gọi hàm thật từ `packages/shared/dist` nhưng bọc try/catch, lỗi require sẽ fallback về string-check im lặng |
| test-landing-page-free-drag-move-size.cjs | STRING-MATCHER THUẦN | Chỉ `.includes()`/đếm chuỗi trên text nguồn, không import/thực thi gì |
| test-landing-page-element-free-drag.cjs | STRING-MATCHER THUẦN | Tương tự |
| test-landing-page-section-overlap.cjs | STRING-MATCHER THUẦN | Có cả regex kiểm tra "shape" của code (vd. `!/move[\s\S]{0,400}translate3d\(/`) — không phải assertion hành vi thật |
| test-landing-page-free-position-canvas.cjs | STRING-MATCHER THUẦN | Kể cả hàm tên `loadSnap()` cũng chỉ regex trên text `.ts`, không require/thực thi |
| (không có test-landing-page-undo*.cjs) | THIẾU HẲN | Không có gate tự động nào cho historyRef/futureRef hay tương tác với theme-switcher undo — đúng lỗ hổng để lọt BUG-12 |
| test-landing-page-doctor-gates.cjs | REAL TEST | Thực sự require() code đã build, spin `http.createServer` thật, test SSRF-guard bằng I/O thật |
| test-landing-page-theme-switcher.cjs | HYBRID | Phần lõi (`applyQuickThemeToSpecTokens`, `sanitizeLandingPageSpec`...) require thật và assert giá trị thật; nhưng KHÔNG có gate nào giả lập bấm nút Undo/Reset của switcher hay tương tác với global undo — không thể bắt được BUG-12/BUG-22 |
| test-landing-page-autosave-stuck.cjs | HYBRID (đã cập nhật ở Phase 1) | Sau khi tôi sửa Phase 1, các gate liên quan STALE_REVISION đã phản ánh đúng hành vi mới (pause + resolveSaveConflict), không còn khớp bug LP-AS cũ nữa — nhưng KHÔNG kiểm tra được đường version-restore (BUG-07), vì kịch bản đó nằm ngoài phạm vi file autosave |

**Kết luận:** Không có bug nào ở trên bị gate cũ "chặn" nhầm là false — toàn bộ 27 bug xác nhận đều từ đọc trực tiếp source hiện tại, không dựa vào giả định gate PASS = đúng hành vi. Ngược lại, nhiều bug (đặc biệt BUG-23 resize-sau-rotate, BUG-11 advanced-position không clamp, BUG-12/22 theme-undo desync) tồn tại chính xác ở những vùng mà gate hiện có chỉ kiểm tra "chuỗi còn tồn tại trong file", không kiểm tra hành vi runtime thật.

---

## Bảng tổng hợp

| Mức | Số lượng |
|---|---|
| P0_COUNT | 2 |
| P1_COUNT | 11 |
| P2_COUNT | 10 |
| P3_COUNT | 4 |
| **TOTAL_BUGS** | **27** |

*(Không tính 1 bug đã fix ở Phase 1, và 6 mục SUSPECTED chưa xác nhận được đường tái hiện.)*

### TOP_PRIORITY_FIX_ORDER

1. **BUG-01** `public-api-strips-meta` — P0, chặn mọi thứ khác thuộc nhóm public-parity (BUG-03, 04, 05 phụ thuộc vào fix này trước).
2. **BUG-02** `public-free-position-sections-lost` — P0, độc lập với BUG-01, có thể fix song song.
3. **BUG-07** `version-restore-no-concurrency-guard-silently-reverted` — P1, cùng họ root-cause với bug autosave đã fix Phase 1; nguy cơ mất dữ liệu thật, im lặng.
4. **BUG-06** `undo-history-leaks-across-pages` — P1, fix cực rẻ (`key={pageId}`), rủi ro thấp, chặn nguy cơ ghi nhầm dữ liệu chéo trang.
5. **BUG-10** `block-lock-only-guards-delete` — P1, vá theo đúng pattern đã có sẵn cho Xoá.
6. **BUG-09** `marquee-select-stuck-on-pointercancel` — P1, có thể làm liệt hẳn canvas trên mobile; fix nhỏ (thêm 1 listener).
7. **BUG-08** `context-menu-stale-block-on-empty-right-click` — P1, nguy cơ xoá/nhân bản nhầm.
8. **BUG-03, BUG-04, BUG-05** (`public-inline-text-style-lost`, `public-element-free-drag-lost`, `public-headline-bypasses-inline-editable`) — P1, làm tiếp sau BUG-01/02 vì cùng mạch renderer public.
9. **BUG-11** `advanced-position-unclamped-breaks-layout` — P1, fix rẻ (clamp input).
10. **BUG-12** `theme-switcher-local-undo-redo-desync` — P1, cần quyết định kiến trúc (bỏ undo-stack riêng hay không) trước khi code.
11. **BUG-23** `resize-after-rotate-wrong-axis` — P1, core math, cần test kỹ mọi góc/handle trước khi merge — làm sau khi các P1 "rẻ" đã xong.
12. **BUG-15** `canvas-reserve-height-dual-writer-race` — P1 (kế thừa từ audit trước), cần quyết định kiến trúc nguồn-nào-là-chủ trước khi code.
13. Nhóm P2 (BUG-13, 14, 16–22) — theo độ ưu tiên nghiệp vụ, không chặn nhau.
14. Nhóm P3 (BUG-24–27) — dọn khi rảnh, rủi ro thấp nhất.

---

## Kết luận

```
BUILDER_CURRENT_STATUS=UNSTABLE
LANDING_PAGE_PROD_READY=NO
```

**Lý do UNSTABLE/NO:** 2 bug P0 (BUG-01, BUG-02) nghĩa là trang **published thực tế không khớp với những gì người dùng thiết kế trong Builder** — mất định vị tự do (section lẫn phần tử), mất toàn bộ định dạng chữ tuỳ chỉnh, mất custom CSS trên phần lớn loại heading. Đây là lỗi "what-you-design-is-not-what-you-publish" ở mức nghiêm trọng nhất, ảnh hưởng MỌI trang có dùng free-position hoặc toolbar định dạng chữ (tính năng lõi, không phải edge-case). Cộng thêm 11 bug P1 khác — trong đó có 2 đường mất-dữ-liệu-im-lặng riêng biệt (BUG-07 version-restore, và root-cause tương tự đã fix 1 lần ở BUG autosave Phase 1 nhưng lộ lại qua đường khác), 1 lỗi có thể liệt toàn bộ canvas trên mobile (BUG-09), và 1 lỗi "khoá" không thực sự khoá (BUG-10) — module này chưa đạt mức ổn định để coi là production-ready, dù phần lớn workflow "vẽ nhanh 1 trang đơn giản, không rotate/free-position phức tạp, publish 1 lần" vẫn hoạt động được bình thường trong thực tế.

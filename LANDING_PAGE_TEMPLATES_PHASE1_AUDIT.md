# Landing Page Templates — Phase 1 Audit & Architecture Design

**Phạm vi:** `packages/shared/src/landing-page-template{s,-expand,-flows,-foundation,-select,-validators}.ts`, `landing-page-category-architectures.ts`, `landing-page-spa-directions.ts`, `landing-page-types.ts`, `LandingPageRenderer` (apps/web), API `GET /templates` (apps/api), Prisma `LandingPageTemplate`.

**Catalog version hiện tại:** `gallery-v7-spa-offer-booking` — 20 category × 10 architecture = 200 template.

**Phương pháp:** Đọc trực tiếp toàn bộ pipeline seed → expand → architecture → recipe → renderer → API/DB qua 5 luồng đọc song song + tôi tự verify chéo các điểm mâu thuẫn/quan trọng nhất bằng cách đọc lại code thật. **Chưa sửa bất kỳ dòng code nào** — đúng yêu cầu Phase 1.

---

## A. Báo cáo nguyên nhân template bị giống nhau

Nguyên nhân là **2 tầng cộng hưởng**, không phải 1 lỗi đơn lẻ:

### Tầng 1 — Dữ liệu (packages/shared): kiến trúc có thật, nhưng biến thể section thì không

- Pipeline thật: `LANDING_PAGE_SYSTEM_TEMPLATES = expandLandingPageTemplateCatalog(LANDING_PAGE_TEMPLATE_SEEDS)` (`landing-page-templates.ts:1128-1129`). Có **20 seed** (1/category, `landing-page-templates.ts:481-1125`), mỗi seed nhân ra **10 kiến trúc** từ `CATEGORY_ARCHITECTURES[category]` (`landing-page-category-architectures.ts:237-3094`, 200 entry `v(...)` tổng cộng, verify bằng grep).
- `CategoryArchitectureVariant` (`category-architectures.ts:96-119`) THỰC SỰ khác nhau giữa 10 biến thể/category: `sectionSequence` (thứ tự/tập hợp section), `heroVariant`, `theme`, `layout`, `ctaStrategy`, `formPlacement`, `proofType`, `visualComposition` — đây là dữ liệu hand-authored thật, không phải giả. Có sẵn cả hàm tự-kiểm `analyzeArchitectureUniqueness()` (`category-architectures.ts:3516-3558`) tính `sectionSignature` — chứng tỏ đội ngũ trước đã ý thức được vấn đề "diversity" này.
- **NHƯNG**: field `blockVariants: Partial<Record<BlockType,string>>` — field DUY NHẤT có thể chọn layout cấu trúc riêng cho từng section (vd. Testimonials dạng `quote-centered` vs `logo-wall`) — **chỉ được điền cho đúng 1/20 category: `spa`** (verify bằng grep `blockVariants:` — xuất hiện 10 lần trong `spa`, **0 lần** ở 19 category còn lại). 19/20 category để mọi section không phải Hero ở variant ngầm định `'default'`.
- Hệ quả: `heroVariant` cũng bị giới hạn — vì không set `blockVariants.Hero` trực tiếp, `v()` helper (`category-architectures.ts:168-204`) tự suy ra từ 1 enum legacy 7 giá trị qua `mapLegacyHeroVariant` (`foundation.ts:266-293`), chỉ chạm được **6/8** hero-layout thật có trong renderer — `'editorial-overlay'` và `'default'` không bao giờ đạt tới trừ khi set `blockVariants.Hero` thủ công (chỉ spa làm điều này).
- **Copy/câu chữ**: chỉ `spa` có lớp overlay riêng `applySpaDirectionCopy()` (`landing-page-spa-directions.ts`, gate cứng `if (category === 'spa')` tại `category-architectures.ts:3508-3510`) viết lại toàn bộ headline/feature/FAQ/guarantee theo TỪNG architectureId. **19/20 category còn lại dùng NGUYÊN VĂN cùng 1 bộ câu chữ seed**, chỉ resequence vào section-order khác nhau qua `ensureFeatures/ensureBenefits/...` (`category-architectures.ts:3389-3436`) — nghĩa là 10 template "saas" đọc y hệt từng câu, chỉ khác thứ tự/theme.
- **Design token nghèo**: chỉ **5 theme** (`MODERN/PREMIUM/MINIMAL/BOLD/CORPORATE`, `landing-page-types.ts:500-551`), mỗi theme chỉ khác `primary/secondary/background/surface/text/muted` (6 màu) + 1 `fontFamily` + 1 `radius` duy nhất. **Không có spacing scale, typography scale, shadow scale, density** — các field này tồn tại dạng optional trong type `LandingPageThemeTokens` nhưng KHÔNG preset nào điền. `MODERN` và `BOLD` còn trùng nguyên `primary` color + `fontFamily`.
- File `landing-page-template-flows.ts` (10 "flow") thực chất là **dead code một phần**: hàm `buildBlocksForFlow` (cơ chế 10-flow gốc) có **0 caller** trong toàn repo (verify bằng grep) — pipeline thật đã chuyển sang `CATEGORY_ARCHITECTURES` từ lâu. File này còn sống chỉ vì chứa các helper dùng chung `ensureCta/ensureFeatures/ensureFooter/...` mà `category-architectures.ts` import trực tiếp.

### Tầng 2 — Renderer (apps/web): dù data có variant, renderer phần lớn bỏ qua

Đây là phát hiện quan trọng nhất: **kể cả khi tự sửa data để 20/20 category đều điền đủ `blockVariants` như spa, phần lớn section vẫn sẽ nhìn giống nhau** vì renderer không thực sự vẽ khác:

| Block type | Renderer có đọc `variant`? | Số cấu trúc JSX thực sự khác nhau | Kết luận |
|---|---|---|---|
| **Hero** | Có (`resolveHeroComposition`) | **6 nhánh JSX thật** (floating-card+form, floating-card, editorial-overlay, fullscreen-image, split-left/right, centered) | Đa dạng thật |
| Benefits/Features/Process/Gallery/Product (ListCards) | Có nhưng hời hợt | 1 khung card-grid dùng chung; variant chỉ đổi số cột/icon-vs-ảnh/CSS | Gần như 1 layout |
| Testimonials | Có | Chỉ **2/8** giá trị variant có nhánh JSX thật; còn lại render y hệt hoặc chỉ đổi CSS | Gần như 1 layout |
| **Pricing** | **KHÔNG BAO GIỜ ĐỌC** (grep toàn file: field `variant` bị bỏ qua hoàn toàn) | **1**, cố định | Variant hoàn toàn "chết" |
| CTA | Có, một phần | 1 khung DOM; đổi màu nền/inline-style; **2/7 variant khai báo bị "chết"** (`split`, `floating-card` không có nhánh nào) | 1 layout, khác biệt hời hợt |
| LeadForm | Có, một phần | 1 khung DOM; variant chỉ đổi kích thước/CSS, `split` KHÔNG có layout tách-đôi thật | 1 layout, khác biệt hời hợt |

→ **Kết luận Root Cause**: dù mỗi category có 10 "kiến trúc" khác nhau về thứ tự section, khách hàng vẫn thấy các template "giống nhau" vì (1) câu chữ y hệt (trừ spa), (2) chỉ 5 theme chỉ khác màu, (3) renderer chỉ thực sự vẽ khác cho Hero — 5/6 loại section còn lại (đặc biệt **Pricing = 0%**) luôn ra cùng 1 hình dạng bất kể data nói gì.

### Tin tốt cho việc redesign
- `analyzeArchitectureUniqueness()` (self-check có sẵn) và validator similarity thô (`FINGERPRINT_COLLISION` error + `STRUCTURE_SIMILARITY` warning @35%, trong `landing-page-template-validators.ts:94-257`) **đã tồn tại** nhưng **không được nối vào CI** (grep toàn repo: không package.json script, không GitHub Actions nào gọi `validate-landing-page-template-catalog.cjs`) — hạ tầng để nâng cấp thành validator similarity đã có sẵn, không cần viết từ đầu.
- Type `LANDING_PAGE_HERO_VARIANTS`, `LANDING_PAGE_CTA_VARIANTS`, `LANDING_PAGE_FEATURES_VARIANTS`... (`foundation.ts:65-202`) đã khai báo ~**56 variant id** (Hero 8, CTA 7, LeadForm 8, Pricing 4, Testimonials 8, Features/Benefits/Product ~7×3=21) — **đã đạt gần đúng mục tiêu 60-100 variant** bạn đề ra, chỉ là chưa được (a) renderer triển khai và (b) data 19/20 category sử dụng. Đây là việc "hoàn thiện", không phải "làm mới từ 0".
- `designFamily` hiện có ~9 giá trị (`luxury, minimal, corporate, bold, organic, conversion, portfolio, local, editorial`) — gần khớp mục tiêu "8-10 design direction", chỉ cần gắn thêm token thật (spacing/typography/shadow/density) thay vì chỉ là 1 label.
- DB tự đồng bộ từ `packages/shared` qua `ensureSystemTemplates()` gate bằng hằng `LANDING_PAGE_TEMPLATE_CATALOG_VERSION` (chạy ở `onModuleInit` + mỗi lần gọi `listTemplates`) → sửa code trong shared rồi bump version là DB tự cập nhật, **không cần migration DB thủ công**, và template riêng của từng org (`organizationId != null`) không bị đụng.

---

## B. File/module cần refactor (chính xác)

| File | Vai trò hiện tại | Cần làm gì |
|---|---|---|
| `packages/shared/src/landing-page-types.ts` | Định nghĩa `LandingPageSpec`, `LandingPageBlock`, `LandingPageThemeTokens`, 5 theme preset | **Chỉ thêm field mới (optional)**, không đổi field cũ — mở rộng `LandingPageThemeTokens` thật sự dùng spacing/typography/shadow (hiện có slot nhưng rỗng) |
| `packages/shared/src/landing-page-template-foundation.ts` | Taxonomy designFamily/conversionGoal, khai báo variant-id enum, `LandingPageArchitectureRecipe` type | Mở rộng thành nơi chứa **Design Token System** + **Block Variant Registry** thật (không chỉ enum string) |
| `packages/shared/src/landing-page-category-architectures.ts` | 200 kiến trúc hand-authored, `buildBlocksFromArchitecture`, `analyzeArchitectureUniqueness` | Tách phần **archetype tái sử dụng được** (section skeleton) ra khỏi phần **category-specific** (copy, theme); mở rộng `blockVariants` cho cả 20 category, không chỉ spa |
| `packages/shared/src/landing-page-spa-directions.ts` | Copy overlay hardcode riêng cho spa | **Tổng quát hoá** thành cơ chế copy-bank theo archetype, dùng chung cho mọi category (không hardcode `if (category==='spa')`) |
| `packages/shared/src/landing-page-template-flows.ts` | Chứa cả helper `ensureX` (đang sống) + `buildBlocksForFlow`/10-flow switch (dead code, 0 caller) | Giữ nguyên phần `ensureX`; **đánh dấu/dọn phần dead code** ở giai đoạn sau (rủi ro thấp, không ảnh hưởng runtime hiện tại) |
| `packages/shared/src/landing-page-template-expand.ts` | Orchestrator: seed × architecture → 200 template | Thêm bước gọi Design Token + Archetype registry mới; giữ nguyên chữ ký `expandLandingPageTemplateCatalog` |
| `packages/shared/src/landing-page-template-select.ts` | AI chọn template theo keyword, không có ý niệm similarity | Không bắt buộc sửa ở Phase 1; có thể bổ sung tham chiếu `archetypeId` sau |
| `packages/shared/src/landing-page-template-validators.ts` | Có sẵn `FINGERPRINT_COLLISION` + `STRUCTURE_SIMILARITY` (35%) nhưng không chạy CI | **Nâng cấp thành Similarity Validator đầy đủ** (mục G) + nối vào CI |
| `scripts/validate-landing-page-template-catalog.cjs` | Script validator chạy tay, không ai gọi | Nối vào `.github/workflows/landing-page-saas.yml` |
| `apps/web/src/components/landing-pages/landing-page-renderer.tsx` | Renderer chính — nơi giới hạn diversity thật sự | **Trọng tâm refactor**: implement thật cho Pricing (hiện=0), bổ sung 6 nhánh Testimonials còn thiếu, sửa 2 CTA variant chết, thêm layout tách-đôi thật cho LeadForm `split` |
| `apps/web/src/components/landing-pages/landing-page-variant-render.ts` | `resolveHeroComposition`, `LP_VARIANT_CSS` (CSS-only differentiation) | Mở rộng cho các block type còn thiếu nhánh JSX thật |
| `apps/api/src/landing-pages/landing-pages.service.ts` (`ensureSystemTemplates`, `listTemplates`) | Đồng bộ shared→DB, trả API | **Không đổi shape response** — chỉ đổi nội dung `definition` JSON bên trong |
| `packages/database/prisma/schema.prisma` (`LandingPageTemplate`) | Model DB, cột `definition: Json` | **Không cần đổi schema** — mọi field mới nằm trong JSON `definition`/`spec.meta` |

---

## C. Đề xuất schema TypeScript mới (additive, giữ tương thích)

Nguyên tắc: **không sửa** `LandingPageSpec`, `LandingPageBlock`, `LandingPageTemplateDefinition` hiện có — chỉ **thêm field optional** và **thêm type mới song song**. Mọi consumer cũ (renderer cũ, AI select, API response) tiếp tục chạy được không cần sửa.

```ts
// packages/shared/src/landing-page-template-foundation.ts (mở rộng)

/** Vị trí cụ thể của 1 section trong flow — thay cho việc chỉ có "type" rời rạc.
 *  Giải quyết luôn 1 lỗi tiềm ẩn: blockVariants (Partial<Record<Type,string>>) cũ
 *  KHÔNG thể lưu 2 variant khác nhau khi cùng 1 type xuất hiện 2 lần trong 1 flow
 *  (vd. spa-offer-conversion có 2 block CTA) — vì nó khoá theo type, không theo vị trí. */
export type ArchitectureSectionPlan = Array<{
  type: LandingPageBlockType;
  variant: string;                 // bắt buộc — 'default' là 1 giá trị hợp lệ, không phải "bỏ trống"
  purpose: ArchitectureSectionPurpose; // 'capture-attention' | 'build-trust' | 'show-proof' | 'handle-objection' | 'convert' | 'navigate' | 'inform'
  emphasis?: 'primary' | 'secondary';
}>;

/** Kiến trúc v2 — additive, các field cũ (sectionSequence/blockVariants/heroVariant)
 *  được GIỮ NGUYÊN và tự suy ra (derive) từ `sections` để không phá code đọc field cũ. */
export type LandingPageArchitectureRecipeV2 = LandingPageArchitectureRecipe & {
  recipeVersion: 2;
  archetypeId: string;             // NEW — tham chiếu 1 trong 25-35 archetype tái sử dụng
  designDirectionId: string;       // NEW — 1 trong 8-10 design direction (thay cho designFamily đơn thuần)
  sections: ArchitectureSectionPlan; // NEW — nguồn sự thật duy nhất; sectionSequence/blockVariants derive từ đây
};

/** Design tokens thật — mở rộng LandingPageThemeTokens hiện có (không sửa field cũ). */
export type LandingPageDesignTokensV2 = {
  directionId: string;
  palette: LandingPageThemeTokens;  // TÁI SỬ DỤNG type màu/font hiện có, không đổi
  typography: {
    headingFontFamily: string;
    bodyFontFamily: string;
    scaleRatio: number;             // vd 1.25 (minor third) .. 1.5 (perfect fourth)
    weightHeading: number;
    weightBody: number;
    lineHeightHeading: number;
    lineHeightBody: number;
  };
  spacing: {
    unitPx: number;                 // base unit, vd 4 hoặc 8
    sectionPaddingScale: number;    // nhân với unit cho khoảng cách giữa section
    density: 'compact' | 'comfortable' | 'spacious';
  };
  radius: { sm: string; md: string; lg: string; pill: string };
  shadow: { none: string; sm: string; md: string; lg: string };
  imagery: {
    treatment: 'editorial' | 'product-flat' | 'illustration' | 'photo-real';
    cornerStyle: 'sharp' | 'rounded' | 'organic';
  };
};
```

`spec.meta.architectureRecipe` chấp nhận **cả 2 dạng** (v1 cũ hoặc v2 mới) — renderer/AI-select cũ chỉ đọc field chung (`sectionSequence`, `heroVariant`...) nên không cần sửa để không bị vỡ; renderer MỚI kiểm tra `recipeVersion === 2` để dùng `sections`/`designDirectionId` cho độ chính xác cao hơn.

---

## D. Đề xuất Block Variant Registry

```ts
// packages/shared/src/landing-page-block-variant-registry.ts (file mới)

export type BlockVariantDefinition = {
  id: string;                       // vd 'pricing-comparison-table'
  blockType: LandingPageBlockType;
  label: string;
  structuralDescription: string;    // mô tả CHÍNH XÁC cái gì khác về DOM/layout — bắt buộc điền
  hasRendererImplementation: boolean; // "hợp đồng chống fake-diversity": true chỉ khi đã có nhánh JSX riêng trong renderer, verify bằng test D-2 (mục G)
  compatibleDesignDirections?: string[];
  itemCountRange?: { min: number; max: number };
};

export const BLOCK_VARIANT_REGISTRY: Record<LandingPageBlockType, BlockVariantDefinition[]> = {
  Hero: [ /* 8+ entries — đã có phần lớn qua LANDING_PAGE_HERO_VARIANTS, chỉ cần format lại + set hasRendererImplementation */ ],
  Pricing: [
    { id: 'pricing-cards', ..., hasRendererImplementation: true /* hiện có, chính là layout mặc định */ },
    { id: 'pricing-comparison-table', ..., hasRendererImplementation: false /* TODO renderer */ },
    { id: 'pricing-single-highlight', ..., hasRendererImplementation: false },
    { id: 'pricing-toggle-monthly-yearly', ..., hasRendererImplementation: false },
  ],
  Testimonials: [ /* 8 khai báo hiện có → nâng hasRendererImplementation từ 2/8 lên 8/8 */ ],
  CTA: [ /* 7 khai báo, sửa 2 cái "chết" (split, floating-card) */ ],
  LeadForm: [ /* 8 khai báo, thêm layout split thật */ ],
  Features: [...], Benefits: [...], Product: [...], Gallery: [...], Process: [...], // 60-100 tổng
  ...
};

/** Gate CI: build phải fail nếu 1 variant được category-architecture nào đó tham chiếu
 *  mà hasRendererImplementation === false — chặn "khai báo variant nhưng không vẽ khác". */
export function assertNoOrphanVariants(usedVariantIds: Set<string>): TemplateCatalogIssue[];
```

---

## E. Đề xuất Architecture Registry (tách Archetype khỏi Category)

Nguyên tắc cốt lõi theo đúng yêu cầu "Không hardcode riêng SPA nếu kiến trúc có thể tái sử dụng": tách **Archetype** (khung cấu trúc industry-agnostic, tái dùng CHÉO category) ra khỏi **Category Architecture** (1 archetype cụ thể hoá cho 1 category bằng copy + theme + design-direction phù hợp).

```ts
// packages/shared/src/landing-page-archetype-registry.ts (file mới)

export type LandingPageArchetype = {
  archetypeId: string;              // vd 'proof-first-long-form', 'pricing-forward', 'gallery-led-portfolio',
                                     //     'booking-first-minimal', 'story-driven-process', 'objection-handling-faq-heavy'...
  label: string;
  description: string;              // mục đích chiến lược, vd "Dẫn dắt bằng bằng chứng xã hội trước khi bán"
  sectionSkeleton: ArchitectureSectionPlan; // industry-agnostic — dùng placeholder purpose, KHÔNG copy cứng
  suitableConversionGoals: LandingPageConversionGoal[];
};

// 25-35 archetype — TÁI SỬ DỤNG CHÉO 20 category, không phải 1 archetype/category
export const LANDING_PAGE_ARCHETYPES: LandingPageArchetype[] = [ ... ];

/** 1 category-architecture = archetype + designDirection + conversionGoal + copy-bank category đó.
 *  200 template = 20 category × 10 (archetype, direction) pairing — pairing được CHỌN có chủ đích
 *  để đảm bảo similarity trong-category < 75% (validator ở mục G chặn tự động). */
export function instantiateArchitecture(
  archetypeId: string,
  category: LandingPageCategory,
  designDirectionId: string,
): LandingPageArchitectureRecipeV2;
```

Vì 25-35 archetype × 8-10 design-direction >> 10 slot/category, hệ thống có dư địa chọn **combo khác nhau cho từng category** thay vì mỗi category tự nghĩ ra 10 kiến trúc từ đầu (như hiện tại) — vừa đảm bảo tái sử dụng, vừa dễ audit trùng lặp bằng validator.

---

## F. Đề xuất Design Token System

Xem type `LandingPageDesignTokensV2` ở mục C. Đề xuất cụ thể **8-10 Design Direction** (tái dùng gần nguyên `designFamily` hiện có, chỉ gắn thêm token thật):

| directionId | Kế thừa designFamily hiện có | Đặc điểm phân biệt (spacing/typography/radius/shadow) |
|---|---|---|
| `luxury-editorial` | luxury | Spacing spacious, serif heading, radius nhỏ (sắc), shadow tinh tế |
| `minimal-swiss` | minimal | Spacing comfortable, sans grotesk, radius nhỏ, shadow none |
| `bold-startup` | bold | Spacing compact, sans dày (weight cao), radius lớn (pill), shadow rõ |
| `organic-wellness` | organic | Spacing spacious, serif/rounded font, radius bo tròn (organic), shadow mềm |
| `corporate-trust` | corporate | Spacing comfortable, sans trung tính, radius nhỏ, shadow nhẹ |
| `local-warm` | local | Spacing comfortable, font thân thiện, radius vừa, shadow nhẹ |
| `portfolio-showcase` | portfolio | Spacing spacious (ảnh chiếm ưu thế), radius nhỏ, shadow mạnh cho ảnh nổi khối |
| `conversion-direct` | conversion | Spacing compact (ít khoảng trắng, CTA dày đặc), radius vừa, shadow rõ cho nút CTA |
| `technical-saas` (mới) | — | Spacing comfortable, monospace/sans kỹ thuật, radius nhỏ, shadow layer nhiều lớp |
| `playful-product` (mới) | — | Spacing compact, font tròn/đậm, radius lớn, shadow màu (không chỉ đen) |

→ Đủ 10 direction, 8/10 kế thừa trực tiếp taxonomy đã có sẵn (`inferDesignFamily`), chỉ 2 direction mới cần thêm.

---

## G. Đề xuất Template Similarity Validator

Mở rộng (không thay thế) `validateLandingPageTemplateCatalog` hiện có.

```ts
// packages/shared/src/landing-page-template-validators.ts (mở rộng)

export type TemplateFingerprint = {
  architectureId: string;
  archetypeId: string;
  heroVariant: string;
  sectionSequence: string;   // "Hero>Benefits>Pricing>CTA>Footer"
  sectionVariants: string;   // "Hero:split-left|Benefits:icon-grid|Pricing:cards|..." (theo vị trí, không theo type)
  typography: string;        // `${headingFontFamily}|${scaleRatio}|${weightHeading}`
  spacing: string;           // `${density}|${unitPx}|${sectionPaddingScale}`
  cardStyle: string;         // radius+shadow signature
  imagery: string;           // treatment+cornerStyle
  ctaPattern: string;        // ctaStrategy+formPlacement
  conversionFlow: string;    // conversionGoal+ctaStrategy+formPlacement nối lại (chuỗi hành trình)
};

export function computeTemplateFingerprint(def: LandingPageTemplateDefinition): TemplateFingerprint;

/** Similarity = trung bình có trọng số trên 10 field trên. Field cấu trúc (sectionSequence,
 *  sectionVariants, heroVariant, architectureId) trọng số cao hơn field thẩm mỹ (typography,
 *  spacing, imagery) — 2 template có thể cùng design-direction (hợp lý, tái sử dụng token) mà
 *  vẫn KHÔNG bị tính similarity cao nếu structure thật sự khác. */
export function similarityScore(a: TemplateFingerprint, b: TemplateFingerprint): number; // 0..1

export type SimilarityIssue = TemplateCatalogIssue & {
  templateA: string; templateB: string; score: number;
  sameCategoryStrict?: boolean; // true khi 2 template cùng category (áp rule nghiêm hơn)
};

/**
 * Rule áp dụng đúng theo yêu cầu:
 *  - similarity >= 0.85            → FAIL (mọi cặp, không phân biệt category)
 *  - 0.75 <= similarity < 0.85     → WARN (mọi cặp)
 *  - 2 template CÙNG category có similarity > 0.75 → FAIL (nghiêm hơn WARN thông thường,
 *    vì đây chính là điều khách hàng nhìn thấy khi lướt catalog trong 1 category)
 */
export function validateTemplateSimilarity(
  templates: LandingPageTemplateDefinition[],
): { errors: SimilarityIssue[]; warnings: SimilarityIssue[] };
```

Trọng số đề xuất (tổng = 1.0): `sectionVariants 0.25`, `sectionSequence 0.20`, `heroVariant 0.15`, `architectureId/archetypeId 0.10`, `conversionFlow 0.10`, `ctaPattern 0.08`, `cardStyle 0.05`, `typography 0.03`, `spacing 0.02`, `imagery 0.02` — ưu tiên tuyệt đối cho cấu trúc/flow, đúng nguyên tắc "không tạo diversity giả bằng đổi màu/copy/ảnh" mà chính validator cũng phải tuân theo (nếu 2 template chỉ khác `typography`/`spacing`/`imagery`, tổng trọng số 3 field đó chỉ 7% — không đủ để "cứu" 1 cặp giống hệt cấu trúc).

**Kế hoạch chạy**: thêm bước vào `.github/workflows/landing-page-saas.yml` gọi `scripts/validate-landing-page-template-catalog.cjs` (hiện chưa được gọi) ở chế độ **report-only** trước, sau khi migrate xong mới chuyển **blocking**.

---

## H. Kế hoạch migration — không phá 200 template hiện tại

Dựa trên sự thật đã audit: `packages/shared` là nguồn sống, DB tự sync qua `ensureSystemTemplates()` + `LANDING_PAGE_TEMPLATE_CATALOG_VERSION`. Vì vậy migration có thể **hoàn toàn additive, triển khai từng phần, rollback dễ**:

1. **Giai đoạn 0 (an toàn tuyệt đối)** — thêm type mới, registry mới, token mới vào `packages/shared` dưới dạng module/field ĐỘC LẬP, không ai import → build xanh, 0 rủi ro runtime, 200 template hiện tại không đổi 1 byte.
2. **Giai đoạn 1 (renderer, vẫn an toàn)** — bổ sung nhánh JSX mới cho Pricing/Testimonials/CTA/LeadForm trong `landing-page-renderer.tsx`, luôn có `default` case giữ nguyên hành vi hiện tại cho `variant` chưa được set/không nhận diện → 200 template cũ (không có `blockVariants` mới) render **y hệt như trước**.
3. **Giai đoạn 2 (validator report-only)** — nối `validate-landing-page-template-catalog.cjs` vào CI ở chế độ chỉ log, chưa fail build → lấy baseline: dự đoán ~19/20 category sẽ có nhiều cặp WARN/FAIL similarity (đúng như audit chỉ ra) — đây là backlog cần xử lý, không phải lỗi mới phát sinh.
4. **Giai đoạn 3 (pilot 2-3 category)** — chọn 2-3 category đại diện (vd. `saas`, `real_estate`, `restaurant`) để tự viết `Archetype × DesignDirection × copy-bank` mới theo hệ thống mới, bump `LANDING_PAGE_TEMPLATE_CATALOG_VERSION` (vd `gallery-v8-...`) → DB tự đồng bộ khi API restart, validator phải xanh cho 3 category này trước khi tiếp tục.
5. **Giai đoạn 4 (rollout dần)** — lặp lại cho 17 category còn lại, MỖI LẦN 1 batch nhỏ (2-4 category), review + chạy validator sau mỗi batch — không big-bang cả 200 cùng lúc.
6. **Giai đoạn 5** — sau khi 20/20 category qua validator, chuyển CI validator sang **blocking**.
7. Trong suốt quá trình: `spec.meta.architectureRecipe` field cũ (`sectionSequence`, `blockVariants`, `heroVariant`...) **luôn được derive/giữ song song** từ `sections` mới → mọi consumer cũ (AI select, doctor, v.v.) không cần sửa.
8. API `GET /templates` **không đổi shape response** (`id, slug, name, category, theme, description, tags, thumbnailUrl, previewLongImage, badges, designFamily, conversionGoal, architectureId, isSystem`) — field mới (`archetypeId`, `designDirectionId`) nằm trong `definition` JSON, không lộ ra response list trừ khi chủ động thêm (có thể thêm sau, không bắt buộc Phase 1).
9. Prisma schema **không đổi** — `definition: Json` đã đủ chỗ chứa mọi field mới.

---

## I. Danh sách các bước triển khai theo thứ tự ưu tiên

1. Xác nhận phạm vi dead-code (`buildBlocksForFlow`) — đã xong ở Phase 1 này, ghi nhận để dọn sau, không block gì.
2. Xây **Design Token System** (mục F) — nền tảng, mọi thứ khác phụ thuộc vào đây.
3. Xây **Block Variant Registry** (mục D) — ưu tiên tuyệt đối cho **Pricing** (hiện = 0% implementation, tác động cao nhất vì mọi template đều có Pricing).
4. Implement renderer thật cho Pricing (comparison-table, single-highlight, toggle-monthly-yearly) — impact cao nhất/effort vừa phải vì đang từ con số 0.
5. Bổ sung 6 nhánh Testimonials còn thiếu + sửa 2 CTA variant "chết" + layout split thật cho LeadForm.
6. Xây **Archetype Registry** (mục E) — 25-35 archetype tái sử dụng chéo category.
7. Xây `ArchitectureRecipeV2`/`sections` schema (mục C) + hàm `instantiateArchitecture`.
8. Tổng quát hoá cơ chế copy-bank (thay `applySpaDirectionCopy` hardcode) thành cơ chế dùng chung mọi category.
9. Xây **Similarity Validator** đầy đủ (mục G), chạy report-only trong CI.
10. Pilot 2-3 category qua hệ thống mới, đo bằng validator.
11. Rollout dần 17 category còn lại theo batch nhỏ.
12. Chuyển validator sang blocking trong CI.
13. *(Ngoài phạm vi Phase 1 — chỉ làm sau khi tất cả trên hoàn tất)*: generate screenshot hàng loạt, mở rộng archetype cho ngành nghề mới ngoài 20 category hiện tại.

---

## Phạm vi đã tuân thủ

Không sửa code (chỉ đọc + phân tích). Không đổi `LandingPageSpec`/`LandingPageBlock`. Không đổi Prisma schema. Không đổi shape API `GET /templates`. Không đề xuất duplicate component để tạo diversity giả — ngược lại, validator ở mục G được thiết kế trọng số nặng về cấu trúc chính xác để CHẶN kiểu diversity giả đó. Chưa implement hàng loạt template, chưa generate screenshot.

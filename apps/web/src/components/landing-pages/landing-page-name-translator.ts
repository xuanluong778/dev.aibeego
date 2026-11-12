/**
 * Translates landing page names to natural Vietnamese for UI presentation only.
 * Does not overwrite or mutate database values, IDs, slugs, or URLs.
 */

export const LP_DISPLAY_TRANSLATION_MAP: Record<string, string> = {
  // Common page names & system templates
  'marketing pro': 'Tiếp thị chuyên nghiệp',
  'marketing': 'Tiếp thị số',
  'agency portfolio': 'Hồ sơ năng lực Agency',
  'split hero': 'Hero chia đôi',
  'cream editorial sales': 'Bán hàng Editorial tông kem',
  'dark direct-response': 'Phản hồi trực tiếp nền tối',
  'gallery': 'Bộ sưu tập dự án',
  'faq heavy': 'Hỏi đáp chuyên sâu',
  'trust first': 'Tối ưu độ tin cậy',
  'lead capture': 'Thu thập khách hàng tiềm năng',
  'webinar registration': 'Đăng ký Hội thảo trực tuyến',
  'webinar': 'Hội thảo trực tuyến Webinar',
  'product launch': 'Ra mắt sản phẩm mới',
  'spa & wellness': 'Spa & Chăm sóc sức khỏe',
  'spa': 'Spa & Thẩm mỹ',
  'skincare': 'Chăm sóc da & Mỹ phẩm',
  'fashion drop': 'Bộ sưu tập thời trang',
  'real estate': 'Dự án Bất động sản',
  'seo services': 'Dịch vụ SEO tổng thể',
  'web design': 'Thiết kế Website',
  'local service': 'Dịch vụ địa phương',
  'online course': 'Khóa học trực tuyến',
  'coaching 1:1': 'Huấn luyện cá nhân 1:1',
  'coaching': 'Huấn luyện cá nhân',
  'b2b consulting': 'Tư vấn doanh nghiệp B2B',
  'b2b consult': 'Tư vấn doanh nghiệp B2B',
  'cosmetics': 'Mỹ phẩm & Làm đẹp',
  'fitness': 'Thể hình & Gym',
  'education': 'Giáo dục & Đào tạo',
  'sales page': 'Trang bán hàng chuyển đổi',
  'event': 'Sự kiện & Hội thảo',
  'untitled': 'Trang chưa đặt tên',
  'untitled page': 'Trang chưa đặt tên',
};

/**
 * Format landing page display name to natural Vietnamese:
 * - Translates known template names/phrases (e.g. "Marketing pro" -> "Tiếp thị chuyên nghiệp")
 * - Translates compound names (e.g. "Agency Portfolio · Split Hero" -> "Hồ sơ năng lực Agency · Hero chia đôi")
 * - Translates copy suffix "(copy)" -> "(bản sao)", "(copy 2)" -> "(bản sao 2)"
 * - Preserves custom brand names (e.g. "Trần Gia Bảo's Spa", "LPQA webthemestore")
 * - Replaces "Landing-page-" generated prefixes with "Trang-đích-"
 */
export function formatLandingPageDisplayName(rawName?: string | null): string {
  if (!rawName || !rawName.trim()) return 'Trang chưa đặt tên';
  let name = rawName.trim();

  // 1. Extract and convert copy suffix: (copy), (copy 2), (copy-3), (bản sao)...
  const copyMatch = name.match(/\s*\(\s*(?:copy|bản sao)(\s*[-_]?\s*(\d+))?\s*\)/i);
  let copySuffix = '';
  if (copyMatch) {
    const num = copyMatch[2];
    copySuffix = num ? ` (bản sao ${num})` : ' (bản sao)';
    name = name.replace(/\s*\(\s*(?:copy|bản sao)(\s*[-_]?\s*(\d+))?\s*\)/i, '').trim();
  }

  // 2. Direct whole-string match (case-insensitive)
  const lower = name.toLowerCase();
  if (LP_DISPLAY_TRANSLATION_MAP[lower]) {
    return LP_DISPLAY_TRANSLATION_MAP[lower] + copySuffix;
  }

  // 3. Multi-segment template names separated by '·' (e.g. "Agency Portfolio · Split Hero")
  if (name.includes('·')) {
    const parts = name.split('·').map((p) => p.trim());
    const translatedParts = parts.map((part) => {
      const lowerPart = part.toLowerCase();
      if (LP_DISPLAY_TRANSLATION_MAP[lowerPart]) {
        return LP_DISPLAY_TRANSLATION_MAP[lowerPart];
      }
      return part;
    });
    return translatedParts.join(' · ') + copySuffix;
  }

  // 4. Auto-generated prefixes
  if (/^landing-page-/i.test(name)) {
    name = name.replace(/^landing-page-/i, 'Trang-đích-');
  } else if (/^landing page\b/i.test(name)) {
    name = name.replace(/^landing page\b/i, 'Trang đích');
  }

  return name + copySuffix;
}


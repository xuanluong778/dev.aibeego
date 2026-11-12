/** Scope the existing injected foundations; library sections reuse them in a local boundary.
 * The zero-specificity exclusion applies to the selector subject, preserving ancestor
 * selectors from the builder/body and the specificity/order of legacy styles.
 */
const cache = new Map<string, string>();
export function scopeLegacyLandingPageCss(css: string): string {
  const cached = cache.get(css);
  if (cached) return cached;
  const guard =
    ':not(:where([data-lp-section-library-scope], [data-lp-section-library-scope] *)):not(:where([data-lp-style-scope="agency-portfolio-v2"], [data-lp-style-scope="agency-portfolio-v2"] *)):not(:where([data-lp-style-scope="restaurant-menu-v2"], [data-lp-style-scope="restaurant-menu-v2"] *)):not(:where([data-lp-style-scope="local-service-v2"], [data-lp-style-scope="local-service-v2"] *)):not(:where([data-lp-style-scope="website-brief-v2"], [data-lp-style-scope="website-brief-v2"] *)):not(:where([data-lp-style-scope="blank-starter-v1"], [data-lp-style-scope="blank-starter-v1"] *))';
  function selector(value: string): string {
    const s = value.trim();
    let depth = 0,
      quote = '',
      comment = false;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i]!;
      if (comment) {
        if (ch === '*' && s[i + 1] === '/') {
          comment = false;
          i++;
        }
        continue;
      }
      if (quote) {
        if (ch === '\\') i++;
        else if (ch === quote) quote = '';
        continue;
      }
      if (ch === '/' && s[i + 1] === '*') {
        comment = true;
        i++;
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        continue;
      }
      if (ch === '(' || ch === '[') depth++;
      else if (ch === ')' || ch === ']') depth--;
      else if (
        depth === 0 &&
        ch === ':' &&
        (s[i + 1] === ':' || /^:(before|after|first-line|first-letter)\b/.test(s.slice(i)))
      )
        return s.slice(0, i) + guard + s.slice(i);
    }
    return s + guard;
  }
  function selectors(text: string): string {
    let result = '',
      start = 0,
      depth = 0,
      quote = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]!;
      if (quote) {
        if (ch === '\\') i++;
        else if (ch === quote) quote = '';
        continue;
      }
      if (ch === '"' || ch === "'") quote = ch;
      else if (ch === '(' || ch === '[') depth++;
      else if (ch === ')' || ch === ']') depth--;
      else if (ch === ',' && depth === 0) {
        result += selector(text.slice(start, i)) + ',';
        start = i + 1;
      }
    }
    return result + selector(text.slice(start));
  }
  function sheet(text: string): string {
    let out = '',
      start = 0,
      quote = '',
      comment = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]!;
      if (comment) {
        if (ch === '*' && text[i + 1] === '/') {
          comment = false;
          i++;
        }
        continue;
      }
      if (quote) {
        if (ch === '\\') i++;
        else if (ch === quote) quote = '';
        continue;
      }
      if (ch === '/' && text[i + 1] === '*') {
        comment = true;
        i++;
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        continue;
      }
      if (ch === ';') {
        out += text.slice(start, i + 1);
        start = i + 1;
        continue;
      }
      if (ch !== '{') continue;
      const head = text.slice(start, i);
      let depth = 1,
        j = i + 1,
        q = '',
        c = false;
      for (; j < text.length && depth; j++) {
        const v = text[j]!;
        if (c) {
          if (v === '*' && text[j + 1] === '/') {
            c = false;
            j++;
          }
          continue;
        }
        if (q) {
          if (v === '\\') j++;
          else if (v === q) q = '';
          continue;
        }
        if (v === '/' && text[j + 1] === '*') {
          c = true;
          j++;
          continue;
        }
        if (v === '"' || v === "'") q = v;
        else if (v === '{') depth++;
        else if (v === '}') depth--;
      }
      const content = text.slice(i + 1, j - 1);
      const clean = head.replace(/\/\*[\s\S]*?\*\//g, '').trim();
      if (/^@(media|supports|container|layer)\b/i.test(clean))
        out += head + '{' + sheet(content) + '}';
      else if (clean.startsWith('@')) out += head + '{' + content + '}';
      else out += selectors(head) + '{' + content + '}';
      i = j - 1;
      start = j;
    }
    return out + text.slice(start);
  }
  // Library sections have an independent legacy renderer, even inside industry/blank pages.
  // Scope proximity and the upper boundary prevent the surrounding page DNA leaking in.
  const scoped = sheet(css) + '\n@scope ([data-lp-section-library-scope]) to ([data-lp-library-v2]) {\n' + css.replaceAll('[data-lp-canvas-root]', '[data-lp-library-canvas]') + '\n}';
  cache.set(css, scoped);
  return scoped;
}

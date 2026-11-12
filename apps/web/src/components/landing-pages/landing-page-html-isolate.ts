/** Turn an uploaded HTML document into isolated markup. Scripts never run. */

const FONT_HOST = 'https://fonts.googleapis.com/';

export type IsolatedHtmlDocument = {
  css: string;
  bodyHtml: string;
  fontHrefs: string[];
  background: string;
};

function adaptCss(css: string): string {
  const safe = css
    .replace(/<\/style/gi, '')
    .replace(/expression\s*\(/gi, '(')
    .replace(/javascript\s*:/gi, '')
    .replace(/behavior\s*:/gi, 'x:')
    .replace(/-moz-binding\s*:/gi, 'x:')
    .replace(/:root\b/g, ':host')
    .replace(/(^|[{},])\s*(html|body)(?=\s*[,{:.#\s])/g, '$1 :host');
  // Width queries follow the landing column (editor frame, preview, public), not the browser window.
  const once =
    '.fade-up,.process-step,.reveal,[data-aos]{animation-iteration-count:1 !important;animation-fill-mode:both !important;}';
  return (
    safe.replace(/@media\b([^{]*)\{/gi, (full, condition: string) => {
    if (!/(?:min|max)-width\s*:/i.test(condition)) return full;
    return `@container lp ${condition}{`;
  }) + once
  );
}

function readBackground(css: string, html: string): string {
  const root = css.match(/--bg-base\s*:\s*(#[0-9a-fA-F]{3,8})/i)?.[1];
  if (root) return root;
  const body = css.match(/background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8})/i)?.[1];
  if (body) return body;
  const fromHtml = html.match(/<body[^>]*style=["'][^"']*background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8})/i)?.[1];
  return fromHtml || '#0A0A0A';
}

export function isolateHtmlDocument(html: string): IsolatedHtmlDocument {
  const withoutScripts = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script\b[^>]*\/>/gi, '');
  const css = adaptCss(
    [...withoutScripts.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1] || '').join('\n'),
  );
  const fontHrefs = [...withoutScripts.matchAll(/<link\b[^>]*href\s*=\s*(['"])(https:\/\/fonts\.googleapis\.com\/[^'"]+)\1/gi)]
    .map((m) => m[2])
    .filter((href) => href.startsWith(FONT_HOST))
    .slice(0, 4);
  const body = withoutScripts.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || withoutScripts;
  const bodyHtml = body
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object\b[\s\S]*?<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, '');
  return {
    css,
    bodyHtml,
    fontHrefs,
    background: readBackground(css, withoutScripts),
  };
}

/** Put an edited body back into the original document. Head and CSS stay intact. */
export function replaceHtmlBody(originalHtml: string, bodyInnerHtml: string): string {
  const cleaned = bodyInnerHtml
    .replace(/\scontenteditable=(['"]).*?\1/gi, '')
    .replace(/\sdata-lp-html-edit=(['"]).*?\1/gi, '')
    .replace(/\sspellcheck=(['"]).*?\1/gi, '');
  if (/<body\b[^>]*>[\s\S]*<\/body>/i.test(originalHtml)) {
    return originalHtml.replace(/(<body\b[^>]*>)[\s\S]*(<\/body>)/i, `$1${cleaned}$2`);
  }
  return cleaned;
}

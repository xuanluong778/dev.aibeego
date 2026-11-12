/** Resolve bulk containers into logical templates, rather than counting ZIPs and folders twice. */
import { createHash } from 'crypto';
import { buildStoredZip, readZip, TEMPLATE_PACK_FORMAT, TEMPLATE_PACK_FORMAT_VERSION, TEMPLATE_PACK_MAX_ZIP_BYTES, TemplatePackError } from './template-pack';

export type TemplateBulkFile = { originalname?: string; buffer?: Buffer; size?: number; bulkSource?: 'zip' | 'folder' };
const MAX_TEMPLATES = 300;
const ignored = (name: string) => name.split('/').some(p => p === '__MACOSX' || p === '.DS_Store' || p === 'Thumbs.db');
const hasDocument = (entries: Map<string, Buffer>, root = '') => ['template.json', 'index.html', 'source.html'].some(n => entries.has(root + n));
const metadata = (entries: Map<string, Buffer>, root = ''): { slug: string; fingerprint: string } | null => {
  const bytes = entries.get(root + 'manifest.json');
  if (!bytes || bytes.length > 100_000) return null;
  let manifest: Record<string, unknown>;
  try { manifest = JSON.parse(bytes.toString('utf8')); } catch { return null; }
  if (!manifest || manifest.format !== TEMPLATE_PACK_FORMAT || manifest.formatVersion !== TEMPLATE_PACK_FORMAT_VERSION || typeof manifest.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.slug) || manifest.slug.length > 80) return null;
  const hash = createHash('sha256');
  // ZIP headers/timestamps/order do not change a template's contents.
  for (const [name, data] of [...entries].filter(([name]) => name.startsWith(root) && !ignored(name)).sort(([a], [b]) => a.localeCompare(b))) {
    hash.update(name.slice(root.length)); hash.update('\0'); hash.update(data); hash.update('\0');
  }
  return { slug: manifest.slug, fingerprint: hash.digest('hex') };
};
const zipMetadata = (file: TemplateBulkFile) => {
  if (!file.buffer || !file.originalname?.toLowerCase().endsWith('.zip')) return null;
  try { const entries = readZip(file.buffer); return hasDocument(entries) ? metadata(entries) : null; } catch { return null; }
};

export type TemplateBulkPreferences = Readonly<Record<string, string>>;
const sourceAlias = (file: TemplateBulkFile) => (file.originalname || '').replace(/\\/g, '/').split('/').pop()!.replace(/\.zip$/i, '');

/** Explicit operator/user choice only; unconfigured conflicts keep requiring a choice. */
export function parseTemplateBulkPreferences(raw?: string): TemplateBulkPreferences {
  if (!raw) return {};
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new TemplatePackError('Cấu hình chọn bản template không hợp lệ'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TemplatePackError('Cấu hình chọn bản template không hợp lệ');
  const result: Record<string, string> = {};
  for (const [slug, alias] of Object.entries(value)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80 || typeof alias !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(alias) || alias.length > 120) throw new TemplatePackError('Cấu hình chọn bản template không hợp lệ');
    result[slug] = alias;
  }
  return result;
}

/** Prefer extracted/editable source folders over their packaged copies, once per slug. */
export function deduplicateTemplateBulkFiles(files: TemplateBulkFile[], preferences: TemplateBulkPreferences = {}): TemplateBulkFile[] {
  const result: TemplateBulkFile[] = [], seen = new Map<string, { index: number; fingerprint: string; source?: string }>();
  for (const file of files) {
    const info = zipMetadata(file);
    if (!info) { result.push(file); continue; } // Keep malformed packs for the existing per-file error report.
    const previous = seen.get(info.slug);
    if (!previous) {
      seen.set(info.slug, { index: result.length, fingerprint: info.fingerprint, source: file.bulkSource }); result.push(file); continue;
    }
    const old = result[previous.index]!;
    const selected = preferences[info.slug];
    if (selected) {
      const oldSelected = sourceAlias(old) === selected, nextSelected = sourceAlias(file) === selected;
      if (oldSelected && !nextSelected) continue;
      if (nextSelected && !oldSelected) {
        result[previous.index] = file;
        seen.set(info.slug, { index: previous.index, fingerprint: info.fingerprint, source: file.bulkSource });
        continue;
      }
    }
    if (previous.source === 'folder' && file.bulkSource !== 'folder') continue;
    if (file.bulkSource === 'folder' && previous.source !== 'folder') {
      result[previous.index] = file; seen.set(info.slug, { index: previous.index, fingerprint: info.fingerprint, source: 'folder' }); continue;
    }
    if (previous.fingerprint === info.fingerprint) continue;
    throw new TemplatePackError(`Mẫu "${info.slug}" có nhiều bản khác nhau: ${old.originalname} và ${file.originalname}. Chỉ giữ một bản nguồn cho slug này.`);
  }
  return result;
}

const finish = (files: TemplateBulkFile[], preferences: TemplateBulkPreferences) => {
  const unique = deduplicateTemplateBulkFiles(files, preferences);
  if (unique.length > MAX_TEMPLATES) throw new TemplatePackError(`Đã nhận diện ${unique.length} mẫu khác nhau sau khi gộp trùng; tối đa 300 mẫu mỗi lần upload.`);
  return unique;
};

export function expandTemplateBulkFile(file: TemplateBulkFile, preferences: TemplateBulkPreferences = {}): TemplateBulkFile[] {
  if (!file.originalname?.toLowerCase().endsWith('.zip') || !file.buffer?.length) return [file];
  const entries = new Map([...readZip(file.buffer, { bundle: true })].filter(([name]) => !ignored(name)));
  const allRoots = [...entries.keys()].filter(name => /(?:^|\/)manifest\.json$/.test(name)).map(name => name.slice(0, -'manifest.json'.length)).filter(root => entries.has(root + 'template.json') || (hasDocument(entries, root) && metadata(entries, root)));
  const childRoots = allRoots.filter(root => root !== '');
  // A folder owns all its contents; a ZIP kept inside that folder is not another template.
  const roots = childRoots.filter(root => !childRoots.some(parent => parent !== root && root.startsWith(parent)));
  const nested = [...entries].filter(([name]) => name.toLowerCase().endsWith('.zip') && !roots.some(root => name.startsWith(root)));
  if (!nested.length && !roots.length && entries.has('manifest.json') && hasDocument(entries)) return [file];
  const packaged = nested.map(([name, buffer]) => ({ originalname: name, buffer, size: buffer.length, bulkSource: 'zip' as const }));
  const explicitTemplates = roots.length > 0 || packaged.some(p => zipMetadata(p));
  // Collection/gallery/demo HTML is ancillary when explicit manifest-based templates exist.
  // Pure HTML-folder archives still use the existing create-draft semantics.
  if (!explicitTemplates) {
    const htmlRoots = [...entries.keys()].filter(name => /(?:^|\/)(?:index|source)\.html$/i.test(name)).map(name => name.slice(0, name.lastIndexOf('/') + 1));
    for (const root of htmlRoots) {
      if (root === '' && (nested.length || htmlRoots.some(r => r !== ''))) continue;
      if (!roots.some(parent => root.startsWith(parent) || parent.startsWith(root))) roots.push(root);
    }
  }
  if (!packaged.length && !roots.length) {
    if (file.buffer.length > TEMPLATE_PACK_MAX_ZIP_BYTES) throw new TemplatePackError('Không tìm thấy mẫu trong ZIP tổng. Mỗi mẫu cần một gói .zip hoặc thư mục chứa manifest.json và template.json/index.html.');
    return [file];
  }
  if (!packaged.length && roots.length === 1 && roots[0] === '') return [file];
  const expanded: TemplateBulkFile[] = [...packaged];
  for (const root of roots) {
    const files = [...entries].filter(([name]) => name.startsWith(root) && !name.toLowerCase().endsWith('.zip')).map(([name, data]) => ({ name: name.slice(root.length), data }));
    const label = root.replace(/\/$/, '') || file.originalname.replace(/\.zip$/i, '');
    const buffer = buildStoredZip(files);
    expanded.push({ originalname: `${label}.zip`, buffer, size: buffer.length, bulkSource: 'folder' });
  }
  return finish(expanded, preferences);
}

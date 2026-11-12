'use client';
import { useState, type ReactNode } from 'react';
import type { LandingPageBlock, LandingPageSpec } from '@marketingspa/shared';
import {
  InlineEditable,
  ElementChrome,
  ItemReorderChrome,
  type LandingPageCanvasHandlers,
} from './landing-page-canvas-ux';
import { LpIndustryImage } from './landing-page-industry-image';
import { lpImgStyle } from './landing-page-content-image-style';
import { landingPageSectionSurfaceStyle } from './landing-page-section-surface';
import { itemBoxDomProps, itemBoxHideAttrs } from './landing-page-item-box';
import './landing-page-local-service.css';
import { IndustryExtraBlock } from './landing-page-industry-extras';

export function LocalServiceBlock({
  block,
  spec,
  canvas,
  renderForm,
}: {
  block: LandingPageBlock;
  spec: LandingPageSpec;
  canvas: LandingPageCanvasHandlers | null;
  renderForm: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const target = (type: LandingPageBlock['type']) =>
    spec.blocks.find((b) => b.enabled && b.type === type)?.id;
  const text = (
    field: string,
    value: string | undefined,
    as: 'h1' | 'h2' | 'h3' | 'p' | 'span' = 'p',
    className?: string,
  ) => (
    <InlineEditable
      blockId={block.id}
      field={field}
      value={value || ''}
      as={as}
      className={className}
      handlers={canvas}
      blockStyle={block.style as Record<string, unknown>}
      multiline={as !== 'span'}
      textRole={as.startsWith('h') ? 'heading' : 'paragraph'}
    />
  );
  const link = (label: string, href: string, field?: string, cls = 'local-button') => (
    <a
      className={cls}
      href={href}
      onClick={(e) => {
        if (canvas) {
          e.preventDefault();
          return;
        }
        // Let the browser resolve the fragment after layout/menu changes.
        // A scripted smooth scroll can be cancelled by a viewport resize.
        setOpen(false);
      }}
    >
      {field ? text(field, label, 'span') : label}
      <span aria-hidden>→</span>
    </a>
  );
  const section = (cls: string, children: ReactNode) => (
    <section
      id={block.id}
      className={'local-section ' + cls}
      style={landingPageSectionSurfaceStyle(block)}
    >
      <div className="local-container">{children}</div>
    </section>
  );
  const heading = (label: string) => (
    <div className="local-section-head">
      <span className="local-eyebrow">{label}</span>
      {'headline' in block ? text('headline', block.headline, 'h2') : null}
      {'subheadline' in block && block.subheadline ? text('subheadline', block.subheadline) : null}
    </div>
  );
  if (block.type === 'Pricing' || block.type === 'Video')
    return <IndustryExtraBlock block={block} spec={spec} canvas={canvas} prefix="local" />;
  switch (block.type) {
    case 'Header':
      return (
        <header
          id={block.id}
          className="local-header"
          style={landingPageSectionSurfaceStyle(block)}
        >
          <div className="local-container local-header-row">
            <div className="local-brand">
              <span className="local-brand-mark" aria-hidden>
                ⌂
              </span>
              <span>
                {text('headline', block.headline, 'span')}
                <small>{text('subheadline', block.subheadline, 'span')}</small>
              </span>
            </div>
            <button
              type="button"
              className="local-menu-toggle"
              aria-expanded={open}
              aria-controls={'nav-' + block.id}
              aria-label={open ? 'Đóng menu' : 'Mở menu'}
              onClick={() => setOpen((v) => !v)}
            >
              ☰
            </button>
            <nav
              id={'nav-' + block.id}
              className={'local-nav' + (open ? ' open' : '')}
              aria-label="Điều hướng dịch vụ"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setOpen(false);
                  e.currentTarget.parentElement
                    ?.querySelector<HTMLButtonElement>('button')
                    ?.focus();
                }
              }}
            >
              {(['Features', 'Benefits', 'Process', 'FAQ'] as const).map((type, i) =>
                target(type) ? (
                  <span key={type}>
                    {link(
                      (block.body || '').split('|')[i] || type,
                      '#' + target(type),
                      undefined,
                      'local-nav-link',
                    )}
                  </span>
                ) : null,
              )}
            </nav>
            <div className="local-header-action">
              {link(
                block.ctaLabel || 'Liên hệ',
                block.ctaUrl || '#' + target('LeadForm'),
                'ctaLabel',
              )}
            </div>
          </div>
        </header>
      );
    case 'Hero':
      return section(
        'local-hero',
        <>
          <div className="local-hero-copy">
            <span className="local-eyebrow">{text('body', block.body, 'span')}</span>
            {text('headline', block.headline, 'h1')}
            {text('subheadline', block.subheadline)}
            <div className="local-hero-actions">
              {link(
                block.ctaLabel || 'Trao đổi',
                block.ctaUrl || '#' + target('LeadForm'),
                'ctaLabel',
              )}
              {target('Features') ? link('Xem hạng mục', '#' + target('Features'), undefined, 'local-text-link') : null}
            </div>
            <ul className="local-trust">
              {block.trustPoints?.map((point, i) => (
                <li key={i}>
                  <span aria-hidden>✓</span>
                  {text('trustPoint:' + i, point, 'span')}
                </li>
              ))}
            </ul>
          </div>
          {block.variant !== 'minimal-copy' ? (
            <figure className="local-hero-visual">
              <ElementChrome
                blockId={block.id}
                element="image"
                kind="image"
                handlers={canvas}
                blockStyle={block.style as Record<string, unknown>}
              >
                <LpIndustryImage
                  src={block.imageUrl || ''}
                  alt={block.imageStyle?.alt || 'Minh họa dịch vụ'}
                  style={lpImgStyle(block.imageStyle)} imageStyle={block.imageStyle} canvas={Boolean(canvas)}
                  loading="eager"
                  fallbackLabel="Chưa có ảnh minh họa"
                />
              </ElementChrome>
              <figcaption>MINH HỌA HẠNG MỤC · KHÔNG PHẢI ẢNH ĐỘI NGŨ THỰC TẾ</figcaption>
            </figure>
          ) : null}
        </>,
      );
    case 'Gallery':
      return section(
        'local-gallery',
        <>
          {heading('HỒ SƠ HẠNG MỤC MINH HỌA')}
          <div className="local-gallery-grid">
            {block.items.map((item, i) => (
              <ItemReorderChrome
                key={item.id}
                blockId={block.id}
                index={i}
                itemId={item.id}
                handlers={canvas}
              >
                <article className="local-gallery-card">
                  <ElementChrome
                    blockId={block.id}
                    element={`item:${item.id}`}
                    field={`itemImage:${item.id}`}
                    kind="image"
                    handlers={canvas}
                    blockStyle={block.style as Record<string, unknown>}
                  >
                    <LpIndustryImage
                      src={item.imageUrl || ''}
                      alt={item.imageStyle?.alt || item.title}
                      style={lpImgStyle(item.imageStyle)} imageStyle={item.imageStyle} canvas={Boolean(canvas)}
                      loading="eager"
                    />
                  </ElementChrome>
                  {text('itemTitle:' + item.id, item.title, 'h3')}
                  {text('itemDesc:' + item.id, item.description)}
                </article>
              </ItemReorderChrome>
            ))}
          </div>
        </>,
      );
    case 'Features':
    case 'Benefits':
    case 'Process': {
      const offers = block.type === 'Features',
        scope = block.type === 'Benefits';
      return section(
        offers ? 'local-offers' : scope ? 'local-scope' : 'local-process',
        <>
          {heading(
            offers ? 'HẠNG MỤC DỊCH VỤ' : scope ? 'PHẠM VI TRƯỚC KHI BẮT ĐẦU' : 'CÁCH PHỐI HỢP',
          )}
          <div
            className={
              offers ? 'local-offer-grid' : scope ? 'local-scope-list' : 'local-process-list'
            }
          >
            {block.items.map((it, i) => (
              <ItemReorderChrome
                key={it.id}
                blockId={block.id}
                index={i}
                itemId={it.id}
                handlers={canvas}
              >
                <ElementChrome
                  blockId={block.id}
                  element={`item:${it.id}`}
                  kind="box"
                  handlers={canvas}
                  blockStyle={block.style as Record<string, unknown>}
                >
                  <article
                    className={
                      offers ? 'local-offer-card' : scope ? 'local-scope-row' : 'local-process-row'
                    }
                    {...itemBoxDomProps(block, it.id)}
                    {...itemBoxHideAttrs(block, it.id)}
                  >
                    <span className="local-number">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      {text('itemTitle:' + it.id, it.title, 'h3')}
                      {text('itemDesc:' + it.id, it.description)}
                    </div>
                  </article>
                </ElementChrome>
              </ItemReorderChrome>
            ))}
          </div>
        </>,
      );
    }
    case 'FAQ':
      return section(
        'local-faq',
        <>
          {heading('GIẢI ĐÁP TRƯỚC KHI LIÊN HỆ')}
          <div className="local-faq-list">
            {block.items.map((it, i) => (
              <details
                key={it.id}
                open={i === 0 ? true : undefined}
                onClick={(e) => canvas && e.preventDefault()}
              >
                <summary>
                  {text('itemQuestion:' + it.id, it.question, 'span')}
                  <span aria-hidden>+</span>
                </summary>
                {text('itemAnswer:' + it.id, it.answer)}
              </details>
            ))}
          </div>
        </>,
      );
    case 'LeadForm':
      return section(
        'local-request',
        <>
          <aside>
            {heading('BẮT ĐẦU TỪ NHU CẦU CỦA BẠN')}
            <div className="local-request-note">
              <span aria-hidden>ⓘ</span>
              <p>
                Bản mẫu chưa có đơn vị nhận việc, khu vực hoặc lịch trống được xác nhận. Không dùng
                form này cho yêu cầu khẩn cấp.
              </p>
            </div>
          </aside>
          <ElementChrome
            blockId={block.id}
            element="form"
            kind="box"
            handlers={canvas}
            blockStyle={block.style as Record<string, unknown>}
          >
            {renderForm}
          </ElementChrome>
        </>,
      );
    case 'Footer':
      return (
        <footer
          id={block.id}
          className="local-footer"
          style={landingPageSectionSurfaceStyle(block)}
        >
          <div className="local-container">
            <div>
              {text('headline', block.headline, 'h2')}
              {text('subheadline', block.subheadline, 'span')}
              {text('body', block.body)}
            </div>
            {link(
              block.ctaLabel || 'Về đầu trang',
              block.ctaUrl || '#' + target('Header'),
              'ctaLabel',
              'local-text-link',
            )}
          </div>
        </footer>
      );
    default:
      return null;
  }
}

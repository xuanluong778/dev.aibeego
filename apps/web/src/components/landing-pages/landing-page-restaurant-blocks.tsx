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
import { itemBoxDomProps, itemBoxHideAttrs } from './landing-page-item-box';
import { landingPageSectionSurfaceStyle } from './landing-page-section-surface';
import './landing-page-restaurant.css';
import { IndustryExtraBlock } from './landing-page-industry-extras';

/** Restaurant's own presentation; shared selection/history/media/form behavior. */
export function RestaurantMenuBlock({
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
  const link = (label: string, href: string, field?: string, kind = 'dining-button') => (
    <a
      href={href}
      className={kind}
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
      <span aria-hidden>↗</span>
    </a>
  );
  const section = (cls: string, content: ReactNode) => (
    <section
      id={block.id}
      className={'dining-section ' + cls}
      style={landingPageSectionSurfaceStyle(block)}
    >
      <div className="dining-container">{content}</div>
    </section>
  );
  const heading = (eyebrow: string) => (
    <div className="dining-section-head">
      <span className="dining-eyebrow">{eyebrow}</span>
      {'headline' in block ? text('headline', block.headline, 'h2') : null}
      {'subheadline' in block && block.subheadline ? text('subheadline', block.subheadline) : null}
    </div>
  );
  const photo = (
    url: string | null | undefined,
    alt: string,
    field: string,
    style?: import('@marketingspa/shared').LandingPageImageStyle,
  ) => (
    <ElementChrome
      blockId={block.id}
      element={field.startsWith('itemImage:') ? `item:${field.slice(10)}` : 'image'}
      field={field.startsWith('itemImage:') ? field : undefined}
      kind="image"
      handlers={canvas}
      blockStyle={block.style as Record<string, unknown>}
    >
      <LpIndustryImage
        src={url || ''}
        alt={alt}
        fallbackLabel="Ảnh minh họa chưa được cung cấp"
        loading="eager"
        style={lpImgStyle(style)}
        imageStyle={style} canvas={Boolean(canvas)}
      />
    </ElementChrome>
  );
  if (block.type === 'Pricing' || block.type === 'Video')
    return <IndustryExtraBlock block={block} spec={spec} canvas={canvas} prefix="dining" />;
  switch (block.type) {
    case 'Header':
      return (
        <header
          id={block.id}
          className="dining-header"
          style={landingPageSectionSurfaceStyle(block)}
        >
          <div className="dining-container dining-header-row">
            <a
              className="dining-brand"
              href={'#' + block.id}
              onClick={(e) => canvas && e.preventDefault()}
            >
              {text('headline', block.headline, 'span')}
              <small>{text('subheadline', block.subheadline, 'span')}</small>
            </a>
            <button
              type="button"
              className="dining-menu-toggle"
              aria-expanded={open}
              aria-controls={'nav-' + block.id}
              aria-label={open ? 'Đóng menu' : 'Mở menu'}
              onClick={() => setOpen((v) => !v)}
            >
              ☰
            </button>
            <nav
              id={'nav-' + block.id}
              className={open ? 'dining-nav open' : 'dining-nav'}
              aria-label="Điều hướng nhà hàng"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setOpen(false);
                  e.currentTarget.parentElement
                    ?.querySelector<HTMLButtonElement>('button')
                    ?.focus();
                }
              }}
            >
              {(['Product', 'Gallery', 'LeadForm'] as const).map((type, i) =>
                target(type) ? (
                  <span key={type}>
                    {link(
                      (block.body || '').split('|')[i] || type,
                      '#' + target(type),
                      undefined,
                      'dining-nav-link',
                    )}
                  </span>
                ) : null,
              )}
            </nav>
            <span className="dining-header-action">
              {link(
                block.ctaLabel || 'Đặt bàn',
                block.ctaUrl || '#' + target('LeadForm'),
                'ctaLabel',
              )}
            </span>
          </div>
        </header>
      );
    case 'Hero':
      return section(
        'dining-hero',
        <>
          <div className="dining-hero-copy">
            <span className="dining-eyebrow">{text('body', block.body, 'span')}</span>
            {text('headline', block.headline, 'h1')}
            {text('subheadline', block.subheadline)}
            <div className="dining-hero-actions">
              {link(
                block.ctaLabel || 'Đặt bàn',
                block.ctaUrl || '#' + target('LeadForm'),
                'ctaLabel',
              )}
              {target('Product')
                ? link('Khám phá thực đơn', '#' + target('Product'), undefined, 'dining-text-link')
                : null}
            </div>
            <ul className="dining-notes">
              {block.trustPoints?.map((t, i) => (
                <li key={i}>{text('trustPoint:' + i, t, 'span')}</li>
              ))}
            </ul>
          </div>
          {block.variant !== 'minimal-copy' ? (
            <figure className="dining-hero-photo">
              {photo(
                block.imageUrl,
                block.imageStyle?.alt || 'Ảnh minh họa',
                'image',
                block.imageStyle,
              )}
              <figcaption>ẢNH MINH HỌA · THAY BẰNG KHÔNG GIAN THỰC TẾ</figcaption>
            </figure>
          ) : null}
        </>,
      );
    case 'Features':
    case 'Benefits':
    case 'Product':
    case 'Gallery':
    case 'Process': {
      const gallery = block.type === 'Gallery',
        process = block.type === 'Process';
      return section(
        gallery ? 'dining-space' : process ? 'dining-process' : 'dining-menu',
        <>
          {heading(
            gallery
              ? 'KHÔNG GIAN & CẢM HỨNG'
              : process
                ? 'TỪ KẾ HOẠCH ĐẾN CUỘC HẸN'
                : block.type === 'Features'
                  ? 'TỪ BẾP ĐẾN BÀN ĂN'
                : block.type === 'Benefits'
                  ? 'CHUẨN BỊ CHO CUỘC HẸN'
                : 'THỰC ĐƠN GỢI Ý',
          )}
          <div
            className={
              gallery ? 'dining-space-grid' : process ? 'dining-step-grid' : 'dining-menu-list'
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
                      gallery ? 'dining-space-card' : process ? 'dining-step' : 'dining-menu-item'
                    }
                    {...itemBoxDomProps(block, it.id)}
                    {...itemBoxHideAttrs(block, it.id)}
                  >
                    {gallery ? (
                      <div className="dining-space-photo">
                        {photo(
                          it.imageUrl,
                          it.imageStyle?.alt || it.title,
                          'itemImage:' + it.id,
                          it.imageStyle,
                        )}
                      </div>
                    ) : (
                      <span className="dining-number">{String(i + 1).padStart(2, '0')}</span>
                    )}
                    <div>
                      {text('itemTitle:' + it.id, it.title, 'h3')}
                      {text('itemDesc:' + it.id, it.description)}
                    </div>
                    {!gallery && !process ? (
                      <span className="dining-menu-mark" aria-hidden>
                        ✳
                      </span>
                    ) : null}
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
        'dining-faq',
        <>
          {heading('NHỮNG ĐIỀU CẦN BIẾT')}
          <div className="dining-faq-list">
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
        'dining-booking',
        <>
          <div className="dining-booking-copy">
            {heading('LÊN KẾ HOẠCH CHO BỮA ĂN')}
            <p className="dining-contact-note">
              Bản mẫu chưa có địa chỉ, giờ phục vụ hoặc đầu mối nhận đặt bàn thật. Cần cập nhật các
              thông tin này trước khi xuất bản.
            </p>
          </div>
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
          className="dining-footer"
          id={block.id}
          style={landingPageSectionSurfaceStyle(block)}
        >
          <div className="dining-container">
            <div>
              {text('headline', block.headline, 'h2')}
              {text('subheadline', block.subheadline, 'span')}
              {text('body', block.body)}
            </div>
            {link(
              block.ctaLabel || 'Về đầu trang',
              block.ctaUrl || '#' + target('Header'),
              'ctaLabel',
              'dining-text-link',
            )}
          </div>
        </footer>
      );
    default:
      return null;
  }
}

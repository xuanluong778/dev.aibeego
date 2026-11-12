'use client';

import { useState, useEffect, useRef, type ReactNode, type CSSProperties } from 'react';
import type {
  LandingPageBlock,
  LandingPageSpec,
  LandingPageImageStyle,
} from '@marketingspa/shared';
import {
  InlineEditable,
  ElementChrome,
  ItemReorderChrome,
  type LandingPageCanvasHandlers,
} from './landing-page-canvas-ux';
import { itemBoxDomProps, itemBoxHideAttrs } from './landing-page-item-box';
import { lpImgStyle, lpImgMotionAttr } from './landing-page-content-image-style';
import { LpContentImage } from './landing-page-content-image';
import { landingPageSectionSurfaceStyle } from './landing-page-section-surface';
import './landing-page-agency-portfolio.css';

const paths: Record<string, string> = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  brief:
    '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h4"/>',
  scope:
    '<path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5"/><rect x="7" y="7" width="10" height="10" rx="2"/>',
  folder:
    '<path d="M3 7V5a2 2 0 0 1 2-2h5l3 3h6a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/><path d="m8 14 3 3 5-6"/>',
  web: '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 9h20M6 6.5h.01M9 6.5h.01M6 13h5M6 16h8"/>',
  pen: '<path d="m14 5 5 5M4 20l4-1 12-12a2.8 2.8 0 0 0-4-4L4 15l-1 6Z"/>',
  campaign: '<path d="m3 11 16-7v16L3 14v-3Z"/><path d="m6 15 2 6h4l-2-5M22 8v7"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
};
function Icon({ name }: { name: string }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: paths[name] || paths.check! }}
    />
  );
}
function Mark() {
  return (
    <svg className="brand-mark" viewBox="0 0 36 36" aria-hidden="true">
      <rect width="36" height="36" rx="10" fill="#FF6B00" />
      <path d="m9 25 8-16h4l7 16h-5l-2-5h-6l-2 5Z" fill="#111827" />
      <path d="m16.5 16 2-4 1.5 4Z" fill="#FF6B00" />
    </svg>
  );
}

/** Presentation for this one persisted version. All editing, media, drag and form primitives are shared. */
export function AgencyPortfolioBlock({
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
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (block.type !== 'Header' || !headerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width >= 1024) setMenuOpen(false);
    });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, [block.type]);
  const itemProps = (id: string) => {
    const props = itemBoxDomProps(block, id);
    const vars = props.style as Record<string, string>;
    const style: Record<string, string> = { ...vars };
    for (const [variable, property] of Object.entries({
      '--lp-item-box-bg-color': 'backgroundColor',
      '--lp-item-box-bg-image': 'backgroundImage',
      '--lp-item-box-bg-size': 'backgroundSize',
      '--lp-item-box-bg-position': 'backgroundPosition',
      '--lp-item-box-padding': 'padding',
      '--lp-item-box-border': 'border',
      '--lp-item-box-radius': 'borderRadius',
      '--lp-item-box-shadow': 'boxShadow',
    })) {
      if (vars[variable]) style[property] = vars[variable]!;
    }
    return { ...props, style: style as CSSProperties };
  };

  const text = (
    field: string,
    value: string | undefined,
    as: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div' = 'p',
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
      textRole={
        as.startsWith('h') ? 'heading' : /^(ctaLabel|planCta:)/.test(field) ? 'button' : 'paragraph'
      }
    />
  );
  const targetFor = (type: LandingPageBlock['type']) =>
    spec.blocks.find((b) => b.enabled && b.type === type)?.id;
  const scroll = (href: string) => {
    if (!href.startsWith('#')) return;
    const key = href.slice(1);
    const target =
      key === 'lead-form'
        ? document.querySelector(`[data-lp-block-id="${targetFor('LeadForm')}"]`)
        : key === 'top'
          ? document.querySelector(`[data-lp-block-id="${targetFor('Header')}"]`)
          : document.getElementById(key);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const link = (
    label: string,
    href: string,
    kind = 'btn-primary',
    field?: string,
    onChoose?: () => void,
  ) => (
    <a
      className={'btn ' + kind}
      href={href}
      onClick={(e) => {
        if (canvas) {
          e.preventDefault();
          return;
        }
        onChoose?.();
        setMenuOpen(false);
        if (href.startsWith('#')) {
          e.preventDefault();
          scroll(href);
        }
      }}
    >
      {field ? text(field, label, 'span') : label}
      <Icon name="arrow" />
    </a>
  );
  const navTypes: LandingPageBlock['type'][] = ['Features', 'Gallery', 'Process', 'Pricing', 'FAQ'];
  const navLabels = block.type === 'Header' ? (block.body || '').split('|') : [];
  const nav = (mobile = false) => (
    <nav
      className={mobile ? 'container mobile-nav open' : 'desktop-nav'}
      aria-label={mobile ? 'Menu di động' : 'Điều hướng chính'}
    >
      {navLabels.map((label, i) => {
        const id = targetFor(navTypes[i]!);
        return id ? (
          <a
            key={i}
            href={'#' + id}
            onClick={(e) => {
              e.preventDefault();
              if (!canvas) scroll('#' + id);
              setMenuOpen(false);
            }}
          >
            {label}
          </a>
        ) : null;
      })}
      {mobile && block.type === 'Header'
        ? link(block.ctaLabel || '', block.ctaUrl || '#lead-form', 'nav-contact')
        : null}
    </nav>
  );
  const head = (eyebrow: string, center = false) => (
    <div className={'section-head' + (center ? ' center' : '')}>
      <span className="eyebrow">{eyebrow}</span>
      {'headline' in block
        ? text(
            'headline',
            block.type === 'Process' &&
              block.headline === 'Bốn bước phối hợp.' && spec.meta?.fieldSources?.[block.id + '.headline'] !== 'user' &&
              block.items.length !== 4
              ? `${block.items.length} bước phối hợp.`
              : block.headline,
            'h2',
          )
        : null}
      {'subheadline' in block && block.subheadline ? text('subheadline', block.subheadline) : null}
    </div>
  );
  const media = (
    src: string | undefined | null,
    alt: string,
    field = 'image',
    style?: LandingPageImageStyle,
  ) => (
    <ElementChrome
      blockId={block.id}
      element={field.startsWith('itemImage:') ? `item:${field.slice(10)}` : 'image'}
      field={field.startsWith('itemImage:') ? field : undefined}
      handlers={canvas}
      kind="image"
      blockStyle={block.style as Record<string, unknown>}
    >
      <LpContentImage
        key={src}
        src={src || ''}
        alt={alt}
        fallbackLabel="Ảnh minh họa chưa được cung cấp"
        loading="eager"
        style={lpImgStyle(style)}
        data-lp-img-motion={lpImgMotionAttr(style)}
      />
    </ElementChrome>
  );
  const section = (className: string, children: ReactNode, id?: string) => (
    <section
      className={className}
      id={id || block.id}
      style={landingPageSectionSurfaceStyle(block)}
    >
      {children}
    </section>
  );
  switch (block.type) {
    case 'Header':
      return (
        <header
          ref={headerRef}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setMenuOpen(false);
              headerRef.current?.querySelector<HTMLButtonElement>('.menu-toggle')?.focus();
            }
          }}
          className="header"
          id="top"
          style={landingPageSectionSurfaceStyle(block)}
        >
          <div className="container header-inner">
            <div className="brand">
              {block.imageUrl ? media(block.imageUrl, block.headline || '', 'image', {fit:'contain',...block.imageStyle}) : <Mark />}
              <span>
                {text('headline', block.headline, 'span')}
                <small>{text('subheadline', block.subheadline, 'span')}</small>
              </span>
            </div>
            {nav()}
            <span className="header-cta">
              {link(block.ctaLabel || '', block.ctaUrl || '#lead-form', 'btn-primary', 'ctaLabel')}
            </span>
            <button
              className="menu-toggle"
              type="button"
              aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={menuOpen}
              aria-controls={'menu-' + block.id}
              onClick={() => setMenuOpen((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setMenuOpen(false);
              }}
            >
              <Icon name="menu" />
            </button>
          </div>
          <div id={'menu-' + block.id} hidden={!menuOpen}>
            {menuOpen ? nav(true) : null}
          </div>
        </header>
      );
    case 'Hero':
      return section(
        'hero',
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">{text('body', block.body, 'span')}</span>
            {text('headline', block.headline, 'h1')}
            {text('subheadline', block.subheadline, 'p', 'hero-description')}
            <ul className="hero-points">
              {(block.trustPoints || []).map((p, i) => (
                <li key={i}>
                  <Icon name="check" />
                  {text(`trustPoint:${i}`, p, 'span')}
                </li>
              ))}
            </ul>
            <div className="hero-actions">
              {link(block.ctaLabel || '', block.ctaUrl || '#lead-form', 'btn-primary', 'ctaLabel')}
              {targetFor('Features') ? (
                <a
                  className="btn btn-outline-light"
                  href={'#' + targetFor('Features')}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!canvas) scroll('#' + targetFor('Features'));
                  }}
                >
                  Xem dịch vụ
                </a>
              ) : null}
            </div>
          </div>
          <figure className="hero-figure">
            <div className="photo-frame">
              {media(
                block.imageUrl,
                block.imageStyle?.alt || 'Ảnh minh họa hoạt động phối hợp.',
                'image',
                { fit: 'cover', position: '50% 48%', ...block.imageStyle },
              )}
              <span className="image-badge">ẢNH MINH HỌA</span>
            </div>
            <figcaption>{block.imageStyle?.alt || 'Ảnh minh họa hoạt động phối hợp.'}</figcaption>
          </figure>
        </div>,
      );
    case 'Benefits':
    case 'Features':
    case 'Gallery':
    case 'Process': {
      const gallery = block.type === 'Gallery',
        process = block.type === 'Process',
        services = block.type === 'Features';
      const cls = gallery ? 'gallery' : process ? 'process' : services ? 'services' : 'benefits';
      const grid = gallery
        ? 'work-grid'
        : process
          ? 'steps'
          : services
            ? 'services-grid'
            : 'benefits-grid';
      const eyebrow = gallery
        ? 'ĐẦU RA MINH HỌA'
        : process
          ? 'QUY TRÌNH'
          : services
            ? 'DỊCH VỤ'
            : 'LỢI ÍCH';
      return section(
        cls,
        <div className="container">
          {gallery ? (
            <div className="gallery-heading">
              {head(eyebrow)}
              <span className="demo-note">
                <span />
                {block.items.length} ví dụ minh họa
              </span>
            </div>
          ) : (
            head(eyebrow)
          )}
          <div className={grid} data-lp-free-surface="1">
            {block.items.map((it, i) => (
              <ItemReorderChrome
                blockId={block.id}
                itemId={it.id}
                index={i}
                key={it.id}
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
                      gallery
                        ? 'work-card'
                        : process
                          ? 'step'
                          : services
                            ? 'service-card'
                            : 'benefit-card'
                    }
                    {...itemProps(it.id)}
                    {...itemBoxHideAttrs(block, it.id)}
                  >
                    {gallery ? (
                      <>
                        <div className="work-media">
                          {media(
                            it.imageUrl,
                            it.imageStyle?.alt || it.title,
                            `itemImage:${it.id}`,
                            { fit: 'contain', ...it.imageStyle },
                          )}
                        </div>
                        <div className="work-copy">
                          <span className="media-label">{it.role}</span>
                          {text(`itemTitle:${it.id}`, it.title, 'h3')}
                          {text(`itemDesc:${it.id}`, it.description)}
                        </div>
                      </>
                    ) : process ? (
                      <>
                        <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
                        <div>
                          {text(`itemTitle:${it.id}`, it.title, 'h3')}
                          {text(`itemDesc:${it.id}`, it.description)}
                        </div>
                      </>
                    ) : (
                      <>
                        {services ? (
                          <div className="service-top">
                            <Icon name={it.icon || 'web'} />
                            <span>{String(i + 1).padStart(2, '0')}</span>
                          </div>
                        ) : (
                          <span className="icon-box">
                            <Icon name={it.icon || 'brief'} />
                          </span>
                        )}
                        {text(`itemTitle:${it.id}`, it.title, 'h3')}
                        {text(`itemDesc:${it.id}`, it.description)}
                      </>
                    )}
                  </article>
                </ElementChrome>
              </ItemReorderChrome>
            ))}
          </div>
        </div>,
      );
    }
    case 'Pricing':
      return section(
        'pricing',
        <div className="container">
          {head('CÁCH HỢP TÁC', true)}
          <div className="pricing-grid" data-lp-free-surface="1">
            {block.plans.map((p, i) => (
              <ItemReorderChrome
                blockId={block.id}
                index={i}
                itemId={p.id}
                handlers={canvas}
                key={p.id}
              >
                <ElementChrome
                  blockId={block.id}
                  element={`item:${p.id}`}
                  kind="box"
                  handlers={canvas}
                  blockStyle={block.style as Record<string, unknown>}
                >
                  <article
                    className={'price-card' + (p.highlighted ? ' dark' : '')}
                    {...itemProps(p.id)}
                    {...itemBoxHideAttrs(block, p.id)}
                  >
                    <span className="overline">{p.period}</span>
                    {text(`planName:${p.id}`, p.name, 'h3')}
                    {text(`planPrice:${p.id}`, p.price, 'p', 'price-intro')}
                    <ul>
                      {p.features.map((f, n) => (
                        <li key={n}>
                          <Icon name="check" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    {link(
                      p.ctaLabel || 'Trao đổi',
                      p.ctaUrl || '#lead-form',
                      p.highlighted ? 'btn-primary' : 'btn-outline',
                      `planCta:${p.id}`,
                      () => {
                        const form = document.querySelector(
                          `[data-lp-block-id="${targetFor('LeadForm')}"] form`,
                        );
                        form?.dispatchEvent(
                          new CustomEvent('agency-plan', { detail: p.name, bubbles: true }),
                        );
                      },
                    )}
                  </article>
                </ElementChrome>
              </ItemReorderChrome>
            ))}
          </div>
        </div>,
      );
    case 'FAQ':
      return section(
        'faq',
        <div className="container">
          <div className="faq-inner">
            {head('CÂU HỎI THƯỜNG GẶP')}
            {block.items.map((it, i) => (
              <details
                key={it.id}
                open={i === 0 ? true : undefined}
                onClick={(e) => {
                  if (canvas) e.preventDefault();
                }}
              >
                <summary>
                  {text(`itemQuestion:${it.id}`, it.question, 'span')}
                  <span className="faq-plus">
                    <Icon name="plus" />
                  </span>
                </summary>
                {text(`itemAnswer:${it.id}`, it.answer)}
              </details>
            ))}
          </div>
        </div>,
      );
    case 'CTA':
      return section(
        'cta',
        <div className="container cta-inner">
          <div>
            {text('headline', block.headline, 'h2')}
            {text('subheadline', block.subheadline)}
          </div>
          {link(block.ctaLabel || '', block.ctaUrl || '#lead-form', 'btn-primary', 'ctaLabel')}
        </div>,
      );
    case 'LeadForm':
      return section(
        'form-section',
        <div className="container">
          <div className="form-wrap">
            {head('BẮT ĐẦU TRAO ĐỔI', true)}
            <ElementChrome
              blockId={block.id}
              element="form"
              kind="box"
              handlers={canvas}
              blockStyle={block.style as Record<string, unknown>}
            >
              {renderForm}
            </ElementChrome>
          </div>
        </div>,
      );
    case 'Footer':
      return (
        <footer className="footer" style={landingPageSectionSurfaceStyle(block)}>
          <div className="container">
            <div className="footer-top">
              <div className="brand">
                <Mark />
                {text('headline', block.headline, 'span')}
              </div>
              {text('subheadline', block.subheadline, 'span', 'footer-demo')}
            </div>
            <div className="footer-bottom">
              {text('body', block.body, 'span')}
              <a
                href={block.ctaUrl || '#top'}
                onClick={(e) => {
                  e.preventDefault();
                  if (!canvas) scroll(block.ctaUrl || '#top');
                }}
              >
                {text('ctaLabel', block.ctaLabel, 'span')} ↑
              </a>
            </div>
          </div>
        </footer>
      );
    default:
      return null;
  }
}

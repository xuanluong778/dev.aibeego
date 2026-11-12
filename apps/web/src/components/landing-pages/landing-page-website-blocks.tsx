'use client';
import { useState, type ReactNode } from 'react';
import type { LandingPageBlock, LandingPageSpec } from '@marketingspa/shared';
import {
  InlineEditable,
  ElementChrome,
  ItemReorderChrome,
  type LandingPageCanvasHandlers,
} from './landing-page-canvas-ux';
import { landingPageSectionSurfaceStyle } from './landing-page-section-surface';
import { LpIndustryImage } from './landing-page-industry-image';
import { lpImgStyle } from './landing-page-content-image-style';
import './landing-page-website.css';
export function WebsiteBriefBlock({
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
  ) => (
    <InlineEditable
      blockId={block.id}
      field={field}
      value={value || ''}
      as={as}
      handlers={canvas}
      blockStyle={block.style as Record<string, unknown>}
      textRole={as.startsWith('h') ? 'heading' : 'paragraph'}
    />
  );
  const link = (label: string, href: string, field?: string, cls = 'webstudio-button') => (
    <a
      className={cls}
      href={href}
      onClick={(e) => {
        if (canvas) e.preventDefault();
        setOpen(false);
      }}
    >
      {field ? text(field, label, 'span') : label}
      <span aria-hidden>↗</span>
    </a>
  );
  const section = (cls: string, children: ReactNode) => (
    <section
      id={block.id}
      className={'webstudio-section ' + cls}
      style={landingPageSectionSurfaceStyle(block)}
    >
      <div className="webstudio-shell">{children}</div>
    </section>
  );
  switch (block.type) {
    case 'Header':
      return (
        <header id={block.id} className="webstudio-header">
          <div className="webstudio-shell webstudio-header-row">
            <div className="webstudio-brand">
              {text('headline', block.headline, 'span')}
              <small>{text('subheadline', block.subheadline, 'span')}</small>
            </div>
            <button
              className="webstudio-menu-toggle"
              type="button"
              aria-controls={'nav-' + block.id}
              aria-expanded={open}
              aria-label={open ? 'Đóng menu' : 'Mở menu'}
              onClick={() => setOpen((v) => !v)}
            >
              ☰
            </button>
            <nav
              id={'nav-' + block.id}
              className={'webstudio-nav' + (open ? ' open' : '')}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false);
              }}
            >
              {(['Features', 'Process', 'Pricing'] as const).map((type, i) =>
                target(type) ? (
                  <span key={type}>
                    {link(
                      (block.body || '').split('|')[i] || type,
                      '#' + target(type),
                      undefined,
                      'webstudio-nav-link',
                    )}
                  </span>
                ) : null,
              )}
            </nav>
            <div className="webstudio-header-cta">
              {link(
                block.ctaLabel || 'Gửi brief',
                block.ctaUrl || '#' + target('LeadForm'),
                'ctaLabel',
              )}
            </div>
          </div>
        </header>
      );
    case 'Hero':
      return section(
        'webstudio-hero',
        <>
          <div className="webstudio-hero-copy">
            <div className="webstudio-kicker">{text('body', block.body, 'span')}</div>
            {text('headline', block.headline, 'h1')}
            {text('subheadline', block.subheadline)}
            <div className="webstudio-actions">
              {link(
                block.ctaLabel || 'Gửi brief',
                block.ctaUrl || '#' + target('LeadForm'),
                'ctaLabel',
              )}
            </div>
            <ul className="webstudio-trust">
              {block.trustPoints?.map((p, i) => (
                <li key={i}>{text('trustPoint:' + i, p, 'span')}</li>
              ))}
            </ul>
          </div>
          <figure>
            <ElementChrome
              blockId={block.id}
              element="image"
              kind="image"
              handlers={canvas}
              blockStyle={block.style as Record<string, unknown>}
            >
              <LpIndustryImage
                src={block.imageUrl || ''}
                alt={block.imageStyle?.alt}
                imageStyle={block.imageStyle}
                style={lpImgStyle(block.imageStyle)}
                canvas={Boolean(canvas)}
                loading="eager"
              />
            </ElementChrome>
          </figure>
        </>,
      );
    case 'Features':
    case 'Process':
      return section(
        block.type === 'Features' ? 'webstudio-deliverables' : 'webstudio-process',
        <>
          <div className="webstudio-section-head">
            <span className="webstudio-kicker">
              {block.type === 'Features' ? '02 / PHẠM VI' : '03 / BÀN GIAO'}
            </span>
            {text('headline', block.headline, 'h2')}
            {text('subheadline', block.subheadline)}
          </div>
          <div className="webstudio-card-grid">
            {block.items.map((item, i) => (
              <ItemReorderChrome
                key={item.id}
                blockId={block.id}
                index={i}
                itemId={item.id}
                handlers={canvas}
              >
                <ElementChrome
                  blockId={block.id}
                  element={`item:${item.id}`}
                  kind="box"
                  handlers={canvas}
                  blockStyle={block.style as Record<string, unknown>}
                >
                  <article className="webstudio-card">
                    <span className="webstudio-number">{String(i + 1).padStart(2, '0')}</span>
                    {text('itemTitle:' + item.id, item.title, 'h3')}
                    {text('itemDesc:' + item.id, item.description)}
                  </article>
                </ElementChrome>
              </ItemReorderChrome>
            ))}
          </div>
        </>,
      );
    case 'Pricing':
      return section(
        'webstudio-pricing',
        <>
          <div className="webstudio-section-head">
            <span className="webstudio-kicker">04 / LỰA CHỌN</span>
            {text('headline', block.headline, 'h2')}
            {text('subheadline', block.subheadline)}
          </div>
          <div className="webstudio-package-grid">
            {block.plans.map((plan, i) => (
              <ItemReorderChrome
                key={plan.id}
                blockId={block.id}
                index={i}
                itemId={plan.id}
                handlers={canvas}
              >
                <ElementChrome
                  blockId={block.id}
                  element={`item:${plan.id}`}
                  kind="box"
                  handlers={canvas}
                  blockStyle={block.style as Record<string, unknown>}
                >
                  <article
                    className="webstudio-package"
                    data-highlighted={plan.highlighted ? '1' : undefined}
                  >
                    {text('planName:' + plan.id, plan.name, 'h3')}
                    {text('planPrice:' + plan.id, plan.price)}
                    <ul>
                      {plan.features.map((f, n) => (
                        <li key={n}>{f}</li>
                      ))}
                    </ul>
                    <a
                      className="webstudio-button"
                      href={'#' + target('LeadForm')}
                      onClick={(e) => {
                        if (canvas) {
                          e.preventDefault();
                          return;
                        }
                        document
                          .getElementById(target('LeadForm') || '')
                          ?.querySelector('form')
                          ?.dispatchEvent(
                            new CustomEvent('lp-industry-choice', {
                              detail: { key: 'website_scope', label: plan.name },
                            }),
                          );
                      }}
                    >
                      {text('planCta:' + plan.id, plan.ctaLabel, 'span')}
                    </a>
                  </article>
                </ElementChrome>
              </ItemReorderChrome>
            ))}
          </div>
        </>,
      );
    case 'FAQ':
      return section(
        'webstudio-faq',
        <>
          <div className="webstudio-section-head">{text('headline', block.headline, 'h2')}</div>
          <div>
            {block.items.map((item, i) => (
              <details
                key={item.id}
                open={i === 0 ? true : undefined}
                onClick={(e) => {
                  if (canvas) e.preventDefault();
                }}
              >
                <summary>
                  {text('itemQuestion:' + item.id, item.question, 'span')}
                  <span aria-hidden>+</span>
                </summary>
                {text('itemAnswer:' + item.id, item.answer)}
              </details>
            ))}
          </div>
        </>,
      );
    case 'LeadForm':
      return section(
        'webstudio-brief',
        <>
          <aside>
            <span className="webstudio-kicker">05 / BRIEF WEBSITE</span>
            {text('headline', block.headline, 'h2')}
            {text('subheadline', block.subheadline)}
            <p className="webstudio-note">
              Bản mẫu chưa có đơn vị nhận dự án hoặc báo giá được xác nhận. Cập nhật thông tin vận
              hành trước khi phát hành.
            </p>
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
        <footer id={block.id} className="webstudio-footer">
          <div className="webstudio-shell">
            <div>
              {text('headline', block.headline, 'h2')}
              {text('subheadline', block.subheadline)}
              {text('body', block.body)}
            </div>
            {link(
              block.ctaLabel || 'Về đầu trang',
              block.ctaUrl || '#' + target('Header'),
              'ctaLabel',
              'webstudio-nav-link',
            )}
          </div>
        </footer>
      );
    default:
      return null;
  }
}

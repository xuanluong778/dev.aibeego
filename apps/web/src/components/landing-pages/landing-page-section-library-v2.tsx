'use client';

import { type CSSProperties, type ReactNode } from 'react';
import {
  Check,
  ArrowUpRight,
  Layers,
  Zap,
  BarChart3,
  Users,
  ShieldCheck,
  Workflow,
  Quote,
  ChevronDown,
  Star,
  Heart,
  Plus,
  Circle,
} from 'lucide-react';
import type { LandingPageBlock, LandingPageImageStyle } from '@marketingspa/shared';
import {
  InlineEditable,
  ElementChrome,
  ItemReorderChrome,
  type LandingPageCanvasHandlers,
} from './landing-page-canvas-ux';
import { LpContentImage } from './landing-page-content-image';
import { itemBoxDomProps, itemBoxHideAttrs } from './landing-page-item-box';
import { lpImgStyle } from './landing-page-content-image-style';
import { landingPageSectionSurfaceStyle } from './landing-page-section-surface';
import type { SectionLibraryContext } from './landing-page-section-library-context';
import './landing-page-section-library-v2.css';

type Entry = {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  imageStyle?: LandingPageImageStyle;
  question?: string;
  answer?: string;
  quote?: string;
  author?: string;
  role?: string;
  avatarUrl?: string;
  name?: string;
  price?: string;
  period?: string;
  features?: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  highlighted?: boolean;
};
type Content = {
  headline?: string;
  subheadline?: string;
  body?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  trustPoints?: string[];
  imageUrl?: string;
  imageStyle?: LandingPageImageStyle;
  videoUrl?: string;
  posterUrl?: string;
  items?: Entry[];
  plans?: Entry[];
};
const icons = [Layers, Zap, BarChart3, Users, ShieldCheck, Workflow];
const trustIcons: Record<string, typeof Check> = {
  check: Check,
  star: Star,
  heart: Heart,
  bolt: Zap,
  plus: Plus,
  arrow: ArrowUpRight,
  dot: Circle,
  shield: ShieldCheck,
};

function onPrimary(color: string): string {
  const match = /^#([\da-f]{6})$/i.exec(color);
  if (!match) return '#ffffff';
  const channels = [0, 2, 4]
    .map((i) => parseInt(match[1]!.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]! > 0.179
    ? '#102a2c'
    : '#ffffff';
}

/** Opt-in v2 only. Existing sections keep their original renderer and CSS. */
export function LandingPageSectionLibraryBlockV2({
  block,
  context,
  canvas,
  viewport,
  renderForm,
  renderCountdown,
  catalogPreview = false,
}: {
  block: LandingPageBlock;
  context: SectionLibraryContext;
  canvas: LandingPageCanvasHandlers | null;
  viewport: 'desktop' | 'tablet' | 'mobile';
  renderForm?: ReactNode;
  renderCountdown?: ReactNode;
  catalogPreview?: boolean;
}) {
  const b = block as LandingPageBlock & Content;
  const style = (block.style || {}) as Record<string, unknown>;
  const savedPresentation = context.presentation || {
    category: 'content',
    layout: 'default',
    columns: 3,
    tone: 'light',
    sourceVariant: undefined,
  };
  const p = {
    ...savedPresentation,
    layout:
      block.variant &&
      savedPresentation.sourceVariant &&
      block.variant !== savedPresentation.sourceVariant
        ? block.variant
        : savedPresentation.layout,
  };
  const tokens = context.themeTokens;
  const primary = tokens.button || tokens.primary;
  const vars = {
    '--sl2-bg': tokens.background,
    '--sl2-surface': tokens.surface,
    '--sl2-soft': tokens.surfaceAlt || tokens.surface,
    '--sl2-text': tokens.text,
    '--sl2-muted': tokens.muted,
    '--sl2-line': tokens.border || '#dce3eb',
    '--sl2-accent': primary,
    '--sl2-on-accent': onPrimary(primary),
    '--sl2-columns': p.columns,
    '--lp-on-primary': onPrimary(primary),
    ...landingPageSectionSurfaceStyle(block),
  } as CSSProperties;
  const itemProps = (id: string) => {
    const props = itemBoxDomProps(block, id),
      vars = props.style as Record<string, string>;
    const css: Record<string, string> = { ...vars };
    for (const [variable, property] of Object.entries({
      '--lp-item-box-bg-color': 'backgroundColor',
      '--lp-item-box-bg-image': 'backgroundImage',
      '--lp-item-box-bg-size': 'backgroundSize',
      '--lp-item-box-bg-position': 'backgroundPosition',
      '--lp-item-box-padding': 'padding',
      '--lp-item-box-border': 'border',
      '--lp-item-box-radius': 'borderRadius',
      '--lp-item-box-shadow': 'boxShadow',
    }))
      if (vars[variable]) css[property] = vars[variable]!;
    if (props['data-lp-item-box-bg'] === 'clear') css.background = 'transparent';
    return {
      ...props,
      ...itemBoxHideAttrs(block, id),
      style: css as CSSProperties,
      'data-lp-card-item': '1',
    };
  };
  const text = (
    field: string,
    value: string | undefined,
    tag: 'h1' | 'h2' | 'h3' | 'p' | 'span' = 'p',
    className = '',
    role:
      | 'heading'
      | 'paragraph'
      | 'button'
      | 'card-title'
      | 'card-description'
      | 'faq'
      | 'testimonial'
      | 'pricing' = 'paragraph',
  ) =>
    value ? (
      <InlineEditable
        as={tag}
        blockId={block.id}
        field={field}
        value={value}
        handlers={canvas}
        blockStyle={style}
        className={className}
        textRole={role}
        multiline={tag === 'p'}
      />
    ) : null;
  const header = (align = 'center') => (
    <header className={`sl2-heading sl2-align-${align}`}>
      {text('headline', b.headline, block.type === 'Hero' ? 'h1' : 'h2', 'sl2-title', 'heading')}
      {text('subheadline', b.subheadline, 'p', 'sl2-description')}
    </header>
  );
  const button = (label = b.ctaLabel, href = b.ctaUrl, field = 'ctaLabel', secondary = false) =>
    label ? (
      <div className="sl2-action">
        {canvas ? (
          text(field, label, 'span', `sl2-btn ${secondary ? 'sl2-btn-secondary' : ''}`, 'button')
        ) : (
          <a
            className={`sl2-btn ${secondary ? 'sl2-btn-secondary' : ''}`}
            href={href || '#lead-form'}
          >
            {text(field, label, 'span', 'sl2-btn-label', 'button')}
          </a>
        )}
      </div>
    ) : null;
  const media = (
    src: string | undefined,
    alt: string,
    field = 'image',
    imageStyle?: LandingPageImageStyle,
  ) =>
    src ? (
      <ElementChrome
        blockId={block.id}
        element={field.startsWith('itemImage:') ? `item:${field.slice(10)}` : 'image'}
        field={field.startsWith('itemImage:') ? field : undefined}
        kind="image"
        handlers={canvas}
        blockStyle={style}
        className="sl2-media-wrap"
      >
        <div
          className="sl2-media"
          data-lp-hero-visual={block.type === 'Hero' && field === 'image' ? '1' : undefined}
        >
          <LpContentImage
            src={src}
            alt={imageStyle?.alt || alt}
            loading="eager"
            decoding="async"
            style={lpImgStyle(imageStyle)}
          />
        </div>
      </ElementChrome>
    ) : null;
  const trust = b.trustPoints?.length ? (
    <ul className="sl2-trust">
      {b.trustPoints.map((value, index) => {
        const element = `item:trust-icon-${index}` as const;
        const iconIds = (style.elementIconIds || {}) as Record<string, string>;
        const Icon = trustIcons[iconIds[element] || 'check'] || Check;
        return (
          <li key={index}>
            <ElementChrome
              blockId={block.id}
              element={element}
              kind="box"
              handlers={canvas}
              blockStyle={style}
              className="sl2-trust-icon"
            >
              <Icon aria-hidden className="sl2-check" />
            </ElementChrome>
            {text(`trustPoint:${index}`, value, 'span', 'sl2-trust-text')}
          </li>
        );
      })}
    </ul>
  ) : null;
  const items = b.items || [];
  const wrap = (entry: Entry, index: number, node: ReactNode) => (
    <ItemReorderChrome
      key={entry.id}
      blockId={block.id}
      itemId={entry.id}
      index={index}
      handlers={canvas}
    >
      {node}
    </ItemReorderChrome>
  );
  let content: ReactNode;
  if (block.type === 'Hero') {
    const copy = (
      <div className="sl2-hero-copy" data-lp-hero-copy="1">
        {header('left')}
        {trust}
        {button()}
      </div>
    );
    if (['editorial-overlay', 'fullscreen-image'].includes(p.layout))
      content = (
        <div className="sl2-hero-backdrop">
          {media(b.imageUrl, b.headline || '')}
          <div className="sl2-backdrop-shade" aria-hidden />
          {copy}
        </div>
      );
    else if (p.layout === 'floating-card')
      content = (
        <div className="sl2-hero-float">
          {media(b.imageUrl, b.headline || '')}
          {copy}
        </div>
      );
    else if (['centered', 'premium-dark', 'minimal-copy'].includes(p.layout))
      content = (
        <div
          className={`sl2-hero-centered ${p.layout === 'minimal-copy' ? 'sl2-hero-minimal' : ''}`}
        >
          {copy}
          {p.layout !== 'minimal-copy' ? media(b.imageUrl, b.headline || '') : null}
        </div>
      );
    else
      content = (
        <div
          data-lp-hero-grid="1"
          data-lp-container-inner="1"
          className={`sl2-hero-split ${p.layout === 'split-right' ? 'sl2-hero-reverse' : ''}`}
        >
          {copy}
          {media(b.imageUrl, b.headline || '')}
        </div>
      );
  } else if (block.type === 'LeadForm') {
    content = (
      <div
        data-lp-form-split={
          ['split', 'floating-card', 'booking'].includes(p.layout) ? '1' : undefined
        }
        data-lp-container-inner="1"
        className={`sl2-form-layout ${['split', 'floating-card', 'booking'].includes(p.layout) ? 'sl2-form-split' : ''}`}
      >
        <div>
          {header('left')}
          <ul className="sl2-form-points">
            <li>
              <Check aria-hidden />
              Trao đổi về nhu cầu của bạn
            </li>
            <li>
              <Check aria-hidden />
              Thống nhất bước tiếp theo
            </li>
          </ul>
        </div>
        <div className="sl2-form">{renderForm}</div>
      </div>
    );
  } else if (block.type === 'Countdown') {
    content = (
      <div className={`sl2-countdown ${p.layout === 'inline' ? 'sl2-countdown-inline' : ''}`}>
        <div>{header('left')}</div>
        <div className="sl2-countdown-clock">{renderCountdown}</div>
      </div>
    );
  } else if (block.type === 'Video') {
    content = (
      <div className={p.layout === 'sidebar' ? 'sl2-video-split' : ''}>
        {header(p.layout === 'sidebar' ? 'left' : 'center')}
        <ElementChrome
          blockId={block.id}
          element="section"
          field="videoUrl"
          kind="box"
          handlers={canvas}
          blockStyle={style}
        >
          <div className="sl2-video">
            {(catalogPreview || canvas) && b.posterUrl ? (
              <img
                className="sl2-video-poster"
                src={b.posterUrl}
                alt={b.headline || 'Video giới thiệu'}
              />
            ) : b.videoUrl && !/\.(mp4|webm)(?:[?#]|$)/i.test(b.videoUrl) ? (
              <iframe
                title={b.headline || 'Video'}
                src={b.videoUrl}
                loading="lazy"
                allowFullScreen
              />
            ) : (
              <video
                controls
                preload="metadata"
                playsInline
                poster={b.posterUrl}
                src={b.videoUrl}
                aria-label={b.headline || 'Video giới thiệu'}
              />
            )}
          </div>
        </ElementChrome>
      </div>
    );
  } else if (block.type === 'Pricing') {
    content = (
      <>
        {header()}
        <div
          className={`sl2-grid sl2-prices ${p.layout === 'comparison' ? 'sl2-price-comparison' : ''} ${p.layout === 'minimal' ? 'sl2-price-minimal' : ''}`}
          style={{ '--sl2-columns': b.plans?.length || 3 } as CSSProperties}
        >
          {b.plans?.map((plan, index) =>
            wrap(
              plan,
              index,
              <div
                {...itemProps(plan.id)}
                className={`sl2-price ${plan.highlighted ? 'sl2-featured' : ''}`}
              >
                {text(`planName:${plan.id}`, plan.name, 'h3', 'sl2-card-title', 'card-title')}
                <div className="sl2-price-amount">
                  {text(`planPrice:${plan.id}`, plan.price, 'span', 'sl2-price-value', 'pricing')}
                  {plan.price !== 'Liên hệ' && plan.period ? (
                    <span className="sl2-price-period">/ {plan.period}</span>
                  ) : null}
                </div>
                {button(plan.ctaLabel, plan.ctaUrl, `planCta:${plan.id}`, !plan.highlighted)}
                <ul className="sl2-plan-features">
                  {plan.features?.map((feature, i) => (
                    <li key={i}>
                      <Check aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>,
            ),
          )}
        </div>
      </>
    );
  } else if (block.type === 'Testimonials') {
    content = (
      <>
        {header()}
        <div
          className={`sl2-grid sl2-quotes ${p.layout === 'quote-centered' ? 'sl2-single-quote' : ''}`}
          style={{ '--sl2-columns': Math.min(3, items.length) } as CSSProperties}
        >
          {items.map((entry, index) =>
            wrap(
              entry,
              index,
              <figure {...itemProps(entry.id)} className="sl2-quote">
                <Quote className="sl2-quote-mark" aria-hidden />
                {text(`itemQuote:${entry.id}`, entry.quote, 'p', 'sl2-quote-text', 'testimonial')}
                <figcaption>
                  <span className="sl2-avatar" aria-hidden>
                    {(entry.author || '')
                      .split(' ')
                      .map((x) => x[0])
                      .join('')
                      .slice(0, 2)}
                  </span>
                  <div>
                    {text(
                      `itemAuthor:${entry.id}`,
                      entry.author,
                      'span',
                      'sl2-author',
                      'card-title',
                    )}
                    <span className="sl2-role">{entry.role}</span>
                  </div>
                </figcaption>
              </figure>,
            ),
          )}
        </div>
      </>
    );
  } else if (block.type === 'FAQ') {
    content = (
      <>
        {header()}
        <div className="sl2-faq-grid" style={{ '--sl2-columns': p.columns } as CSSProperties}>
          {items.map((entry, index) =>
            wrap(
              entry,
              index,
              canvas ? (
                <div {...itemProps(entry.id)} className="sl2-faq">
                  <div className="sl2-faq-question">
                    {text(
                      `itemQuestion:${entry.id}`,
                      entry.question,
                      'h3',
                      'sl2-card-title',
                      'faq',
                    )}
                    <ChevronDown aria-hidden />
                  </div>
                  {text(`itemAnswer:${entry.id}`, entry.answer, 'p', 'sl2-card-description', 'faq')}
                </div>
              ) : (
                <details {...itemProps(entry.id)} className="sl2-faq" open={index === 0}>
                  <summary>
                    {text(
                      `itemQuestion:${entry.id}`,
                      entry.question,
                      'span',
                      'sl2-card-title',
                      'faq',
                    )}
                    <ChevronDown aria-hidden />
                  </summary>
                  {text(`itemAnswer:${entry.id}`, entry.answer, 'p', 'sl2-card-description', 'faq')}
                </details>
              ),
            ),
          )}
        </div>
      </>
    );
  } else if (block.type === 'CTA' || block.type === 'Guarantee') {
    content = (
      <div
        data-lp-cta-split={p.layout === 'split' ? '1' : undefined}
        data-lp-container-inner="1"
        className={`sl2-callout ${p.layout === 'split' ? 'sl2-callout-split' : ''} ${b.imageUrl ? 'sl2-callout-image' : ''}`}
      >
        {b.imageUrl ? (
          <div className="sl2-callout-backdrop">
            {media(b.imageUrl, b.headline || '')}
            <div className="sl2-backdrop-shade" aria-hidden />
          </div>
        ) : null}
        <div className="sl2-callout-copy">
          {block.type === 'Guarantee' ? (
            <ShieldCheck className="sl2-guarantee-mark" aria-hidden />
          ) : null}
          {header(p.layout === 'split' ? 'left' : 'center')}
          {text('body', b.body, 'p', 'sl2-description')}
        </div>
        {button()}
      </div>
    );
  } else if (block.type === 'Gallery') {
    content = (
      <>
        {header()}
        <div className={`sl2-gallery sl2-gallery-${p.layout}`}>
          {items.map((entry, index) =>
            wrap(
              entry,
              index,
              <figure {...itemProps(entry.id)} className="sl2-gallery-image">
                {media(
                  entry.imageUrl,
                  entry.title || '',
                  `itemImage:${entry.id}`,
                  entry.imageStyle,
                )}
                <figcaption>
                  {text(
                    `itemTitle:${entry.id}`,
                    entry.title,
                    'span',
                    'sl2-gallery-caption',
                    'card-title',
                  )}
                </figcaption>
              </figure>,
            ),
          )}
        </div>
      </>
    );
  } else if (p.category === 'intro' || (p.category === 'content' && !items.length)) {
    content = (
      <div
        className={`sl2-prose ${p.layout === 'intro-left' || p.layout === 'editorial-list' ? 'sl2-prose-left' : ''}`}
      >
        {header(p.layout === 'intro-left' ? 'left' : 'center')}
        {items.length ? (
          <div className="sl2-grid">
            {items.map((entry, index) =>
              wrap(
                entry,
                index,
                <div {...itemProps(entry.id)} className="sl2-prose-point">
                  <Check className="sl2-icon" aria-hidden />
                  {text(`itemTitle:${entry.id}`, entry.title, 'h3', 'sl2-card-title', 'card-title')}
                  {text(
                    `itemDesc:${entry.id}`,
                    entry.description,
                    'p',
                    'sl2-card-description',
                    'card-description',
                  )}
                </div>,
              ),
            )}
          </div>
        ) : null}
      </div>
    );
  } else if (p.category === 'stats') {
    content = (
      <>
        {header()}
        <div className="sl2-grid sl2-stats">
          {items.map((entry, index) =>
            wrap(
              entry,
              index,
              <div {...itemProps(entry.id)} className="sl2-stat">
                {text(`itemTitle:${entry.id}`, entry.title, 'h3', 'sl2-stat-number', 'card-title')}
                {text(
                  `itemDesc:${entry.id}`,
                  entry.description,
                  'p',
                  'sl2-card-description',
                  'card-description',
                )}
              </div>,
            ),
          )}
        </div>
      </>
    );
  } else if (['alternating', 'image-left', 'image-right'].includes(p.layout)) {
    content = (
      <>
        {header()}
        <div className="sl2-rows">
          {items.map((entry, index) =>
            wrap(
              entry,
              index,
              <div
                {...itemProps(entry.id)}
                className={`sl2-row ${p.layout === 'image-right' || (p.layout === 'alternating' && index % 2) ? 'sl2-row-reverse' : ''}`}
              >
                {media(
                  entry.imageUrl,
                  entry.title || '',
                  `itemImage:${entry.id}`,
                  entry.imageStyle,
                )}
                <div className="sl2-row-copy">
                  <span className="sl2-step-label" aria-hidden>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {text(`itemTitle:${entry.id}`, entry.title, 'h3', 'sl2-row-title', 'card-title')}
                  {text(
                    `itemDesc:${entry.id}`,
                    entry.description,
                    'p',
                    'sl2-card-description',
                    'card-description',
                  )}
                </div>
              </div>,
            ),
          )}
        </div>
      </>
    );
  } else {
    const list = ['editorial-list', 'numbered', 'minimal-list', 'timeline'].includes(p.layout),
      process = block.type === 'Process';
    content = (
      <>
        {header()}
        <div
          className={`sl2-grid ${list ? 'sl2-list' : ''} ${p.layout === 'numbered' || process ? 'sl2-numbered' : ''} ${p.layout === 'timeline' ? 'sl2-timeline' : ''}`}
          style={
            { '--sl2-columns': list && p.layout !== 'numbered' ? 2 : p.columns } as CSSProperties
          }
        >
          {items.map((entry, index) => {
            const Icon = icons[index % icons.length]!;
            return wrap(
              entry,
              index,
              <div {...itemProps(entry.id)} className={`sl2-card ${list ? 'sl2-card-simple' : ''}`}>
                {entry.imageUrl && !list && p.layout === 'image-cards' ? (
                  media(
                    entry.imageUrl,
                    entry.title || '',
                    `itemImage:${entry.id}`,
                    entry.imageStyle,
                  )
                ) : process || p.layout === 'numbered' ? (
                  <span className="sl2-step-label" aria-hidden>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                ) : (
                  <span className="sl2-icon">
                    <Icon aria-hidden />
                  </span>
                )}
                <div className="sl2-card-copy">
                  {text(`itemTitle:${entry.id}`, entry.title, 'h3', 'sl2-card-title', 'card-title')}
                  {text(
                    `itemDesc:${entry.id}`,
                    entry.description,
                    'p',
                    'sl2-card-description',
                    'card-description',
                  )}
                </div>
              </div>,
            );
          })}
        </div>
      </>
    );
  }
  return (
    <section
      className={`sl2-stage sl2-category-${p.category} sl2-layout-${p.layout} sl2-tone-${p.tone}`}
      data-sl2-section={context.templateId}
      data-sl2-viewport={viewport}
      style={vars}
    >
      <div
        className="sl2-container"
        data-lp-container-inner={
          (block.type === 'Hero' &&
            ![
              'centered',
              'premium-dark',
              'minimal-copy',
              'editorial-overlay',
              'fullscreen-image',
              'floating-card',
            ].includes(p.layout)) ||
          block.type === 'LeadForm' ||
          (block.type === 'CTA' && p.layout === 'split')
            ? undefined
            : '1'
        }
      >
        {content}
      </div>
    </section>
  );
}

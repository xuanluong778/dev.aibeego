'use client';

import type { ReactNode } from 'react';
import type { LandingPageBlock, LandingPageImageStyle } from '@marketingspa/shared';
import { BLANK_STARTER_IMAGE } from '@marketingspa/shared';
import { InlineEditable, ElementChrome, ItemReorderChrome, type LandingPageCanvasHandlers } from './landing-page-canvas-ux';
import { LpContentImage } from './landing-page-content-image';
import { lpImgStyle, lpImgMotionAttr } from './landing-page-content-image-style';
import { landingPageSectionSurfaceStyle } from './landing-page-section-surface';
import { itemBoxDomProps } from './landing-page-item-box';
import './landing-page-blank-starter.css';

function SocialIcons() {
  return <div className="blank-social" aria-label="Mạng xã hội">
    <span role="img" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 22v-9h3l.5-4H14V6.5c0-1.2.4-2 2-2h2V1.2A25 25 0 0 0 15 1c-3 0-5 1.8-5 5v3H7v4h3v9Z"/></svg></span>
    <span role="img" aria-label="X"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22H17l-4.9-7.4L5.6 22H2.4l8.3-9.6L.8 2h6.4l4.5 6.8L18.9 2Zm-1.1 18h1.7L6.3 4H4.5l13.3 16Z"/></svg></span>
  </div>;
}

/** The blank starter uses native editable blocks, media selection and the shared lead form. */
export function BlankStarterBlock({ block, canvas, renderForm }: {
  block: LandingPageBlock;
  canvas: LandingPageCanvasHandlers | null;
  renderForm: ReactNode;
}) {
  const text = (field: string, value: string | undefined, as: 'h1'|'h2'|'h3'|'p'|'span' = 'p') =>
    <InlineEditable blockId={block.id} field={field} value={value || ''} as={as}
      handlers={canvas} blockStyle={block.style as Record<string, unknown>}
      multiline={as !== 'span'} textRole={as.startsWith('h') ? 'heading' : field === 'ctaLabel' ? 'button' : 'paragraph'} />;
  const media = (src: string | null | undefined, field = 'image', style?: LandingPageImageStyle) => {
    const item = field.startsWith('itemImage:') ? field.slice(10) : null;
    return <ElementChrome blockId={block.id} element={item ? `item:${item}` : 'image'}
      field={item ? field : undefined} kind="image" handlers={canvas}
      blockStyle={block.style as Record<string, unknown>}>
      <LpContentImage key={src} src={src || BLANK_STARTER_IMAGE} alt={style?.alt || 'Ảnh minh họa'}
        loading="eager" style={lpImgStyle(style)} data-lp-img-motion={lpImgMotionAttr(style)} />
    </ElementChrome>;
  };
  const section = (className: string, children: ReactNode) =>
    <section className={`blank-section ${className}`} style={landingPageSectionSurfaceStyle(block)}>{children}</section>;
  switch (block.type) {
    case 'Header':
      return section('blank-header', <div className="blank-container blank-header-inner">
        <div className="blank-logo">{media(block.imageUrl)}{text('headline', block.headline, 'span')}</div><SocialIcons />
      </div>);
    case 'Hero':
    case 'CTA': {
      const href = block.ctaUrl || '#lead-form';
      return section(block.type === 'Hero' ? 'blank-hero' : 'blank-cta', <div className="blank-container blank-centered">
        {block.type === 'Hero' ? <div className="blank-hero-image">{media(block.imageUrl, 'image', block.imageStyle)}</div> : null}
        {text('headline', block.headline, block.type === 'Hero' ? 'h1' : 'h2')}
        {text('subheadline', block.subheadline)}
        {block.body ? text('body', block.body) : null}
        {block.ctaLabel ? <ElementChrome blockId={block.id} element="cta" kind="button" handlers={canvas} blockStyle={block.style as Record<string, unknown>} className="mt-9"><a className="blank-button" style={{marginTop:0}} href={href} onClick={e => {
          if (canvas) { e.preventDefault(); return; }
          if (href.startsWith('#')) {
            const target = e.currentTarget.closest('[data-lp-canvas-root]')?.querySelector(`[id="${CSS.escape(href.slice(1))}"]`);
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
          }
        }}>{text('ctaLabel', block.ctaLabel, 'span')}</a></ElementChrome> : null}
      </div>);
    }
    case 'LeadForm':
      return section('blank-registration', <div className="blank-container">
        {text('headline', block.headline, 'h2')}
        <div className="blank-registration-grid"><div className="blank-intro">{text('subheadline', block.subheadline)}</div><div className="blank-form">{renderForm}</div></div>
      </div>);
    case 'Features':
      return section('blank-features', <div className="blank-container">
        {block.headline ? text('headline', block.headline, 'h2') : null}
        {block.subheadline ? text('subheadline', block.subheadline) : null}
        <div className="blank-feature-grid">{block.items.map((item, index) =>
          <ItemReorderChrome key={item.id} blockId={block.id} itemId={item.id} index={index} handlers={canvas}>
            <div className="blank-feature" {...itemBoxDomProps(block, item.id)}>
              <div className="blank-feature-image">{media(item.imageUrl, `itemImage:${item.id}`, item.imageStyle)}</div>
              <div className="blank-feature-copy">{text(`itemTitle:${item.id}`, item.title, 'h3')}{text(`itemDesc:${item.id}`, item.description)}</div>
            </div>
          </ItemReorderChrome>)}</div>
      </div>);
    case 'Footer':
      return section('blank-footer', <div className="blank-container blank-centered"><SocialIcons />
        {block.headline ? text('headline', block.headline, 'h2') : null}{block.body ? text('body', block.body) : null}
      </div>);
    default: return null;
  }
}

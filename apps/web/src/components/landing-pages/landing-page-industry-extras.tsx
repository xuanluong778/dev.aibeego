'use client';
import type { LandingPageBlock, LandingPageSpec } from '@marketingspa/shared';
import {
  InlineEditable,
  ElementChrome,
  ItemReorderChrome,
  type LandingPageCanvasHandlers,
} from './landing-page-canvas-ux';
import { landingPageSectionSurfaceStyle } from './landing-page-section-surface';
import { LpIndustryImage } from './landing-page-industry-image';
import {lpImgStyle} from './landing-page-content-image-style';
import type {LandingPageImageStyle} from '@marketingspa/shared';
import './landing-page-industry-variants.css';

/** Shared interaction primitives, with separate dining/service visual namespaces. */
export function IndustryExtraBlock({
  block,
  spec,
  canvas,
  prefix,
}: {
  block: LandingPageBlock;
  spec: LandingPageSpec;
  canvas: LandingPageCanvasHandlers | null;
  prefix: 'dining' | 'local';
}) {
  const text = (field: string, value: string | undefined, as: 'h2' | 'h3' | 'p' | 'span' = 'p') => (
    <InlineEditable
      as={as}
      blockId={block.id}
      field={field}
      value={value || ''}
      handlers={canvas}
      blockStyle={block.style as Record<string, unknown>}
      textRole={as.startsWith('h') ? 'heading' : 'paragraph'}
    />
  );
  const form = spec.blocks.find((b) => b.enabled && b.type === 'LeadForm');
  if (block.type === 'Pricing')
    return (
      <section
        id={block.id}
        className={`${prefix}-section ${prefix}-pricing`}
        style={landingPageSectionSurfaceStyle(block)}
      >
        <div className={`${prefix}-container`}>
          <div className={`${prefix}-section-head`}>
            {text('headline', block.headline, 'h2')}
            {text('subheadline', block.subheadline)}
          </div>
          <div className={`${prefix}-package-grid`}>
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
                    className={`${prefix}-package`}
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
                      className={`${prefix}-button`}
                      href={'#' + form?.id}
                      onClick={(e) => {
                        if (canvas) { e.preventDefault(); return; }
                        const section = document.getElementById(form?.id || '');
                        section?.querySelector('form')?.dispatchEvent(
                          new CustomEvent('lp-industry-choice', {
                            detail: {
                              key: prefix === 'dining' ? 'dining_option' : 'service_package',
                              label: plan.name,
                            },
                          }),
                        );
                        // Native fragment navigation keeps the target reliable across resizes.
                      }}
                    >
                      {text('planCta:' + plan.id, plan.ctaLabel || 'Trao đổi', 'span')}
                    </a>
                  </article>
                </ElementChrome>
              </ItemReorderChrome>
            ))}
          </div>
        </div>
      </section>
    );
  if (block.type === 'Video') {
    const posterStyle=block.style?.posterImageStyle as LandingPageImageStyle|undefined;
    const url = block.videoUrl || '',
      embed =
        /^https:\/\/(www\.)?(youtube(-nocookie)?\.com\/embed\/|player\.vimeo\.com\/video\/)/.test(
          url,
        );
    const playable = /^(https:\/\/|\/(?!\/))/.test(url);
    return (
      <section
        id={block.id}
        className={`${prefix}-section ${prefix}-story`}
        style={landingPageSectionSurfaceStyle(block)}
      >
        <div className={`${prefix}-container`}>
          <div className={`${prefix}-section-head`}>{text('headline', block.headline, 'h2')}</div>
          <ElementChrome
            blockId={block.id}
            element="image"
            kind="image"
            handlers={canvas}
            blockStyle={block.style as Record<string, unknown>}
          >
            <div className={`${prefix}-story-media`}>
              {playable ? (
                embed ? (
                  <iframe title={block.headline || 'Video giới thiệu'} src={url} allowFullScreen />
                ) : (
                  <video
                    controls
                    preload="metadata"
                    src={url}
                    poster={block.posterUrl || undefined}
                    aria-label={block.headline || 'Video giới thiệu'}
                  />
                )
              ) : (
                <>
                  <LpIndustryImage
                    src={block.posterUrl || ''}
                    alt={block.headline || "Ảnh bìa video giới thiệu"} imageStyle={posterStyle} canvas={Boolean(canvas)} style={lpImgStyle(posterStyle)}
                    loading="eager"
                  />
                  <p data-industry-video-placeholder>
                    Chưa có video giới thiệu. Chủ trang có thể bổ sung video được phép sử dụng; ảnh
                    này chỉ minh họa vị trí nội dung.
                  </p>
                </>
              )}
            </div>
          </ElementChrome>
        </div>
      </section>
    );
  }
  return null;
}

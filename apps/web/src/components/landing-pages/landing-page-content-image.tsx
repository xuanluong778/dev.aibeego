'use client';

import { useState, type CSSProperties } from 'react';

export type LpContentImageProps = {
  src: string;
  alt?: string;
  /** Shown on branded fallback when load fails or src empty. */
  fallbackLabel?: string;
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  decoding?: 'async' | 'auto' | 'sync';
  'data-lp-img-motion'?: string;
};

function brandedFallbackStyle(style?: CSSProperties): CSSProperties {
  return {
    ...style,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    background:
      'linear-gradient(145deg, color-mix(in srgb, var(--lp-primary) 20%, var(--lp-surface)) 0%, color-mix(in srgb, var(--lp-secondary) 12%, var(--lp-surface)) 100%)',
    color: 'color-mix(in srgb, var(--lp-secondary) 88%, #0f172a)',
    fontSize: '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.02em',
    lineHeight: 1.35,
    boxSizing: 'border-box',
  };
}

/** Catalog-safe content image — never shows broken icon or raw alt text. */
export function LpContentImage({
  src,
  alt = '',
  fallbackLabel,
  width,
  height,
  className,
  style,
  loading = 'lazy',
  fetchPriority,
  decoding = 'async',
  'data-lp-img-motion': imgMotion,
}: LpContentImageProps) {
  const [failed, setFailed] = useState(false);
  const trimmed = (src || '').trim();
  const label = fallbackLabel || alt || 'Visual';
  const decorative = !alt.trim();

  if (!trimmed || failed) {
    return (
      <div
        data-lp-img-fallback="1"
        data-lp-content-image="1"
        aria-hidden={decorative ? true : undefined}
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : label}
        className={className}
        style={brandedFallbackStyle(style)}
      >
        <span data-lp-img-fallback-label="1">{label}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={trimmed}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding={decoding}
      className={className}
      style={style}
      data-lp-content-image="1"
      data-lp-img-motion={imgMotion}
      onError={() => setFailed(true)}
    />
  );
}

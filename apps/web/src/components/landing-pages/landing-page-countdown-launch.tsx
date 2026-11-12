'use client';

import { useRef, useState, type CSSProperties, type FormEvent } from 'react';
import type { LandingPageCountdownBlock } from '@marketingspa/shared';
import {
  countdownPresetById,
  isCountdownLaunchStyle,
} from '@marketingspa/shared';
import {
  InlineEditable,
  type LandingPageCanvasHandlers,
} from './landing-page-canvas-ux';
import { LandingPageCountdownLive } from './landing-page-countdown';
import './landing-page-countdown.css';

const COUNTDOWN_FONTS =
  'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@500;600;700&family=Playfair+Display:wght@500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap';

let fontsInjected = false;
function ensureCountdownFonts() {
  if (typeof document === 'undefined' || fontsInjected) return;
  if (document.getElementById('lp-countdown-fonts')) {
    fontsInjected = true;
    return;
  }
  const link = document.createElement('link');
  link.id = 'lp-countdown-fonts';
  link.rel = 'stylesheet';
  link.href = COUNTDOWN_FONTS;
  document.head.appendChild(link);
  fontsInjected = true;
}

function tokenStyle(tokens: NonNullable<ReturnType<typeof countdownPresetById>>['tokens']): CSSProperties {
  return {
    ['--cd-bg' as string]: tokens.bg,
    ['--cd-bg-image' as string]: tokens.bgImage || 'none',
    ['--cd-bg-size' as string]: 'auto',
    ['--cd-text' as string]: tokens.text,
    ['--cd-muted' as string]: tokens.muted,
    ['--cd-accent' as string]: tokens.accent,
    ['--cd-digit' as string]: tokens.digit,
    ['--cd-form-bg' as string]: tokens.formBg,
    ['--cd-form-border' as string]: tokens.formBorder,
    ['--cd-form-radius' as string]: tokens.formRadius,
    ['--cd-input-bg' as string]: tokens.inputBg,
    ['--cd-input-border' as string]: tokens.inputBorder,
    ['--cd-input-color' as string]: tokens.inputColor,
    ['--cd-input-radius' as string]: tokens.inputRadius,
    ['--cd-cta-bg' as string]: tokens.ctaBg,
    ['--cd-cta-color' as string]: tokens.ctaColor,
    ['--cd-kicker' as string]: tokens.kicker,
    ['--cd-headline-font' as string]:
      tokens.headlineFont || '"Be Vietnam Pro", "Plus Jakarta Sans", "Segoe UI", sans-serif',
    ['--cd-digit-font' as string]:
      tokens.digitFont || '"Be Vietnam Pro", "Plus Jakarta Sans", "Segoe UI", sans-serif',
    backgroundColor: tokens.bg,
    backgroundImage: tokens.bgImage,
    backgroundSize: tokens.bgImage?.includes('linear-gradient(90deg') ? undefined : undefined,
    color: tokens.text,
  };
}

export function LandingPageCountdownLaunch({
  block,
  primary,
  canvas,
  onLeadSubmit,
  onFormStart,
}: {
  block: LandingPageCountdownBlock;
  primary: string;
  canvas?: LandingPageCanvasHandlers | null;
  onLeadSubmit?: (fields: Record<string, string>, blockId: string) => Promise<void> | void;
  onFormStart?: () => void;
}) {
  const preset = countdownPresetById(block.styleVariant);
  const tokens = preset?.tokens;
  const started = useRef(false);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (typeof document !== 'undefined') ensureCountdownFonts();
  if (!tokens || !isCountdownLaunchStyle(block.styleVariant)) return null;

  const kicker = block.kicker || preset?.kicker || 'Aibeego';
  const formTitle = block.formHeadline || preset?.formHeadline || 'Đăng ký nhận thông báo';
  const submitLabel = block.submitLabel || preset?.submitLabel || 'Đăng ký ngay';
  const showForm = block.showSignup !== false;
  const blockStyle = (block.style || {}) as Record<string, unknown>;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (canvas) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const fields: Record<string, string> = {
      name: String(data.get('name') || ''),
      email: String(data.get('email') || ''),
    };
    if (!fields.name.trim() || !fields.email.trim()) {
      setError('Vui lòng điền họ tên và email.');
      return;
    }
    setError(null);
    setPending(true);
    try {
      await onLeadSubmit?.(fields, block.id);
      setSuccess(true);
      form.reset();
    } catch {
      setError('Chưa gửi được. Thử lại giúp bạn.');
    } finally {
      setPending(false);
    }
  }

  const surface: CSSProperties = tokenStyle(tokens);
  const sans = '"Be Vietnam Pro", "Plus Jakarta Sans", "Segoe UI", sans-serif';
  const face = tokens.headlineFont || sans;
  const champ = block.styleVariant === 'champagne-editorial';
  const lime = block.styleVariant === 'lime-terminal';
  const textLock: CSSProperties = {
    fontFamily: champ ? face : sans,
    textTransform: 'none',
    hyphens: 'manual',
    overflowWrap: 'normal',
    wordBreak: 'normal',
  };
  const kickerStyle: CSSProperties = {
    ...textLock,
    fontFamily: champ ? face : sans,
    color: tokens.kicker,
    fontWeight: 600,
    fontSize: champ ? '1.7rem' : '1.35rem',
    letterSpacing: '-0.02em',
    lineHeight: 1.15,
  };
  const headlineStyle: CSSProperties = {
    ...textLock,
    fontFamily: face,
    color: lime ? '#d6f25c' : tokens.text,
    fontWeight: champ ? 600 : 800,
    fontSize: 'clamp(2.15rem, 3.5vw, 3.25rem)',
    lineHeight: champ ? 1.05 : 1.08,
    letterSpacing: champ ? '-0.02em' : '-0.038em',
    maxWidth: champ ? '7.6em' : '9.35em',
  };
  const subStyle: CSSProperties = {
    ...textLock,
    color: tokens.muted,
    fontWeight: 400,
    fontSize: '1.02rem',
    lineHeight: 1.55,
  };
  const formTitleStyle: CSSProperties = {
    ...textLock,
    fontFamily: champ ? face : sans,
    color: lime ? '#ffffff' : tokens.text,
    fontWeight: 700,
    fontSize: '1.28rem',
    letterSpacing: '-0.025em',
    lineHeight: 1.25,
    maxWidth: 'none',
  };
  const inputStyle: CSSProperties = {
    background: tokens.inputBg,
    color: tokens.inputColor,
    border: tokens.inputBorder,
    borderRadius: tokens.inputRadius,
    fontFamily: champ ? face : sans,
    fontSize: '0.95rem',
    fontWeight: 500,
  };
  const buttonStyle: CSSProperties = {
    background: tokens.ctaBg,
    color: tokens.ctaColor,
    borderRadius: tokens.inputRadius,
    fontFamily: champ ? face : sans,
    fontWeight: 700,
    fontSize: '0.98rem',
    textTransform: 'none',
  };

  return (
    <section
      className="lp-cd-launch"
      data-lp-countdown
      data-lp-countdown-launch="1"
      data-lp-countdown-theme={block.styleVariant}
      style={surface}
    >
      <div className="lp-cd-atmos" aria-hidden="true" />
      <div className="lp-cd-launch-inner">
        <div className="lp-cd-copy">
          {canvas ? (
            <InlineEditable
              as="div"
              blockId={block.id}
              field="kicker"
              value={kicker}
              handlers={canvas}
              blockStyle={blockStyle}
              textRole="paragraph"
              className="lp-cd-kicker"
              style={kickerStyle}
            />
          ) : (
            <div className="lp-cd-kicker" style={kickerStyle}>{kicker}</div>
          )}
          {canvas ? (
            <InlineEditable
              as="h2"
              blockId={block.id}
              field="headline"
              value={block.headline || ''}
              handlers={canvas}
              blockStyle={blockStyle}
              textRole="heading"
              className="lp-cd-headline"
              style={headlineStyle}
            />
          ) : (
            <h2 className="lp-cd-headline" style={headlineStyle}>{block.headline}</h2>
          )}
          {canvas ? (
            <InlineEditable
              as="p"
              blockId={block.id}
              field="subheadline"
              value={block.subheadline || ''}
              handlers={canvas}
              blockStyle={blockStyle}
              multiline
              textRole="paragraph"
              className="lp-cd-sub"
              style={subStyle}
            />
          ) : (
            <p className="lp-cd-sub" style={subStyle}>{block.subheadline}</p>
          )}
          <LandingPageCountdownLive
            block={block}
            primary={primary}
            blockId={block.id}
            canvas={canvas}
          />
        </div>
        {showForm ? (
          <form
            className="lp-cd-form"
            data-lp-cd-form-theme={block.styleVariant}
            data-lp-countdown-form="1"
            style={{
              background: tokens.formBg,
              border: tokens.formBorder,
              borderRadius: tokens.formRadius,
              color: tokens.text,
              fontFamily: champ ? face : sans,
            }}
            onSubmit={onSubmit}
            onFocus={() => {
              if (!started.current) {
                started.current = true;
                onFormStart?.();
              }
            }}
          >
            {canvas ? (
              <InlineEditable
                as="h3"
                blockId={block.id}
                field="formHeadline"
                value={formTitle}
                handlers={canvas}
                blockStyle={blockStyle}
                textRole="heading"
                className="lp-cd-form-title"
                style={formTitleStyle}
              />
            ) : (
              <h3 className="lp-cd-form-title" style={formTitleStyle}>{formTitle}</h3>
            )}
            {success ? (
              <p className="lp-cd-form-msg">Cảm ơn bạn! Chúng tôi sẽ thông báo khi ra mắt.</p>
            ) : (
              <>
                <label htmlFor={`${block.id}-cd-name`} style={{ color: tokens.muted, fontFamily: champ ? face : sans }}>Họ và tên</label>
                <input
                  id={`${block.id}-cd-name`}
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Nguyễn Minh Anh"
                  readOnly={Boolean(canvas)}
                  style={inputStyle}
                />
                <label htmlFor={`${block.id}-cd-email`} style={{ color: tokens.muted, fontFamily: champ ? face : sans }}>Email</label>
                <input
                  id={`${block.id}-cd-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="ban@example.com"
                  readOnly={Boolean(canvas)}
                  style={inputStyle}
                />
                <button type="submit" disabled={pending || Boolean(canvas)} style={buttonStyle}>
                  {pending ? 'Đang gửi…' : submitLabel}
                </button>
                {error ? (
                  <p className="lp-cd-form-msg" role="alert">
                    {error}
                  </p>
                ) : null}
              </>
            )}
          </form>
        ) : null}
      </div>
    </section>
  );
}

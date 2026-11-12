'use client';

/**
 * Landing Page Form Library Modal.
 * Displays visual popup modal for choosing form designs / templates.
 * Matches exact layout: dark left navigation + rich visual preview cards on light canvas.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import {
  LP_FORM_LIBRARY_CATEGORIES,
  getFormLibraryTemplatesByCategory,
  type LpFormLibraryCategoryId,
  type LpFormLibraryTemplate,
} from './landing-page-form-library-catalog';
import { cn } from '@/lib/utils';

export type LandingPageFormLibraryModalProps = {
  open: boolean;
  onClose: () => void;
  onInsertTemplate: (template: LpFormLibraryTemplate) => void;
};

export function LandingPageFormLibraryModal({
  open,
  onClose,
  onInsertTemplate,
}: LandingPageFormLibraryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<LpFormLibraryCategoryId>('register');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const templates = useMemo(
    () => getFormLibraryTemplatesByCategory(activeCategory),
    [activeCategory],
  );

  const handleSelect = useCallback(
    (template: LpFormLibraryTemplate) => {
      onInsertTemplate(template);
      onClose();
    },
    [onInsertTemplate, onClose],
  );

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6"
      data-lp-form-library-modal="1"
      role="dialog"
      aria-modal="true"
      aria-label="Thư viện Biểu mẫu"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative flex h-full max-h-[calc(100dvh-2rem)] w-full max-w-[1040px] flex-col overflow-hidden rounded-2xl border border-zinc-700/50 bg-[#161a23] shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:flex-row"
        data-lp-form-library-shell
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Left Sidebar */}
        <aside
          className="relative flex w-full shrink-0 flex-col border-b border-zinc-800 bg-[#161a23] p-5 sm:w-[220px] sm:border-b-0 sm:border-r sm:overflow-y-auto"
          data-lp-form-library-nav
        >
          <div className="mb-6 flex items-center justify-between sm:block">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-white">
              BIỂU MẪU
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white sm:hidden"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-row gap-1 overflow-x-auto sm:flex-col sm:overflow-visible">
            {LP_FORM_LIBRARY_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  data-lp-form-category={cat.id}
                  data-active={isActive ? '1' : '0'}
                  className={cn(
                    'group relative flex w-full shrink-0 items-center whitespace-nowrap px-3 py-2 text-left text-[13px] transition sm:whitespace-normal',
                    isActive
                      ? 'font-bold text-white'
                      : 'font-medium text-zinc-400 hover:text-zinc-200',
                  )}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span className="relative z-10">{cat.label}</span>
                  {/* Active arrow indicator pointing into the right panel */}
                  {isActive ? (
                    <span
                      className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 translate-x-full border-y-[6px] border-l-[8px] border-y-transparent border-l-[#161a23] sm:block"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content Area */}
        <section
          className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f3f4f7]"
          data-lp-form-library-content
        >
          {/* Top Bar with Close Button */}
          <div className="flex shrink-0 items-center justify-end px-4 py-2.5">
            <button
              type="button"
              onClick={onClose}
              className="hidden rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-700 sm:inline-flex"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Grid of Visual Form Cards */}
          <div
            className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-1 sm:px-7"
            data-lp-form-library-scroll
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  data-lp-form-card={tpl.id}
                  role="button"
                  tabIndex={0}
                  className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-zinc-200/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  onClick={() => handleSelect(tpl)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(tpl);
                    }
                  }}
                >
                  {/* Card Visual Form Preview */}
                  <div
                    className="relative flex flex-col items-center justify-center min-h-[220px] overflow-hidden bg-black"
                    style={{ backgroundColor: tpl.preview.outerBg }}
                  >
                    {/* Inner form container if present (e.g. Card 1, 4, 5, 6 have centered column on black) */}
                    <div
                      className={cn(
                        'flex flex-col gap-3 py-5 transition group-hover:scale-[1.01]',
                        tpl.preview.innerBg && tpl.preview.innerBg !== tpl.preview.outerBg
                          ? 'w-[75%] min-h-[220px] justify-center px-5'
                          : 'w-full max-w-[340px] min-h-[220px] justify-center px-6',
                      )}
                      style={{
                        backgroundColor: tpl.preview.innerBg || 'transparent',
                        border: tpl.preview.innerBorder || 'none',
                      }}
                    >
                      {/* Inputs representation */}
                      {tpl.fields.slice(0, 2).map((field, idx) => {
                        const style = tpl.preview.inputStyle;
                        const labelPos = tpl.preview.labelPosition || (style === 'underline' ? 'above' : 'inside');

                        if (style === 'underline' || labelPos === 'above') {
                          return (
                            <div key={idx} className="w-full flex flex-col gap-1">
                              <span
                                className="text-[11px] font-medium tracking-wider"
                                style={{
                                  color: tpl.preview.labelColor,
                                  fontFamily: tpl.preview.fontFamily === 'serif' ? 'Georgia, serif' : 'inherit',
                                }}
                              >
                                {field.label || 'FIELD *'}
                              </span>
                              {style === 'underline' ? (
                                <div
                                  className="w-full h-4"
                                  style={{
                                    borderBottom: tpl.preview.inputBorderBottom || '1.5px solid currentColor',
                                  }}
                                />
                              ) : style === 'pill' ? (
                                <div
                                  className="w-full h-8 rounded-full flex items-center px-4"
                                  style={{
                                    backgroundColor: tpl.preview.inputBg,
                                    border: tpl.preview.inputBorder || 'none',
                                  }}
                                />
                              ) : (
                                <div
                                  className="w-full h-9 rounded-md flex items-center px-3"
                                  style={{
                                    backgroundColor: tpl.preview.inputBg,
                                    border: tpl.preview.inputBorder || 'none',
                                  }}
                                />
                              )}
                            </div>
                          );
                        }

                        if (style === 'pill') {
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-center px-4 py-2.5 text-[11px] font-medium tracking-wider shadow-sm"
                              style={{
                                backgroundColor: tpl.preview.inputBg,
                                border: tpl.preview.inputBorder || 'none',
                                borderRadius: '9999px',
                                color: tpl.preview.inputTextColor,
                                fontFamily: tpl.preview.fontFamily === 'serif' ? 'Georgia, serif' : 'inherit',
                              }}
                            >
                              <span>{field.label || 'FIELD *'}</span>
                            </div>
                          );
                        }

                        // Box style with label inside
                        return (
                          <div
                            key={idx}
                            className="flex items-center px-3.5 py-2.5 text-[11px] font-medium tracking-wide"
                            style={{
                              backgroundColor: tpl.preview.inputBg,
                              border: tpl.preview.inputBorder || 'none',
                              borderRadius: '6px',
                              color: tpl.preview.inputTextColor,
                              fontFamily: tpl.preview.fontFamily === 'serif' ? 'Georgia, serif' : 'inherit',
                            }}
                          >
                            <span>
                              {field.label.startsWith('Họ') || field.label.startsWith('Số')
                                ? field.placeholder || 'Nhập…'
                                : field.label}
                            </span>
                          </div>
                        );
                      })}

                      {/* Submit button representation */}
                      <div className="mt-2 flex justify-center">
                        <button
                          type="button"
                          tabIndex={-1}
                          className="px-6 py-2 text-[11px] font-bold tracking-wider uppercase transition shadow-md group-hover:brightness-105 pointer-events-none"
                          style={{
                            backgroundColor: tpl.preview.buttonBg,
                            color: tpl.preview.buttonColor,
                            borderRadius: tpl.preview.buttonRadius || '9999px',
                            fontFamily: tpl.preview.fontFamily === 'serif' ? 'Georgia, serif' : 'inherit',
                          }}
                        >
                          {tpl.preview.buttonText}
                        </button>
                      </div>
                    </div>

                    {/* Interactive hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100">
                      <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-zinc-900 shadow-lg">
                        Chèn mẫu này
                      </span>
                    </div>
                  </div>

                  {/* Card Footer with label */}
                  <div className="flex items-center justify-between border-t border-zinc-100 bg-white px-3.5 py-2">
                    <span className="truncate text-xs font-semibold text-zinc-800">
                      {tpl.label}
                    </span>
                    <span className="text-[10px] font-medium text-amber-600">
                      Sử dụng mẫu →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>,
    document.body,
  );
}


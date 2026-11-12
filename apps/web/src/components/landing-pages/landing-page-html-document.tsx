'use client';

import { useEffect, useMemo, useRef } from 'react';
import { isolateHtmlDocument, replaceHtmlBody } from './landing-page-html-isolate';
import {
  applyHtmlNodePatch,
  pickHtmlTarget,
  readHtmlNode,
  stampHtmlNodeIds,
  type HtmlNodeSnapshot,
  type HtmlPatchFn,
} from './landing-page-html-nodes';

type Props = {
  /** Full uploaded document. Omit when rendering one section fragment. */
  html?: string;
  /** One section's markup. CSS comes from sharedCss so each section is its own block. */
  fragment?: string;
  sharedCss?: string;
  sharedFonts?: string[];
  sharedBackground?: string;
  /** Builder canvas: click text to edit, double-click an image to change its URL. */
  editable?: boolean;
  selectedNodeId?: string | null;
  /** Select the section root when the block is chosen from the layer list. */
  activateRoot?: boolean;
  onHtmlChange?: (html: string) => void;
  onFragmentChange?: (html: string) => void;
  onSelectNode?: (node: HtmlNodeSnapshot) => void;
  onBindPatch?: (patch: HtmlPatchFn | null) => void;
  onLeadSubmit?: (fields: Record<string, string>) => Promise<void> | void;
  onFormStart?: () => void;
};

function hasDirectText(el: HTMLElement): boolean {
  for (const child of el.childNodes) {
    if (child.nodeType === Node.TEXT_NODE && (child.textContent || '').replace(/\u00a0/g, ' ').trim()) {
      return true;
    }
  }
  return false;
}

function scrollParent(start: HTMLElement): Element | null {
  let node: HTMLElement | null = start.parentElement;
  while (node) {
    const overflow = getComputedStyle(node).overflowY;
    if ((overflow === 'auto' || overflow === 'scroll') && node.scrollHeight > node.clientHeight + 8) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function snapshotBody(body: HTMLElement): string {
  const clone = body.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[contenteditable], [data-lp-html-edit], .lp-html-selected').forEach((el) => {
    el.removeAttribute('contenteditable');
    el.removeAttribute('data-lp-html-edit');
    el.removeAttribute('spellcheck');
    el.removeAttribute('title');
    el.classList.remove('lp-html-selected');
  });
  return clone.innerHTML;
}

function markEditableText(body: HTMLElement) {
  body.querySelectorAll('*').forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    if (node.closest('svg, input, textarea, select')) return;
    if (node.parentElement?.closest('[data-lp-html-edit]')) return;
    if (!hasDirectText(node)) return;
    node.setAttribute('contenteditable', 'true');
    node.setAttribute('data-lp-html-edit', '1');
    node.setAttribute('spellcheck', 'true');
  });
  body.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('a, button')) event.preventDefault();
  });
}

function fragmentMarkup(body: HTMLElement): string {
  const root = body.firstElementChild;
  if (!(root instanceof HTMLElement)) return snapshotBody(body);
  const clone = root.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[contenteditable], [data-lp-html-edit], .lp-html-selected').forEach((el) => {
    el.removeAttribute('contenteditable');
    el.removeAttribute('data-lp-html-edit');
    el.removeAttribute('spellcheck');
    el.removeAttribute('title');
    el.classList.remove('lp-html-selected');
  });
  return clone.outerHTML;
}

function readFormFields(form: HTMLFormElement): Record<string, string> {
  const fields: Record<string, string> = {};
  const data = new FormData(form);
  for (const [key, value] of data.entries()) {
    if (typeof value === 'string' && key && !fields[key]) fields[key] = value.slice(0, 2000);
  }
  return fields;
}

/** Original HTML and CSS, isolated from the app. Imported scripts never run. */
export function LandingPageHtmlDocument({
  html = '',
  fragment,
  sharedCss,
  sharedFonts,
  sharedBackground,
  editable = false,
  selectedNodeId = null,
  activateRoot = false,
  onHtmlChange,
  onFragmentChange,
  onSelectNode,
  onBindPatch,
  onLeadSubmit,
  onFormStart,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLElement | null>(null);
  const renderedHtml = useRef('');
  const sourceKey = fragment ?? html;
  const sourceRef = useRef(sourceKey);
  const fragmentModeRef = useRef(Boolean(fragment));
  const onChangeRef = useRef(onHtmlChange);
  const onFragmentRef = useRef(onFragmentChange);
  const onSelectRef = useRef(onSelectNode);
  const onBindPatchRef = useRef(onBindPatch);
  const onLeadRef = useRef(onLeadSubmit);
  const onFormStartRef = useRef(onFormStart);
  onChangeRef.current = onHtmlChange;
  onFragmentRef.current = onFragmentChange;
  onSelectRef.current = onSelectNode;
  onBindPatchRef.current = onBindPatch;
  onLeadRef.current = onLeadSubmit;
  onFormStartRef.current = onFormStart;
  fragmentModeRef.current = Boolean(fragment);
  const background = useMemo(
    () => sharedBackground || (html ? isolateHtmlDocument(html).background : 'transparent'),
    [html, sharedBackground],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
    const existing = shadow.querySelector('[data-lp-html-body]');
    const keep = renderedHtml.current === sourceKey && existing instanceof HTMLElement;
    let body: HTMLElement;
    if (keep) {
      body = existing;
    } else {
      renderedHtml.current = sourceKey;
      const isolated = fragment
        ? {
            css: sharedCss || '',
            bodyHtml: fragment,
            fontHrefs: sharedFonts || [],
            background: sharedBackground || 'transparent',
          }
        : isolateHtmlDocument(html);
      shadow.replaceChildren();
      for (const href of isolated.fontHrefs) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = 'print';
        link.onload = () => {
          link.media = 'all';
        };
        shadow.appendChild(link);
      }
      const style = document.createElement('style');
      style.textContent =
        isolated.css +
        (editable
          ? `
          [data-lp-html-edit] { cursor: text; }
          [data-lp-html-edit]:hover { outline: 1px dashed rgba(201,168,76,.85); outline-offset: 3px; }
          [data-lp-html-edit]:focus { outline: 2px solid #C9A84C; outline-offset: 3px; }
          .lp-html-selected { outline: 2px solid #C9A84C !important; outline-offset: 4px; box-shadow: 0 0 0 1px rgba(201,168,76,.45); }
          img[data-lp-html-img] { cursor: pointer; }
          img[data-lp-html-img]:hover { outline: 2px solid #C9A84C; outline-offset: 3px; }
        `
          : '');
      shadow.appendChild(style);
      body = document.createElement('div');
      body.setAttribute('data-lp-html-body', '1');
      body.innerHTML = isolated.bodyHtml;
      body.querySelectorAll('script, iframe, object, embed').forEach((el) => el.remove());
      body.querySelectorAll('img').forEach((img, index) => {
        if (!(img instanceof HTMLImageElement)) return;
        if (!img.getAttribute('loading')) img.loading = index === 0 ? 'eager' : 'lazy';
        img.decoding = 'async';
      });
      body.style.containerName = 'lp';
      body.style.containerType = 'inline-size';
      shadow.appendChild(body);

      body.querySelectorAll('form').forEach((form) => {
        let started = false;
        let busy = false;
        form.addEventListener('focusin', () => {
          if (started) return;
          started = true;
          onFormStartRef.current?.();
        });
        form.addEventListener('submit', (event) => {
          event.preventDefault();
          if (busy) return;
          const submit = onLeadRef.current;
          if (!submit) return;
          busy = true;
          void Promise.resolve(submit(readFormFields(form))).finally(() => {
            busy = false;
          });
        });
      });

      bodyRef.current = body;
      sourceRef.current = sourceKey;
      const commit = () => {
        const current = bodyRef.current;
        if (!current) return;
        const next = fragmentModeRef.current
          ? fragmentMarkup(current)
          : replaceHtmlBody(sourceRef.current, snapshotBody(current));
        if (!next || next === sourceRef.current) return;
        renderedHtml.current = next;
        sourceRef.current = next;
        if (fragmentModeRef.current) onFragmentRef.current?.(next);
        else onChangeRef.current?.(next);
        const selected = current.querySelector('.lp-html-selected');
        if (selected instanceof HTMLElement) {
          const snap = readHtmlNode(selected);
          if (snap) onSelectRef.current?.(snap);
        }
      };
      if (editable) {
        markEditableText(body);
        body.querySelectorAll('img').forEach((img) => {
          if (!(img instanceof HTMLImageElement)) return;
          img.setAttribute('data-lp-html-img', '1');
          img.title = 'Bấm đúp để đổi ảnh';
          img.addEventListener('dblclick', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const nextUrl = window.prompt('Dán URL ảnh (https:// hoặc /uploads/...)', img.getAttribute('src') || '');
            if (!nextUrl || !/^(https:\/\/|\/)/i.test(nextUrl.trim())) return;
            img.src = nextUrl.trim();
            commit();
          });
        });
        body.addEventListener('focusout', (event) => {
          const target = event.target;
          if (!(target instanceof HTMLElement) || !target.matches('[data-lp-html-edit]')) return;
          commit();
        });
        body.addEventListener('click', (event) => {
          const target = event.target;
          if (!(target instanceof Element)) return;
          const picked = pickHtmlTarget(target);
          if (!picked) return;
          if (picked.matches('a, button')) event.preventDefault();
          body.querySelectorAll('.lp-html-selected').forEach((el) => el.classList.remove('lp-html-selected'));
          picked.classList.add('lp-html-selected');
          const snap = readHtmlNode(picked);
          if (snap) onSelectRef.current?.(snap);
        });
        if (stampHtmlNodeIds(body)) commit();
      }
    }

    const onFocusIn = () => host.setAttribute('data-lp-inline-editing', '1');
    const onFocusOut = () => {
      window.setTimeout(() => {
        if (!shadow.activeElement) host.removeAttribute('data-lp-inline-editing');
      }, 0);
    };
    if (editable) {
      host.addEventListener('focusin', onFocusIn);
      host.addEventListener('focusout', onFocusOut);
    }

    const motionTargets = body.querySelectorAll('.fade-up, .process-step, .reveal, [data-aos]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let observer: IntersectionObserver | null = null;
    if (reduceMotion) {
      motionTargets.forEach((el) => el.classList.add('visible'));
    } else if (motionTargets.length) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            if (!entry.target.classList.contains('visible')) entry.target.classList.add('visible');
            observer?.unobserve(entry.target);
          }
        },
        { root: scrollParent(host), rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
      );
      motionTargets.forEach((el) => observer?.observe(el));
    }

    return () => {
      observer?.disconnect();
      host.removeEventListener('focusin', onFocusIn);
      host.removeEventListener('focusout', onFocusOut);
    };
  }, [sourceKey, html, fragment, sharedCss, sharedFonts, sharedBackground, editable]);

  useEffect(() => {
    if (!editable) {
      onBindPatchRef.current?.(null);
      return;
    }
    const body = bodyRef.current;
    const ownsSelection =
      !fragmentModeRef.current ||
      Boolean(selectedNodeId && body?.querySelector(`[data-lp-node="${selectedNodeId}"]`));
    if (!ownsSelection) return;
    const patch: HtmlPatchFn = (id, nodePatch, commit) => {
      const current = bodyRef.current;
      if (!current || !/^n\d+$/.test(id)) return null;
      const el = current.querySelector(`[data-lp-node="${id}"]`);
      if (!(el instanceof HTMLElement)) return null;
      const target = Object.keys(nodePatch).length ? applyHtmlNodePatch(el, nodePatch) : el;
      if (commit) {
        const next = fragmentModeRef.current
          ? fragmentMarkup(current)
          : replaceHtmlBody(sourceRef.current, snapshotBody(current));
        if (next && next !== sourceRef.current) {
          renderedHtml.current = next;
          sourceRef.current = next;
          if (fragmentModeRef.current) onFragmentRef.current?.(next);
          else onChangeRef.current?.(next);
        }
      }
      return readHtmlNode(target);
    };
    onBindPatchRef.current?.(patch);
    return () => onBindPatchRef.current?.(null);
  }, [editable, selectedNodeId, sourceKey]);

  useEffect(() => {
    if (!activateRoot || !editable) return;
    const body = bodyRef.current;
    const root = body?.firstElementChild;
    if (!(root instanceof HTMLElement)) return;
    if (!root.getAttribute('data-lp-node')) return;
    const snap = readHtmlNode(root);
    if (snap) onSelectRef.current?.(snap);
  }, [activateRoot, editable, sourceKey]);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    body.querySelectorAll('.lp-html-selected').forEach((el) => el.classList.remove('lp-html-selected'));
    if (!selectedNodeId || !/^n\d+$/.test(selectedNodeId)) return;
    body.querySelector(`[data-lp-node="${selectedNodeId}"]`)?.classList.add('lp-html-selected');
  }, [selectedNodeId, sourceKey]);

  return (
    <div
      ref={hostRef}
      data-lp-html-document="1"
      data-lp-html-section={fragment ? '1' : undefined}
      data-lp-html-editable={editable ? '1' : '0'}
      style={{
        display: 'block',
        width: '100%',
        background,
        color: '#F0EDE6',
        containerName: 'lp',
        containerType: 'inline-size',
      }}
    />
  );
}

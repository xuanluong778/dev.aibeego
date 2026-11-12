import type { LandingPageSpec, LandingPageMotion } from '@marketingspa/shared';
import {
  lpMotionLocalKey,
  readLandingPageMotion,
  sanitizeLandingPageMotionStyle,
} from '@marketingspa/shared';

export const LP_MOTION_TRY_EVENT = 'aibeego:lp-motion-try';
export type LpMotionTryDetail = { blockId: string; key: string; motion?: LandingPageMotion };

// Individual transforms compose with the existing design/legacy transform. No wrapper/layout changes.
export const LP_MOTION_CSS = `
@keyframes aibeego-lpm-opacity { from { opacity: 0; } to { opacity: var(--aibeego-lpm-opacity, 1); } }
@keyframes aibeego-lpm-slide-down { from { translate: 0 calc(-1 * var(--aibeego-lpm-distance)); } to { translate: 0 0; } }
@keyframes aibeego-lpm-slide-up { from { translate: 0 var(--aibeego-lpm-distance); } to { translate: 0 0; } }
@keyframes aibeego-lpm-slide-right { from { translate: calc(-1 * var(--aibeego-lpm-distance)) 0; } to { translate: 0 0; } }
@keyframes aibeego-lpm-slide-left { from { translate: var(--aibeego-lpm-distance) 0; } to { translate: 0 0; } }
@keyframes aibeego-lpm-zoom-in { from { scale: .82; } to { scale: 1; } }
@keyframes aibeego-lpm-zoom-out { from { scale: 1.18; } to { scale: 1; } }
@keyframes aibeego-lpm-slide-down-right { from { translate: calc(-1 * var(--aibeego-lpm-diagonal)) calc(-1 * var(--aibeego-lpm-diagonal)); } to { translate: 0 0; } }
@keyframes aibeego-lpm-slide-down-left { from { translate: var(--aibeego-lpm-diagonal) calc(-1 * var(--aibeego-lpm-diagonal)); } to { translate: 0 0; } }
@keyframes aibeego-lpm-slide-up-right { from { translate: calc(-1 * var(--aibeego-lpm-diagonal)) var(--aibeego-lpm-diagonal); } to { translate: 0 0; } }
@keyframes aibeego-lpm-slide-up-left { from { translate: var(--aibeego-lpm-diagonal) var(--aibeego-lpm-diagonal); } to { translate: 0 0; } }
[data-lp-motion-clipping] { overflow: clip; }
@media (prefers-reduced-motion: no-preference) {
  [data-lp-motion-pending] { opacity: 0 !important; }
}
@media (prefers-reduced-motion: reduce) {
  [data-lp-motion-running] { animation: none !important; }
}
`;

/** Lookup is scoped to this renderer and the exact block owner, including portalled section elements. */
export function findLpMotionNode(
  root: HTMLElement,
  blockId: string,
  key: string,
): HTMLElement | null {
  const block = root.querySelector<HTMLElement>(`[data-lp-block-id="${CSS.escape(blockId)}"]`);
  if (!block) return null;
  if (key === 'section') return block;
  const owned = (selector: string) =>
    Array.from(block.querySelectorAll<HTMLElement>(selector)).find(
      (node) => node.closest('[data-lp-block-id]') === block,
    ) || null;
  const privateAnchor = owned(`[data-lp-motion-key="${CSS.escape(key)}"]`);
  if (privateAnchor) return privateAnchor;
  if (key.startsWith('grid:')) return owned(`[data-lp-grid-cell="${CSS.escape(key.slice(5))}"]`);
  if (key === 'image') {
    const image = owned(
      `[data-lp-element-id="${CSS.escape(`${blockId}::image`)}"], [data-lp-content-image="1"]`,
    );
    if (image) return image;
  }
  if (key.startsWith('field:')) {
    const field = CSS.escape(key.slice(6));
    const node = owned(
      `[data-lp-field-anchor="${field}"], [data-lp-inline-field="${field}"], [data-lp-element-field="${field}"], [data-lp-motion-field="${field}"]`,
    );
    if (!node) return null;
    // A CTA selects its full clickable surface, including background, border and icon.
    if (
      key === 'field:ctaLabel' ||
      key === 'field:submitLabel' ||
      key.startsWith('field:planCta:')
    ) {
      const button = node.closest<HTMLElement>('a,button,[data-lp-button-hit]');
      if (button && button.closest('[data-lp-block-id]') === block) return button;
    }
    // Text box carries its background, size and free-position chrome.
    const box = node.closest<HTMLElement>('[data-lp-inline-wrap], [data-lp-text-box]');
    if (box) return box;
    // Public inline text uses its existing text surface, without changing display or adding wrappers.
    if (getComputedStyle(node).display === 'inline') {
      for (
        let parent = node.parentElement;
        parent && parent !== block;
        parent = parent.parentElement
      ) {
        if (!/^(H[1-6]|P|SPAN|LABEL|DIV)$/.test(parent.tagName)) break;
        if (parent.querySelector('input,textarea,select,button,a,video,iframe,svg,img,[data-lp-item-id]'))
          break;
        const fields = parent.querySelectorAll('[data-lp-field-anchor],[data-lp-motion-field],[data-lp-inline-field],[data-lp-element-field]');
        if (Array.from(fields).some((field) => field !== node)) break;
        if (!['inline', 'contents'].includes(getComputedStyle(parent).display)) return parent;
      }
    }
    return node;
  }
  if (key.startsWith('item:') && !key.startsWith('item:trust-')) {
    const card = owned(`[data-lp-item-id="${CSS.escape(key.slice(5))}"]`);
    if (card) return card;
    return owned(
      `[data-lp-element-id="${CSS.escape(`${blockId}::${key}`)}"]:not([data-lp-element-kind="text"])`,
    );
  }
  return owned(`[data-lp-element-id="${CSS.escape(`${blockId}::${key}`)}"]`);
}

export function lpMotionScrollRoot(node: HTMLElement): HTMLElement | null {
  for (let parent = node.parentElement; parent; parent = parent.parentElement) {
    if (parent === document.body || parent === document.documentElement) return null;
    if (
      /(auto|scroll|overlay)/.test(getComputedStyle(parent).overflowY) &&
      (parent.scrollHeight > parent.clientHeight + 1 ||
        parent.matches('[data-lp-canvas-scroll],[data-radix-scroll-area-viewport]'))
    )
      return parent;
  }
  return null;
}

const ANIMATION_PROPERTIES = [
  'animation-name',
  'animation-duration',
  'animation-delay',
  'animation-timing-function',
  'animation-iteration-count',
  'animation-direction',
  'animation-fill-mode',
  'animation-play-state',
  'animation-composition',
  'animation-timeline',
  'animation-range-start',
  'animation-range-end',
] as const;
/** Preserve each legacy animation, its timeline (including view()), and its original inline declaration. */
export function playLpMotion(
  node: HTMLElement,
  motion: LandingPageMotion,
  done: () => void,
): () => void {
  const style = node.style;
  const computed = getComputedStyle(node);
  const snapshot = [...ANIMATION_PROPERTIES, '--aibeego-lpm-opacity', '--aibeego-lpm-distance', '--aibeego-lpm-diagonal'].map(
    (name) => [name, style.getPropertyValue(name), style.getPropertyPriority(name)] as const,
  );
  // Read the full legacy style before writes: avoid forced style recalculation per longhand.
  const legacy = Object.fromEntries(
    ANIMATION_PROPERTIES.map((name) => [name, computed.getPropertyValue(name)]),
  );
  const opacity = computed.opacity;
  const canvas = node.closest<HTMLElement>('[data-lp-canvas-root]');
  const viewportWidth = Math.min(
    canvas?.clientWidth || Infinity,
    lpMotionScrollRoot(node)?.clientWidth || document.documentElement.clientWidth,
  );
  const distance = Math.round(Math.max(56, Math.min(96, viewportWidth * .085)));
  const names = computed.animationName.split(',').map((name) => name.trim());
  const spatial = motion.preset !== 'fade';
  const additions: Record<string, string[]> = {
    'animation-name': ['aibeego-lpm-opacity', ...(spatial ? [`aibeego-lpm-${motion.preset}`] : [])],
    'animation-duration': [`${motion.duration}ms`],
    'animation-delay': [`${motion.delay}ms`],
    'animation-timing-function': ['cubic-bezier(.25,.1,.25,1)', 'cubic-bezier(.22,1,.36,1)'],
    'animation-iteration-count': ['1'],
    'animation-direction': ['normal'],
    'animation-fill-mode': ['backwards'],
    'animation-play-state': ['running'],
    'animation-composition': ['replace', ...(spatial ? ['add'] : [])],
    'animation-timeline': ['auto'],
    'animation-range-start': ['normal'],
    'animation-range-end': ['normal'],
  };
  style.setProperty('--aibeego-lpm-opacity', opacity);
  style.setProperty('--aibeego-lpm-distance', `${distance}px`);
  style.setProperty('--aibeego-lpm-diagonal', `${Math.round(distance * Math.SQRT1_2)}px`);
  for (const name of ANIMATION_PROPERTIES) {
    const old = legacy[name]!.split(/,(?![^()]*\))/)
      .map((value) => value.trim())
      .filter(Boolean);
    const extra = additions[name]!;
    const values = Array.from({ length: names.length }, (_, i) => old[i % old.length] || 'initial');
    values.push(...Array.from({ length: spatial ? 2 : 1 }, (_, i) => extra[i % extra.length]!));
    style.setProperty(name, values.join(', '), 'important');
  }
  node.setAttribute('data-lp-motion-running', motion.preset);
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    for (const [name, value, priority] of snapshot) {
      if (value) style.setProperty(name, value, priority);
      else style.removeProperty(name);
    }
    node.removeAttribute('data-lp-motion-running');
    done();
  };
  const timer = window.setTimeout(finish, motion.duration + motion.delay + 40);
  return finish;
}

/** One lifetime per renderer view; editor auditions are transient events and never mutate the spec. */
export function installLpMotion(
  root: HTMLElement,
  spec: LandingPageSpec,
  editing: boolean,
  played = new Set<string>(),
): () => void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  type Queue = {
    scrollRoot: HTMLElement | null;
    inset: number;
    ready: Set<HTMLElement>;
    running: Map<HTMLElement, { finish: number; top: number; left: number; width: number; height: number; duration: number }>;
    nextAt: number;
    frame?: number;
    timer?: number;
  };
  type Waiting = { id: string; motion: LandingPageMotion; queue: Queue; top: number; left: number };
  const active = new Map<HTMLElement, () => void>();
  const observers = new Map<HTMLElement | null, IntersectionObserver>();
  const queues = new Map<HTMLElement | null, Queue>();
  const pending = new Map<HTMLElement, Waiting>();
  let clipping = 0;
  let stopped = false;
  const frames = new Set<number>();
  const play = (node: HTMLElement, motion: LandingPageMotion, onDone?: () => void): boolean => {
    active.get(node)?.();
    // Never hide focused CTA/form or their ancestors, even during the delay.
    if (reduced.matches || node.contains(document.activeElement)) return false;
    clipping++;
    root.setAttribute('data-lp-motion-clipping', '1');
    active.set(
      node,
      playLpMotion(node, motion, () => {
        active.delete(node);
        if (--clipping === 0) root.removeAttribute('data-lp-motion-clipping');
        onDone?.();
      }),
    );
    return true;
  };
  const clearQueueTimer = (queue: Queue) => {
    clearTimeout(queue.timer);
    queue.timer = undefined;
  };
  const requestDrain = (queue: Queue) => {
    if (stopped) return;
    clearQueueTimer(queue);
    if (!queue.ready.size || queue.frame !== undefined) return;
    // Batch IO notifications and portalled elements before sorting visual order.
    const frame = requestAnimationFrame(() => {
      frames.delete(frame);
      queue.frame = undefined;
      if (!stopped) drain(queue);
    });
    queue.frame = frame;
    frames.add(frame);
  };
  const position = (rect: DOMRectReadOnly, queue: Queue) => {
    const scroll = queue.scrollRoot;
    const bounds = scroll?.getBoundingClientRect();
    return {
      top: rect.top + (scroll ? scroll.scrollTop - bounds!.top : window.scrollY),
      left: rect.left + (scroll ? scroll.scrollLeft - bounds!.left : window.scrollX),
    };
  };
  const drain = (queue: Queue) => {
    if (reduced.matches) {
      stop();
      return;
    }
    if (document.hidden) return;
    const bounds = queue.scrollRoot?.getBoundingClientRect();
    const viewport = {
      top: Math.max(0, bounds?.top ?? 0),
      bottom: Math.min(window.innerHeight, (bounds?.bottom ?? window.innerHeight) - queue.inset),
      left: Math.max(0, bounds?.left ?? 0),
      right: Math.min(window.innerWidth, bounds?.right ?? window.innerWidth),
    };
    const visible: Array<{ node: HTMLElement; waiting: Waiting; rect: DOMRect }> = [];
    // Read the batch before animation writes. Offscreen entries stay observed and
    // are never marked played: a fast scroll must not consume their entrance.
    for (const node of queue.ready) {
      const waiting = pending.get(node);
      if (!waiting || !root.contains(node)) {
        queue.ready.delete(node);
        continue;
      }
      const rect = node.getBoundingClientRect();
      if (!(rect.width > 0 && rect.height > 0 && rect.bottom > viewport.top &&
        rect.top < viewport.bottom && rect.right > viewport.left && rect.left < viewport.right)) continue;
      if (![...queue.running.keys()].some(parent => parent.contains(node)))
        Object.assign(waiting, position(rect, queue));
      visible.push({ node, waiting, rect });
    }
    visible.sort((a, b) => {
      if (a.node.contains(b.node)) return -1;
      if (b.node.contains(a.node)) return 1;
      return Math.abs(a.waiting.top - b.waiting.top) > 12
        ? a.waiting.top - b.waiting.top
        : a.waiting.left - b.waiting.left;
    });
    const next = visible[0];
    if (!next) return;
    const { node, waiting } = next;
    const now = performance.now();
    const total = waiting.motion.delay + waiting.motion.duration + 40;
    const offsetTop = queue.scrollRoot ? queue.scrollRoot.scrollTop - bounds!.top : window.scrollY;
    const offsetLeft = queue.scrollRoot ? queue.scrollRoot.scrollLeft - bounds!.left : window.scrollX;
    const runningInView = [...queue.running].filter(([other, task]) => {
      if (other.contains(node) || node.contains(other)) return true;
      // Use the design slot: an entrance translation may temporarily move the
      // painted box outside the viewport, but must not collapse the stagger gap.
      const top = task.top - offsetTop, left = task.left - offsetLeft;
      return top + task.height > viewport.top && top < viewport.bottom &&
        left + task.width > viewport.left && left < viewport.right;
    });
    // A previous viewport must not hold up newly visible content after a fast scroll.
    let due = runningInView.length ? queue.nextAt : 0;
    for (const [other, task] of runningInView) {
      // Even with mixed user durations, later elements must finish after earlier ones.
      due = Math.max(due, task.finish - total + 70);
      if (other.contains(node) || node.contains(other)) {
        // Never compound an entrance transform with an animated ancestor/child.
        due = Math.max(due, task.finish, now + 16);
      } else if (task.top < waiting.top - 12) {
        // A lower row joins only the soft tail of the row above it.
        due = Math.max(due, task.finish - Math.min(120, task.duration * .18));
      }
    }
    if (due > now) {
      clearQueueTimer(queue);
      queue.timer = window.setTimeout(() => {
        queue.timer = undefined;
        requestDrain(queue);
      }, Math.max(1, Math.ceil(due - now)));
      return;
    }
    queue.ready.delete(node);
    pending.delete(node);
    observers.get(queue.scrollRoot)?.unobserve(node);
    node.removeAttribute('data-lp-motion-pending');
    played.add(waiting.id);
    queue.running.set(node, {
      finish: now + total, top: waiting.top, left: waiting.left,
      width: next.rect.width, height: next.rect.height, duration: waiting.motion.duration,
    });
    const started = play(node, waiting.motion, () => {
      queue.running.delete(node);
      requestDrain(queue);
    });
    if (started) {
      queue.nextAt = now + waiting.motion.delay + Math.max(140, Math.min(260, waiting.motion.duration * .4));
    } else queue.running.delete(node);
    requestDrain(queue);
  };
  let discovery: MutationObserver | undefined;
  let discoveryTimer: number | undefined;
  const register = (blockId: string, key: string, motion: LandingPageMotion): boolean => {
    const id = `${blockId}::${key}`;
    if (played.has(id)) return true;
    const node = findLpMotionNode(root, blockId, key);
    if (!node) return false;
    if (node.contains(document.activeElement)) {
      played.add(id);
      return true;
    }
    // Progressive enhancement: without IO leave the original HTML visible.
    if (typeof IntersectionObserver === 'undefined') return true;
    const scrollRoot = lpMotionScrollRoot(node);
    let queue = queues.get(scrollRoot);
    if (!queue) {
      queue = {
        scrollRoot,
        inset: Math.round(Math.max(16, Math.min(80, (scrollRoot?.clientHeight || window.innerHeight) * .1))),
        ready: new Set(), running: new Map(), nextAt: 0,
      };
      queues.set(scrollRoot, queue);
    }
    const targetQueue = queue;
    let observer = observers.get(scrollRoot);
    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const target = entry.target as HTMLElement;
            const waiting = pending.get(target);
            if (!waiting) continue;
            if (entry.isIntersecting) targetQueue.ready.add(target);
            else targetQueue.ready.delete(target);
          }
          requestDrain(targetQueue);
        },
        {
          root: scrollRoot,
          // Enter the visible area before starting; a one-pixel intersection at
          // the lower edge would spend most of a larger entrance off screen.
          rootMargin: `0px 0px -${targetQueue.inset}px 0px`,
          threshold: 0,
        },
      );
      observers.set(scrollRoot, observer);
    }
    pending.set(node, { id, motion, queue, ...position(node.getBoundingClientRect(), queue) });
    // Armed only with working JS/IO. Keep the original layout as the IO target;
    // start the transform only on entry, avoiding a visible -> hidden flash on scroll.
    if (!node.contains(document.activeElement)) node.setAttribute('data-lp-motion-pending', '1');
    observer.observe(node);
    return true;
  };
  if (!editing && !reduced.matches) {
    let missing: Array<{ blockId: string; key: string; motion: LandingPageMotion }> = [];
    for (const block of spec.blocks) {
      if (!block.enabled) continue;
      const config = sanitizeLandingPageMotionStyle(block.style?.lpMotion);
      if (!config) continue;
      const entries = [
        ...(config.section ? [['section', config.section] as const] : []),
        ...Object.entries(config.elements || {}),
      ];
      for (const [key, motion] of entries) {
        if (!register(block.id, key, motion)) missing.push({ blockId: block.id, key, motion });
      }
    }
    // SectionElements mounts through portals after its layout pass. Discover only
    // unresolved configured targets, then disconnect as soon as they are mounted.
    if (missing.length && typeof MutationObserver !== 'undefined') {
      discovery = new MutationObserver(() => {
        missing = missing.filter((target) => !register(target.blockId, target.key, target.motion));
        if (!missing.length) {
          discovery?.disconnect();
          clearTimeout(discoveryTimer);
        }
      });
      discovery.observe(root, { childList: true, subtree: true });
      discoveryTimer = window.setTimeout(() => discovery?.disconnect(), 5000);
    }
  }
  const audition = (event: Event) => {
    if (!editing) return;
    const detail = (event as CustomEvent<LpMotionTryDetail>).detail;
    if (!detail) return;
    const motion = readLandingPageMotion({ lpMotion: { section: detail.motion } }, 'section');
    const node = findLpMotionNode(root, detail.blockId, detail.key);
    for (const cancel of Array.from(active.values())) cancel();
    if (node && motion) play(node, motion);
  };
  const reveal = (event: Event) => {
    const target = event.target as Node;
    for (const [node, cancel] of active)
      if (node.contains(target) || target.contains(node)) cancel();
    for (const [node, waiting] of pending)
      if (node.contains(target)) {
        played.add(waiting.id);
        pending.delete(node);
        waiting.queue.ready.delete(node);
        requestDrain(waiting.queue);
        node.removeAttribute('data-lp-motion-pending');
        for (const observer of observers.values()) observer.unobserve(node);
      }
  };
  const stop = () => {
    stopped = true;
    discovery?.disconnect();
    clearTimeout(discoveryTimer);
    for (const frame of frames) cancelAnimationFrame(frame);
    frames.clear();
    for (const queue of queues.values()) {
      clearQueueTimer(queue);
      queue.ready.clear();
    }
    for (const cancel of Array.from(active.values())) cancel();
    for (const observer of observers.values()) observer.disconnect();
    for (const node of pending.keys()) node.removeAttribute('data-lp-motion-pending');
    pending.clear();
  };
  const reduce = () => {
    if (reduced.matches) stop();
  };
  const retryVisible = () => {
    for (const queue of queues.values()) if (queue.ready.size) requestDrain(queue);
  };
  if (!editing) {
    window.addEventListener('scroll', retryVisible, { capture: true, passive: true });
    window.addEventListener('resize', retryVisible);
    document.addEventListener('visibilitychange', retryVisible);
  }
  root.addEventListener(LP_MOTION_TRY_EVENT, audition);
  root.addEventListener('focusin', reveal, true);
  root.addEventListener('pointerdown', reveal, true);
  reduced.addEventListener('change', reduce);
  return () => {
    stop();
    root.removeEventListener(LP_MOTION_TRY_EVENT, audition);
    root.removeEventListener('focusin', reveal, true);
    root.removeEventListener('pointerdown', reveal, true);
    reduced.removeEventListener('change', reduce);
    window.removeEventListener('scroll', retryVisible, true);
    window.removeEventListener('resize', retryVisible);
    document.removeEventListener('visibilitychange', retryVisible);
  };
}

export function tryLpMotion(
  target: { blockId: string; element?: string; field?: string },
  motion?: LandingPageMotion,
): void {
  const block = document.querySelector<HTMLElement>(
    `[data-lp-canvas-ux="1"] [data-lp-block-id="${CSS.escape(target.blockId)}"], [data-lp-interactive="1"] [data-lp-block-id="${CSS.escape(target.blockId)}"]`,
  );
  block?.dispatchEvent(
    new CustomEvent<LpMotionTryDetail>(LP_MOTION_TRY_EVENT, {
      bubbles: true,
      detail: { blockId: target.blockId, key: lpMotionLocalKey(target), motion },
    }),
  );
}

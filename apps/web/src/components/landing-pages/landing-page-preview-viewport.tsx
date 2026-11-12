'use client';

import { useLayoutEffect, type ReactNode } from 'react';

const PREVIEW = '[data-lp-preview-viewport]';
const CONTAINER = 'lp-builder-preview';

/** Split selector lists without splitting commas in :is(), attributes or strings. */
function selectors(value: string): string[] {
  const parts: string[] = [];
  let start = 0, depth = 0, quote = '';
  for (let i = 0; i < value.length; i += 1) {
    const c = value[i];
    if (value[i - 1] === '\\') continue;
    if (quote) { if (c === quote) quote = ''; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '(' || c === '[') depth += 1;
    if (c === ')' || c === ']') depth -= 1;
    if (c === ',' && depth === 0) { parts.push(value.slice(start, i)); start = i + 1; }
  }
  parts.push(value.slice(start));
  return parts;
}

function excludePreview(selector: string): string {
  return selectors(selector).map(s => {
    const pseudo = s.search(/::[a-z-]+(?:\([^)]*\))?\s*$/i);
    const at = pseudo < 0 ? s.length : pseudo;
    // :where keeps the original specificity for every page outside Builder.
    return `${s.slice(0, at)}:where(:not(${PREVIEW} *))${s.slice(at)}`;
  }).join(',');
}

function isWidthQuery(rule: CSSRule): rule is CSSMediaRule {
  return rule instanceof CSSMediaRule && /\b(?:min-|max-)?width\s*[:<>=]/.test(rule.conditionText);
}

function containerCondition(condition: string): string {
  return condition.replace(/\b(?:only\s+)?screen\s+and\s*/gi, '').replace(/^not all and\s*/i, 'not ');
}

function containerRule(rule: CSSRule): string {
  // Modern CSSStyleRule also exposes cssRules for nesting; keep its declarations.
  if (rule instanceof CSSStyleRule) return rule.cssText;
  if (isWidthQuery(rule)) {
    return `@container ${CONTAINER} ${containerCondition(rule.conditionText)}{${Array.from(rule.cssRules).map(containerRule).join('')}}`;
  }
  if ('cssRules' in rule) {
    const group = rule as CSSGroupingRule;
    return `${rule.cssText.slice(0, rule.cssText.indexOf('{'))}{${Array.from(group.cssRules).map(containerRule).join('')}}`;
  }
  return rule.cssText;
}

let users = 0;
let releaseStyles: (() => void) | null = null;

/**
 * Retarget width media rules to a named size container only while Builder is open.
 * Same DOM/event coordinate space: portals, selection and free-drag stay intact.
 * Rules are inserted beside their originals, preserving cascade order/specificity.
 */
function retainPreviewStyles(): () => void {
  users += 1;
  if (users === 1) {
    const seen = new WeakSet<CSSStyleSheet>();
    const originals: [CSSStyleRule, string][] = [];
    const inserted: [CSSStyleSheet | CSSGroupingRule, CSSRule][] = [];
    const exclude = (rules: CSSRuleList) => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule) {
          originals.push([rule, rule.selectorText]);
          rule.selectorText = excludePreview(rule.selectorText);
        } else if ('cssRules' in rule) exclude((rule as CSSGroupingRule).cssRules);
      }
    };
    const visit = (parent: CSSStyleSheet | CSSGroupingRule) => {
      for (let i = parent.cssRules.length - 1; i >= 0; i -= 1) {
        const rule = parent.cssRules[i];
        if (isWidthQuery(rule)) {
          try {
            const index = parent.insertRule(containerRule(rule), i + 1);
            inserted.push([parent, parent.cssRules[index]]);
            exclude(rule.cssRules);
          } catch { /* Leave unsupported/external rules unchanged. */ }
        } else if ('cssRules' in rule && !(rule instanceof CSSKeyframesRule)) {
          visit(rule as CSSGroupingRule);
        }
      }
    };
    const sync = () => {
      for (const sheet of Array.from(document.styleSheets)) {
        if (seen.has(sheet)) continue;
        try { visit(sheet); seen.add(sheet); } catch { /* Cross-origin font stylesheets. */ }
      }
    };
    sync();
    const observer = new MutationObserver(records => {
      if (records.some(record =>
        (record.target instanceof Element && record.target.closest('style')) ||
        Array.from(record.addedNodes).some(node => node instanceof Element &&
          (node.matches('style,link[rel="stylesheet"]') || node.querySelector('style,link[rel="stylesheet"]'))),
      )) sync();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    document.addEventListener('load', sync, true);
    releaseStyles = () => {
      observer.disconnect();
      document.removeEventListener('load', sync, true);
      for (const [rule, selector] of originals) rule.selectorText = selector;
      for (const [parent, rule] of inserted.reverse()) {
        const index = Array.from(parent.cssRules).indexOf(rule);
        if (index >= 0) parent.deleteRule(index);
      }
    };
  }
  return () => { users -= 1; if (!users) { releaseStyles?.(); releaseStyles = null; } };
}

export function LandingPagePreviewViewport({ children }: { children: ReactNode }) {
  useLayoutEffect(retainPreviewStyles, []);
  return (
    <div data-lp-preview-viewport="1" style={{ width: '100%', containerType: 'inline-size', containerName: CONTAINER }}>
      <style>{`
        ${PREVIEW} [data-lp-container-inner], ${PREVIEW} [data-lp-hero-copy] { min-width: 0; }
        @container ${CONTAINER} (max-width: 1023px) {
          ${PREVIEW} [data-lp-hero-copy] { width: 100%; max-width: 100%; }
        }
      `}</style>
      {children}
    </div>
  );
}

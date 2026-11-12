/**
 * Canvas document model for LP Builder (Page → Section → Container → Elements).
 * Additive: old LandingPageSpec.blocks remain source of truth; canvas is a view + selection tree.
 */

import type { LandingPageBlock, LandingPageSpec } from './landing-page-types';

export type LandingPageCanvasStyle = {
  lpMotion?: import('./landing-page-motion').LandingPageMotionStyle;
  /** Opt-in empty video slot for the versioned industry renderer; legacy ignores it. */
  industryVideoPlaceholder?: boolean;
  /** Editable poster treatment for that industry's Video block. */
  posterImageStyle?: import('./landing-page-types').LandingPageImageStyle;
  width?: string;
  maxWidth?: string;
  minHeight?: string;
  height?: string;
  padding?: string;
  margin?: string;
  background?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  backgroundPosition?: string;
  color?: string;
  border?: string;
  borderRadius?: string;
  boxShadow?: string;
  /** CSS clip-path for shape/box masks. */
  clipPath?: string;
  /** Marker id for shape-only «Đồ họa» CTA blocks. */
  lpBox?: string;
  /** Photo frame flag — fill via block.imageUrl. */
  lpFrame?: boolean | string;
  /** Grid layout token e.g. "2x2". */
  lpGrid?: string;
  /** JSON string[] of cell image URLs. */
  lpGridImages?: string;
  /** Equal-width content columns inside a section (2–12). */
  lpContentColumns?: number;
  /** Serialized canvas groups; stable member selection keys, stored with their box owner. */
  lpElementGroups?: string;
  /** Serialized per-element layer ranks, independent of page/section order. */
  lpElementLayers?: string;
  /** Out-of-flow element copy; placement/coordinates remain owned by the same box. */
  lpCanvasAbsolute?: string;
  lpCanvasX?: string;
  lpCanvasY?: string;
  /** Paint order for elements attached to a section. */
  lpZIndex?: string;
  /** Column that keeps the section's original flow content after a left split. */
  lpNativeColumnIndex?: number;
  /** Positions of the original groups in an existing split layout. */
  lpNativeColumnIndices?: number[];
  /** Stable native card IDs corresponding to the saved column indices. */
  lpNativeItemIds?: string;
  opacity?: number;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string | number;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  objectFit?: 'cover' | 'contain';
  objectPosition?: string;
};

export type LandingPageCanvasNodeKind = 'page' | 'section' | 'container' | 'element';

export type LandingPageCanvasElementType =
  | 'heading'
  | 'text'
  | 'button'
  | 'image'
  | 'icon'
  | 'card'
  | 'countdown'
  | 'form'
  | 'video'
  | 'spacer'
  | 'unknown';

export type LandingPageCanvasNode = {
  id: string;
  kind: LandingPageCanvasNodeKind;
  type: string;
  parentId: string | null;
  /** Links back to LandingPageBlock.id when kind=section or nested under it. */
  blockId?: string;
  itemId?: string;
  fieldKey?: string;
  name: string;
  props: Record<string, unknown>;
  style: LandingPageCanvasStyle;
  responsiveStyle?: {
    tablet?: LandingPageCanvasStyle;
    mobile?: LandingPageCanvasStyle;
  };
  locked: boolean;
  hidden: boolean;
  children: string[];
};

export type LandingPageCanvasDocument = {
  version: 1;
  rootId: string;
  nodes: Record<string, LandingPageCanvasNode>;
};

export type LandingPageCanvasSelection = {
  selectedSectionId: string | null;
  selectedElementId: string | null;
  /** Alias of selectedSectionId for legacy builder wiring. */
  selectedBlockId: string | null;
};

const PAGE_ID = 'page_root';

function elId(blockId: string, key: string) {
  return `${blockId}__${key}`;
}

function readBlockExtras(block: LandingPageBlock): {
  locked: boolean;
  hidden: boolean;
  style: LandingPageCanvasStyle;
  responsiveStyle?: LandingPageCanvasNode['responsiveStyle'];
  name?: string;
} {
  const b = block as LandingPageBlock & {
    locked?: boolean;
    hidden?: boolean;
    style?: LandingPageCanvasStyle;
    responsiveStyle?: LandingPageCanvasNode['responsiveStyle'];
    layerName?: string;
  };
  return {
    locked: b.locked === true,
    hidden: b.hidden === true || block.enabled === false,
    style: b.style && typeof b.style === 'object' ? { ...b.style } : {},
    responsiveStyle: b.responsiveStyle,
    name: typeof b.layerName === 'string' ? b.layerName : undefined,
  };
}

/**
 * Normalize LandingPageSpec.blocks → canvas tree (non-destructive view).
 */
export function normalizeLandingPageCanvas(spec: LandingPageSpec): LandingPageCanvasDocument {
  const nodes: Record<string, LandingPageCanvasNode> = {};
  const sectionIds: string[] = [];

  nodes[PAGE_ID] = {
    id: PAGE_ID,
    kind: 'page',
    type: 'page',
    parentId: null,
    name: 'Page',
    props: { theme: spec.theme },
    style: {},
    locked: false,
    hidden: false,
    children: sectionIds,
  };

  for (const block of spec.blocks) {
    const extras = readBlockExtras(block);
    const sectionId = block.id;
    const containerId = elId(block.id, 'container');
    if(!block.sectionPlacement)sectionIds.push(sectionId);

    const elementIds: string[] = [];

    nodes[sectionId] = {
      id: sectionId,
      kind: block.sectionPlacement ? 'element' : 'section',
      type: block.type,
      parentId: block.sectionPlacement ? elId(block.sectionPlacement.sectionId,'container') : PAGE_ID,
      blockId: block.id,
      name: extras.name || block.type,
      props: { enabled: block.enabled, spacing: block.spacing, background: block.background },
      style: { ...extras.style, background: extras.style.background || block.background || undefined },
      responsiveStyle: extras.responsiveStyle,
      locked: extras.locked,
      hidden: extras.hidden,
      children: [containerId],
    };

    nodes[containerId] = {
      id: containerId,
      kind: 'container',
      type: 'container',
      parentId: sectionId,
      blockId: block.id,
      name: 'Container',
      props: {},
      style: { maxWidth: '72rem', width: '100%' },
      locked: extras.locked,
      hidden: false,
      children: elementIds,
    };

    const pushEl = (
      key: string,
      type: LandingPageCanvasElementType,
      name: string,
      props: Record<string, unknown>,
      itemId?: string,
    ) => {
      const id = elId(block.id, key);
      elementIds.push(id);
      nodes[id] = {
        id,
        kind: 'element',
        type,
        parentId: containerId,
        blockId: block.id,
        itemId,
        fieldKey: key.includes('.') ? key.split('.').pop() : key,
        name,
        props,
        style: {},
        locked: extras.locked,
        hidden: false,
        children: [],
      };
    };

    if ('headline' in block && (block as { headline?: string }).headline != null) {
      pushEl('headline', 'heading', 'Headline', { text: (block as { headline?: string }).headline || '' });
    }
    if ('subheadline' in block && (block as { subheadline?: string }).subheadline) {
      pushEl('subheadline', 'text', 'Subheadline', {
        text: (block as { subheadline?: string }).subheadline || '',
      });
    }
    if ('body' in block && (block as { body?: string }).body) {
      pushEl('body', 'text', 'Body', { text: (block as { body?: string }).body || '' });
    }
    if ('ctaLabel' in block && (block as { ctaLabel?: string }).ctaLabel) {
      pushEl('ctaLabel', 'button', 'CTA', {
        text: (block as { ctaLabel?: string }).ctaLabel || '',
        href: (block as { ctaUrl?: string }).ctaUrl || '',
      });
    }
    if ('imageUrl' in block) {
      pushEl('imageUrl', 'image', 'Image', {
        src: (block as { imageUrl?: string | null }).imageUrl || null,
        imageStyle: (block as { imageStyle?: unknown }).imageStyle,
      });
    }
    if (block.type === 'Countdown') {
      pushEl('countdown', 'countdown', 'Countdown', {
        endsAt: (block as { endsAt?: string }).endsAt,
      });
    }
    if (block.type === 'Video') {
      pushEl('videoUrl', 'video', 'Video', { src: (block as { videoUrl?: string }).videoUrl });
    }
    if (block.type === 'LeadForm') {
      pushEl('form', 'form', 'Lead Form', {});
    }
    if ('items' in block && Array.isArray((block as { items?: unknown[] }).items)) {
      const items = (block as { items: Array<Record<string, unknown>> }).items;
      items.forEach((item, i) => {
        const iid = String(item.id || `item_${i}`);
        pushEl(
          `item.${iid}`,
          'card',
          String(item.title || `Card ${i + 1}`),
          {
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl,
            imageStyle: item.imageStyle,
          },
          iid,
        );
      });
    }
    if ('plans' in block && Array.isArray((block as { plans?: unknown[] }).plans)) {
      const plans = (block as { plans: Array<Record<string, unknown>> }).plans;
      plans.forEach((plan, i) => {
        const pid = String(plan.id || `plan_${i}`);
        pushEl(`plan.${pid}`, 'card', String(plan.name || `Plan ${i + 1}`), { ...plan }, pid);
      });
    }
  }

  for(const block of spec.blocks){
    if(!block.sectionPlacement)continue;
    nodes[elId(block.sectionPlacement.sectionId,'container')]?.children.push(block.id);
  }
  return { version: 1, rootId: PAGE_ID, nodes };
}

export function resolveCanvasSelection(
  canvas: LandingPageCanvasDocument,
  selectedElementId: string | null,
  selectedSectionId: string | null,
): LandingPageCanvasSelection {
  let sectionId = selectedSectionId;
  let elementId = selectedElementId;
  if (elementId && canvas.nodes[elementId]) {
    const node = canvas.nodes[elementId]!;
    sectionId = node.blockId || sectionId;
  }
  if (sectionId && !canvas.nodes[sectionId]) sectionId = null;
  if (elementId && !canvas.nodes[elementId]) elementId = null;
  return {
    selectedSectionId: sectionId,
    selectedElementId: elementId,
    selectedBlockId: sectionId,
  };
}

export function parseCanvasElementId(elementId: string): {
  blockId: string;
  key: string;
} | null {
  const idx = elementId.indexOf('__');
  if (idx <= 0) return null;
  return { blockId: elementId.slice(0, idx), key: elementId.slice(idx + 2) };
}

/** Reorder section (block) ids in canvas → returns new block id order. */
export function canvasSectionOrder(canvas: LandingPageCanvasDocument): string[] {
  const page = canvas.nodes[canvas.rootId];
  return page?.children?.slice() || [];
}

export function renameCanvasNode(
  canvas: LandingPageCanvasDocument,
  nodeId: string,
  name: string,
): LandingPageCanvasDocument {
  const node = canvas.nodes[nodeId];
  if (!node) return canvas;
  return {
    ...canvas,
    nodes: {
      ...canvas.nodes,
      [nodeId]: { ...node, name: name.slice(0, 80) || node.name },
    },
  };
}

export const LANDING_PAGE_CANVAS_PAGE_ID = PAGE_ID;

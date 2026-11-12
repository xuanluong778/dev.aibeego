/**
 * Single source of truth for catalog/stock backdrop images.
 * All photo IDs HTTP-verified (200) against images.unsplash.com — no 404 assets.
 */

import type { LandingPageCategory } from './landing-page-types';

/** Verified Unsplash photo IDs — curated per category theme. */
export const VERIFIED_CATEGORY_BACKDROPS: Record<string, readonly string[]> = {
  agency: [
    'photo-1497366811353-6870744d04b2',
    'photo-1542744173-8e7e53415bb0',
    'photo-1556761175-5973dc0f32e7',
    'photo-1522071820081-009f0129c71c',
    'photo-1552664730-d307ca884978',
    'photo-1497366216548-37526070297c',
    'photo-1486406146926-c627a92ad1ab',
  ],
  clinic: [
    'photo-1576091160399-112ba8d25d1d',
    'photo-1631217868264-e5b90bb7e133',
    'photo-1666214280557-f1b5022eb634',
    'photo-1519494026892-80bbd2d6fd0d',
    'photo-1584820927498-cfe5211fd8bf',
  ],
  saas: [
    'photo-1460925895917-afdab827c52f',
    'photo-1551288049-bebda4e38f71',
    'photo-1519389950473-47ba0277781c',
    'photo-1498050108023-c5249f4df085',
    'photo-1553877522-43269d4ea984',
    'photo-1504868584819-f8e8b4b6d7e3',
    'photo-1600880292203-757bb62b4baf',
  ],
  service: [
    'photo-1504307651254-35680f356dfd',
    'photo-1503387762-592deb58ef4e',
    'photo-1504917595217-d4dc5ebe6122',
    'photo-1581578731548-c64695cc6952',
    'photo-1621905252507-b35492cc74b4',
    'photo-1454165804606-c3d57bc86b40',
  ],
  consulting: [
    'photo-1556761175-b413da4baf72',
    'photo-1553877522-43269d4ea984',
    'photo-1600880292203-757bb62b4baf',
    'photo-1552664730-d307ca884978',
    'photo-1522071820081-009f0129c71c',
    'photo-1556761175-5973dc0f32e7',
  ],
  seo: [
    'photo-1460925895917-afdab827c52f',
    'photo-1551288049-bebda4e38f71',
    'photo-1553877522-43269d4ea984',
    'photo-1504868584819-f8e8b4b6d7e3',
    'photo-1556761175-5973dc0f32e7',
    'photo-1542744173-8e7e53415bb0',
  ],
  website: [
    'photo-1498050108023-c5249f4df085',
    'photo-1507238691740-187a5b1d37b8',
    'photo-1555066931-4365d14bab8c',
    'photo-1517694712202-14dd9538aa97',
    'photo-1547658719-da2b51169166',
    'photo-1460925895917-afdab827c52f',
  ],
  product: [
    'photo-1523275335684-37898b6baf30',
    'photo-1572635196237-14b3f281503f',
    'photo-1526170375885-4d8ecf77b99f',
  ],
  fashion: [
    'photo-1490481651871-ab68de25d43d',
    'photo-1469334031218-e382a71b716b',
    'photo-1515886657613-9f3515b0c78f',
  ],
  cosmetics: [
    'photo-1596462502278-27bfdc403348',
    'photo-1522335789203-aabd1fc54bc9',
    'photo-1512496015851-a90fb38ba796',
  ],
  spa: [
    'photo-1540555700478-4be289fbecef',
    'photo-1544367567-0f2fcb009e0b',
    'photo-1506126613408-eca07ce68773',
  ],
  course: [
    'photo-1524178232363-1fb2b075b655',
    'photo-1434030216411-0b793f4b4173',
    'photo-1503676260728-1c00da094a0b',
    'photo-1522202176988-66273c2fd55f',
    'photo-1516321318423-f06f85e504b3',
    'photo-1523240795612-9a054b0db644',
  ],
  webinar: [
    'photo-1540575467063-178a50c2df87',
    'photo-1505373877841-8d25f7d46678',
    'photo-1591115765373-5207764f72e7',
    'photo-1511578314322-379afb476865',
    'photo-1553877522-43269d4ea984',
  ],
  coaching: [
    'photo-1600880292203-757bb62b4baf',
    'photo-1552664730-d307ca884978',
    'photo-1522202176988-66273c2fd55f',
    'photo-1434030216411-0b793f4b4173',
    'photo-1506126613408-eca07ce68773',
  ],
  restaurant: [
    'photo-1517248135467-4c7edcad34c4',
    'photo-1414235077428-338989a2e8c0',
    'photo-1555396273-367ea4eb4db5',
    'photo-1559339352-11d035aa65de',
  ],
  real_estate: [
    'photo-1600596542815-ffad4c1539a9',
    'photo-1600585154340-be6161a56a0c',
    'photo-1600607687939-ce8a6c25118c',
    'photo-1600566753190-17f0baa2a6c3',
    'photo-1564013799919-ab600027ffc6',
  ],
  quote: [
    'photo-1454165804606-c3d57bc86b40',
    'photo-1504307651254-35680f356dfd',
    'photo-1503387762-592deb58ef4e',
    'photo-1504917595217-d4dc5ebe6122',
    'photo-1581578731548-c64695cc6952',
  ],
  ebook: [
    'photo-1456513080510-7bf3a84b82f8',
    'photo-1481627834876-b7833e8f5570',
    'photo-1497633762265-9d179a990aa6',
    'photo-1524178232363-1fb2b075b655',
  ],
  demo: [
    'photo-1553877522-43269d4ea984',
    'photo-1460925895917-afdab827c52f',
    'photo-1551288049-bebda4e38f71',
    'photo-1519389950473-47ba0277781c',
    'photo-1498050108023-c5249f4df085',
  ],
  lead_magnet: [
    'photo-1556761175-5973dc0f32e7',
    'photo-1553877522-43269d4ea984',
    'photo-1454165804606-c3d57bc86b40',
    'photo-1504868584819-f8e8b4b6d7e3',
    'photo-1522071820081-009f0129c71c',
  ],
};

const DEFAULT_BACKDROPS: readonly string[] = [
  'photo-1497366216548-37526070297c',
  'photo-1460925895917-afdab827c52f',
  'photo-1486406146926-c627a92ad1ab',
  'photo-1556761175-5973dc0f32e7',
];

export function getVerifiedBackdropPhotoIds(category: LandingPageCategory | string): readonly string[] {
  return VERIFIED_CATEGORY_BACKDROPS[category] || DEFAULT_BACKDROPS;
}

export function verifiedBackdropUrl(category: LandingPageCategory | string, variantIndex = 0): string {
  const seeds = getVerifiedBackdropPhotoIds(category);
  const id = seeds[Math.abs(variantIndex) % seeds.length]!;
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=70`;
}

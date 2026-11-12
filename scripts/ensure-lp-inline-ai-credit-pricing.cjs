#!/usr/bin/env node
/** Upsert CreditFeaturePricing for landing_page.inline_ai */
const path = require('path');
const dbRoot = path.join(__dirname, '../packages/database');
const { PrismaClient } = require(path.join(dbRoot, 'node_modules/@prisma/client'));
const { Decimal } = require(path.join(dbRoot, 'node_modules/@prisma/client/runtime/library'));

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.creditFeaturePricing.upsert({
      where: { featureCode: 'landing_page.inline_ai' },
      update: {
        name: 'Landing page — gợi ý chữ AI',
        creditCost: new Decimal(2),
        description: 'Gợi ý 3 phiên bản cho 1 ô chữ trong builder',
        sortOrder: 120,
        isActive: true,
      },
      create: {
        featureCode: 'landing_page.inline_ai',
        name: 'Landing page — gợi ý chữ AI',
        creditCost: new Decimal(2),
        description: 'Gợi ý 3 phiên bản cho 1 ô chữ trong builder',
        sortOrder: 120,
        isActive: true,
      },
    });
    console.log('PRICING_OK landing_page.inline_ai');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

const { PrismaClient } = require('@prisma/client');

async function main() {
  const p = new PrismaClient();
  try {
    const pub = await p.landingPage.findFirst({
      where: { status: 'PUBLISHED', publishedSpec: { not: null } },
      select: { slug: true, name: true, seoTitle: true },
      orderBy: { publishedAt: 'desc' },
    });
    process.stdout.write(JSON.stringify({ pub }) + '\n');
  } finally {
    await p.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

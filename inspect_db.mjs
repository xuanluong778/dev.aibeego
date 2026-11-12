import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const users = await prisma.user.findMany({
  take: 5,
  include: { role: true, organization: true },
  orderBy: { createdAt: 'desc' },
});
for (const u of users) {
  console.log(JSON.stringify({ id: u.id, email: u.email, orgId: u.organizationId, orgName: u.organization?.name, role: u.role?.code }));
}
const lps = await prisma.landingPage.findMany({ take: 5, orderBy: { updatedAt: 'desc' } });
console.log('--- landing pages ---');
for (const p of lps) console.log(JSON.stringify({ id: p.id, orgId: p.organizationId, name: p.name, status: p.status, slug: p.slug }));
await prisma.$disconnect();

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const item = await prisma.dress.findUnique({ where: { id: "444f6859-787a-488e-9d53-36b9809cdea1" }});
  console.log("Dress found:", !!item);
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

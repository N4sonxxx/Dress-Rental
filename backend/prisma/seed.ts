import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const passwordHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.admin.upsert({
    where: { email: "admin@glamourrent.com" },
    update: {},
    create: {
      email: "admin@glamourrent.com",
      passwordHash,
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create sample dresses
  const dresses = [
    {
      name: "Midnight Velvet Evening Gown",
      description:
        "A stunning floor-length velvet gown in deep midnight blue. Features a sweetheart neckline, fitted bodice, and flowing A-line skirt. Perfect for formal events and galas.",
      size: "M",
      color: "Navy Blue",
      style: "EVENING",
      pricePerDay: 85,
      imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800",
    },
    {
      name: "Rose Gold Sequin Cocktail Dress",
      description:
        "Dazzling rose gold sequin cocktail dress with a flattering V-neck and cap sleeves. Hits just above the knee for a chic, modern look. Ideal for parties and celebrations.",
      size: "S",
      color: "Rose Gold",
      style: "COCKTAIL",
      pricePerDay: 65,
      imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
    },
    {
      name: "Emerald Satin Prom Dress",
      description:
        "Elegant emerald green satin prom dress with a high slit and open back. Features delicate spaghetti straps and a subtle train. A showstopper for any prom or formal dance.",
      size: "S",
      color: "Emerald Green",
      style: "PROM",
      pricePerDay: 75,
      imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800",
    },
    {
      name: "Classic Black Lace Formal Dress",
      description:
        "Timeless black lace overlay formal dress with a scalloped neckline and three-quarter sleeves. Fully lined with a fitted silhouette. Suitable for weddings and formal dinners.",
      size: "L",
      color: "Black",
      style: "FORMAL",
      pricePerDay: 90,
      imageUrl: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800",
    },
    {
      name: "Blush Pink Chiffon Garden Dress",
      description:
        "Romantic blush pink chiffon dress with floral embroidery. Features a flowy midi-length skirt and delicate ruching at the waist. Perfect for garden parties and casual celebrations.",
      size: "M",
      color: "Blush Pink",
      style: "CASUAL",
      pricePerDay: 45,
      imageUrl: "https://images.unsplash.com/photo-1502716119720-b23a1e3f2005?w=800",
    },
    {
      name: "Burgundy Off-Shoulder Gown",
      description:
        "Dramatic burgundy off-shoulder gown with a structured bodice and sweeping train. Features luxurious satin fabric with a mermaid silhouette. Red carpet ready.",
      size: "XS",
      color: "Burgundy",
      style: "EVENING",
      pricePerDay: 95,
      imageUrl: "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=800",
    },
    {
      name: "Silver Metallic Mini Dress",
      description:
        "Eye-catching silver metallic mini dress with a high neckline and long sleeves. Perfect for New Year's Eve, birthday parties, or any event where you want to shine.",
      size: "XS",
      color: "Silver",
      style: "COCKTAIL",
      pricePerDay: 55,
      imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800",
    },
    {
      name: "Ivory Lace Tea-Length Dress",
      description:
        "Vintage-inspired ivory lace tea-length dress with a boat neckline and cap sleeves. Features a cinched waist and full circle skirt. Ideal for rehearsal dinners and bridal showers.",
      size: "L",
      color: "Ivory",
      style: "FORMAL",
      pricePerDay: 70,
      imageUrl: "https://images.unsplash.com/photo-1623609163859-ca93c959b98a?w=800",
    },
  ];

  for (const d of dresses) {
    await prisma.dress.create({ data: d });
  }
  console.log(`✅ ${dresses.length} dresses created`);

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

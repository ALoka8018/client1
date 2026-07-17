import { prisma } from "../src/index.js";

const CATEGORIES = [
  { key: "leakage", label: "Leakage", icon: "water_drop" },
  { key: "waterproofing", label: "Waterproofing", icon: "foundation" },
  { key: "inspection", label: "Inspection", icon: "search_check" },
  { key: "plumbing", label: "Plumbing", icon: "plumbing" },
];

async function main() {
  for (const category of CATEGORIES) {
    await prisma.serviceCategory.upsert({
      where: { key: category.key },
      update: {},
      create: category,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

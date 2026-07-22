import { prisma } from "../src/index.js";

const CATEGORIES = [
  { key: "leakage", label: "Leakage", icon: "water_drop" },
  { key: "waterproofing", label: "Waterproofing", icon: "foundation" },
  { key: "inspection", label: "Inspection", icon: "search_check" },
  { key: "plumbing", label: "Plumbing", icon: "plumbing" },
];

const SERVICES = [
  {
    categoryKey: "leakage",
    title: "Terrace Leakage Detection & Repair",
    description:
      "Precision moisture mapping to locate the source of terrace seepage, followed by a full waterproof membrane repair.",
    rating: "4.8",
    priceLabel: "Starting at ₹4,500",
    priceAmount: "4500.00",
    priceUnit: "per visit",
    ctaType: "dual",
  },
  {
    categoryKey: "leakage",
    title: "Bathroom Seepage Treatment",
    description:
      "Diagnose and seal wall/floor seepage around bathrooms using injection grouting and waterproof coating.",
    rating: "4.7",
    priceLabel: "Starting at ₹3,200",
    priceAmount: "3200.00",
    priceUnit: "per bathroom",
    ctaType: "dual",
  },
  {
    categoryKey: "waterproofing",
    title: "Terrace Waterproofing (APP Membrane)",
    description:
      "Full torch-applied APP membrane waterproofing for terraces, with a 5-year workmanship warranty.",
    rating: "4.9",
    priceLabel: "Starting at ₹65 / sq.ft",
    priceAmount: "65.00",
    priceUnit: "per sq.ft",
    ctaType: "dual",
  },
  {
    categoryKey: "waterproofing",
    title: "Basement Waterproofing",
    description:
      "Crystalline waterproofing treatment for basements and retaining walls to stop water ingress permanently.",
    rating: "4.6",
    priceLabel: "Starting at ₹18,000",
    priceAmount: "18000.00",
    priceUnit: "per project",
    ctaType: "dual",
  },
  {
    categoryKey: "inspection",
    title: "Property Health Inspection",
    description:
      "Comprehensive plumbing, electrical, and structural dampness inspection with a detailed condition report.",
    rating: "4.8",
    priceLabel: "₹1,500",
    priceAmount: "1500.00",
    priceUnit: "per visit",
    ctaType: "single",
  },
  {
    categoryKey: "inspection",
    title: "Pre-Purchase Site Survey",
    description:
      "An independent engineering survey covering seepage risk, plumbing condition, and waterproofing history before you buy.",
    rating: "4.7",
    priceLabel: "₹2,500",
    priceAmount: "2500.00",
    priceUnit: "per property",
    ctaType: "single",
  },
  {
    categoryKey: "plumbing",
    title: "General Plumbing Repair",
    description:
      "Leaking taps, choked drains, and pipe fittings fixed by a certified plumbing technician.",
    rating: "4.6",
    priceLabel: "Starting at ₹800",
    priceAmount: "800.00",
    priceUnit: "per visit",
    ctaType: "dual",
  },
  {
    categoryKey: "plumbing",
    title: "Complete Pipeline Replacement",
    description:
      "End-to-end replacement of corroded or leaking water supply and drainage pipelines.",
    rating: "4.8",
    priceLabel: "Starting at ₹12,000",
    priceAmount: "12000.00",
    priceUnit: "per project",
    ctaType: "dual",
  },
];

const SERVICE_AREAS = [
  { city: "Bhubaneswar", area: "Bhubaneswar GPO", pincode: "751001" },
  { city: "Bhubaneswar", area: "Patia", pincode: "751024" },
  { city: "Cuttack", area: "Cuttack GPO", pincode: "753001" },
  { city: "Puri", area: "Puri Town", pincode: "752001" },
  { city: "Rourkela", area: "Rourkela Town", pincode: "769001" },
];

async function main() {
  const categories = new Map<string, string>();

  for (const category of CATEGORIES) {
    const record = await prisma.serviceCategory.upsert({
      where: { key: category.key },
      update: {},
      create: category,
    });
    categories.set(category.key, record.id);
  }

  for (const { categoryKey, ...service } of SERVICES) {
    const categoryId = categories.get(categoryKey);
    if (!categoryId) continue;

    const existing = await prisma.service.findFirst({
      where: { categoryId, title: service.title },
    });

    if (existing) continue;

    await prisma.service.create({
      data: { ...service, categoryId, active: true },
    });
  }

  for (const serviceArea of SERVICE_AREAS) {
    await prisma.serviceArea.upsert({
      where: { pincode: serviceArea.pincode },
      update: {},
      create: serviceArea,
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

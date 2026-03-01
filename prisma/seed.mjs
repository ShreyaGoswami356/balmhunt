import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function utcDateOnly() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function utcWeekStart(base = new Date()) {
  const date = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
  const day = date.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return date;
}

function utcNextWeekStart(base = new Date()) {
  const start = utcWeekStart(base);
  start.setUTCDate(start.getUTCDate() + 7);
  return start;
}

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const users = [
    { name: "Ava Lane", email: "ava@balmhunt.dev", role: "USER" },
    { name: "Mia Ross", email: "mia@balmhunt.dev", role: "USER" },
    { name: "Nora Kim", email: "nora@balmhunt.dev", role: "USER" },
    { name: "Kylie Cosmetics", email: "kylie@balmhunt.dev", role: "BRAND" },
    { name: "e.l.f. Cosmetics", email: "elf@balmhunt.dev", role: "BRAND" },
    { name: "Eadem", email: "eadem@balmhunt.dev", role: "BRAND" },
    { name: "Haus Labs", email: "hauslabs@balmhunt.dev", role: "BRAND" },
    { name: "Skinfood", email: "skinfood@balmhunt.dev", role: "BRAND" },
    { name: "Grown Alchemist", email: "grownalchemist@balmhunt.dev", role: "BRAND" },
    { name: "NARS", email: "nars@balmhunt.dev", role: "BRAND" },
    { name: "Hung Vanngo Beauty", email: "hung@balmhunt.dev", role: "BRAND" },
    { name: "YSL", email: "ysl@balmhunt.dev", role: "BRAND" },
    { name: "Dot & Key", email: "dotandkey@balmhunt.dev", role: "BRAND" },
    { name: "Burt's Bees", email: "burtsbees@balmhunt.dev", role: "BRAND" },
    { name: "Glow Edit Studio", email: "glowedit@balmhunt.dev", role: "BRAND" },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        password: passwordHash,
      },
      create: {
        name: user.name,
        email: user.email,
        role: user.role,
        password: passwordHash,
      },
    });
  }

  const brands = [
    { email: "kylie@balmhunt.dev", brand_name: "Kylie Cosmetics", website: "https://kyliecosmetics.com" },
    { email: "elf@balmhunt.dev", brand_name: "e.l.f. Cosmetics", website: "https://elfcosmetics.com" },
    { email: "eadem@balmhunt.dev", brand_name: "Eadem", website: "https://eadem.co" },
    { email: "hauslabs@balmhunt.dev", brand_name: "Haus Labs", website: "https://hauslabs.com" },
    { email: "skinfood@balmhunt.dev", brand_name: "Skinfood", website: "https://skinfood.com" },
    { email: "grownalchemist@balmhunt.dev", brand_name: "Grown Alchemist", website: "https://grownalchemist.com" },
    { email: "nars@balmhunt.dev", brand_name: "NARS", website: "https://narscosmetics.com" },
    { email: "hung@balmhunt.dev", brand_name: "Hung Vanngo Beauty", website: "https://example.com" },
    { email: "ysl@balmhunt.dev", brand_name: "YSL", website: "https://yslbeautyus.com" },
    { email: "dotandkey@balmhunt.dev", brand_name: "Dot & Key", website: "https://dotandkey.com" },
    { email: "burtsbees@balmhunt.dev", brand_name: "Burt's Bees", website: "https://burtsbees.com" },
    { email: "glowedit@balmhunt.dev", brand_name: "Glow Edit Studio", website: "https://example.com" },
  ];

  const brandProfileIdByEmail = new Map();
  for (const brand of brands) {
    const brandUser = await prisma.user.findUniqueOrThrow({
      where: { email: brand.email },
    });

    const brandProfile = await prisma.brandProfile.upsert({
      where: { user_id: brandUser.id },
      update: {
        brand_name: brand.brand_name,
        website: brand.website,
        verified: true,
      },
      create: {
        user_id: brandUser.id,
        brand_name: brand.brand_name,
        website: brand.website,
        verified: true,
      },
    });

    brandProfileIdByEmail.set(brand.email, brandProfile.id);
  }

  const today = utcDateOnly();
  const weekStart = utcWeekStart();
  const nextWeekStart = utcNextWeekStart();

  await prisma.product.deleteMany({
    where: {
      launch_date: {
        gte: weekStart,
        lt: nextWeekStart,
      },
    },
  });

  const products = [
    {
      email: "kylie@balmhunt.dev",
      name: "Butter Cake Lip Butter",
      image_url: "/Images/kylie-butter-cake.png",
      tagline: "ultra-hydrating lip butter trending right now",
      description: "A newly launched ultra-hydrating lip balm from Kylie Cosmetics that is gaining major traction this week.",
    },
    {
      email: "elf@balmhunt.dev",
      name: "Big Dill Lip Balm",
      image_url: "/Images/elf-big-dill.png",
      tagline: "bold pickle-flavored limited drop",
      description: "e.l.f. adds Big Dill to the Glow Reviver lineup with limited availability.",
    },
    {
      email: "eadem@balmhunt.dev",
      name: "Sakura Shaved Ice Lip Balm",
      image_url: "/Images/eadem-sakura-shaved-ice.png",
      tagline: "sakura-toned hydrating balm",
      description: "Eadem Sakura Shaved Ice shade is getting strong buzz this week.",
    },
    {
      email: "nars@balmhunt.dev",
      name: "Afterglow Lip Balm (Midnight Swim)",
      image_url: "/Images/nars-midnight-swim.png",
      tagline: "afterglow shade highlight this week",
      description: "NARS Afterglow Lip Balm in Midnight Swim is featured in this week's highlights.",
    },
    {
      email: "hung@balmhunt.dev",
      name: "Glossy Lip Hue Hydrating Balm",
      image_url: "/Images/hung-vanngo-glossy-lip-hue.png",
      tagline: "glossy finish with deep hydration",
      description: "Hung Vanngo Beauty's Glossy Lip Hue Hydrating Balm is one of this week's standout launches.",
    },
    {
      email: "ysl@balmhunt.dev",
      name: "Lovenu de Lip Blusher",
      image_url: "/Images/ysl-lovenude-lip-blusher.png",
      tagline: "sheer tint blusher-balm finish",
      description: "YSL Lovenu de Lip Blusher joins this week's high-interest launch list.",
    },
  ];

  for (const product of products) {
    const brandProfileId = brandProfileIdByEmail.get(product.email);
    if (!brandProfileId) {
      throw new Error(`missing brand profile for ${product.email}`);
    }

    const productId = `launch-${product.name}`.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();

    await prisma.product.upsert({
      where: {
        id: productId,
      },
      update: {
        name: product.name,
        image_url: product.image_url,
        tagline: product.tagline,
        description: product.description,
        launch_date: today,
        brand_profile_id: brandProfileId,
      },
      create: {
        id: productId,
        name: product.name,
        image_url: product.image_url,
        tagline: product.tagline,
        description: product.description,
        launch_date: today,
        brand_profile_id: brandProfileId,
      },
    });
  }

  console.log("seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

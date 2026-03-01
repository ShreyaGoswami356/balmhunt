import { formatMonthYearUTC } from "@/lib/date";

export type DemoLaunch = {
  id: string;
  name: string;
  imageUrl: string;
  tagline: string;
  description: string;
  brandName: string;
  voteCount: number;
  commentCount: number;
};

export const DEMO_LAUNCHES: DemoLaunch[] = [
  {
    id: "launch-butter-cake-lip-butter",
    name: "Butter Cake Lip Butter",
    imageUrl: "/Images/kylie-butter-cake.png",
    tagline: "ultra-hydrating lip butter trending right now",
    description: "Kylie Cosmetics - Butter Cake Lip Butter",
    brandName: "Kylie Cosmetics",
    voteCount: 41,
    commentCount: 5,
  },
  {
    id: "launch-big-dill-lip-balm",
    name: "Big Dill Lip Balm",
    imageUrl: "/Images/elf-big-dill.png",
    tagline: "bold pickle-flavored limited drop",
    description: "e.l.f. Cosmetics - Big Dill Lip Balm",
    brandName: "e.l.f. Cosmetics",
    voteCount: 33,
    commentCount: 4,
  },
  {
    id: "launch-sakura-shaved-ice-lip-balm",
    name: "Sakura Shaved Ice Lip Balm",
    imageUrl: "/Images/eadem-sakura-shaved-ice.png",
    tagline: "sakura-toned hydrating balm",
    description: "Eadem - Sakura Shaved Ice Lip Balm",
    brandName: "Eadem",
    voteCount: 29,
    commentCount: 3,
  },
  {
    id: "launch-afterglow-lip-balm-midnight-swim",
    name: "Afterglow Lip Balm (Midnight Swim)",
    imageUrl: "/Images/nars-midnight-swim.png",
    tagline: "afterglow shade highlight this week",
    description: "NARS - Afterglow Lip Balm (Midnight Swim)",
    brandName: "NARS",
    voteCount: 25,
    commentCount: 2,
  },
  {
    id: "launch-glossy-lip-hue-hydrating-balm",
    name: "Glossy Lip Hue Hydrating Balm",
    imageUrl: "/Images/hung-vanngo-glossy-lip-hue.png",
    tagline: "glossy finish with deep hydration",
    description: "Hung Vanngo Beauty - Glossy Lip Hue Hydrating Balm",
    brandName: "Hung Vanngo Beauty",
    voteCount: 22,
    commentCount: 2,
  },
  {
    id: "launch-lovenu-de-lip-blusher",
    name: "Lovenu de Lip Blusher",
    imageUrl: "/Images/ysl-lovenude-lip-blusher.png",
    tagline: "sheer tint blusher-balm finish",
    description: "YSL - Lovenu de Lip Blusher",
    brandName: "YSL",
    voteCount: 19,
    commentCount: 1,
  },
];

export function getDemoWeekRange() {
  const weekStart = new Date(Date.UTC(2026, 1, 27));
  const weekEnd = new Date(Date.UTC(2026, 2, 5));
  return { weekStart, weekEnd };
}

export function getDemoWeeklyWinners() {
  const { weekStart, weekEnd } = getDemoWeekRange();
  const winner = DEMO_LAUNCHES[0];

  return [
    {
      weekStart,
      weekEnd,
      productId: winner.id,
      productName: winner.name,
      brandName: winner.brandName,
      totalVotes: winner.voteCount,
    },
  ];
}

export function getDemoMonthlyWinners() {
  const weeklyWinners = getDemoWeeklyWinners();
  const winner = weeklyWinners[0];
  const monthStart = new Date(Date.UTC(winner.weekStart.getUTCFullYear(), winner.weekStart.getUTCMonth(), 1));

  return [
    {
      monthStart,
      monthLabel: formatMonthYearUTC(monthStart),
      productId: winner.productId,
      productName: winner.productName,
      brandName: winner.brandName,
      totalVotes: winner.totalVotes,
      sourcedFromWeeks: 1,
    },
  ];
}

export function findDemoLaunchById(id: string) {
  return DEMO_LAUNCHES.find((launch) => launch.id === id) ?? null;
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function utcDateOnlyWithOffset(days) {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days));
}

async function main() {
  const yesterday = utcDateOnlyWithOffset(-1);

  const existing = await prisma.hallOfFame.findUnique({
    where: { date: yesterday },
  });

  if (existing) {
    console.log("winner already recorded for", yesterday.toISOString().slice(0, 10));
    return;
  }

  const winner = await prisma.vote.groupBy({
    by: ["product_id"],
    where: { vote_date: yesterday },
    _count: { _all: true },
    orderBy: { _count: { product_id: "desc" } },
    take: 1,
  });

  if (!winner[0]) {
    console.log("no votes for", yesterday.toISOString().slice(0, 10));
    return;
  }

  await prisma.hallOfFame.create({
    data: {
      product_id: winner[0].product_id,
      date: yesterday,
      total_votes: winner[0]._count._all,
    },
  });

  console.log("winner saved for", yesterday.toISOString().slice(0, 10));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

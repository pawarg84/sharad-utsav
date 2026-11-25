import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const STOCK = [
  ["DAY_ADULT", 380],
  ["DAY_CHILD", 260],
  ["ALLDAY_ADULT", 0],
  ["ALLDAY_CHILD", 140],
  ["FAMILY", 95],
  ["DANDIYA", 900],
  ["DINNER", 1700],
  ["WORKSHOP", 2],
] as const;

async function main() {
  for (const [sku, remaining] of STOCK) {
    await db.stock.upsert({
      where: { sku },
      update: { remaining },
      create: { sku, remaining },
    });
  }
  console.log("Seeded stock");
}
main().finally(() => db.$disconnect());

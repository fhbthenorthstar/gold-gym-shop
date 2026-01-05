import "dotenv/config";
import { writeClient } from "../sanity/lib/client";
import { dataset } from "../sanity/env";

const SHOULD_WRITE = process.argv.includes("--confirm");

type DiscountSeed = {
  title: string;
  code: string;
  type: "percentage" | "fixed";
  amount: number;
  minSubtotal?: number;
  maxDiscount?: number;
  maxUses?: number;
  active?: boolean;
};

const discountSeeds: DiscountSeed[] = [
  {
    title: "Welcome Savings",
    code: "WELCOME500",
    type: "fixed",
    amount: 500,
    minSubtotal: 3000,
    maxUses: 500,
    active: true,
  },
  {
    title: "Gold 10% Off",
    code: "GOLD10",
    type: "percentage",
    amount: 10,
    minSubtotal: 2000,
    maxDiscount: 750,
    maxUses: 1000,
    active: true,
  },
  {
    title: "Muscle Stack 15%",
    code: "MUSCLE15",
    type: "percentage",
    amount: 15,
    minSubtotal: 5000,
    maxDiscount: 1200,
    maxUses: 400,
    active: true,
  },
  {
    title: "Bundle Bonus",
    code: "BUNDLE1000",
    type: "fixed",
    amount: 1000,
    minSubtotal: 7000,
    maxUses: 250,
    active: true,
  },
];

const normalizeCode = (code: string) =>
  code.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

async function seedDiscounts() {
  console.log(`Seeding discounts into dataset: ${dataset}`);
  console.table(
    discountSeeds.map((discount) => ({
      code: discount.code,
      type: discount.type,
      amount: discount.amount,
      minSubtotal: discount.minSubtotal ?? 0,
    }))
  );

  if (!SHOULD_WRITE) {
    console.log("Dry run. Re-run with --confirm to write data.");
    return;
  }

  const transaction = writeClient.transaction();

  discountSeeds.forEach((discount) => {
    const docId = `discount-${normalizeCode(discount.code)}`;
    transaction.createIfNotExists({
      _id: docId,
      _type: "discount",
      usedCount: 0,
    });
    transaction.patch(docId, {
      set: {
        title: discount.title,
        code: discount.code,
        type: discount.type,
        amount: discount.amount,
        minSubtotal: discount.minSubtotal ?? 0,
        maxDiscount: discount.maxDiscount ?? null,
        maxUses: discount.maxUses ?? null,
        active: discount.active ?? true,
      },
      setIfMissing: { usedCount: 0 },
    });
  });

  await transaction.commit();
  console.log("Discounts seeded successfully.");
}

seedDiscounts().catch((error) => {
  console.error("Failed to seed discounts:", error);
  process.exit(1);
});

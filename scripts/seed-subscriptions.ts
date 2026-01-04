import "dotenv/config";
import { writeClient } from "../sanity/lib/client";
import { dataset } from "../sanity/env";

const SHOULD_WRITE = process.argv.includes("--confirm");

const members = [
  { name: "Arafat Hasan", email: "arafat.hasan@example.com", phone: "+8801701123456" },
  { name: "Nusrat Jahan", email: "nusrat.jahan@example.com", phone: "+8801702234567" },
  { name: "Shakil Ahmed", email: "shakil.ahmed@example.com", phone: "+8801703345678" },
  { name: "Fariha Rahman", email: "fariha.rahman@example.com", phone: "+8801704456789" },
  { name: "Mahmudul Islam", email: "mahmudul.islam@example.com", phone: "+8801705567890" },
  { name: "Tania Sultana", email: "tania.sultana@example.com", phone: "+8801706678901" },
  { name: "Rafiul Karim", email: "rafiul.karim@example.com", phone: "+8801707789012" },
  { name: "Sadia Akter", email: "sadia.akter@example.com", phone: "+8801708890123" },
  { name: "Ziaur Rahman", email: "ziaur.rahman@example.com", phone: "+8801709901234" },
  { name: "Imran Hossain", email: "imran.hossain@example.com", phone: "+8801710012345" },
  { name: "Farzana Haque", email: "farzana.haque@example.com", phone: "+8801711123456" },
  { name: "Jubayer Ahmed", email: "jubayer.ahmed@example.com", phone: "+8801712234567" },
  { name: "Nazia Rahim", email: "nazia.rahim@example.com", phone: "+8801713345678" },
  { name: "Sajib Chowdhury", email: "sajib.chowdhury@example.com", phone: "+8801714456789" },
  { name: "Tahmina Kabir", email: "tahmina.kabir@example.com", phone: "+8801715567890" },
];

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const buildSubscriptionNumber = (index: number) => {
  const padded = String(index + 1).padStart(3, "0");
  return `SUB-2025-${padded}`;
};

async function run() {
  if (!SHOULD_WRITE) {
    console.log("Dry run only. Re-run with --confirm to seed subscriptions.");
    return;
  }

  if (dataset !== "production") {
    console.error(
      `Refusing to seed into \"${dataset}\". Set NEXT_PUBLIC_SANITY_DATASET=production to continue.`
    );
    process.exit(1);
  }

  const packages: Array<{
    _id: string;
    durationMonths?: number | null;
    offerPrice?: number | null;
    packagePrice?: number | null;
  }> = await writeClient.fetch(`*[_type == "subscriptionPackage"]{
    _id,
    durationMonths,
    offerPrice,
    packagePrice
  }`);

  if (!packages.length) {
    console.error("No subscription packages found. Seed packages first.");
    process.exit(1);
  }

  const now = new Date();

  for (const [index, member] of members.entries()) {
    const pkg = packages[index % packages.length];
    const startDate = new Date(now.getTime() - index * 5 * 24 * 60 * 60 * 1000);
    const durationMonths = pkg.durationMonths ?? 1;
    const endDate = addMonths(startDate, durationMonths);
    const price =
      typeof pkg.offerPrice === "number" ? pkg.offerPrice : pkg.packagePrice ?? 0;

    const status =
      index < 9 ? "active" : index < 12 ? "pending" : "cancelled";
    const paymentStatus =
      status === "active" ? "paid" : status === "pending" ? "pending" : "failed";

    await writeClient.createOrReplace({
      _id: `subscription-seed-${index + 1}`,
      _type: "subscription",
      subscriptionNumber: buildSubscriptionNumber(index),
      subscriberName: member.name,
      subscriberEmail: member.email,
      subscriberPhone: member.phone,
      userId: `seed-user-${index + 1}`,
      package: { _type: "reference", _ref: pkg._id },
      price,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      nextRenewalDate: endDate.toISOString().split("T")[0],
      status,
      paymentMethod: "online",
      paymentStatus,
      notes: "Seeded membership for dashboard previews.",
    });
  }

  console.log(`Seeded ${members.length} subscriptions.`);
}

run().catch((error) => {
  console.error("Failed to seed subscriptions:", error);
  process.exit(1);
});

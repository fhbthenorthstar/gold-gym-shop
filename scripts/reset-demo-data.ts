import "dotenv/config";
import { writeClient } from "../sanity/lib/client";

const CATEGORY_SLUGS = [
  "sofas",
  "chairs",
  "tables",
  "beds",
  "storage",
  "lighting",
];

const SHOULD_DELETE = process.argv.includes("--confirm");

async function run() {
  const ids = await writeClient.fetch<string[]>(
    `*[
      (_type == "category" && slug.current in $categorySlugs)
      || (_type == "product" && category->slug.current in $categorySlugs)
      || (_type == "customer" && _id match "customer-sample-*")
      || (_type == "order" && _id match "order-sample-*")
    ]._id`,
    { categorySlugs: CATEGORY_SLUGS }
  );

  if (ids.length === 0) {
    console.log("No demo documents found to delete.");
    return;
  }

  console.log(`Found ${ids.length} demo documents.`);
  if (!SHOULD_DELETE) {
    console.log("Dry run only. Re-run with --confirm to delete.");
    return;
  }

  const transaction = ids.reduce(
    (tx, id) => tx.delete(id),
    writeClient.transaction()
  );

  await transaction.commit();
  console.log(`Deleted ${ids.length} demo documents.`);
}

run().catch((error) => {
  console.error("Failed to delete demo data:", error);
  process.exit(1);
});

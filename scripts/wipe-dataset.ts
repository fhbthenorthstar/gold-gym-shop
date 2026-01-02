import "dotenv/config";
import { writeClient } from "../sanity/lib/client";
import { dataset } from "../sanity/env";

const SHOULD_DELETE = process.argv.includes("--confirm");

const ASSET_TYPES = new Set(["sanity.imageAsset", "sanity.fileAsset"]);
const SYSTEM_ID_PREFIX = "_.";

type DocInfo = { _id: string; _type: string };

const chunkArray = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

async function deleteBatch(client: typeof writeClient, ids: string[]) {
  let tx = client.transaction();
  ids.forEach((id) => {
    tx = tx.delete(id);
  });
  await tx.commit();
}

async function deleteWithFallback(client: typeof writeClient, ids: string[]) {
  try {
    await deleteBatch(client, ids);
    return ids.length;
  } catch (error) {
    console.warn(
      `Batch delete failed for ${ids.length} docs, retrying individually...`
    );
    let deleted = 0;
    for (const id of ids) {
      try {
        await client.delete(id);
        deleted += 1;
      } catch (deleteError) {
        console.warn(`Failed to delete ${id}:`, deleteError);
      }
    }
    return deleted;
  }
}

async function run() {
  if (!SHOULD_DELETE) {
    console.log("Dry run only. Re-run with --confirm to delete all documents.");
    return;
  }

  if (dataset !== "production") {
    console.error(
      `Refusing to wipe dataset "${dataset}". Set NEXT_PUBLIC_SANITY_DATASET=production to continue.`
    );
    process.exit(1);
  }

  const rawClient = writeClient.withConfig({ perspective: "raw" });
  const docs = await rawClient.fetch<DocInfo[]>(`*[] { _id, _type }`);
  const filteredDocs = docs.filter(
    (doc) => doc?._id && !doc._id.startsWith(SYSTEM_ID_PREFIX)
  );
  const contentIds = filteredDocs
    .filter((doc) => !ASSET_TYPES.has(doc._type))
    .map((doc) => doc._id);
  const assetIds = filteredDocs
    .filter((doc) => ASSET_TYPES.has(doc._type))
    .map((doc) => doc._id);

  if (contentIds.length === 0 && assetIds.length === 0) {
    console.log("No documents found to delete.");
    return;
  }

  console.log(
    `Found ${contentIds.length} documents and ${assetIds.length} assets to delete in "${dataset}".`
  );

  let deletedCount = 0;

  if (contentIds.length > 0) {
    const contentChunks = chunkArray(contentIds, 200);
    for (let i = 0; i < contentChunks.length; i += 1) {
      const chunk = contentChunks[i];
      const deleted = await deleteWithFallback(rawClient, chunk);
      deletedCount += deleted;
      console.log(
        `Deleted ${deletedCount}/${contentIds.length} documents (batch ${
          i + 1
        }/${contentChunks.length}).`
      );
    }
  }

  if (assetIds.length > 0) {
    const assetChunks = chunkArray(assetIds, 200);
    let deletedAssets = 0;
    for (let i = 0; i < assetChunks.length; i += 1) {
      const chunk = assetChunks[i];
      const deleted = await deleteWithFallback(rawClient, chunk);
      deletedAssets += deleted;
      console.log(
        `Deleted ${deletedAssets}/${assetIds.length} assets (batch ${i + 1}/${
          assetChunks.length
        }).`
      );
    }
  }

  const remainingDocs = await rawClient.fetch<DocInfo[]>(`*[] { _id, _type }`);
  const remainingContent = remainingDocs.filter(
    (doc) =>
      doc?._id &&
      !doc._id.startsWith(SYSTEM_ID_PREFIX) &&
      !ASSET_TYPES.has(doc._type)
  );
  const remainingAssets = remainingDocs.filter(
    (doc) =>
      doc?._id &&
      !doc._id.startsWith(SYSTEM_ID_PREFIX) &&
      ASSET_TYPES.has(doc._type)
  );

  console.log(
    `Completed: deleted ${deletedCount} documents. Remaining: ${remainingContent.length} documents, ${remainingAssets.length} assets (system docs are skipped).`
  );
}

run().catch((error) => {
  console.error("Failed to wipe dataset:", error);
  process.exit(1);
});

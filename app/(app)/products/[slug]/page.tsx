import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/live";
import { PRODUCT_BY_SLUG_QUERY } from "@/lib/sanity/queries/products";
import { ProductGallery } from "@/components/app/ProductGallery";
import { ProductInfo } from "@/components/app/ProductInfo";
import { ProductReviews } from "@/components/app/ProductReviews";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const { data: product } = await sanityFetch({
    query: PRODUCT_BY_SLUG_QUERY,
    params: { slug },
  });

  if (!product) {
    notFound();
  }

  const descriptionHtml =
    product.descriptionHtml?.trim() ||
    (product.description ? `<p>${product.description}</p>` : "");

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <ProductGallery images={product.images} productName={product.name} />
          <ProductInfo product={product} />
        </div>

        <div className="mt-12 border-t border-zinc-800 pt-10">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full flex-wrap justify-start gap-2 rounded-none bg-transparent p-0">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-zinc-400 data-[state=active]:border-primary data-[state=active]:text-white sm:px-4 sm:text-xs sm:tracking-[0.2em]"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="rounded-none border-b-2 border-transparent px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-zinc-400 data-[state=active]:border-primary data-[state=active]:text-white sm:px-4 sm:text-xs sm:tracking-[0.2em]"
              >
                Shipping Information
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-zinc-400 data-[state=active]:border-primary data-[state=active]:text-white sm:px-4 sm:text-xs sm:tracking-[0.2em]"
              >
                Reviews
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6 text-sm text-zinc-300">
              {descriptionHtml ? (
                <div
                  className="prose prose-invert max-w-none prose-p:text-zinc-300"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              ) : (
                <p>No description available.</p>
              )}
            </TabsContent>
            <TabsContent value="shipping" className="mt-6 text-sm text-zinc-300">
              <p>
                We offer fast nationwide delivery with secure packaging. Orders
                ship within 24-48 hours, and tracking details are sent via email
                and SMS.
              </p>
              <p className="mt-4">
                Need help? Contact our support team for bulk or custom shipping
                options.
              </p>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <ProductReviews
                productId={product._id}
                productName={product.name}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

    </div>
  );
}

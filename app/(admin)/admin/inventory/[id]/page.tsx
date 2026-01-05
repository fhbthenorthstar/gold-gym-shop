"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import {
  useDocument,
  useEditDocument,
  useDocumentProjection,
  type DocumentHandle,
} from "@sanity/sdk-react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PublishButton,
  RevertButton,
  ImageUploader,
  DeleteButton,
} from "@/components/admin";
import { PRODUCT_TYPES, GOALS, SPORTS, GENDERS } from "@/lib/constants/filters";


// Field editor components
function NameEditor(handle: DocumentHandle) {
  const { data: name } = useDocument({ ...handle, path: "name" });
  const editName = useEditDocument({ ...handle, path: "name" });

  return (
    <Input
      value={(name as string) ?? ""}
      onChange={(e) => editName(e.target.value)}
      placeholder="Product name"
    />
  );
}

function SlugEditor(handle: DocumentHandle) {
  const { data: slug } = useDocument({ ...handle, path: "slug" });
  const editSlug = useEditDocument({ ...handle, path: "slug" });
  const slugValue = (slug as { current?: string })?.current ?? "";

  return (
    <Input
      value={slugValue}
      onChange={(e) => editSlug({ _type: "slug", current: e.target.value })}
      placeholder="product-slug"
    />
  );
}

function DescriptionEditor(handle: DocumentHandle) {
  const { data: description } = useDocument({ ...handle, path: "description" });
  const editDescription = useEditDocument({ ...handle, path: "description" });

  return (
    <Textarea
      value={(description as string) ?? ""}
      onChange={(e) => editDescription(e.target.value)}
      placeholder="Product description..."
      rows={4}
    />
  );
}

function DescriptionHtmlEditor(handle: DocumentHandle) {
  const { data: descriptionHtml } = useDocument({
    ...handle,
    path: "descriptionHtml",
  });
  const editDescriptionHtml = useEditDocument({
    ...handle,
    path: "descriptionHtml",
  });

  return (
    <Textarea
      value={(descriptionHtml as string) ?? ""}
      onChange={(e) => editDescriptionHtml(e.target.value)}
      placeholder="<p>HTML description...</p>"
      rows={6}
    />
  );
}

function PriceEditor(handle: DocumentHandle) {
  const { data: price } = useDocument({ ...handle, path: "price" });
  const editPrice = useEditDocument({ ...handle, path: "price" });

  return (
    <Input
      type="number"
      step="0.01"
      min="0"
      value={(price as number) ?? ""}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        editPrice(parseFloat(e.target.value) || 0)
      }
      placeholder="0.00"
    />
  );
}

function StockEditor(handle: DocumentHandle) {
  const { data: stock } = useDocument({ ...handle, path: "stock" });
  const editStock = useEditDocument({ ...handle, path: "stock" });

  return (
    <Input
      type="number"
      min="0"
      value={(stock as number) ?? 0}
      onChange={(e) => editStock(parseInt(e.target.value) || 0)}
      placeholder="0"
    />
  );
}

function BrandEditor(handle: DocumentHandle) {
  const { data: brand } = useDocument({ ...handle, path: "brand" });
  const editBrand = useEditDocument({ ...handle, path: "brand" });

  return (
    <Input
      value={(brand as string) ?? ""}
      onChange={(e) => editBrand(e.target.value)}
      placeholder="Brand name"
    />
  );
}

function ProductTypeEditor(handle: DocumentHandle) {
  const { data: productType } = useDocument({ ...handle, path: "productType" });
  const editProductType = useEditDocument({
    ...handle,
    path: "productType",
  });

  return (
    <Select
      value={(productType as string) ?? ""}
      onValueChange={(value) => editProductType(value)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select type" />
      </SelectTrigger>
      <SelectContent>
        {PRODUCT_TYPES.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function GoalsEditor(handle: DocumentHandle) {
  const { data: goals } = useDocument({ ...handle, path: "goals" });
  const editGoals = useEditDocument({ ...handle, path: "goals" });
  const currentGoals = Array.isArray(goals) ? goals : [];

  const toggleGoal = (value: string) => {
    if (currentGoals.includes(value)) {
      editGoals(currentGoals.filter((goal) => goal !== value));
      return;
    }

    editGoals([...currentGoals, value]);
  };

  return (
    <div className="space-y-2">
      {GOALS.map((goal) => (
        <label key={goal.value} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={currentGoals.includes(goal.value)}
            onChange={() => toggleGoal(goal.value)}
            className="h-4 w-4 rounded border-zinc-300 text-amber-500 focus:ring-amber-500 dark:border-zinc-600 dark:bg-zinc-800"
          />
          {goal.label}
        </label>
      ))}
    </div>
  );
}

function SportsEditor(handle: DocumentHandle) {
  const { data: sports } = useDocument({ ...handle, path: "sports" });
  const editSports = useEditDocument({ ...handle, path: "sports" });
  const currentSports = Array.isArray(sports) ? sports : [];

  const toggleSport = (value: string) => {
    if (currentSports.includes(value)) {
      editSports(currentSports.filter((sport) => sport !== value));
      return;
    }

    editSports([...currentSports, value]);
  };

  return (
    <div className="space-y-2">
      {SPORTS.map((sport) => (
        <label key={sport.value} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={currentSports.includes(sport.value)}
            onChange={() => toggleSport(sport.value)}
            className="h-4 w-4 rounded border-zinc-300 text-amber-500 focus:ring-amber-500 dark:border-zinc-600 dark:bg-zinc-800"
          />
          {sport.label}
        </label>
      ))}
    </div>
  );
}

function GenderEditor(handle: DocumentHandle) {
  const { data: gender } = useDocument({ ...handle, path: "gender" });
  const editGender = useEditDocument({ ...handle, path: "gender" });
  const genderValue =
    typeof gender === "string" && gender.length > 0 ? gender : "unspecified";

  return (
    <Select
      value={genderValue}
      onValueChange={(value) =>
        editGender(value === "unspecified" ? null : value)
      }
    >
      <SelectTrigger>
        <SelectValue placeholder="Select gender" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unspecified">Unspecified</SelectItem>
        {GENDERS.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function FeaturedEditor(handle: DocumentHandle) {
  const { data: featured } = useDocument({ ...handle, path: "featured" });
  const editFeatured = useEditDocument({ ...handle, path: "featured" });

  return (
    <Switch
      checked={(featured as boolean) ?? false}
      onCheckedChange={(checked: boolean) => editFeatured(checked)}
    />
  );
}

function IsDigitalEditor(handle: DocumentHandle) {
  const { data: isDigital } = useDocument({ ...handle, path: "isDigital" });
  const editIsDigital = useEditDocument({ ...handle, path: "isDigital" });

  return (
    <Switch
      checked={(isDigital as boolean) ?? false}
      onCheckedChange={(checked: boolean) => editIsDigital(checked)}
    />
  );
}

interface ProductSlugProjection {
  slug: {
    current: string;
  } | null;
}

function ProductStoreLink(handle: DocumentHandle) {
  const { data } = useDocumentProjection<ProductSlugProjection>({
    ...handle,
    projection: `{ slug }`,
  });

  const slug = data?.slug?.current;

  if (!slug) return null;

  return (
    <Link
      href={`/products/${slug}`}
      target="_blank"
      className="flex items-center justify-center gap-1 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
    >
      View on store
      <ExternalLink className="h-3.5 w-3.5" />
    </Link>
  );
}

function ProductDetailContent({ handle }: { handle: DocumentHandle }) {
  const { data: name } = useDocument({ ...handle, path: "name" });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
            {(name as string) || "New Product"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Edit product details
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DeleteButton handle={handle} />
          <Suspense fallback={null}>
            <RevertButton {...handle} />
          </Suspense>
          <Suspense fallback={null}>
            <PublishButton {...handle} />
          </Suspense>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Main Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Suspense fallback={<Skeleton className="h-10" />}>
                  <NameEditor {...handle} />
                </Suspense>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Suspense fallback={<Skeleton className="h-10" />}>
                  <SlugEditor {...handle} />
                </Suspense>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Suspense fallback={<Skeleton className="h-24" />}>
                  <DescriptionEditor {...handle} />
                </Suspense>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descriptionHtml">Description HTML</Label>
                <Suspense fallback={<Skeleton className="h-32" />}>
                  <DescriptionHtmlEditor {...handle} />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
              Pricing & Inventory
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price (৳)</Label>
                <Suspense fallback={<Skeleton className="h-10" />}>
                  <PriceEditor {...handle} />
                </Suspense>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Suspense fallback={<Skeleton className="h-10" />}>
                  <StockEditor {...handle} />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Attributes */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
              Attributes
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Brand</Label>
                <Suspense fallback={<Skeleton className="h-10" />}>
                  <BrandEditor {...handle} />
                </Suspense>
              </div>
              <div className="space-y-2">
                <Label>Product Type</Label>
                <Suspense fallback={<Skeleton className="h-10" />}>
                  <ProductTypeEditor {...handle} />
                </Suspense>
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Suspense fallback={<Skeleton className="h-10" />}>
                  <GenderEditor {...handle} />
                </Suspense>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Goals</Label>
                <Suspense fallback={<Skeleton className="h-24" />}>
                  <GoalsEditor {...handle} />
                </Suspense>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Sports</Label>
                <Suspense fallback={<Skeleton className="h-24" />}>
                  <SportsEditor {...handle} />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
              Options
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    Featured Product
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Show on homepage and promotions
                  </p>
                </div>
                <Suspense fallback={<Skeleton className="h-6 w-11" />}>
                  <FeaturedEditor {...handle} />
                </Suspense>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    Digital Product
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Fulfilled digitally with no shipping
                  </p>
                </div>
                <Suspense fallback={<Skeleton className="h-6 w-11" />}>
                  <IsDigitalEditor {...handle} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
              Product Images
            </h2>
            <ImageUploader {...handle} />
            <div className="mt-4">
              <Suspense fallback={null}>
                <ProductStoreLink {...handle} />
              </Suspense>
            </div>
          </div>

          {/* Studio Link */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Advanced Editing
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Set category, options, and variants in Sanity Studio.
            </p>
            <Link
              href={`/studio/structure/product;${handle.documentId}`}
              target="_blank"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
            >
              Open in Studio
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Skeleton className="h-7 w-48 sm:h-8" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-[140px]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = use(params);

  const handle: DocumentHandle = {
    documentId: id,
    documentType: "product",
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Back Link */}
      <Link
        href="/admin/inventory"
        className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Inventory
      </Link>

      {/* Product Detail */}
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailContent handle={handle} />
      </Suspense>
    </div>
  );
}

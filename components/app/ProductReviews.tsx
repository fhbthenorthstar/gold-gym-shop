"use client";

import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Review = {
  _id: string;
  name: string;
  title: string;
  rating: number;
  body: string;
  createdAt: string;
  verifiedPurchase: boolean;
};

interface ProductReviewsProps {
  productId: string;
  productName?: string | null;
}

const sortOptions = [
  { label: "Most recent", value: "recent" },
  { label: "Highest rating", value: "highest" },
  { label: "Lowest rating", value: "lowest" },
];

const getRatingLabel = (rating: number) =>
  rating === 1 ? "star" : "stars";

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState("recent");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState({
    name: "",
    title: "",
    body: "",
    rating: 5,
  });

  const loadReviews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`);
      if (!response.ok) {
        throw new Error("Failed to load reviews");
      }
      const data = await response.json();
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch (err) {
      setError("Unable to load reviews right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const summary = useMemo(() => {
    const total = reviews.length;
    const average =
      total > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / total
        : 0;

    const counts = [5, 4, 3, 2, 1].map((value) => ({
      value,
      count: reviews.filter((review) => review.rating === value).length,
    }));

    return { total, average, counts };
  }, [reviews]);

  const sortedReviews = useMemo(() => {
    const items = [...reviews];
    switch (sort) {
      case "highest":
        return items.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return items.sort((a, b) => a.rating - b.rating);
      default:
        return items.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [reviews, sort]);

  const handleChange = (field: keyof typeof formState, value: string | number) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          name: formState.name,
          title: formState.title,
          body: formState.body,
          rating: formState.rating,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.error || "Failed to submit review");
      }

      const payload = await response.json();
      if (payload?.review) {
        setReviews((prev) => [payload.review, ...prev]);
      }

      toast.success("Thanks for your review!");
      setFormState({ name: "", title: "", body: "", rating: 5 });
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Unable to submit review right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">
            Customer Reviews
          </p>
          <h3 className="mt-2 text-3xl font-semibold text-white">
            {summary.average.toFixed(1)}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={cn(
                  "h-4 w-4",
                  index < Math.round(summary.average)
                    ? "fill-primary text-primary"
                    : "text-zinc-600"
                )}
              />
            ))}
            <span className="text-xs text-zinc-400">
              {summary.total} review{summary.total === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {summary.counts.map((entry) => {
            const percent =
              summary.total > 0 ? (entry.count / summary.total) * 100 : 0;
            return (
              <div key={entry.value} className="flex items-center gap-3">
                <span className="w-14 text-xs text-zinc-400">
                  {entry.value} {getRatingLabel(entry.value)}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs text-zinc-500">
                  {entry.count}
                </span>
              </div>
            );
          })}
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-primary text-black hover:bg-primary/90"
        >
          Write a review
        </Button>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-lg font-semibold text-white">
            Reviews for {productName ?? "this product"}
          </h4>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-9 w-44 border-zinc-800 bg-zinc-950 text-xs text-zinc-200">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-950 text-zinc-200">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 space-y-6">
          {isLoading ? (
            <p className="text-sm text-zinc-500">Loading reviews...</p>
          ) : error ? (
            <p className="text-sm text-zinc-500">{error}</p>
          ) : sortedReviews.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No reviews yet. Be the first to review!
            </p>
          ) : (
            sortedReviews.map((review) => (
              <div
                key={review._id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {review.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                  {review.verifiedPurchase && (
                    <span className="rounded-full border border-primary/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                      Verified Purchase
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={cn(
                        "h-4 w-4",
                        index < review.rating
                          ? "fill-primary text-primary"
                          : "text-zinc-600"
                      )}
                    />
                  ))}
                </div>

                <h5 className="mt-3 text-sm font-semibold text-white">
                  {review.title}
                </h5>
                <p className="mt-2 text-sm text-zinc-300">
                  {review.body}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-200">
          <DialogHeader>
            <DialogTitle className="text-white">Write a review</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Share your experience to help others choose the right gear.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      type="button"
                      key={value}
                      onClick={() => handleChange("rating", value)}
                      className="transition"
                      aria-label={`${value} ${getRatingLabel(value)}`}
                    >
                      <Star
                        className={cn(
                          "h-6 w-6",
                          value <= formState.rating
                            ? "fill-primary text-primary"
                            : "text-zinc-600"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <Input
              value={formState.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="Your name"
              className="border-zinc-800 bg-zinc-900 text-zinc-200"
              required
            />
            <Input
              value={formState.title}
              onChange={(event) => handleChange("title", event.target.value)}
              placeholder="Review title"
              className="border-zinc-800 bg-zinc-900 text-zinc-200"
              required
            />
            <Textarea
              value={formState.body}
              onChange={(event) => handleChange("body", event.target.value)}
              placeholder="Write your review"
              className="min-h-[120px] border-zinc-800 bg-zinc-900 text-zinc-200"
              required
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-zinc-700 text-zinc-200 hover:border-primary hover:text-primary/90"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-black hover:bg-primary/90"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

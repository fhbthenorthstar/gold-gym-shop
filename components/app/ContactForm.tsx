"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type SubmissionState = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<SubmissionState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      comment: String(formData.get("comment") ?? "").trim(),
    };

    if (!payload.name || !payload.phone || !payload.comment) {
      setStatus("error");
      setMessage("Please fill in all fields.");
      return;
    }

    setStatus("submitting");
    setMessage(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      form.reset();
      setStatus("success");
      setMessage("Thanks! We received your message and will get back soon.");
    } catch {
      setStatus("error");
      setMessage("Unable to submit right now. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
      <input
        type="text"
        name="name"
        placeholder="Name"
        required
        className="h-11 rounded-md border border-zinc-800 bg-black/70 px-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone number"
        required
        className="h-11 rounded-md border border-zinc-800 bg-black/70 px-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <textarea
        name="comment"
        placeholder="Comment"
        rows={4}
        required
        className="sm:col-span-2 rounded-md border border-zinc-800 bg-black/70 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {message && (
        <p
          className={`text-xs sm:col-span-2 ${
            status === "success" ? "text-primary" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}

      <Button
        type="submit"
        disabled={status === "submitting"}
        className="h-10 rounded-md bg-primary text-xs font-semibold uppercase tracking-[0.2em] text-black hover:bg-primary/90 sm:col-span-2"
      >
        {status === "submitting" ? "Sending..." : "Get in Touch"}
      </Button>
    </form>
  );
}

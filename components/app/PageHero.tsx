"use client";

interface PageHeroProps {
  title: string;
  subtitle?: string;
}

export function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <section
      className="relative overflow-hidden border-b border-zinc-800 bg-cover bg-center"
      style={{
        backgroundImage:
          "url(/trinners/head-trainers-01.webp)",
      }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 text-center text-white">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">
          Home / {title}
        </p>
        <h1 className="font-heading mt-4 text-3xl md:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm text-zinc-300">{subtitle}</p>
        )}
      </div>
    </section>
  );
}

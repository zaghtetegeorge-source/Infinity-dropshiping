"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  images: { url: string; alt: string }[];
  videoUrl?: string | null;
  title: string;
}

export function ProductGallery({ images, videoUrl, title }: Props) {
  const slides = [...images.map((i) => ({ type: "image" as const, ...i })), ...(videoUrl ? [{ type: "video" as const, url: videoUrl, alt: title }] : [])];
  const [active, setActive] = useState(0);
  const current = slides[active] ?? slides[0];

  if (!current) {
    return <div className="aspect-square rounded-xl bg-gray-100" />;
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
        {current.type === "video" ? (
          <video src={current.url} controls className="h-full w-full object-cover" poster={images[0]?.url} />
        ) : (
          <Image src={current.url} alt={current.alt || title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
        )}
      </div>
      {slides.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {slides.map((slide, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${i === active ? "border-black" : "border-transparent"}`}
            >
              {slide.type === "video" ? (
                <div className="flex h-full w-full items-center justify-center bg-gray-800 text-xs text-white">▶</div>
              ) : (
                <Image src={slide.url} alt={slide.alt || title} fill className="object-cover" />
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

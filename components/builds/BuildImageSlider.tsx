"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ImageLightbox from "@/components/builds/ImageLightbox";

interface BuildImageSliderProps {
  // 表示する画像
  images: string[];
  // 画像の説明
  alt: string;
}

// 作品画像を横スワイプで切り替えるスライダー。
export default function BuildImageSlider({
  images,
  alt,
}: BuildImageSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // 全画面表示中の画像。null なら閉じている
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const scrollToImage = (index: number) => {
    const track = trackRef.current;
    if (!track) return;

    const clamped = Math.max(0, Math.min(images.length - 1, index));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;

    setActiveIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  // 1枚だけのときは4:3に切り抜かず、画像の比率のまま表示する
  if (images.length === 1) {
    return (
      <div role="group" aria-label="作品画像" className="relative bg-zinc-900">
        <Image
          src={images[0]}
          alt={alt}
          width={0}
          height={0}
          sizes="(max-width: 1024px) 100vw, 1024px"
          priority
          className="h-auto w-full"
        />
        {/* 写真のクリックで全画面表示を開く */}
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          aria-label="画像を全画面で表示"
          className="absolute inset-0 cursor-zoom-in"
        />

        {lightboxIndex !== null && (
          <ImageLightbox
            images={images}
            alt={alt}
            index={lightboxIndex}
            onChange={setLightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-roledescription="カルーセル"
      aria-label="作品画像"
      className="relative bg-zinc-900"
    >
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scrollbar-none"
      >
        {images.map((src, index) => (
          <div
            key={`${src}-${index}`}
            role="group"
            aria-roledescription="スライド"
            aria-label={`${index + 1} / ${images.length}`}
            className="relative aspect-[4/3] w-full shrink-0 snap-center"
          >
            <Image
              src={src}
              alt={images.length > 1 ? `${alt} (${index + 1})` : alt}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority={index === 0}
              className="object-contain"
            />
            {/* 写真のクリックで全画面表示を開く */}
            <button
              type="button"
              onClick={() => setLightboxIndex(index)}
              aria-label={`${index + 1}枚目の画像を全画面で表示`}
              className="absolute inset-0 cursor-zoom-in"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollToImage(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="前の画像"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-zinc-700 shadow transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => scrollToImage(activeIndex + 1)}
            disabled={activeIndex === images.length - 1}
            aria-label="次の画像"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-zinc-700 shadow transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* 現在の位置を示すドット(クリックでその画像へ移動) */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollToImage(index)}
                aria-label={`${index + 1}枚目を表示`}
                aria-current={index === activeIndex}
                className={`h-2 w-2 cursor-pointer rounded-full ring-1 ring-zinc-900/20 transition ${
                  index === activeIndex ? "bg-white" : "bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          alt={alt}
          index={lightboxIndex}
          onChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}

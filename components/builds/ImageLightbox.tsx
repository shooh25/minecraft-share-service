"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageLightboxProps {
  // 表示する画像
  images: string[];
  // 画像の説明
  alt: string;
  // 表示中の画像
  index: number;
  // 表示する画像を切り替える
  onChange: (index: number) => void;
  // ビューアを閉じる
  onClose: () => void;
}

// 作品画像を画面全体に表示するビューア。
export default function ImageLightbox({
  images,
  alt,
  index,
  onChange,
  onClose,
}: ImageLightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowLeft" && index > 0) {
        onChange(index - 1);
      }
      if (event.key === "ArrowRight" && index < images.length - 1) {
        onChange(index + 1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [index, images.length, onChange, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="画像を全画面で表示"
      className="fixed inset-0 z-[100]"
    >
      <div
        className="absolute inset-0 bg-zinc-950/95"
        aria-hidden="true"
        onClick={onClose}
      />

      <div className="pointer-events-none absolute inset-0 p-4 sm:p-10">
        <div className="relative h-full w-full">
          <Image
            src={images[index]}
            alt={images.length > 1 ? `${alt} (${index + 1})` : alt}
            fill
            sizes="100vw"
            className="object-contain"
          />
        </div>
      </div>

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="閉じる"
        className="absolute right-4 top-4 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => onChange(index - 1)}
            disabled={index === 0}
            aria-label="前の画像"
            className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 sm:left-6"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => onChange(index + 1)}
            disabled={index === images.length - 1}
            aria-label="次の画像"
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 sm:right-6"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-medium text-white/80">
            {index + 1} / {images.length}
          </span>
        </>
      )}
    </div>
  );
}

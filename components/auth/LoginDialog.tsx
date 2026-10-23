"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import GoogleLoginButton from "./GoogleLoginButton";

type LoginDialogProps = {
  open: boolean;
  error: boolean;
  onClose: () => void;
};

// Headerのログインボタンから開くログインダイアログ。
export default function LoginDialog({ open, error, onClose }: LoginDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      // ダイアログ内でフォーカスを循環させる
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-zinc-950/40"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-dialog-title"
        aria-describedby="login-dialog-description"
        className="relative w-full max-w-sm rounded-md border border-zinc-200 bg-white p-8 text-center shadow-xl"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
        >
          <X className="h-4 w-4" />
        </button>

        <p
          id="login-dialog-title"
          className="text-2xl font-bold tracking-tight text-zinc-950"
        >
          craftshare<span className="text-zinc-400">.</span>
        </p>

        <p
          id="login-dialog-description"
          className="mt-3 text-sm leading-relaxed text-zinc-500"
        >
          Minecraft建築作品を探索・共有しよう。
        </p>

        <div className="mt-8">
          <GoogleLoginButton />
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">
            ログインに失敗しました。もう一度お試しください。
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { X } from "lucide-react";
import { useDialogScrollLock } from "@/components/ui/useDialogScrollLock";
import GoogleLoginButton from "./GoogleLoginButton";

type LoginDialogProps = {
  open: boolean;
  error: boolean;
  onClose: () => void;
};

// ログインダイアログ。
export default function LoginDialog({ open, error, onClose }: LoginDialogProps) {
  useDialogScrollLock(open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-zinc-950/40"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-dialog-title"
        aria-describedby="login-dialog-description"
        className="relative w-full max-w-sm rounded-md border border-zinc-200 bg-white p-8 text-center shadow-xl"
      >
        <button
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

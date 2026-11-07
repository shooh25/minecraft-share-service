"use client";

import { useEffect, useRef } from "react";
import { Check, CircleAlert } from "lucide-react";

export type ToastType = "success" | "error";

interface ToastProps {
  // 表示するメッセージ
  message: string | null;
  // メッセージの種類
  type?: ToastType;
  // 自動で閉じるまでの時間
  duration?: number;
  // 自動で閉じたときに呼ぶ
  onClose: () => void;
}

// 画面上部に一定時間だけ表示するチップ
export default function Toast({
  message,
  type = "success",
  duration = 3000,
  onClose,
}: ToastProps) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => onCloseRef.current(), duration);
    return () => window.clearTimeout(timer);
  }, [message, duration]);

  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[60] flex justify-center px-4">
      <div
        role={type === "error" ? "alert" : "status"}
        className={`animate-toast-in inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
          type === "success" ? "bg-zinc-900" : "bg-red-600"
        }`}
      >
        {type === "success" ? (
          <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <CircleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        {message}
      </div>
    </div>
  );
}

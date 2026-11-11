"use client";

import { useEffect } from "react";

// ダイアログを開いている間、背景のスクロールを止める
export function useDialogScrollLock(open: boolean) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);
}

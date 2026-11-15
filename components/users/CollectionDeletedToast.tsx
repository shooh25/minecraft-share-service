"use client";

import { useEffect, useState } from "react";
import Toast from "@/components/ui/Toast";

interface CollectionDeletedToastProps {
  // 削除直後に表示するか
  show: boolean;
}

// コレクション削除後に一覧で表示するトースト
export default function CollectionDeletedToast({
  show,
}: CollectionDeletedToastProps) {
  const [message, setMessage] = useState<string | null>(
    show ? "コレクションを削除しました" : null,
  );

  // 再読み込みで再表示しないよう、URLから削除フラグだけを消す
  useEffect(() => {
    if (!show) return;

    const params = new URLSearchParams(window.location.search);
    params.delete("deleted");
    const query = params.toString();

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }, [show]);

  return <Toast message={message} onClose={() => setMessage(null)} />;
}

// DBに保存された画像のオブジェクトキーを、ブラウザで表示できる公開URLに変換する。
export function imageUrl(key: string): string {
  const base = (process.env.R2_PUBLIC_URL ?? "").replace(/\/+$/, "");

  return `${base}/${key.replace(/^\/+/, "")}`;
}

import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// テスト内でも「@/」で読み込めるようにする
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});

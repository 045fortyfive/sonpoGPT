import type { NextConfig } from "next";

// 複数インスタンス同時起動時のロックファイル競合を避けるため、
// ポート番号が3000以外（明示指定された場合）はビルドディレクトリを分ける
const port = process.env.PORT || 3000;
const distDir = Number(port) === 3000 ? '.next' : `.next-${port}`;

const nextConfig: NextConfig = {
  distDir,
  /* config options here */
};

export default nextConfig;

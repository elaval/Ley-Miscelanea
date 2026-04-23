import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Necesario porque el repo tiene dos package-lock.json (scripts + site).
  // Sin esto, Turbopack infiere el workspace root desde la raíz del repo
  // y desordena los paths de output, causando 404 en Vercel.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;

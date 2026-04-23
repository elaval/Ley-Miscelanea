import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",    // genera archivos HTML/CSS/JS estáticos en out/
  trailingSlash: true, // necesario para que las rutas funcionen en hosting estático
};

export default nextConfig;

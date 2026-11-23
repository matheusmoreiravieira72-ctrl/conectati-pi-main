import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* O corpo de POST/PATCH com anexo base64 pode passar de 1 MB:
     aumenta o limite do Server Action para 8 MB. */
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;

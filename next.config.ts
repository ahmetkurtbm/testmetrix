import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Frontend'deki API isteklerini yakala
        destination: "http://18.195.252.134:5000/:path*", // Backend'in HTTP URL'si
      },
      {
        source: "/login", // Özel olarak /login yolunu yönlendir
        destination: "http://18.195.252.134:5000/login", // Backend'in /login endpoint'i
      },
    ];
  },
  // Diğer Next.js ayarları
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;

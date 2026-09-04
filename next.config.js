/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Bundle the read-only demo catalog DB into serverless functions
    outputFileTracingIncludes: {
      "/api/**/*": ["./prisma/seed-demo.db"],
      "/admin/**/*": ["./prisma/seed-demo.db"],
      "/account/**/*": ["./prisma/seed-demo.db"],
      "/search": ["./prisma/seed-demo.db"],
      "/category/*": ["./prisma/seed-demo.db"],
      "/brand/*": ["./prisma/seed-demo.db"],
      "/product/*": ["./prisma/seed-demo.db"],
      "/checkout*": ["./prisma/seed-demo.db"]
    }
  },
  images: {
    remotePatterns: [],
    formats: ["image/avif", "image/webp"]
  },
  async headers() {    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" }
        ]
      }
    ];
  }
};
module.exports = nextConfig;

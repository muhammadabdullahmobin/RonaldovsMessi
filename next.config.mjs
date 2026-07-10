const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isUserSite = repoName.endsWith(".github.io");
const basePath = process.env.GITHUB_ACTIONS === "true" && repoName && !isUserSite ? `/${repoName}` : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "media-cldnry.s-nbcnews.com" },
      { protocol: "https", hostname: "i.guim.co.uk" },
      { protocol: "https", hostname: "i0.wp.com" }
    ]
  }
};

export default nextConfig;

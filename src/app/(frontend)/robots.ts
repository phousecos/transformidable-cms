// @ts-nocheck
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://transformidable.media";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

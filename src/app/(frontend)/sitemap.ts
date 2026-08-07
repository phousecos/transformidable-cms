// @ts-nocheck
import config from "@payload-config";
import { getPayload } from "payload";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://transformidable.media";

// Static, always-present routes (the coming-soon placeholders are included so
// the structure is discoverable; drop any you'd rather keep out of the index).
const STATIC_PATHS = [
  "",
  "/publications",
  "/publications/case-files",
  "/publications/research-notes",
  "/podcast",
  "/about",
  "/research/agenda",
  "/research/methodology",
  "/research/governance-mechanisms",
  "/research/datasets",
  "/research/projects",
  "/briefings/webinars",
  "/briefings/live",
  "/tools/governance-codebook",
  "/tools/mechanism-explorer",
  "/tools/governance-watch",
  "/tools/assessments",
  "/tools/benchmarks",
  "/tools/risk-models",
];

async function publishedDocs(payload: any, collection: string) {
  try {
    const res = await payload.find({
      collection,
      where: { status: { equals: "published" } },
      limit: 1000,
      depth: 0,
    });
    return (res.docs || []).filter((d: any) => d?.slug);
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const now = new Date();
  const entries = STATIC_PATHS.map((p) => ({
    url: `${siteUrl}${p}`,
    lastModified: now,
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));

  try {
    const payload = await getPayload({ config });
    const [caseFiles, notes, pubs] = await Promise.all([
      publishedDocs(payload, "case-files"),
      publishedDocs(payload, "research-notes"),
      publishedDocs(payload, "publications"),
    ]);
    const add = (docs: any[], prefix: string) => {
      for (const d of docs) {
        entries.push({
          url: `${siteUrl}${prefix}/${d.slug}`,
          lastModified: d.updatedAt || d.publishedAt ? new Date(d.updatedAt || d.publishedAt) : now,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    };
    add(caseFiles, "/publications/case-files");
    add(notes, "/publications/research-notes");
    add(pubs, "/publications");
  } catch {
    // Fall back to the static routes if the CMS isn't reachable at build time.
  }

  return entries;
}

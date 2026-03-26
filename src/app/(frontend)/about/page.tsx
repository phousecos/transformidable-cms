// @ts-nocheck
import config from "@payload-config";
import { getPayload } from "payload";
import SiteNav from "../components/SiteNav";
import Footer from "../components/Footer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About — Transformidable",
  description: "About Transformidable — where technology meets leadership.",
};

function lexicalToHtml(node: any): string {
  if (!node) return "";
  if (node.type === "text" || (!node.type && typeof node.text === "string")) {
    let text = node.text ?? "";
    const fmt = typeof node.format === "number" ? node.format : 0;
    if (fmt & 1) text = `<strong>${text}</strong>`;
    if (fmt & 2) text = `<em>${text}</em>`;
    return text;
  }
  const children = (node.children ?? []).map(lexicalToHtml).join("");
  switch (node.type) {
    case "root": return children;
    case "paragraph": return `<p>${children}</p>`;
    case "heading": return `<${node.tag ?? "h2"}>${children}</${node.tag ?? "h2"}>`;
    case "quote": return `<blockquote>${children}</blockquote>`;
    case "linebreak": return "<br />";
    default: return children;
  }
}

function normalizeBody(body: any): string {
  if (typeof body === "string") return body;
  if (body?.root) return lexicalToHtml(body.root);
  return "";
}

export default async function AboutPage() {
  const payload = await getPayload({ config });
  const siteSettings = await payload.findGlobal({ slug: "site-settings" });
  const founderLetter = siteSettings.founderLetter as any;
  const founderBody = founderLetter?.body ? normalizeBody(founderLetter.body) : "";

  return (
    <>
      <SiteNav />
      <main className="bg-parchment">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <h1 className="font-serif text-4xl font-bold italic text-obsidian md:text-5xl">
            About
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-obsidian/60 font-light">
            {(siteSettings.tagline as string) || "Where Technology Meets Leadership"}
          </p>

          <div className="mt-4 h-[2px] w-16 bg-oxblood" />

          <div className="mt-12">
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-oxblood md:text-xs">
              About the Publication
            </p>
            <div className="mt-6 space-y-6 font-serif text-lg leading-[1.8] text-obsidian md:text-xl">
              <p>
                <strong>{(siteSettings.publicationName as string) || "Transformidable"}</strong> is an editorial publication at the intersection of technology and leadership. We believe the most important conversations in technology aren&apos;t about the technology itself — they&apos;re about the people trusted to lead it.
              </p>
            </div>
          </div>

          {founderLetter?.isVisible && founderBody && (
            <div className="mt-16">
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-oxblood md:text-xs">
                {founderLetter.title || "From the Founder"}
              </p>
              <div className="mt-4 h-[2px] w-16 bg-oxblood" />
              <div
                className="mt-10 space-y-6 font-serif text-lg leading-[1.8] text-obsidian md:text-xl [&>p]:mb-6"
                dangerouslySetInnerHTML={{ __html: founderBody }}
              />
              {founderLetter.signoff && (
                <div className="mt-8">
                  <p className="text-sm font-semibold text-obsidian">— {founderLetter.signoff}</p>
                </div>
              )}
            </div>
          )}

          {siteSettings.socialLinks && (
            <div className="mt-16 border-t border-obsidian/10 pt-8">
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-obsidian/40 md:text-xs">
                Connect
              </p>
              <div className="mt-4 flex gap-6">
                {(siteSettings.socialLinks as any)?.linkedin && (
                  <a href={(siteSettings.socialLinks as any).linkedin} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium text-oxblood transition-colors hover:text-gold">
                    LinkedIn
                  </a>
                )}
                {(siteSettings.socialLinks as any)?.website && (
                  <a href={(siteSettings.socialLinks as any).website} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium text-oxblood transition-colors hover:text-gold">
                    Website
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

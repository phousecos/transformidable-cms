// @ts-nocheck
import config from "@payload-config";
import { getPayload } from "payload";
import { ResearchShell } from "../components/research/ResearchShell";
import { Sky } from "../components/research/Sky";
import { fullDate } from "../components/research/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Governance Files",
  description:
    "The Transformidable podcast. Conversations on governance, leadership, and institutional transformation.",
};

const ExtArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
);

export default async function PodcastPage() {
  const payload = await getPayload({ config });

  let episodes: any[] = [];
  try {
    const res = await payload.find({
      collection: "podcast-episodes",
      where: { status: { equals: "published" } },
      sort: "-publishDate",
      depth: 2,
      limit: 50,
    });
    episodes = res.docs || [];
  } catch {
    // Collection may not be migrated yet in a fresh environment.
    episodes = [];
  }

  return (
    <ResearchShell>
      <section className="idx-hero tr-onsky">
        <Sky variant="podcast" />
        <div className="wrap idx-hero-in">
          <p className="kicker">Briefings &middot; Podcast</p>
          <h1 className="idx-title">The Governance Files</h1>
          <p className="idx-intro">
            The Transformidable podcast. Conversations on governance, leadership, and
            institutional transformation, examined on the record.
          </p>
        </div>
      </section>

      <div className="idx-body">
        <div className="wrap">
          {episodes.length === 0 ? (
            <p className="empty">Episodes will appear here as the series is published.</p>
          ) : (
            <div className="pub-list">
              {episodes.map((ep) => {
                const guest = ep.guest && typeof ep.guest === "object" ? ep.guest : null;
                const label = [
                  ep.season != null ? `S${ep.season}` : null,
                  ep.episodeNumber != null ? `E${ep.episodeNumber}` : null,
                ].filter(Boolean).join(" · ");
                return (
                  <article className="pub" key={ep.id}>
                    <span className="p-type">{label || "Episode"}</span>
                    <div>
                      <h4>{ep.title}</h4>
                      {guest && (
                        <p className="p-meta" style={{ color: "var(--gold-deep)" }}>
                          with {guest.name}{guest.role ? `, ${guest.role}` : ""}
                        </p>
                      )}
                      {ep.description && <p className="p-desc">{ep.description}</p>}
                      <div className="p-meta" style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                        {ep.publishDate && <span>{fullDate(ep.publishDate)}</span>}
                        {ep.audioUrl && (
                          <a className="link" href={ep.audioUrl} rel="noopener" target="_blank">
                            Listen <ExtArrow />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ResearchShell>
  );
}

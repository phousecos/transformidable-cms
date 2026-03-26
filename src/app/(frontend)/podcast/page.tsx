// @ts-nocheck
import config from "@payload-config";
import { getPayload } from "payload";
import SiteNav from "../components/SiteNav";
import Footer from "../components/Footer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Podcast — Transformidable",
  description: "Transformidable Conversations — interviews and insights for technology leaders driving enterprise transformation.",
};

export default async function PodcastPage() {
  const payload = await getPayload({ config });

  const episodesResult = await payload.find({
    collection: "podcast-episodes",
    where: { status: { equals: "published" } },
    sort: "-publishDate",
    depth: 2,
    limit: 50,
  });

  const episodes = episodesResult.docs;

  return (
    <>
      <SiteNav />
      <main className="bg-parchment">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <h1 className="font-serif text-4xl font-bold italic text-obsidian md:text-5xl">
            Podcast
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-obsidian/60 font-light">
            Transformidable Conversations — interviews and insights for technology leaders driving enterprise transformation.
          </p>

          {episodes.length > 0 ? (
            <div className="mt-12 space-y-10">
              {episodes.map((episode) => {
                const date = new Date(episode.publishDate);
                const dateStr = isNaN(date.getTime())
                  ? ""
                  : date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
                const guest = episode.guest && typeof episode.guest === "object" ? episode.guest : null;

                return (
                  <article key={episode.id} className="border-b border-obsidian/10 pb-10">
                    <div className="flex items-baseline gap-3">
                      {episode.season != null && episode.episodeNumber != null && (
                        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-oxblood md:text-xs">
                          S{episode.season} · E{episode.episodeNumber}
                        </span>
                      )}
                      {dateStr && (
                        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-obsidian/40 md:text-xs">
                          {dateStr}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-3 font-serif text-xl font-semibold leading-snug text-obsidian md:text-2xl">
                      {episode.title}
                    </h2>
                    {guest && (
                      <p className="mt-2 text-sm text-gold">
                        with {guest.name}{guest.role ? `, ${guest.role}` : ""}
                      </p>
                    )}
                    {episode.description && (
                      <p className="mt-3 text-sm leading-relaxed text-obsidian/60 md:text-base">
                        {episode.description}
                      </p>
                    )}
                    {episode.audioUrl && (
                      <div className="mt-4">
                        <a
                          href={episode.audioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block rounded-sm border border-oxblood/40 px-6 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-oxblood transition-colors hover:bg-oxblood/5 md:text-xs"
                        >
                          Listen →
                        </a>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-12">
              <p className="font-serif text-lg text-obsidian/60 italic">
                No episodes for this period.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

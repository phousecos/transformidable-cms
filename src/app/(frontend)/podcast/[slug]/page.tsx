// @ts-nocheck
import config from "@payload-config";
import { getPayload } from "payload";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ResearchShell } from "../../components/research/ResearchShell";
import { YouTubeEmbed } from "../../components/research/YouTubeEmbed";
import { fullDate } from "../../components/research/format";
import { renderLexical } from "../../components/research/lexical";
import { youtubeId } from "../../../../lib/podcast";

export const dynamic = "force-dynamic";

async function getEpisode(slug: string) {
  const payload = await getPayload({ config });
  try {
    const res = await payload.find({
      collection: "podcast-episodes",
      where: { slug: { equals: slug }, status: { equals: "published" } },
      depth: 2,
      limit: 1,
    });
    return res.docs?.[0] || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ep = await getEpisode(slug);
  if (!ep) return { title: "Episode not found" };
  return {
    title: ep.title,
    description: ep.description || undefined,
    alternates: { types: { "application/rss+xml": "/podcast/feed.xml" } },
  };
}

export default async function PodcastEpisodePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ep = await getEpisode(slug);
  if (!ep) notFound();

  const videoId = youtubeId(ep.youtubeUrl);
  const audioFile = ep.audioFile && typeof ep.audioFile === "object" ? ep.audioFile : null;
  const audioSrc = audioFile?.url || ep.audioUrl || null;
  const guest = ep.guest && typeof ep.guest === "object" ? ep.guest : null;
  const notesHtml = renderLexical(ep.showNotes);
  const transcriptHtml = renderLexical(ep.transcript);
  const label = [
    ep.season != null ? `Season ${ep.season}` : null,
    ep.episodeNumber != null ? `Episode ${ep.episodeNumber}` : null,
  ].filter(Boolean).join(" · ");
  const meta = [ep.publishDate && fullDate(ep.publishDate), ep.duration].filter(Boolean);

  return (
    <ResearchShell>
      <article className="detail">
        <div className="detail-wrap">
          <Link className="backlink" href="/podcast">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
            All episodes
          </Link>

          <p className="kicker">The Governance Files{label ? ` · ${label}` : ""}</p>
          <h1 className="detail-title">{ep.title}</h1>
          {guest && (
            <p className="detail-dek">with {guest.name}{guest.role ? `, ${guest.role}` : ""}</p>
          )}
          {meta.length > 0 && (
            <div className="detail-meta">
              {meta.map((m: string) => <span className="dm" key={m}>{m}</span>)}
            </div>
          )}

          {videoId && <YouTubeEmbed id={videoId} title={ep.title} />}
          {audioSrc && (
            // Audio-only listeners; preload="none" so the page doesn't start
            // downloading a large file nobody asked for.
            <audio className="episode-audio" controls preload="none" src={audioSrc}>
              <a href={audioSrc}>Download the episode audio</a>
            </audio>
          )}

          {ep.description && <p className="lead episode-section">{ep.description}</p>}

          {notesHtml && (
            <section className="episode-section">
              <h2>Show notes</h2>
              <div className="prose" dangerouslySetInnerHTML={{ __html: notesHtml }} />
            </section>
          )}

          {transcriptHtml && (
            <section className="episode-section">
              <h2>Transcript</h2>
              <div className="prose transcript" dangerouslySetInnerHTML={{ __html: transcriptHtml }} />
            </section>
          )}

          <div className="detail-foot">
            <Link className="link" href="/podcast">More episodes
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
          </div>
        </div>
      </article>
    </ResearchShell>
  );
}

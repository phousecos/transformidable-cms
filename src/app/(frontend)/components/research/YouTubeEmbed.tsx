// @ts-nocheck
"use client";
import { useState } from "react";

// Click-to-play YouTube embed. Until clicked it is only a thumbnail, so
// YouTube's player scripts and cookies load for viewers who actually watch.
// The player itself uses youtube-nocookie.com (YouTube's privacy mode).
export function YouTubeEmbed({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="yt">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button type="button" className="yt yt-facade" onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`}>
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
      <span className="yt-play" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
      </span>
    </button>
  );
}

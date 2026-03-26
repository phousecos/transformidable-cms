"use client";
import { useState } from "react";

interface HeroBookClubProps {
  book: {
    title: string;
    author: string;
    editorial_note: string;
    coverUrl: string | null;
    bookshop_url: string;
    amazon_url: string;
    illuminate_badge: boolean;
  };
  dateLabel: string;
}

export default function HeroBookClub({ book, dateLabel }: HeroBookClubProps) {
  const [showModal, setShowModal] = useState(false);

  // Truncate at ~200 chars for the hero preview
  const maxLen = 200;
  const needsTruncation = book.editorial_note.length > maxLen;
  const truncated = needsTruncation
    ? book.editorial_note.slice(0, maxLen).replace(/\s+\S*$/, "") + "…"
    : book.editorial_note;

  return (
    <>
      <section id="now-reading" className="bg-obsidian/95">
        <div className="mx-auto max-w-5xl px-6 pb-12 pt-10 md:pb-16 md:pt-14">
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold md:text-xs">
            {dateLabel}
          </p>
          <div className="mt-6 flex flex-col items-start gap-6 md:h-72 md:flex-row md:gap-10">
            {/* Fixed-size cover */}
            {book.coverUrl && (
              <div className="shrink-0 md:h-full">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="h-52 w-auto shadow-xl md:h-full md:w-auto"
                />
              </div>
            )}
            {/* Text content — constrained to match cover height */}
            <div className="flex flex-1 flex-col overflow-hidden md:h-full">
              {book.illuminate_badge && (
                <span className="mb-2 inline-block w-fit rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-obsidian">
                  ★ Illuminate Book Club
                </span>
              )}
              <h2 className="font-serif text-3xl font-bold text-parchment md:text-4xl">
                {book.title}
              </h2>
              <p className="mt-1 text-sm text-parchment/60">{book.author}</p>
              {book.editorial_note && (
                <div className="mt-4 flex-1 overflow-hidden">
                  <p className="text-sm leading-relaxed text-parchment/70 md:text-base">
                    {truncated}
                    {needsTruncation && (
                      <button
                        onClick={() => setShowModal(true)}
                        className="ml-1 font-medium text-gold transition-colors hover:text-parchment"
                      >
                        More
                      </button>
                    )}
                  </p>
                </div>
              )}
              <div className="mt-4 shrink-0">
                {book.bookshop_url && (
                  <a href={book.bookshop_url} target="_blank" rel="noopener noreferrer"
                    className="inline-block rounded-sm border border-parchment/40 px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-parchment transition-colors hover:bg-parchment/10 md:text-xs">
                    Buy on Bookshop.org
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian/60 p-6"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg bg-parchment p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-obsidian/40 transition-colors hover:text-obsidian"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="flex items-start gap-5">
              {book.coverUrl && (
                <img src={book.coverUrl} alt={book.title} className="w-24 shrink-0 shadow-md" />
              )}
              <div>
                <h3 className="font-serif text-xl font-bold text-obsidian">{book.title}</h3>
                <p className="mt-1 text-sm text-obsidian/50">{book.author}</p>
              </div>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-obsidian/70">
              {book.editorial_note}
            </p>
            <div className="mt-6 flex gap-3">
              {book.bookshop_url && (
                <a
                  href={book.bookshop_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm border border-oxblood/40 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-oxblood transition-colors hover:bg-oxblood/5 md:text-xs"
                >
                  Buy on Bookshop.org
                </a>
              )}
              {book.amazon_url && (
                <a
                  href={book.amazon_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm border border-obsidian/20 px-5 py-2 text-[10px] font-medium uppercase tracking-[0.15em] text-obsidian/50 transition-colors hover:text-obsidian md:text-xs"
                >
                  Amazon
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";
import { useState, useRef } from "react";
import { useDialog } from "./useDialog";

interface BookData {
  id: number;
  title: string;
  author: string;
  editorial_note: string;
  coverUrl: string | null;
  bookshop_url: string;
  amazon_url: string;
  illuminate_badge: boolean;
}

interface BookGridProps {
  books: BookData[];
  showBadge?: boolean;
}

export default function BookGrid({ books, showBadge = false }: BookGridProps) {
  const [modalBook, setModalBook] = useState<BookData | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dialogRef = useDialog(modalBook !== null, () => setModalBook(null));

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = 220 + 24; // card min-width + gap
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth * 2 : cardWidth * 2,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const showArrows = books.length > 3;

  return (
    <>
      <div className="relative mt-8">
        {/* Left arrow */}
        {showArrows && (
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-obsidian/80 text-parchment shadow-lg transition-colors hover:bg-obsidian md:-left-4"
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
        )}

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {books.map((book) => (
            <div key={book.id} className="flex w-[220px] shrink-0 flex-col">
              {book.coverUrl ? (
                <div className="mb-4 aspect-[2/3] w-full overflow-hidden bg-obsidian/10">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="mb-4 flex aspect-[2/3] w-full items-end bg-obsidian/10 p-3">
                  <p className="text-[9px] font-medium text-gold md:text-[10px]">{book.title}</p>
                </div>
              )}
              {showBadge && book.illuminate_badge && (
                <span className="mb-2 inline-block w-fit rounded-full bg-gold px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-obsidian">
                  ★ Illuminate
                </span>
              )}
              <h3 className="font-serif text-base font-semibold leading-snug text-obsidian">{book.title}</h3>
              <p className="mt-0.5 text-xs text-obsidian/50">{book.author}</p>
              <div className="mt-3 flex items-center gap-3">
                {book.bookshop_url && (
                  <a
                    href={book.bookshop_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-b border-oxblood/60 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-oxblood transition-colors hover:text-gold focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-oxblood md:text-xs"
                  >
                    Buy on Bookshop<span className="sr-only"> (opens in new window)</span>
                  </a>
                )}
                {book.editorial_note && (
                  <button
                    onClick={() => setModalBook(book)}
                    className="text-[10px] font-medium uppercase tracking-[0.15em] text-obsidian/40 transition-colors hover:text-obsidian md:text-xs"
                  >
                    More
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right arrow */}
        {showArrows && (
          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-obsidian/80 text-parchment shadow-lg transition-colors hover:bg-obsidian md:-right-4"
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        )}
      </div>

      {/* Description dialog: focus-trapped, Escape closes, focus returns. */}
      {modalBook && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian/60 p-6"
          onClick={() => setModalBook(null)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bookgrid-dialog-title"
            tabIndex={-1}
            className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg bg-parchment p-8 shadow-2xl focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-oxblood"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalBook(null)}
              className="absolute right-4 top-4 text-obsidian/70 transition-colors hover:text-obsidian focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-oxblood"
              aria-label="Close dialog"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="flex items-start gap-5">
              {modalBook.coverUrl && (
                <img src={modalBook.coverUrl} alt="" className="w-24 shrink-0 shadow-md" />
              )}
              <div>
                <h3 id="bookgrid-dialog-title" className="font-serif text-xl font-bold text-obsidian">{modalBook.title}</h3>
                <p className="mt-1 text-sm text-obsidian/70">{modalBook.author}</p>
              </div>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-obsidian/80">
              {modalBook.editorial_note}
            </p>
            <div className="mt-6 flex gap-3">
              {modalBook.bookshop_url && (
                <a
                  href={modalBook.bookshop_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm border border-oxblood/60 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-oxblood transition-colors hover:bg-oxblood/5 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-oxblood md:text-xs"
                >
                  Buy on Bookshop.org<span className="sr-only"> (opens in new window)</span>
                </a>
              )}
              {modalBook.amazon_url && (
                <a
                  href={modalBook.amazon_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm border border-obsidian/40 px-5 py-2 text-[10px] font-medium uppercase tracking-[0.15em] text-obsidian/80 transition-colors hover:text-obsidian focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-oxblood md:text-xs"
                >
                  Amazon<span className="sr-only"> (opens in new window)</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

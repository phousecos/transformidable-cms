// @ts-nocheck
import config from "@payload-config";
import { getPayload } from "payload";
import Footer from "../components/Footer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Reading Room — Transformidable",
  description: "Curated reads for technology leaders, change-makers, and lifelong learners.",
};

export default async function ReadingRoomPage() {
  const payload = await getPayload({ config });

  const booksResult = await payload.find({
    collection: "books",
    where: { status: { equals: "published" } },
    sort: "-published_date",
    depth: 1,
    limit: 100,
  });
  const books = booksResult.docs;

  let transformidableFeature = null;
  try {
    transformidableFeature = await payload.findGlobal({ slug: "transformidable-feature" });
  } catch {}

  const currentSelection = books.find((b) => b.is_current_selection);
  const pastSelections = books.filter((b) => !b.is_current_selection && b.section === "book_club");

  const sections = {
    career_leadership: { label: "Career & Leadership", id: "career", navLabel: "Career Lists", books: [] as any[] },
    pmo_technology: { label: "PMO & Technology", id: "pmo", navLabel: "PMO & Tech", books: [] as any[] },
    staff_picks: { label: "Staff Picks", id: "picks", navLabel: "Picks", books: [] as any[] },
  };
  for (const book of books) {
    if (book.section && book.section !== "book_club" && sections[book.section]) {
      sections[book.section].books.push(book);
    }
  }

  const getCoverUrl = (book: any) => {
    if (!book.cover_image) return null;
    if (typeof book.cover_image === "object" && book.cover_image.url) return book.cover_image.url;
    return null;
  };

  const now = new Date();
  const heroDateLabel = `Now Reading — ${now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;

  // Build nav items — only show sections that have content
  const navItems: { label: string; href: string }[] = [
    { label: "Now Reading", href: "#now-reading" },
  ];
  if (sections.career_leadership.books.length > 0) navItems.push({ label: "Career Lists", href: "#career" });
  if (sections.pmo_technology.books.length > 0) navItems.push({ label: "PMO & Tech", href: "#pmo" });
  navItems.push({ label: "Transformidable", href: "/" });
  if (sections.staff_picks.books.length > 0) navItems.push({ label: "Picks", href: "#picks" });

  return (
    <>
      {/* Reading Room sub-nav */}
      <nav className="sticky top-0 z-50 bg-obsidian">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="/reading-room" className="block shrink-0 font-serif text-lg font-bold text-parchment md:text-xl">
            The Reading Room
          </a>
          <div className="hidden items-center gap-5 md:flex lg:gap-7">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[10px] font-medium uppercase tracking-[0.15em] text-parchment/60 transition-colors hover:text-gold md:text-xs"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <main className="min-h-[60vh]">
        {/* Hero — Now Reading */}
        <section id="now-reading" className="bg-obsidian/95">
          <div className="mx-auto max-w-5xl px-6 pb-12 pt-10 md:pb-16 md:pt-14">
            {currentSelection ? (
              <>
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold md:text-xs">
                  {heroDateLabel}
                </p>
                <div className="mt-6 flex flex-col gap-6 md:flex-row md:gap-10">
                  {getCoverUrl(currentSelection) && (
                    <div className="shrink-0">
                      <img
                        src={getCoverUrl(currentSelection)}
                        alt={currentSelection.title}
                        className="w-28 shadow-xl md:w-36"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    {currentSelection.illuminate_badge && (
                      <span className="inline-block rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-obsidian">
                        ★ Illuminate Book Club
                      </span>
                    )}
                    <h2 className="mt-3 font-serif text-2xl font-bold text-parchment md:text-3xl">
                      {currentSelection.title}
                    </h2>
                    <p className="mt-1 text-sm text-parchment/60">{currentSelection.author}</p>
                    {currentSelection.editorial_note && (
                      <p className="mt-4 text-sm leading-relaxed text-parchment/70 md:text-base">
                        {currentSelection.editorial_note}
                      </p>
                    )}
                    <div className="mt-5">
                      {currentSelection.bookshop_url && (
                        <a href={currentSelection.bookshop_url} target="_blank" rel="noopener noreferrer"
                          className="inline-block rounded-sm border border-parchment/40 px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-parchment transition-colors hover:bg-parchment/10 md:text-xs">
                          Buy on Bookshop.org
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="font-serif text-lg text-parchment/60 italic">
                The Reading Room is being curated. Check back soon.
              </p>
            )}
          </div>
        </section>

        {/* FTC Affiliate Disclosure */}
        <div className="bg-obsidian/90 border-t border-parchment/5">
          <div className="mx-auto max-w-5xl px-6 py-3">
            <p className="text-[9px] leading-relaxed text-parchment/30 md:text-[10px]">
              The Reading Room contains affiliate links to Bookshop.org and Amazon. When you purchase through these links, we earn a small commission at no additional cost to you. As a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. Our editorial selections are independent of these relationships — we recommend what we believe in.
            </p>
          </div>
        </div>

        {/* Past Selections */}
        {pastSelections.length > 0 && (
          <BookSection id="past-selections" label="Past Selections" books={pastSelections} getCoverUrl={getCoverUrl} showBadge />
        )}

        {/* Career & Leadership */}
        {sections.career_leadership.books.length > 0 && (
          <BookSection id="career" label="Career & Leadership" books={sections.career_leadership.books} getCoverUrl={getCoverUrl} />
        )}

        {/* PMO & Technology */}
        {sections.pmo_technology.books.length > 0 && (
          <BookSection id="pmo" label="PMO & Technology" books={sections.pmo_technology.books} getCoverUrl={getCoverUrl} />
        )}

        {/* Transformidable strip */}
        {transformidableFeature && (
          <section id="transformidable" className="bg-oxblood">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-6 md:py-8">
              <div>
                {transformidableFeature.launch_label && (
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold md:text-xs">
                    {transformidableFeature.launch_label}
                  </p>
                )}
                <h3 className="mt-1 font-serif text-lg font-bold text-parchment md:text-xl">
                  Transformidable
                </h3>
                <p className="mt-0.5 text-xs text-parchment/70 md:text-sm">
                  {transformidableFeature.tagline
                    ? `Dr. Jerri Bland — ${transformidableFeature.tagline}`
                    : "Dr. Jerri Bland"}
                </p>
              </div>
              {transformidableFeature.cta_url && (
                <a href={transformidableFeature.cta_url} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 rounded-sm border border-parchment/50 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-parchment transition-colors hover:bg-parchment/10 md:text-xs">
                  {transformidableFeature.cta_label || "Pre-Order →"}
                </a>
              )}
            </div>
          </section>
        )}

        {/* Staff Picks */}
        {sections.staff_picks.books.length > 0 && (
          <BookSection id="picks" label="Staff Picks" books={sections.staff_picks.books} getCoverUrl={getCoverUrl} />
        )}
      </main>
      <Footer />
    </>
  );
}

function BookSection({ id, label, books, getCoverUrl, showBadge = false }: {
  id: string; label: string; books: any[]; getCoverUrl: (b: any) => string | null; showBadge?: boolean;
}) {
  return (
    <section id={id} className="bg-parchment">
      <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
        <h2 className="font-serif text-xl font-bold italic text-oxblood md:text-2xl">{label}</h2>
        <div className="mt-2 h-px bg-oxblood/20" />
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
          {books.map((book: any) => (
            <div key={book.id} className="group flex flex-col">
              {getCoverUrl(book) ? (
                <div className="relative mb-4 aspect-[2/3] w-full overflow-hidden bg-obsidian/10">
                  <img
                    src={getCoverUrl(book)}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                  <p className="relative -mt-6 px-2 text-[9px] font-medium text-gold md:text-[10px]">
                    {book.title}
                  </p>
                  {book.editorial_note && (
                    <div className="absolute inset-0 flex items-end bg-obsidian/80 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="text-xs leading-relaxed text-parchment/90">{book.editorial_note}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative mb-4 flex aspect-[2/3] w-full items-end bg-obsidian/10 p-3">
                  <p className="text-[9px] font-medium text-gold md:text-[10px]">{book.title}</p>
                  {book.editorial_note && (
                    <div className="absolute inset-0 flex items-end bg-obsidian/80 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="text-xs leading-relaxed text-parchment/90">{book.editorial_note}</p>
                    </div>
                  )}
                </div>
              )}
              {showBadge && book.illuminate_badge && (
                <span className="mb-2 inline-block w-fit rounded-full bg-gold px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-obsidian">
                  ★ Illuminate
                </span>
              )}
              <h3 className="font-serif text-base font-semibold leading-snug text-obsidian">{book.title}</h3>
              <p className="mt-0.5 text-xs text-obsidian/50">{book.author}</p>
              {book.bookshop_url && (
                <a
                  href={book.bookshop_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block border-b border-oxblood/40 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-oxblood transition-colors hover:text-gold md:text-xs"
                >
                  Buy on Bookshop
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

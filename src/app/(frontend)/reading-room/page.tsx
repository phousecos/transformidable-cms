// @ts-nocheck
import config from "@payload-config";
import { getPayload } from "payload";
import SiteNav from "../components/SiteNav";
import Footer from "../components/Footer";

export const dynamic = "force-dynamic";

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
    career_leadership: { label: "Career & Leadership", books: [] },
    pmo_technology: { label: "PMO & Technology", books: [] },
    staff_picks: { label: "Staff Picks", books: [] },
  };
  for (const book of books) {
    if (book.section && book.section !== "book_club" && sections[book.section]) {
      sections[book.section].books.push(book);
    }
  }

  const getCoverUrl = (book) => {
    if (!book.cover_image) return null;
    if (typeof book.cover_image === "object" && book.cover_image.url) return book.cover_image.url;
    return null;
  };

  return (
    <>
      <SiteNav />
      <main className="min-h-[60vh]">
        {/* Hero — Now Reading */}
        {currentSelection && (
          <section className="bg-obsidian">
            <div className="mx-auto max-w-5xl px-6 pb-16 pt-12 md:flex md:gap-12 md:pt-16 md:pb-20">
              {getCoverUrl(currentSelection) && (
                <div className="mb-8 shrink-0 md:mb-0">
                  <img
                    src={getCoverUrl(currentSelection)}
                    alt={currentSelection.title}
                    className="mx-auto w-48 shadow-2xl md:mx-0 md:w-56"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold md:text-xs">
                  Now Reading
                </p>
                {currentSelection.illuminate_badge && (
                  <span className="mt-2 inline-block rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-obsidian">
                    ★ Illuminate Book Club
                  </span>
                )}
                <h2 className="mt-4 font-serif text-3xl font-bold text-parchment md:text-4xl">
                  {currentSelection.title}
                </h2>
                <p className="mt-2 text-sm text-parchment/60">{currentSelection.author}</p>
                {currentSelection.editorial_note && (
                  <p className="mt-4 font-serif text-base leading-relaxed text-parchment/80 md:text-lg">
                    {currentSelection.editorial_note}
                  </p>
                )}
                <div className="mt-6 flex flex-wrap gap-3">
                  {currentSelection.bookshop_url && (
                    <a href={currentSelection.bookshop_url} target="_blank" rel="noopener noreferrer"
                      className="rounded-sm bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-obsidian transition-colors hover:bg-gold/90">
                      Buy on Bookshop.org →
                    </a>
                  )}
                  {currentSelection.amazon_url && (
                    <a href={currentSelection.amazon_url} target="_blank" rel="noopener noreferrer"
                      className="rounded-sm border border-parchment/30 px-6 py-3 text-xs font-medium uppercase tracking-[0.15em] text-parchment/70 transition-colors hover:text-parchment">
                      Amazon
                    </a>
                  )}
                  {currentSelection.payhip_url && (
                    <a href={currentSelection.payhip_url} target="_blank" rel="noopener noreferrer"
                      className="rounded-sm bg-oxblood px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-parchment transition-colors hover:bg-oxblood/90">
                      Buy Direct
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Past Selections */}
        {pastSelections.length > 0 && (
          <BookSection label="Past Selections" books={pastSelections} getCoverUrl={getCoverUrl} showBadge />
        )}

        {/* Career & Leadership */}
        {sections.career_leadership.books.length > 0 && (
          <BookSection label="Career & Leadership" books={sections.career_leadership.books} getCoverUrl={getCoverUrl} />
        )}

        {/* PMO & Technology */}
        {sections.pmo_technology.books.length > 0 && (
          <BookSection label="PMO & Technology" books={sections.pmo_technology.books} getCoverUrl={getCoverUrl} />
        )}

        {/* Transformidable strip */}
        {transformidableFeature && (transformidableFeature.tagline || transformidableFeature.cta_url) && (
          <section className="bg-oxblood">
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-12 md:flex-row md:gap-12 md:py-16">
              {transformidableFeature.cover_image && typeof transformidableFeature.cover_image === "object" && transformidableFeature.cover_image.url && (
                <img src={transformidableFeature.cover_image.url} alt="Transformidable" className="w-32 shadow-xl md:w-40" />
              )}
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-serif text-2xl font-bold text-parchment md:text-3xl">Transformidable</h3>
                {transformidableFeature.tagline && (
                  <p className="mt-2 text-sm text-parchment/80 md:text-base">{transformidableFeature.tagline}</p>
                )}
                {transformidableFeature.launch_label && (
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-parchment/50">{transformidableFeature.launch_label}</p>
                )}
              </div>
              {transformidableFeature.cta_url && (
                <a href={transformidableFeature.cta_url} target="_blank" rel="noopener noreferrer"
                  className="rounded-sm bg-gold px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-obsidian transition-colors hover:bg-gold/90">
                  {transformidableFeature.cta_label || "Pre-Order →"}
                </a>
              )}
            </div>
          </section>
        )}

        {/* Staff Picks */}
        {sections.staff_picks.books.length > 0 && (
          <BookSection label="Staff Picks" books={sections.staff_picks.books} getCoverUrl={getCoverUrl} />
        )}

        {/* Empty state */}
        {books.length === 0 && !currentSelection && (
          <section className="bg-parchment">
            <div className="mx-auto max-w-3xl px-6 py-20 text-center">
              <p className="font-serif text-lg text-obsidian/60 italic">The Reading Room is being curated. Check back soon.</p>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

function BookSection({ label, books, getCoverUrl, showBadge = false }) {
  return (
    <section className="bg-parchment">
      <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
        <h2 className="text-[10px] font-medium uppercase tracking-[0.25em] text-oxblood md:text-xs">{label}</h2>
        <div className="mt-4 h-[2px] w-16 bg-oxblood" />
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {books.map((book) => (
            <div key={book.id} className="flex flex-col">
              {getCoverUrl(book) && (
                <img src={getCoverUrl(book)} alt={book.title} className="mb-4 w-full max-w-[200px] shadow-md" />
              )}
              {showBadge && book.illuminate_badge && (
                <span className="mb-2 inline-block w-fit rounded-full bg-gold px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-obsidian">
                  ★ Illuminate
                </span>
              )}
              <h3 className="font-serif text-base font-semibold leading-snug text-obsidian md:text-lg">{book.title}</h3>
              <p className="mt-1 text-xs text-obsidian/50">{book.author}</p>
              {book.editorial_note && (
                <p className="mt-2 text-xs leading-relaxed text-obsidian/60">{book.editorial_note}</p>
              )}
              <div className="mt-3 flex gap-2">
                {book.bookshop_url && (
                  <a href={book.bookshop_url} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] font-medium uppercase tracking-[0.15em] text-oxblood transition-colors hover:text-gold">
                    Bookshop.org
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

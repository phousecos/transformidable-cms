// @ts-nocheck
import config from "@payload-config";
import { getPayload } from "payload";
import Footer from "../components/Footer";
import BookGrid from "../components/BookGrid";
import HeroBookClub from "../components/HeroBookClub";

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
    career_leadership: { label: "Career & Leadership", id: "career", books: [] as any[] },
    professional_development: { label: "Professional Development", id: "professional-development", books: [] as any[] },
    pmo_technology: { label: "PMO & Technology", id: "pmo", books: [] as any[] },
    staff_picks: { label: "Staff Picks", id: "picks", books: [] as any[] },
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

  const navItems: { label: string; href: string }[] = [
    { label: "Now Reading", href: "#now-reading" },
  ];
  if (sections.career_leadership.books.length > 0) navItems.push({ label: "Career Lists", href: "#career" });
  if (sections.professional_development.books.length > 0) navItems.push({ label: "Pro Dev", href: "#professional-development" });
  if (sections.pmo_technology.books.length > 0) navItems.push({ label: "PMO & Tech", href: "#pmo" });
  navItems.push({ label: "Transformidable", href: "/" });
  if (sections.staff_picks.books.length > 0) navItems.push({ label: "Picks", href: "#picks" });

  // Serialize books for client component
  const serializeBook = (book: any) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    editorial_note: book.editorial_note || "",
    coverUrl: getCoverUrl(book),
    bookshop_url: book.bookshop_url || "",
    amazon_url: book.amazon_url || "",
    illuminate_badge: book.illuminate_badge || false,
  });

  return (
    <>
      {/* Reading Room sub-nav */}
      <nav aria-label="Reading Room sections" className="sticky top-0 z-50 bg-obsidian">
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

      <main id="main-content" className="min-h-[60vh]">
        {/* Hero — Now Reading */}
        {currentSelection ? (
          <HeroBookClub
            book={serializeBook(currentSelection)}
            dateLabel={heroDateLabel}
          />
        ) : (
          <section id="now-reading" className="bg-obsidian/95">
            <div className="mx-auto max-w-5xl px-6 pb-12 pt-10 md:pb-16 md:pt-14">
              <p className="font-serif text-lg text-parchment/60 italic">
                The Reading Room is being curated. Check back soon.
              </p>
            </div>
          </section>
        )}

        {/* FTC Affiliate Disclosure */}
        <div className="bg-obsidian/90 border-t border-parchment/5">
          <div className="mx-auto max-w-5xl px-6 py-3">
            <p className="text-[9px] leading-relaxed text-parchment/50 md:text-[10px]">
              The Reading Room contains affiliate links to Bookshop.org and Amazon. When you purchase through these links, we earn a small commission at no additional cost to you. As a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. Our editorial selections are independent of these relationships — we recommend what we believe in.
            </p>
          </div>
        </div>

        {/* Past Selections */}
        {pastSelections.length > 0 && (
          <section id="past-selections" className="bg-parchment">
            <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
              <h2 className="font-serif text-xl font-bold italic text-oxblood md:text-2xl">Past Selections</h2>
              <div className="mt-2 h-px bg-oxblood/20" />
              <BookGrid books={pastSelections.map(serializeBook)} showBadge />
            </div>
          </section>
        )}

        {/* Career & Leadership */}
        {sections.career_leadership.books.length > 0 && (
          <section id="career" className="bg-parchment">
            <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
              <h2 className="font-serif text-xl font-bold italic text-oxblood md:text-2xl">Career &amp; Leadership</h2>
              <div className="mt-2 h-px bg-oxblood/20" />
              <BookGrid books={sections.career_leadership.books.map(serializeBook)} />
            </div>
          </section>
        )}

        {/* Professional Development */}
        {sections.professional_development.books.length > 0 && (
          <section id="professional-development" className="bg-parchment">
            <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
              <h2 className="font-serif text-xl font-bold italic text-oxblood md:text-2xl">Professional Development</h2>
              <div className="mt-2 h-px bg-oxblood/20" />
              <BookGrid books={sections.professional_development.books.map(serializeBook)} />
            </div>
          </section>
        )}

        {/* PMO & Technology */}
        {sections.pmo_technology.books.length > 0 && (
          <section id="pmo" className="bg-parchment">
            <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
              <h2 className="font-serif text-xl font-bold italic text-oxblood md:text-2xl">PMO &amp; Technology</h2>
              <div className="mt-2 h-px bg-oxblood/20" />
              <BookGrid books={sections.pmo_technology.books.map(serializeBook)} />
            </div>
          </section>
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
                  TRANSFORMIDABLE: Leading Change with Clarity, Courage, and Conviction
                </h3>
                <p className="mt-1 text-xs text-parchment/70 md:text-sm">
                  Dr. Jerri Bland{transformidableFeature.tagline ? ` — ${transformidableFeature.tagline}` : ""}
                </p>
                <span className="mt-2 inline-block rounded-sm border border-gold/60 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-gold md:text-[10px]">
                  Coming June 2026
                </span>
              </div>
              {transformidableFeature.cta_url && (
                <a href={transformidableFeature.cta_url} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 rounded-sm border border-parchment/60 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-parchment transition-colors hover:bg-parchment/10 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-gold md:text-xs">
                  {transformidableFeature.cta_label || "Pre-Order →"}<span className="sr-only"> (opens in new window)</span>
                </a>
              )}
            </div>
          </section>
        )}

        {/* Staff Picks */}
        {sections.staff_picks.books.length > 0 && (
          <section id="picks" className="bg-parchment">
            <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
              <h2 className="font-serif text-xl font-bold italic text-oxblood md:text-2xl">Staff Picks</h2>
              <div className="mt-2 h-px bg-oxblood/20" />
              <BookGrid books={sections.staff_picks.books.map(serializeBook)} />
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

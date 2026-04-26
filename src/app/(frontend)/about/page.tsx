// @ts-nocheck
import SiteNav from "../components/SiteNav";
import Footer from "../components/Footer";

export const metadata = {
  title: "About — Transformidable",
  description: "Ideas worth leading with. Transformidable Media.",
};

const brands = [
  {
    name: "Transformidable Media",
    url: "https://transformidable.media",
    domain: "transformidable.media",
    description: "C-suite strategy, transformational leadership philosophy, and the art of leading through change.",
  },
  {
    name: "Unlimited Powerhouse",
    url: "https://unlimitedpowerhouse.com",
    domain: "unlimitedpowerhouse.com",
    description: "Fractional CIO leadership, enterprise IT strategy, and technology-driven transformation.",
  },
  {
    name: "Lumynr",
    url: "https://lumynr.com",
    domain: "lumynr.com",
    description: "A vibrant and growing community for Black women in the technology profession.",
  },
  {
    name: "Vetters Group",
    url: "https://vettersgroup.com",
    domain: "vettersgroup.com",
    description: "Background checks, HR process improvement, and staffing verification.",
  },
];

function BrandCard({ brand }: { brand: { name: string; url: string; domain: string; description: string } }) {
  return (
    <a
      href={brand.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${brand.name} — ${brand.domain} (opens in new window)`}
      className="flex h-full flex-col rounded-lg border border-obsidian/15 bg-white/40 p-7 transition-all hover:border-oxblood/40 hover:shadow-sm focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-oxblood md:p-8"
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold md:text-xs">
        {brand.domain}
      </p>
      <h3 className="mt-3 font-serif text-xl font-bold text-obsidian md:text-2xl">{brand.name}</h3>
      <div className="mt-4 h-[2px] w-10 bg-oxblood" />
      <p className="mt-5 text-sm leading-relaxed text-obsidian/75 md:text-base">{brand.description}</p>
    </a>
  );
}

export default function AboutPage() {
  return (
    <>
      <SiteNav />
      <main id="main-content">
        {/* Dark hero */}
        <section className="bg-obsidian">
          <div className="mx-auto max-w-5xl px-6 pb-16 pt-12 md:pb-20 md:pt-16">
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-gold md:text-xs">
              About
            </p>
            <h1 className="mt-6 font-serif text-4xl font-bold italic text-parchment md:text-6xl lg:text-7xl">
              Ideas worth leading with.
            </h1>
            <div className="mt-8 max-w-3xl space-y-6 text-base leading-relaxed text-parchment/70 md:text-lg">
              <p>
                <strong className="font-semibold text-parchment">Transformidable Media</strong> is a publication of{" "}
                <span className="font-semibold text-parchment">Transformidable LLC</span>
                , bringing together the brands and perspectives of Jerri Bland, Ed.D., Unlimited Powerhouse, and Vetters Group — along with those of our partners at Kade Advisory.
              </p>
              <p>
                Together, these properties cover the full spectrum of technology leadership — from enterprise strategy and project execution to talent development, executive coaching, and community building for women in tech.
              </p>
            </div>
          </div>
        </section>

        {/* Our Brands */}
        <section className="bg-parchment">
          <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
            <h2 className="font-serif text-3xl font-bold text-obsidian md:text-4xl">
              Our Brands
            </h2>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
              {brands.map((brand) => (
                <BrandCard key={brand.domain} brand={brand} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

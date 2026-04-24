// @ts-nocheck
import SiteNav from "../components/SiteNav";
import Footer from "../components/Footer";

export const metadata = {
  title: "About — Transformidable",
  description: "Ideas worth leading with. Transformidable Media is a publication of Powerhouse Industries.",
};

const brandGroups = [
  {
    parent: "The Holding Company",
    description: "The strategic parent that oversees Powerhouse Industries and its portfolio of technology leadership brands.",
    brands: [
      {
        name: "Transformidable Media",
        url: "https://transformidable.media",
        domain: "transformidable.media",
        description: "C-suite strategy, transformational leadership philosophy, and the art of leading through change.",
      },
    ],
  },
  {
    parent: "Unlimited Powerhouse",
    description: "Fractional CIO leadership and enterprise technology strategy for organizations navigating transformation.",
    brands: [
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
        description: "Career relaunch, DEI in IT, and building community for women in technology leadership.",
      },
    ],
  },
  {
    parent: "Vetters Group",
    description: "Background checks and screening services that improve HR processes and staffing decisions.",
    brands: [
      {
        name: "Vetters Group",
        url: "https://vettersgroup.com",
        domain: "vettersgroup.com",
        description: "Background checks, HR process improvement, and staffing verification.",
      },
    ],
  },
];

const partnerBrands = {
  parent: "Velorum Software",
  brands: [
    {
      name: "AgentPMO",
      url: "https://agentpmo.com",
      domain: "agentpmo.com",
      description: "AI-driven delivery, PMO transformation, and execution discipline.",
    },
    {
      name: "Prept",
      url: "https://prept.com",
      domain: "prept.com",
      description: "AI-driven interview practice for interviews and work conversations.",
    },
  ],
};

function BrandCard({ brand }: { brand: { name: string; url: string; domain: string; description: string } }) {
  return (
    <a
      href={brand.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${brand.name} — ${brand.domain} (opens in new window)`}
      className="block rounded-lg border border-obsidian/20 p-6 transition-colors hover:border-obsidian/40 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-oxblood"
    >
      <h4 className="font-serif text-lg font-bold text-obsidian">{brand.name}</h4>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.15em] text-gold md:text-xs">
        {brand.domain}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-obsidian/80">{brand.description}</p>
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
                <a
                  href="https://phousecos.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-parchment underline decoration-parchment/40 underline-offset-2 transition-colors hover:text-gold"
                >
                  Powerhouse Industries
                </a>
                , bringing together the brands and perspectives of The Holding Company, Unlimited Powerhouse, and Vetters Group — along with those of our partners at Velorum Software, including AgentPMO and Prept.
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

            {brandGroups.map((group) => (
              <div key={group.parent} className="mt-12">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-oxblood md:text-xs">
                  {group.parent}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-obsidian/60 md:text-base">
                  {group.description}
                </p>
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {group.brands.map((brand) => (
                    <BrandCard key={brand.domain} brand={brand} />
                  ))}
                </div>
              </div>
            ))}

            {/* Divider */}
            <div className="mt-16 h-px bg-obsidian/10" />

            {/* Partner Brands */}
            <h2 className="mt-16 font-serif text-3xl font-bold text-obsidian md:text-4xl">
              Partner Brands
            </h2>

            <div className="mt-12">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-oxblood md:text-xs">
                {partnerBrands.parent}
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {partnerBrands.brands.map((brand) => (
                  <BrandCard key={brand.domain} brand={brand} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

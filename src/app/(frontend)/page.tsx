// @ts-nocheck
import config from "@payload-config";
import { getPayload } from "payload";
import Link from "next/link";
import { ResearchShell } from "./components/research/ResearchShell";
import { Sky } from "./components/research/Sky";
import { caseNo, fullDate } from "./components/research/format";
import "./components/home/home.css";

export const dynamic = "force-dynamic";

const DESCRIPTION =
  "Transformidable brings together research, executive education, publishing, and media to examine how change is led, how decisions are governed, and what enables organizations to deliver lasting outcomes.";

export const metadata = {
  title: { absolute: "Transformidable | Leadership and governance for consequential transformation" },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
};

const Arrow = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

// The four divisions, given equal weight: same card, same order everywhere.
// None is the parent of another.
const DIVISIONS = [
  {
    no: "01",
    name: "Research",
    href: "/research",
    purpose: "Case Files, the governance codebook, evidence-based findings, and the research agenda.",
    primary: { label: "Explore Case Files", href: "/publications/case-files" },
    secondary: { label: "Follow Research Updates", href: "#briefing" },
  },
  {
    no: "02",
    name: "Academy",
    href: "/academy",
    purpose: "Executive education, governance workshops, cohort programs, and future certificates.",
    primary: { label: "Explore Programs", href: "/academy" },
    secondary: { label: "Inquire About a Cohort", href: "/academy#register-organization" },
  },
  {
    no: "03",
    name: "Publishing",
    href: "/publishing",
    purpose: "The Transformidable Leader, its companion workbook, future books, and substantive publications.",
    primary: { label: "Discover The Transformidable Leader", href: "/publishing" },
    secondary: { label: "Join Book Updates", href: "/publishing#book-updates" },
  },
  {
    no: "04",
    name: "Media",
    href: "/media",
    purpose: "The Governance Files podcast, the Transformidable Briefing, interviews, and events.",
    primary: { label: "Listen to The Governance Files", href: "/podcast" },
    secondary: { label: "Attend a Briefing", href: "/briefings/live" },
  },
];

async function latest(payload: any, collection: string, sort: string) {
  try {
    const res = await payload.find({
      collection,
      where: { status: { equals: "published" } },
      sort,
      depth: 0,
      limit: 1,
    });
    return res.docs?.[0] || null;
  } catch {
    // Collection may not be migrated yet in a fresh environment.
    return null;
  }
}

async function currentCaseFile(payload: any) {
  try {
    const res = await payload.find({
      collection: "case-files",
      where: { status: { equals: "published" }, featured: { equals: true } },
      sort: "-publishedAt",
      depth: 0,
      limit: 1,
    });
    return res.docs?.[0] || (await latest(payload, "case-files", "-publishedAt"));
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const payload = await getPayload({ config });
  const [caseFile, episode] = await Promise.all([
    currentCaseFile(payload),
    latest(payload, "podcast-episodes", "-publishDate"),
  ]);

  return (
    <ResearchShell>
      <section className="hero tr-onsky">
        <Sky variant="home" />
        <div className="wrap hero-in">
          <div className="hero-tags fade">
            <span>Research</span><span className="dot" aria-hidden="true"></span>
            <span>Academy</span><span className="dot" aria-hidden="true"></span>
            <span>Publishing</span><span className="dot" aria-hidden="true"></span>
            <span>Media</span>
          </div>
          <h1 className="hero-head fade d1">
            Leadership and governance for consequential <span className="em">transformation.</span>
          </h1>
          <p className="lead hm-lead fade d2" style={{ maxWidth: "60ch" }}>{DESCRIPTION}</p>
          <div className="hero-cta fade d2" style={{ marginTop: 28 }}>
            <a className="btn" href="#divisions">Explore Transformidable <Arrow /></a>
            <a className="link" href="#briefing">Follow our work <Arrow s={13} /></a>
          </div>
        </div>
      </section>

      <section className="hm-divisions" id="divisions" aria-labelledby="hm-div-h">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <p className="kicker">Four divisions</p>
              <h2 className="h" id="hm-div-h">One commitment to stronger leadership and governance.</h2>
            </div>
          </div>
          <div className="hm-grid">
            {DIVISIONS.map((d) => (
              <article className="hm-div" key={d.name}>
                <span className="hm-no">{d.no}</span>
                <h3><Link href={d.href}>{d.name}</Link></h3>
                <p>{d.purpose}</p>
                <div className="hm-actions">
                  <Link className="hm-primary" href={d.primary.href}>{d.primary.label} <Arrow s={12} /></Link>
                  <Link className="hm-secondary" href={d.secondary.href}>{d.secondary.label}</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rule-band hm-featured" aria-labelledby="hm-feat-h">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <p className="kicker">Featured work</p>
              <h2 className="h" id="hm-feat-h">What is current across Transformidable.</h2>
            </div>
          </div>
          <div className="hm-grid">
            <Link className="hm-feat" href={caseFile ? `/publications/case-files/${caseFile.slug}` : "/publications/case-files"}>
              <span className="hm-feat-label">Research &middot; Current Case File</span>
              {caseFile ? (
                <>
                  {caseFile.caseNumber && <span className="hm-feat-meta">{caseNo(caseFile.caseNumber)}</span>}
                  <span className="hm-feat-title">{caseFile.title}</span>
                  {caseFile.dek && <span className="hm-feat-desc">{caseFile.dek}</span>}
                </>
              ) : (
                <>
                  <span className="hm-feat-title">Case Files</span>
                  <span className="hm-feat-desc">Anatomies of real governance decisions, traced from decision to outcome.</span>
                </>
              )}
              <span className="hm-feat-go">Read the case <Arrow s={12} /></span>
            </Link>

            <Link className="hm-feat" href="/academy/foundation-certificate">
              <span className="hm-feat-label">Academy &middot; In development</span>
              <span className="hm-feat-title">Foundation Certificate in AI Governance</span>
              <span className="hm-feat-desc">A three-course executive education program for boards, executives, and public-sector leaders. Interest registration is open.</span>
              <span className="hm-feat-go">Register interest <Arrow s={12} /></span>
            </Link>

            <Link className="hm-feat" href="/publishing">
              <span className="hm-feat-label">Publishing &middot; Forthcoming</span>
              <span className="hm-feat-title">The Transformidable Leader</span>
              <span className="hm-feat-desc">The forthcoming book from Transformidable, with a companion workbook.</span>
              <span className="hm-feat-go">Discover the book <Arrow s={12} /></span>
            </Link>

            <Link className="hm-feat" href={episode ? `/podcast/${episode.slug}` : "/podcast"}>
              <span className="hm-feat-label">Media &middot; {episode ? "Latest episode" : "The podcast"}</span>
              <span className="hm-feat-title">{episode ? episode.title : "The Governance Files"}</span>
              <span className="hm-feat-desc">
                {episode
                  ? [episode.episodeNumber && `Episode ${episode.episodeNumber}`, episode.publishDate && fullDate(episode.publishDate)].filter(Boolean).join(" · ")
                  : "Governance decisions, examined on the record."}
              </span>
              <span className="hm-feat-go">Listen <Arrow s={12} /></span>
            </Link>
          </div>
        </div>
      </section>

      <section className="rule-band hm-approach" aria-labelledby="hm-approach-h">
        <div className="wrap hm-approach-in">
          <div>
            <p className="kicker">Our approach</p>
            <h2 className="hm-h2" id="hm-approach-h">Understand consequential change. Decide better. Act with conviction.</h2>
          </div>
          <div>
            <p className="body">
              Transformidable advances the leadership and governance of organizational transformation through
              research, education, publishing, and media. We equip leaders and governing bodies to understand
              consequential change, make better decisions, and act with clarity and conviction.
            </p>
            <p className="body">
              Each division has its own audience and purpose. Research builds the evidence. The Academy turns it into
              executive education. Publishing carries the ideas further, and Media brings them into conversation.
              What they share is one intellectual identity and a commitment to stronger leadership and governance.
            </p>
            <p style={{ marginTop: 22 }}><Link className="link" href="/about">About Transformidable <Arrow s={13} /></Link></p>
          </div>
        </div>
      </section>

      <section className="rule-band hm-connect" aria-label="Stay connected">
        <div className="wrap hm-connect-in">
          <div>
            <p className="kicker">Stay connected</p>
            <p className="hm-connect-t">Follow the research, the programs, and the conversation.</p>
          </div>
          <div className="hm-connect-cta">
            <a className="btn" href="#briefing">Subscribe to the Brief <Arrow /></a>
            <Link className="link" href="/contact">Contact us <Arrow s={13} /></Link>
          </div>
        </div>
      </section>
    </ResearchShell>
  );
}

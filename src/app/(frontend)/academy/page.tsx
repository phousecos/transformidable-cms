// @ts-nocheck
import Link from "next/link";
import { AcademyFaq, AcademyHero, AcademyPrivateSessions, AcademyShell, Arrow } from "../components/academy/AcademySections";
import { LegacyAcademyAnchors } from "../components/academy/LegacyAcademyAnchors";
import { FEATURED, OTHER_AUDIENCES, PRIMARY_AUDIENCES, PROGRAMS, PROMISES, faqIn, programHref } from "./content";

const DESCRIPTION =
  "AI governance education for city councils, county commissions, university governing boards, and executive leadership teams. Programs for decision-makers, with practical governance tools, delivered as private sessions.";

export const metadata = {
  title: "Academy",
  description: DESCRIPTION,
  alternates: { canonical: "/academy" },
  openGraph: {
    title: "Transformidable Academy | AI Governance Education",
    description: DESCRIPTION,
    url: "/academy",
  },
};

export default function AcademyPage() {
  return (
    <AcademyShell>
      <LegacyAcademyAnchors />

      <AcademyHero
        kicker="Transformidable Academy · AI Governance Education"
        title="Govern the technology shaping your organization."
        intro="Executive education for the leaders and governing bodies who oversee decisions about artificial intelligence. Designed for decision-makers rather than technical specialists, with practical governance tools to take back to your organization."
        image={{ src: "/academy-hero-jerri-bland.webp", alt: "Jerri Bland", width: 577, height: 1053 }}
      >
        <div className="ac-hero-cta">
          <Link className="btn" href={programHref(FEATURED.slug)}>Explore the briefing for boards &amp; councils <Arrow s={14} /></Link>
        </div>
      </AcademyHero>

      <section className="ac-band" id="featured" aria-labelledby="ac-featured-h">
        <div className="wrap">
          <p className="kicker">Featured program</p>
          <div className="ac-feature">
            <div>
              <p className="ac-eyebrow">{FEATURED.eyebrow}</p>
              <h2 className="ac-feature-title" id="ac-featured-h">{FEATURED.title}</h2>
              <p className="ac-subtitle">{FEATURED.subtitle}</p>
              <p className="body">{FEATURED.intro[1]} {FEATURED.intro[2]}</p>
            </div>
            <div className="ac-feature-side">
              <p className="ac-feature-label">You&rsquo;ll take away</p>
              <p className="body">{FEATURED.takeaway}</p>
              <p style={{ marginTop: 18 }}><Link className="link" href={programHref(FEATURED.slug)}>View the briefing <Arrow /></Link></p>
            </div>
          </div>
        </div>
      </section>

      <section className="ac-band ac-band--parchment" id="programs" aria-labelledby="ac-programs-h">
        <div className="wrap">
          <p className="kicker">AI Governance Education</p>
          <h2 className="ac-h2" id="ac-programs-h">Three programs. Start wherever your organization is.</h2>
          <div className="ac-stages">
            {PROGRAMS.map((p) => (
              <Link className="ac-stage" href={programHref(p.slug)} key={p.slug}>
                <span className="ac-stage-name">{p.stage.name}</span>
                <span className="ac-stage-format">{p.stage.format}</span>
                <span className="ac-stage-desc">{p.stage.line}</span>
                <span className="ac-stage-title">{p.title}</span>
                <span className="ac-course-go">View program <Arrow /></span>
              </Link>
            ))}
          </div>
          <p className="ac-request">
            <Link className="link" href="/academy/organizations#register">Request information <Arrow /></Link>
          </p>
          <p className="ac-note">
            Each program stands on its own. None is a prerequisite: a council may want only the briefing, an executive
            team may be ready for the workshop, and an organization building an AI governance program may need the
            applied course.
          </p>
        </div>
      </section>

      <section className="ac-band" aria-labelledby="ac-promises-h">
        <div className="wrap">
          <p className="kicker">Every program</p>
          <h2 className="ac-h2" id="ac-promises-h">Built for the people responsible for oversight.</h2>
          <div className="ac-promises">
            {PROMISES.map((x) => (
              <div className="ac-promise" key={x.title}>
                <h3 className="ac-h3">{x.title}</h3>
                <p>{x.text}</p>
              </div>
            ))}
          </div>
          <div className="ac-who">
            <p className="ac-feature-label">Designed for</p>
            <ul className="ac-who-list">
              {PRIMARY_AUDIENCES.map((a) => <li key={a}>{a}</li>)}
            </ul>
            <p className="ac-note" style={{ marginTop: 10 }}>{OTHER_AUDIENCES}</p>
          </div>
        </div>
      </section>

      <AcademyPrivateSessions />

      <section className="ac-band" aria-labelledby="ac-approach-h">
        <div className="wrap ac-two">
          <div>
            <p className="kicker">Our approach</p>
            <h2 className="ac-h2" id="ac-approach-h">Research-informed. Practice-oriented.</h2>
          </div>
          <div>
            <p className="body">
              The Academy draws on the governance <Link className="ac-inline" href="/research">research</Link> of
              Transformidable, which examines how governance decisions shape technology-enabled transformation, and
              turns those lessons into practical executive education.
            </p>
          </div>
        </div>
      </section>

      <AcademyFaq items={faqIn("general")} heading="Common questions" />
    </AcademyShell>
  );
}

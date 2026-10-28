// @ts-nocheck
import Link from "next/link";
import { ResearchShell } from "../components/research/ResearchShell";
import { Sky } from "../components/research/Sky";
import { AcademyFaq, AcademyRegister, JsonLd } from "../components/academy/AcademySections";
import "../components/academy/academy.css";
import { AUDIENCES, COURSES, DISCIPLINES, PROGRAM_STATUS, faqFor, faqJsonLd } from "./content";

const DESCRIPTION =
  "Executive education for leaders responsible for consequential technology decisions. Introducing the Foundation Certificate in AI Governance for boards, executives, and public-sector leaders.";

export const metadata = {
  title: "Academy",
  description: DESCRIPTION,
  alternates: { canonical: "/academy" },
  openGraph: {
    title: "Transformidable Academy | Govern the technology shaping your organization",
    description: DESCRIPTION,
    url: "/academy",
  },
};

const Arrow = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

const FAQ_ITEMS = faqFor("academy");

export default function AcademyPage() {
  return (
    <ResearchShell>
      <JsonLd data={faqJsonLd(FAQ_ITEMS)} />

      <section className="idx-hero tr-onsky">
        <Sky variant="academy" />
        <div className="wrap idx-hero-in">
          <p className="kicker">Transformidable Academy</p>
          <h1 className="idx-title">Govern the technology shaping your organization.</h1>
          <p className="ac-hero-sub">Executive education for leaders responsible for consequential technology decisions.</p>
          <p className="idx-intro">
            Transformidable Academy helps executives, governing boards, and organizational leaders develop
            the knowledge, judgment, and practical capabilities to exercise informed oversight.
          </p>
          <div className="ac-hero-cta">
            <Link className="btn" href="/academy/foundation-certificate">Explore the certificate <Arrow /></Link>
            <a className="link" href="#register-organization">Inquire about a private cohort <Arrow s={13} /></a>
          </div>
        </div>
      </section>

      <section className="ac-band--cream" aria-labelledby="ac-why-h">
        <div className="wrap">
          <div className="ac-intro">
            <div>
              <p className="kicker">Why it matters</p>
              <h2 className="ac-h2" id="ac-why-h">Technology is advancing faster than the structures to govern it.</h2>
            </div>
            <div>
              <p className="body">
                Many organizations are adopting artificial intelligence before they have established the
                oversight, accountability, and decision rights needed to govern it. Leaders are asked to
                authorize, oversee, and answer for systems they may not fully understand.
              </p>
              <p className="body">
                Our programs connect technology fundamentals with governance principles, real-world research,
                and applied decision-making, so leaders can act with clarity and conviction.
              </p>
            </div>
          </div>
          <div className="ac-pillars" style={{ marginTop: 44 }}>
            <div className="ac-pillar">
              <span className="diamond" aria-hidden="true" />
              <h3>Understand the technology</h3>
              <p>What AI, language models, and agents can and cannot reliably do, in terms leaders need for oversight.</p>
            </div>
            <div className="ac-pillar">
              <span className="diamond" aria-hidden="true" />
              <h3>Govern its adoption</h3>
              <p>Six practical disciplines for exercising executive oversight of AI decisions.</p>
            </div>
            <div className="ac-pillar">
              <span className="diamond" aria-hidden="true" />
              <h3>Build the capability</h3>
              <p>Structures, decision rights, and reporting that make governance work day to day.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ac-band" id="programs" aria-labelledby="ac-programs-h">
        <div className="wrap">
          <p className="kicker">Introducing</p>
          <h2 className="ac-h2" id="ac-programs-h">Foundation Certificate in AI Governance</h2>
          <p className="lead">
            Artificial intelligence presents opportunities for organizational improvement, but it also raises new
            questions about authority, accountability, risk, information, and oversight. Our three-course
            certificate helps leaders address those questions with confidence.
          </p>
          <p style={{ marginTop: 18 }}><span className="ac-status">{PROGRAM_STATUS}</span></p>
          <div className="ac-courses">
            {COURSES.map((c) => (
              <article className="ac-course" key={c.no}>
                <span className="ac-no">{c.no}</span>
                <h3>{c.title}</h3>
                <p className="ac-tag">{c.tagline}</p>
                <p>{c.summary}</p>
              </article>
            ))}
          </div>
          <div className="ac-after">
            <Link className="btn" href="/academy/foundation-certificate">Explore the certificate program <Arrow /></Link>
            <a className="link" href="#register-individual">Join the interest list <Arrow s={13} /></a>
          </div>
        </div>
      </section>

      <section className="ac-band ac-band--parchment" id="who" aria-labelledby="ac-who-h">
        <div className="wrap ac-two">
          <div>
            <p className="kicker">Who it is for</p>
            <h2 className="ac-h2" id="ac-who-h">Built for the people responsible for governance.</h2>
            <p className="body">
              Our programs are designed for governing bodies and leadership teams who must make, oversee, and
              answer for technology decisions together.
            </p>
            <p className="ac-callout">No technical AI background is required for the foundation program.</p>
          </div>
          <ul className="ac-audiences">
            {AUDIENCES.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      </section>

      <section className="ac-band" id="cohorts" aria-labelledby="ac-cohorts-h">
        <div className="wrap">
          <p className="kicker">Ways to participate</p>
          <h2 className="ac-h2" id="ac-cohorts-h">Learn together. Govern more effectively.</h2>
          <div className="ac-paths">
            <div className="ac-path is-primary">
              <h3 className="ac-h3">Private organizational cohorts</h3>
              <p>
                Bring your governing body or executive leadership team together for a shared learning experience.
                A shared understanding of governance matters most when leaders must decide together.
              </p>
              <ul>
                <li>Facilitated discussion</li>
                <li>Sector-relevant scenarios</li>
                <li>Practical governance exercises</li>
                <li>Virtual or in person</li>
              </ul>
              <a className="btn" href="#register-organization">Request a private cohort discussion <Arrow /></a>
            </div>
            <div className="ac-path is-secondary">
              <h3 className="ac-h3">Individual enrollment</h3>
              <p>
                Executives and professionals may register interest in future open-enrollment programs and
                certificate cohorts, and hear first when dates and enrollment details are announced.
              </p>
              <a className="link" href="#register-individual">Join the interest list <Arrow s={13} /></a>
            </div>
          </div>
        </div>
      </section>

      <section className="ac-band ac-band--cream" id="approach" aria-labelledby="ac-approach-h">
        <div className="wrap">
          <div className="ac-intro">
            <div>
              <p className="kicker">Our approach</p>
              <h2 className="ac-h2" id="ac-approach-h">Research-informed. Practice-oriented.</h2>
            </div>
            <div>
              <p className="body">
                Transformidable Academy draws on the governance <Link className="ac-inline" href="/research/agenda">research</Link> of
                Transformidable and the practical disciplines of the Transformidable Governance Method. Our approach
                examines how governance decisions influence technology-enabled organizational transformation, and
                translates those lessons into practical executive education.
              </p>
              <p className="body">
                Participants learn not only what governance should accomplish, but how to recognize when it is
                working, when it is failing, and when intervention is required.
              </p>
            </div>
          </div>
          <p className="figlabel" style={{ marginTop: 40 }}>The Transformidable Governance Method</p>
          <ul className="ac-disciplines">
            {DISCIPLINES.map((d) => (
              <li className="ac-discipline" key={d.code}>
                <span className="code">{d.code}</span>
                <span className="desc">{d.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <AcademyFaq items={FAQ_ITEMS} />

      <AcademyRegister
        source="/academy"
        title="Be among the first to participate."
        intro="The Foundation Certificate in AI Governance is being prepared for future delivery. Register your interest to receive program announcements, upcoming dates, and enrollment information, or contact us to discuss a private cohort for your organization."
      />
    </ResearchShell>
  );
}

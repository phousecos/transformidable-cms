// @ts-nocheck
import Link from "next/link";
import { ResearchShell } from "../../components/research/ResearchShell";
import { Sky } from "../../components/research/Sky";
import { AcademyFaq, AcademyRegister, JsonLd } from "../../components/academy/AcademySections";
import "../../components/academy/academy.css";
import { COURSES, DISCIPLINES, OUTCOMES, faqFor, faqJsonLd } from "../content";

const DESCRIPTION =
  "A three-course executive education program from Transformidable Academy: understand AI, exercise oversight, and build governance capability. For boards, executives, and organizational decision-makers.";

export const metadata = {
  title: "Foundation Certificate in AI Governance",
  description: DESCRIPTION,
  alternates: { canonical: "/academy/foundation-certificate" },
  openGraph: {
    title: "Foundation Certificate in AI Governance | Transformidable Academy",
    description: DESCRIPTION,
    url: "/academy/foundation-certificate",
  },
};

const Arrow = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

const FAQ_ITEMS = faqFor("certificate");

// schema.org program markup. Offers and dates are left out until they are set.
const PROGRAM_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "EducationalOccupationalProgram",
  name: "Foundation Certificate in AI Governance",
  description: DESCRIPTION,
  educationalCredentialAwarded: "Foundation Certificate in AI Governance (executive education credential)",
  provider: { "@type": "Organization", name: "Transformidable Academy" },
  hasCourse: COURSES.map((c) => ({
    "@type": "Course",
    name: c.title,
    description: c.summary,
    provider: { "@type": "Organization", name: "Transformidable Academy" },
  })),
};

export default function FoundationCertificatePage() {
  return (
    <ResearchShell>
      <JsonLd data={PROGRAM_JSON_LD} />
      <JsonLd data={faqJsonLd(FAQ_ITEMS)} />

      <section className="idx-hero tr-onsky">
        <Sky variant="academy" />
        <div className="wrap idx-hero-in">
          <p className="kicker"><Link href="/academy">Transformidable Academy</Link> &middot; Foundation Certificate in AI Governance</p>
          <h1 className="idx-title">Understand AI. Exercise oversight. Build governance capability.</h1>
          <p className="idx-intro">A three-course executive education program for executives, governing boards, and organizational decision-makers.</p>
          <dl className="ac-facts">
            <div><dt>Delivery</dt><dd>Virtual or in person</dd></div>
            <div><dt>Enrollment</dt><dd>Private organizational cohorts and future open-enrollment sessions</dd></div>
            <div><dt>Program status</dt><dd>In development; interest registration open</dd></div>
          </dl>
          <div className="ac-hero-cta">
            <a className="btn" href="#register-organization">Discuss organizational training <Arrow /></a>
            <a className="link" href="#register-individual">Register interest <Arrow s={13} /></a>
          </div>
        </div>
      </section>

      <section className="ac-band--cream" aria-labelledby="ac-challenge-h">
        <div className="wrap ac-intro">
          <div>
            <p className="kicker">The challenge</p>
            <h2 className="ac-h2" id="ac-challenge-h">Leaders are accountable for systems they may not fully understand.</h2>
          </div>
          <div>
            <p className="body">
              Artificial intelligence is becoming part of organizational operations, services, and decision-making.
              Yet leaders may be asked to authorize, oversee, or accept accountability for systems they do not
              fully understand.
            </p>
            <p className="body">
              The Foundation Certificate in AI Governance addresses that challenge. Designed for executives,
              governing boards, and organizational decision-makers, the program combines accessible AI education
              with practical governance methods and applied organizational exercises.
            </p>
          </div>
        </div>
      </section>

      <section className="ac-band" id="outcomes" aria-labelledby="ac-outcomes-h">
        <div className="wrap">
          <p className="kicker">Learning outcomes</p>
          <h2 className="ac-h2" id="ac-outcomes-h">What participants will learn</h2>
          <p className="body" style={{ marginBottom: 26 }}>By completing the program, participants will be prepared to:</p>
          <ul className="ac-outcomes">
            {OUTCOMES.map((o) => <li key={o}>{o}</li>)}
          </ul>
        </div>
      </section>

      <section className="ac-band ac-band--parchment" id="pathway" aria-labelledby="ac-pathway-h">
        <div className="wrap">
          <p className="kicker">The program</p>
          <h2 className="ac-h2" id="ac-pathway-h">The three-course pathway</h2>
          <div className="ac-pathway">
            {COURSES.map((c, i) => (
              <article className="ac-step" key={c.no} id={`course-${i + 1}`}>
                <div className="ac-step-label">
                  <span className="ac-no">{c.no}</span>
                  <p className="ac-tag">{c.tagline}</p>
                </div>
                <div>
                  <h3 className="ac-h3">{c.title}</h3>
                  {c.detail.map((d) => <p className="body" key={d}>{d}</p>)}
                  {i === 1 && (
                    <ul className="ac-disciplines">
                      {DISCIPLINES.map((d) => (
                        <li className="ac-discipline" key={d.code}>
                          <span className="code">{d.code}</span>
                          <span className="desc">{d.desc}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="ac-format"><b>Planned format:</b> {c.format}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ac-band" id="certificate" aria-labelledby="ac-cert-h">
        <div className="wrap ac-two">
          <div>
            <p className="kicker">Credential</p>
            <h2 className="ac-h2" id="ac-cert-h">Earning the certificate</h2>
            <p className="body">
              The Foundation Certificate in AI Governance is a planned Transformidable Academy educational
              credential. Certificate requirements will include completion of all three courses, learning
              assessments, and an applied governance capstone.
            </p>
            <p className="ac-note">
              The program is designed as executive education, not as an independently accredited professional
              certification. Final assessment requirements and certificate issuance procedures will be published
              before enrollment opens.
            </p>
          </div>
          <div className="ac-paths" style={{ gridTemplateColumns: "1fr" }}>
            <div className="ac-path is-primary">
              <h3 className="ac-h3">Designed for organizational cohorts</h3>
              <p>
                A shared understanding of governance is especially valuable when leadership teams must make
                decisions together. Private cohorts are planned for municipalities, universities, financial
                institutions, nonprofits, and other organizations, and may include sector-relevant scenarios,
                facilitated leadership discussions, and an organizational governance action-planning exercise.
              </p>
              <a className="btn" href="#register-organization">Request a private cohort discussion <Arrow /></a>
            </div>
            <div className="ac-path is-secondary">
              <h3 className="ac-h3">Individual enrollment</h3>
              <p>
                Future open-enrollment cohorts will let executives and professionals participate independently.
                Register your interest to hear about scheduling, delivery formats, and enrollment.
              </p>
              <a className="link" href="#register-individual">Join the interest list <Arrow s={13} /></a>
            </div>
          </div>
        </div>
      </section>

      <AcademyFaq items={FAQ_ITEMS} heading="Questions about the certificate" />

      <AcademyRegister
        source="/academy/foundation-certificate"
        title="Take the next step."
        intro="Organizations can request a discussion about a private cohort; individuals can join the interest list for upcoming certificate cohorts and course announcements."
      />
    </ResearchShell>
  );
}

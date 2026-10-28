// @ts-nocheck
import Link from "next/link";
import { AcademyFaq, AcademyHero, AcademyRoutes, AcademyShell, Arrow, JsonLd } from "../../components/academy/AcademySections";
import { CERTIFICATE, COURSES, OUTCOMES, courseHref, faqIn } from "../content";

const DESCRIPTION =
  "A three-course executive education program from Transformidable Academy: understand AI, exercise oversight, and build governance capability. For boards, executives, and organizational decision-makers.";

export const metadata = {
  title: "Foundation Certificate in AI Governance",
  description: DESCRIPTION,
  alternates: { canonical: CERTIFICATE.href },
  openGraph: {
    title: "Foundation Certificate in AI Governance | Transformidable Academy",
    description: DESCRIPTION,
    url: CERTIFICATE.href,
  },
};

// schema.org program markup. Offers and dates are left out until they are set.
const PROGRAM_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "EducationalOccupationalProgram",
  name: CERTIFICATE.name,
  description: DESCRIPTION,
  educationalCredentialAwarded: `${CERTIFICATE.name} (executive education credential)`,
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
    <AcademyShell>
      <JsonLd data={PROGRAM_JSON_LD} />

      <AcademyHero
        kicker="Certificate program"
        title="Understand AI. Exercise oversight. Build governance capability."
        intro="The Foundation Certificate in AI Governance is a three-course executive education program for executives, governing boards, and organizational decision-makers. It combines accessible AI education with practical governance methods and applied organizational exercises."
        seed={89}
      >
        <dl className="ac-facts">
          <div><dt>Courses</dt><dd>Three, taken in sequence</dd></div>
          <div><dt>Delivery</dt><dd>Virtual or in person</dd></div>
          <div><dt>Status</dt><dd>In development; interest registration open</dd></div>
        </dl>
        <div className="ac-hero-cta">
          <a className="btn" href="#pathway">See the three courses <Arrow s={14} /></a>
        </div>
      </AcademyHero>

      <section className="ac-band" id="pathway" aria-labelledby="ac-pathway-h">
        <div className="wrap">
          <p className="kicker">The pathway</p>
          <h2 className="ac-h2" id="ac-pathway-h">Three courses, from understanding to practice.</h2>
          <div>
            {COURSES.map((c) => (
              <article className="ac-step" key={c.slug}>
                <div>
                  <span className="ac-no">{c.no}</span>
                  <p className="ac-tag">{c.tagline}</p>
                </div>
                <div>
                  <h3 className="ac-h3">{c.title}</h3>
                  <p className="body">{c.summary}</p>
                  <p className="ac-format"><b>Planned format:</b> {c.format}</p>
                  <Link className="link" href={courseHref(c.slug)}>View course <Arrow /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ac-band ac-band--parchment" aria-labelledby="ac-outcomes-h">
        <div className="wrap">
          <p className="kicker">Learning outcomes</p>
          <h2 className="ac-h2" id="ac-outcomes-h">By completing the program, participants will be prepared to</h2>
          <ul className="ac-outcomes is-wide">
            {OUTCOMES.map((o) => <li key={o}>{o}</li>)}
          </ul>
        </div>
      </section>

      <section className="ac-band" aria-labelledby="ac-cert-h">
        <div className="wrap ac-two">
          <div>
            <p className="kicker">Credential</p>
            <h2 className="ac-h2" id="ac-cert-h">Earning the certificate</h2>
          </div>
          <div>
            <p className="body">
              Certificate requirements will include completion of all three courses, learning assessments, and an
              applied governance capstone: an AI Governance Action Brief.
            </p>
            <p className="ac-note">
              The program is designed as executive education, not as an independently accredited professional
              certification. Final assessment requirements and certificate issuance procedures will be published
              before enrollment opens.
            </p>
          </div>
        </div>
      </section>

      <AcademyRoutes heading="Two ways to earn the certificate" query="?program=foundation-certificate#register" />

      <AcademyFaq items={faqIn("certificate")} heading="About the certificate" />
    </AcademyShell>
  );
}

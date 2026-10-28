// @ts-nocheck
import Link from "next/link";
import { AcademyFaq, AcademyHero, AcademyRoutes, AcademyShell, Arrow } from "../components/academy/AcademySections";
import { LegacyAcademyAnchors } from "../components/academy/AcademyNav";
import { AUDIENCES, CERTIFICATE, COURSES, PROGRAM_STATUS, courseHref, faqIn } from "./content";

const DESCRIPTION =
  "Executive education for leaders responsible for consequential technology decisions. Courses in AI governance for boards, executives, and public-sector leaders, as private cohorts or open enrollment.";

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

export default function AcademyPage() {
  return (
    <AcademyShell>
      <LegacyAcademyAnchors />

      <AcademyHero
        kicker="Transformidable Academy"
        title="Govern the technology shaping your organization."
        intro="Executive education for leaders responsible for consequential technology decisions. Our courses connect technology fundamentals with governance principles, real-world research, and applied decision-making."
      >
        <div className="ac-hero-cta">
          <a className="btn" href="#courses">Browse the courses <Arrow s={14} /></a>
        </div>
      </AcademyHero>

      <section className="ac-band" id="courses" aria-labelledby="ac-courses-h">
        <div className="wrap">
          <p className="kicker">Courses</p>
          <h2 className="ac-h2" id="ac-courses-h">Three courses, one certificate.</h2>
          <div className="ac-program">
            <div>
              <span className="ac-status">{PROGRAM_STATUS}</span>
              <h3 className="ac-program-name">{CERTIFICATE.name}</h3>
              <p>{CERTIFICATE.summary}</p>
            </div>
            <div className="ac-program-side">
              <Link className="link" href={CERTIFICATE.href}>About the certificate <Arrow /></Link>
            </div>
          </div>
          <div className="ac-courses">
            {COURSES.map((c) => (
              <Link className="ac-course" href={courseHref(c.slug)} key={c.slug}>
                <span className="ac-no">{c.no}</span>
                <span className="ac-course-title">{c.title}</span>
                <span className="ac-tag">{c.tagline}</span>
                <span className="ac-course-desc">{c.summary}</span>
                <span className="ac-course-meta">{c.delivery}</span>
                <span className="ac-course-go">View course <Arrow /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <AcademyRoutes />

      <section className="ac-band ac-band--parchment" aria-labelledby="ac-who-h">
        <div className="wrap ac-two">
          <div>
            <p className="kicker">Who the courses are for</p>
            <h2 className="ac-h2" id="ac-who-h">Built for the people responsible for governance.</h2>
            <p className="body">
              Leaders are increasingly asked to authorize, oversee, and answer for technology they may not fully
              understand. The courses are designed for the governing bodies and leadership teams in that position.
            </p>
            <p className="ac-note">No technical AI background is required.</p>
          </div>
          <ul className="ac-audiences">
            {AUDIENCES.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      </section>

      <section className="ac-band" aria-labelledby="ac-approach-h">
        <div className="wrap ac-two">
          <div>
            <p className="kicker">Our approach</p>
            <h2 className="ac-h2" id="ac-approach-h">Research-informed. Practice-oriented.</h2>
          </div>
          <div>
            <p className="body">
              The Academy draws on the governance <Link className="ac-inline" href="/research">research</Link> of
              Transformidable and the practical disciplines of the Transformidable Governance Method.
              Participants learn not only what governance should accomplish, but how to recognize when it is
              working, when it is failing, and when intervention is required.
            </p>
          </div>
        </div>
      </section>

      <AcademyFaq items={faqIn("general")} heading="Common questions" />
    </AcademyShell>
  );
}

// @ts-nocheck
import Link from "next/link";
import { AcademyFaq, AcademyHero, AcademyRegister, AcademyShell, Arrow } from "../../components/academy/AcademySections";
import { CERTIFICATE, COURSES, courseHref, faqIn } from "../content";

const DESCRIPTION =
  "Open enrollment in the Transformidable Academy Foundation Certificate in AI Governance for executives and professionals. Join the interest list for dates and enrollment.";

export const metadata = {
  title: "Open Enrollment for Individuals | Academy",
  description: DESCRIPTION,
  alternates: { canonical: "/academy/individuals" },
};

export default function IndividualsPage() {
  return (
    <AcademyShell>
      <AcademyHero
        kicker="For individuals"
        title="Take the courses on your own."
        intro="Future open-enrollment cohorts will let executives and professionals take the Foundation Certificate in AI Governance independently of their organization. No technical AI background is required."
        seed={127}
      >
        <div className="ac-hero-cta">
          <a className="btn" href="#register">Join the interest list <Arrow s={14} /></a>
        </div>
      </AcademyHero>

      <section className="ac-band" aria-labelledby="ac-ind-courses-h">
        <div className="wrap">
          <p className="kicker">What you will take</p>
          <h2 className="ac-h2" id="ac-ind-courses-h">Three courses, taken in sequence.</h2>
          <div className="ac-courses">
            {COURSES.map((c) => (
              <Link className="ac-course" href={courseHref(c.slug)} key={c.slug}>
                <span className="ac-no">{c.no}</span>
                <span className="ac-course-title">{c.title}</span>
                <span className="ac-course-desc">{c.summary}</span>
                <span className="ac-course-meta">{c.format}</span>
                <span className="ac-course-go">View course <Arrow /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="ac-band ac-band--parchment" aria-labelledby="ac-earn-h">
        <div className="wrap ac-two">
          <div>
            <p className="kicker">What you earn</p>
            <h2 className="ac-h2" id="ac-earn-h">The {CERTIFICATE.name}</h2>
          </div>
          <div>
            <p className="body">
              Completing all three courses, the learning assessments, and an applied capstone, an AI Governance
              Action Brief, earns the certificate.
            </p>
            <p className="ac-note">
              The certificate is an executive education credential, not an independently accredited professional
              certification.
            </p>
            <p style={{ marginTop: 16 }}><Link className="link" href={CERTIFICATE.href}>About the certificate <Arrow /></Link></p>
          </div>
        </div>
      </section>

      <section className="ac-band" aria-labelledby="ac-enroll-h">
        <div className="wrap ac-two">
          <div>
            <p className="kicker">How enrollment will work</p>
            <h2 className="ac-h2" id="ac-enroll-h">Hear first, then decide</h2>
            <p className="ac-note">Joining the interest list is not enrollment and carries no commitment.</p>
          </div>
          <ol className="ac-steps">
            <li><b>Join the interest list</b><span>Tell us a little about yourself and which courses interest you.</span></li>
            <li><b>Receive the announcement</b><span>Dates, delivery formats, and pricing for the first open-enrollment cohorts.</span></li>
            <li><b>Enroll when it opens</b><span>Choose a cohort that fits your schedule, if and when you are ready.</span></li>
          </ol>
        </div>
      </section>

      <AcademyFaq items={faqIn("individuals")} heading="Questions from individuals" />

      <AcademyRegister
        type="individual"
        source="/academy/individuals"
        title="Join the interest list."
        intro="Receive program announcements, upcoming dates, and enrollment information."
      />
    </AcademyShell>
  );
}

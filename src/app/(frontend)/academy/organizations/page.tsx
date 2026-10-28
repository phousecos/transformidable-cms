// @ts-nocheck
import Link from "next/link";
import { AcademyFaq, AcademyHero, AcademyRegister, AcademyShell, Arrow } from "../../components/academy/AcademySections";
import { CERTIFICATE, COURSES, courseHref, faqIn } from "../content";

const DESCRIPTION =
  "Private Transformidable Academy cohorts for boards and leadership teams: the Foundation Certificate in AI Governance, delivered to your group with scenarios from your sector.";

export const metadata = {
  title: "Private Cohorts for Organizations | Academy",
  description: DESCRIPTION,
  alternates: { canonical: "/academy/organizations" },
};

export default function OrganizationsPage() {
  return (
    <AcademyShell>
      <AcademyHero
        kicker="For organizations"
        title="Bring your leadership team through the program together."
        intro="A shared understanding of governance is especially valuable when leaders must make decisions together. Private cohorts take your governing body or executive team through the courses as one group, virtually or in person."
        seed={113}
      >
        <div className="ac-hero-cta">
          <a className="btn" href="#register">Request a cohort discussion <Arrow s={14} /></a>
        </div>
      </AcademyHero>

      <section className="ac-band" aria-labelledby="ac-includes-h">
        <div className="wrap ac-two">
          <div>
            <p className="kicker">Private cohorts</p>
            <h2 className="ac-h2" id="ac-includes-h">What a private cohort includes</h2>
            <p className="body">
              Private cohorts are planned for municipalities, universities, financial institutions, nonprofits, and
              other organizations whose leaders share responsibility for technology decisions.
            </p>
          </div>
          <ul className="ac-outcomes">
            <li>Facilitated discussion for your board or leadership team</li>
            <li>Scenarios drawn from your sector</li>
            <li>Practical governance exercises applied to your organization</li>
            <li>An organizational governance action-planning exercise</li>
            <li>Delivery in person, virtually, or a combination</li>
          </ul>
        </div>
      </section>

      <section className="ac-band ac-band--parchment" aria-labelledby="ac-org-courses-h">
        <div className="wrap">
          <p className="kicker">What your team can take</p>
          <h2 className="ac-h2" id="ac-org-courses-h">The full certificate, or a place to start.</h2>
          <p className="body" style={{ marginBottom: 24 }}>
            A cohort can take the full <Link className="ac-inline" href={CERTIFICATE.href}>{CERTIFICATE.name}</Link>.
            If a single session fits better, such as an AI briefing for your board based on Course 1, we can
            discuss that too.
          </p>
          <div className="ac-courses">
            {COURSES.map((c) => (
              <Link className="ac-course" href={courseHref(c.slug)} key={c.slug}>
                <span className="ac-no">{c.no}</span>
                <span className="ac-course-title">{c.title}</span>
                <span className="ac-course-meta">{c.format}</span>
                <span className="ac-course-go">View course <Arrow /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="ac-band" aria-labelledby="ac-how-h">
        <div className="wrap ac-two">
          <div>
            <p className="kicker">How it works</p>
            <h2 className="ac-h2" id="ac-how-h">From first conversation to delivery</h2>
            <p className="ac-note">An inquiry carries no commitment.</p>
          </div>
          <ol className="ac-steps">
            <li><b>A conversation</b><span>We learn about your group, your sector, and what your leaders need to govern well.</span></li>
            <li><b>A proposal</b><span>Scope, format, schedule, and pricing for your cohort, shaped by group size and how much tailoring you need.</span></li>
            <li><b>Delivery</b><span>The courses, delivered to your group in person, virtually, or both.</span></li>
            <li><b>Action planning</b><span>Your team applies what it has learned to your own organization&rsquo;s governance priorities.</span></li>
          </ol>
        </div>
      </section>

      <AcademyFaq items={faqIn("organizations")} heading="Questions from organizations" />

      <AcademyRegister
        type="organization"
        source="/academy/organizations"
        title="Request a private cohort discussion."
        intro="Tell us about your group, anticipated participant numbers, and preferred timing. We will be in touch to arrange a conversation."
      />
    </AcademyShell>
  );
}

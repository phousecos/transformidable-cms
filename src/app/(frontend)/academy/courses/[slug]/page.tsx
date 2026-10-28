// @ts-nocheck
import Link from "next/link";
import { notFound } from "next/navigation";
import { AcademyHero, AcademyRoutes, AcademyShell, Arrow, JsonLd } from "../../../components/academy/AcademySections";
import { CERTIFICATE, COURSES, DISCIPLINES, PROGRAM_STATUS, courseHref } from "../../content";

const findCourse = (slug: string) => COURSES.find((c) => c.slug === slug);

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = findCourse(slug);
  if (!course) return {};
  return {
    title: `${course.title} | Academy`,
    description: course.summary,
    alternates: { canonical: courseHref(course.slug) },
    openGraph: { title: `${course.title} | Transformidable Academy`, description: course.summary, url: courseHref(course.slug) },
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = findCourse(slug);
  if (!course) notFound();
  const i = COURSES.indexOf(course);
  const prev = COURSES[i - 1];
  const next = COURSES[i + 1];

  return (
    <AcademyShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: course.title,
          description: course.summary,
          provider: { "@type": "Organization", name: "Transformidable Academy" },
          isPartOf: { "@type": "EducationalOccupationalProgram", name: CERTIFICATE.name },
        }}
      />

      <AcademyHero
        kicker={`${course.no} of ${COURSES.length} · ${CERTIFICATE.name}`}
        title={course.title}
        intro={course.summary}
        seed={101 + i * 7}
      >
        <dl className="ac-facts">
          <div><dt>Planned format</dt><dd>{course.format}</dd></div>
          <div><dt>Delivery</dt><dd>{course.delivery}</dd></div>
          <div><dt>Status</dt><dd>{PROGRAM_STATUS}</dd></div>
        </dl>
        <div className="ac-hero-cta">
          <a className="btn" href="#take-this-course">How to take this course <Arrow s={14} /></a>
        </div>
      </AcademyHero>

      <section className="ac-band" aria-labelledby="ac-covers-h">
        <div className="wrap ac-two">
          <div>
            <p className="kicker">{course.tagline}</p>
            <h2 className="ac-h2" id="ac-covers-h">What the course covers</h2>
          </div>
          <div>
            {course.detail.map((d) => <p className="body" key={d}>{d}</p>)}
            {course.slug === "governing-ai-adoption" && (
              <ul className="ac-disciplines">
                {DISCIPLINES.map((d) => (
                  <li className="ac-discipline" key={d.code}>
                    <span className="code">{d.code}</span>
                    <span className="desc">{d.desc}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="ac-band ac-band--parchment" aria-labelledby="ac-able-h">
        <div className="wrap ac-two">
          <div>
            <p className="kicker">Outcomes</p>
            <h2 className="ac-h2" id="ac-able-h">After this course, you will be able to</h2>
            <p className="ac-note">No technical AI background is required.</p>
          </div>
          <ul className="ac-outcomes">
            {course.outcomes.map((o) => <li key={o}>{o}</li>)}
          </ul>
        </div>
      </section>

      <section className="ac-band" aria-labelledby="ac-fit-h">
        <div className="wrap ac-two">
          <div>
            <p className="kicker">Part of the certificate</p>
            <h2 className="ac-h2" id="ac-fit-h">{course.no} of the {CERTIFICATE.name}</h2>
          </div>
          <div>
            <p className="body">
              {CERTIFICATE.summary} Completing all three courses, the learning assessments, and an applied
              capstone earns the certificate.
            </p>
            <p style={{ marginTop: 16 }}><Link className="link" href={CERTIFICATE.href}>About the certificate <Arrow /></Link></p>
          </div>
        </div>
      </section>

      <div id="take-this-course">
        <AcademyRoutes heading="How to take this course" query={`?program=${course.program}#register`} />
      </div>

      <section className="ac-band" aria-label="Other courses" style={{ paddingBlock: "28px" }}>
        <div className="wrap ac-pager">
          {prev ? (
            <Link href={courseHref(prev.slug)}><span className="l">&larr; {prev.no}</span><span className="t">{prev.title}</span></Link>
          ) : <span />}
          {next ? (
            <Link href={courseHref(next.slug)}><span className="l">{next.no} &rarr;</span><span className="t">{next.title}</span></Link>
          ) : (
            <Link href={CERTIFICATE.href}><span className="l">The full program &rarr;</span><span className="t">{CERTIFICATE.name}</span></Link>
          )}
        </div>
      </section>
    </AcademyShell>
  );
}

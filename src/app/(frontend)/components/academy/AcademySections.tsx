// @ts-nocheck
import Link from "next/link";
import { ResearchShell } from "../research/ResearchShell";
import { Constellation } from "../research/Constellation";
import { AcademyInquiryForm } from "./AcademyInquiryForm";
import "./academy.css";

export const Arrow = ({ s = 13 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

// Every Academy page: the shared site chrome around the Academy's own surface.
export function AcademyShell({ children }) {
  return (
    <ResearchShell>
      <div className="ac">{children}</div>
    </ResearchShell>
  );
}

// The Academy's light banner, in place of the research side's dark sky.
export function AcademyHero({ kicker, title, intro, children = null, seed = 97 }) {
  return (
    <section className="ac-hero">
      <Constellation seed={seed} count={22} region={{ x0: 0.58, x1: 1, y0: 0, y1: 1 }} focal={{ x: 84, y: 40 }} className="ac-hero-stars" />
      <div className="wrap ac-hero-in">
        {kicker && <p className="kicker">{kicker}</p>}
        <h1 className="ac-title">{title}</h1>
        {intro && <p className="ac-hero-intro">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

// Organizations first: private sessions are the main way to take a program.
// Individuals get a quiet line pointing to the interest list.
export function AcademyPrivateSessions({ individuals = true }) {
  return (
    <section className="ac-band ac-band--parchment" aria-labelledby="ac-private-h">
      <div className="wrap ac-two">
        <div>
          <p className="kicker">Private sessions</p>
          <h2 className="ac-h2" id="ac-private-h">For your entire leadership team or governing body.</h2>
        </div>
        <div>
          <p className="body">
            Every program can be arranged as a private session for your council, commission, board, or executive
            team, virtually or in person, and adapted to your organization.
          </p>
          <p style={{ marginTop: 16 }}><Link className="link" href="/academy/organizations">Private sessions for organizations <Arrow /></Link></p>
          {individuals && (
            <p className="ac-note">
              Interested as an individual? <Link className="ac-inline" href="/academy/individuals">Join the interest list</Link> for future open programs.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// FAQ as native <details>, so answers open without JavaScript and stay in the
// page for search engines.
export function AcademyFaq({ items, heading = "Questions", more = true, groups = null }) {
  const sections = groups || [{ title: null, items }];
  return (
    <section className="ac-band ac-band--cream" id="faq" aria-labelledby="ac-faq-h">
      <div className="wrap ac-faq-wrap">
        <p className="kicker">Questions</p>
        <h2 className="ac-h2" id="ac-faq-h">{heading}</h2>
        {sections.map((g) => (
          <div className="ac-faq-group" key={g.title || "all"}>
            {g.title && <h3 className="ac-faq-group-h">{g.title}</h3>}
            <div className="ac-faq">
              {g.items.map((item) => (
                <details className="ac-faq-item" key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
        <p className="ac-faq-more">
          {more && <Link className="ac-inline" href="/academy/faq">All questions</Link>}
          {more && <span aria-hidden="true">&middot;</span>}
          <span>Something else? <Link className="ac-inline" href="/contact">Contact us</Link></span>
        </p>
      </div>
    </section>
  );
}

// The closing form on an audience page. One form, one audience.
export function AcademyRegister({ type, source, title, intro, program = "", heading = undefined, kicker = undefined }) {
  return (
    <section className="ac-band ac-band--parchment" id="register" aria-labelledby="ac-register-h">
      <div className="wrap ac-register">
        <div className="ac-register-copy">
          <p className="kicker">{kicker || (type === "organization" ? "Start a conversation" : "Interest list")}</p>
          <h2 className="ac-h2" id="ac-register-h">{title}</h2>
          <p className="body">{intro}</p>
        </div>
        <AcademyInquiryForm source={source} type={type} program={program} heading={heading} />
      </div>
    </section>
  );
}

export function JsonLd({ data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

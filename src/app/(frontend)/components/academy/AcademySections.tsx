// @ts-nocheck
import { AcademyInquiryForm } from "./AcademyInquiryForm";

// FAQ as native <details>, so answers open without JavaScript and stay in the
// page for search engines. Pair with faqJsonLd() for structured data.
export function AcademyFaq({ items, heading = "Frequently asked questions" }) {
  return (
    <section className="ac-band ac-band--cream" id="faq" aria-labelledby="ac-faq-h">
      <div className="wrap ac-faq-wrap">
        <div className="sec-head">
          <div>
            <p className="kicker">Questions</p>
            <h2 className="h" id="ac-faq-h">{heading}</h2>
          </div>
        </div>
        <div className="ac-faq">
          {items.map((item) => (
            <details className="ac-faq-item" key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
        <p className="ac-faq-more">
          Have a question we have not answered? <a className="link" href="/contact">Contact us</a>
        </p>
      </div>
    </section>
  );
}

// The closing call to action: both inquiry paths and the form. The empty
// anchors let a link open straight onto either form.
export function AcademyRegister({ source, title, intro }) {
  return (
    <section className="ac-band ac-band--parchment" id="register" aria-labelledby="ac-register-h">
      <span id="register-organization" className="ac-anchor" aria-hidden="true" />
      <span id="register-individual" className="ac-anchor" aria-hidden="true" />
      <div className="wrap ac-register">
        <div className="ac-register-copy">
          <p className="kicker">Register your interest</p>
          <h2 className="ac-h2" id="ac-register-h">{title}</h2>
          <p className="body">{intro}</p>
          <dl className="ac-register-paths">
            <div>
              <dt>For organizations</dt>
              <dd>Request a discussion about a private cohort, anticipated participant numbers, and preferred delivery dates.</dd>
            </div>
            <div>
              <dt>For individuals</dt>
              <dd>Join the interest list for upcoming certificate cohorts and course announcements.</dd>
            </div>
          </dl>
        </div>
        <AcademyInquiryForm source={source} />
      </div>
    </section>
  );
}

export function JsonLd({ data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

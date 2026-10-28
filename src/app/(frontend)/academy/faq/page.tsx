// @ts-nocheck
import { AcademyFaq, AcademyHero, AcademyShell, JsonLd } from "../../components/academy/AcademySections";
import { FAQ, FAQ_GROUPS, faqIn, faqJsonLd } from "../content";

export const metadata = {
  title: "Academy FAQ",
  description: "Answers to common questions about Transformidable Academy, the Foundation Certificate in AI Governance, private cohorts, and open enrollment.",
  alternates: { canonical: "/academy/faq" },
};

export default function AcademyFaqPage() {
  return (
    <AcademyShell>
      <JsonLd data={faqJsonLd(FAQ)} />
      <AcademyHero kicker="Academy FAQ" title="Questions and answers." intro="About the Academy, the certificate, private cohorts for organizations, and open enrollment for individuals." seed={131} />
      <AcademyFaq
        heading="Frequently asked questions"
        more={false}
        groups={FAQ_GROUPS.map((g) => ({ title: g.title, items: faqIn(g.key) }))}
      />
    </AcademyShell>
  );
}

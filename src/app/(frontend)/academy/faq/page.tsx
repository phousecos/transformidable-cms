// @ts-nocheck
import { AcademyFaq, AcademyHero, AcademyShell, JsonLd } from "../../components/academy/AcademySections";
import { FAQ, FAQ_GROUPS, faqIn, faqJsonLd } from "../content";

export const metadata = {
  title: "Academy FAQ",
  description: "Answers to common questions about Transformidable Academy's AI governance programs, private sessions for organizations, and the interest list for individuals.",
  alternates: { canonical: "/academy/faq" },
};

export default function AcademyFaqPage() {
  return (
    <AcademyShell>
      <JsonLd data={faqJsonLd(FAQ)} />
      <AcademyHero kicker="Academy FAQ" title="Questions and answers." intro="About the programs, private sessions for organizations, and the interest list for individuals." seed={131} />
      <AcademyFaq
        heading="Frequently asked questions"
        more={false}
        groups={FAQ_GROUPS.map((g) => ({ title: g.title, items: faqIn(g.key) }))}
      />
    </AcademyShell>
  );
}

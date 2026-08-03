// @ts-nocheck
import config from "@payload-config";
import { getPayload } from "payload";
import Link from "next/link";
import { ResearchShell } from "../../components/research/ResearchShell";
import { caseNo } from "../../components/research/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Case Files — Transformidable",
  description:
    "Anatomies of real governance decisions and why they held or failed. The evidence base behind the research.",
};

export default async function CaseFilesIndex() {
  const payload = await getPayload({ config });
  let docs: any[] = [];
  try {
    const res = await payload.find({
      collection: "case-files",
      where: { status: { equals: "published" } },
      sort: "-publishedAt",
      depth: 1,
      limit: 60,
    });
    docs = res.docs || [];
  } catch {
    docs = [];
  }

  return (
    <ResearchShell>
      <section className="idx-hero">
        <div className="wrap idx-hero-in">
          <p className="kicker">Research &middot; Case Files</p>
          <h1 className="idx-title">Case Files</h1>
          <p className="idx-intro">
            Anatomies of real governance decisions and why they held or failed. Each file traces the
            choices an organization made, and the outcome those choices bought.
          </p>
        </div>
      </section>

      <div className="idx-body">
        <div className="wrap">
          {docs.length === 0 ? (
            <p className="empty">Case files will appear here as the research is published.</p>
          ) : (
            <div className="cf-cards">
              {docs.map((cf) => (
                <Link className="cf-card" href={`/research/case-files/${cf.slug}`} key={cf.id}>
                  <span className="cn">Case File {caseNo(cf.caseNumber)}</span>
                  <h3>{cf.title}</h3>
                  {cf.dek && <p>{cf.dek}</p>}
                  <div className="cm">
                    {cf.sector && <span>{cf.sector}</span>}
                    {cf.method && <span>{cf.method}</span>}
                    {cf.readTime && <span>{cf.readTime} min</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </ResearchShell>
  );
}

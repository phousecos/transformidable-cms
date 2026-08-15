// @ts-nocheck
import Link from "next/link";
import { ResearchShell } from "../../components/research/ResearchShell";
import { Sky } from "../../components/research/Sky";

export const metadata = {
  title: "Governance Codebook",
  description:
    "The analytical framework behind Transformidable's research: how technology governance is defined, evidenced, and assessed, independent of outcome.",
};

const DOMAINS = [
  {
    code: "G1",
    name: "Governance Structure & Authority",
    definition:
      "The formal or practical allocation of governance authority over a technology matter, including governing bodies, retained and delegated authority, organizational jurisdiction, and governance capacity.",
    question: "Who has authority to govern this matter, and how is that authority structured?",
    includes:
      "Governance bodies, steering committees, executive sponsorship, retained and delegated authority, charters, governance-body composition, organizational jurisdiction, governance capacity, and authority allocated to vendors or third parties.",
    note: "Delegation is not treated as inherently deficient.",
  },
  {
    code: "G2",
    name: "Decision Rights & Accountability",
    definition:
      "The allocation of rights to recommend, approve, reject, authorize, suspend, terminate, accept risk, or otherwise make consequential technology decisions, together with accountability for those decisions.",
    question: "Who can make which decisions, and who is accountable for them?",
    includes:
      "Approval and veto authority, go/no-go authority, funding authority, risk acceptance, suspension and termination rights, accountability assignments, role ambiguity, delegated decision rights, and responsibility matrices.",
  },
  {
    code: "G3",
    name: "Oversight, Assurance & Challenge",
    definition:
      "Mechanisms used to independently monitor, validate, challenge, review, or assure technology performance, governance, compliance, controls, readiness, or risk.",
    question:
      "How does the organization determine whether what it is being told is reliable, and whether governance expectations are being met?",
    includes:
      "Independent reviews, internal audit, quality assurance, testing, validation, user acceptance, readiness reviews, control assessments, governing-body challenge, and performance validation.",
    note: "Testing is treated as an assurance mechanism, not inherently as evidence of failure.",
  },
  {
    code: "G4",
    name: "Risk, Policy & Control Governance",
    definition:
      "Structures through which technology risks, policies, standards, thresholds, controls, exceptions, and acceptable-use conditions are established and governed.",
    question:
      "What rules and risk boundaries govern the technology, and how are those boundaries established and maintained?",
    includes:
      "Technology policies, AI acceptable-use policies, risk appetite and tolerance, control requirements, approval conditions, exception procedures, risk registers, compliance requirements, and prohibited uses.",
  },
  {
    code: "G5",
    name: "Information, Transparency & Escalation",
    definition:
      "The production, quality, flow, presentation, elevation, and use of information required for technology governance and decision-making.",
    question:
      "What did decision-makers know, when did they know it, how did they know it, and what happened when information warranted attention?",
    includes:
      "Status and risk reporting, dashboards, information quality, omitted or filtered information, escalation thresholds, employee concerns, reporting frequency, transparency, and management response to elevated concerns.",
  },
  {
    code: "G6",
    name: "Vendor & Third-Party Governance",
    definition:
      "Governance of vendors, integrators, consultants, model providers, contractors, cloud providers, and other external parties upon whom the organization depends.",
    question:
      "How does the organization retain appropriate governance over technology activities performed or influenced by third parties?",
    includes:
      "Vendor selection, contracting, contract administration, performance measures, service expectations, third-party risk, vendor accountability, scope changes, AI and model-provider governance, and dependency and concentration risk.",
  },
  {
    code: "G7",
    name: "Change, Configuration & Lifecycle Governance",
    definition:
      "Governance of material changes to technology, configuration, scope, models, functionality, use, deployment conditions, or operating environment throughout the technology lifecycle.",
    question:
      "How are material technology changes authorized, tested, documented, controlled, and, when necessary, reauthorized?",
    includes:
      "Configuration and code changes, model updates, scope changes, new AI uses, production changes, change approval, configuration baselines, version changes, environment promotion, and decommissioning.",
  },
  {
    code: "G8",
    name: "Data, Access, Privacy & Security Governance",
    definition:
      "Governance mechanisms controlling technology-related data quality, use, access, privilege, segregation, privacy, confidentiality, security, and integrity.",
    question:
      "How does the organization govern who or what may access, use, modify, rely upon, or disclose data and technology resources?",
    includes:
      "Role-based access, least privilege, segregation of duties, privileged-access reviews, data integrity and reconciliation, privacy controls, confidential data handling, AI training and prompt data, and identity governance.",
  },
  {
    code: "G9",
    name: "Stakeholder, External & Institutional Governance",
    definition:
      "Governance mechanisms through which affected stakeholders, institutional obligations, external authorities, and broader organizational interests influence technology decisions.",
    question: "Whose interests and external obligations must be incorporated into governance?",
    includes:
      "Board responsibilities, regulation, labor and employee interests, collective bargaining, customers, citizens, students, patients, users, legal review, accessibility, ethics, and interagency and external oversight.",
    note: "External scrutiny is not itself evidence of internal governance deficiency.",
  },
  {
    code: "G10",
    name: "Adaptation, Intervention & Learning",
    definition:
      "The ability of governance structures to reconsider prior decisions, intervene, recover, adapt, and learn when technology, evidence, performance, risk, or circumstances materially change.",
    question: "What happens when the assumptions supporting the original governance decision no longer hold?",
    includes:
      "Corrective intervention, governance restructuring, recovery actions, suspension and reauthorization, lessons learned, policy revision, control strengthening, incident response, and responses to audit findings.",
    note: "Intervention is not inherently evidence of failure. Timely intervention can demonstrate effective governance.",
  },
];

export default function GovernanceCodebookPage() {
  return (
    <ResearchShell>
      <section className="idx-hero tr-onsky">
        <Sky variant="tools" />
        <div className="wrap idx-hero-in">
          <p className="kicker">Tools · Governance Codebook</p>
          <h1 className="idx-title">The Technology Governance Codebook</h1>
          <p className="idx-intro">
            The analytical framework behind every Governance Files case: how Transformidable defines,
            evidences, and assesses technology governance, independent of whether an initiative
            ultimately succeeded or failed.
          </p>
        </div>
      </section>

      <article className="detail">
        <div className="detail-wrap">
          <div className="detail-meta">
            <span className="dm"><b>Version</b> 0.1</span>
            <span className="dm"><b>Status</b> Prototype</span>
            <span className="dm"><b>Initial pilot</b> UCPath</span>
            <span className="dm"><b>Maintainer</b> Jerri Bland, Ed.D., PMP</span>
          </div>

          <div className="prose" style={{ marginTop: 34 }}>
            <p>
              The Technology Governance Codebook supports systematic, outcome-neutral analysis of
              technology governance. It is the research instrument behind every Governance Files case:
              the same definitions and questions are applied whether the matter at hand ended well,
              ended badly, or is still unfolding.
            </p>
            <blockquote>
              How do governance decisions and mechanisms shape the adoption, use, transformation,
              operation, and consequences of technology within organizations?
            </blockquote>
            <p>
              The codebook is designed to examine governance across favorable, adverse, mixed,
              recovered, ongoing, and indeterminate outcomes. It does not assume that:
            </p>
            <ul>
              <li>an adverse outcome establishes governance failure;</li>
              <li>a favorable outcome establishes effective governance;</li>
              <li>a governance deficiency necessarily produces realized harm;</li>
              <li>effective governance eliminates the possibility of adverse consequences; or</li>
              <li>technology governance occurs only within formal projects or implementations.</li>
            </ul>
            <p>
              Coding first establishes how governance operated. Governance effectiveness, consequences,
              and the relationship between them are assessed separately, and only afterward.
            </p>
          </div>

          <section className="case-section" id="governance-matter">
            <h2 className="case-h">What we study: the Governance Matter</h2>
            <div className="prose" style={{ marginTop: 0 }}>
              <p>
                The unit of research is a <strong>Governance Matter</strong>: a defined instance in
                which organizational authority, oversight, accountability, policy, control, or
                decision-making is exercised, or reasonably may be expected to be exercised, over a
                consequential technology activity, decision, system, relationship, or use.
              </p>
              <p>
                Governance Matters include, among others: technology projects and transformations; ERP
                and student information system implementations; AI deployments and use cases;
                enterprise technology policies; technology acquisitions and investment decisions;
                vendor and third-party relationships; data practices and cybersecurity decisions; and
                technology incidents and how institutions respond to them. A single matter may draw on
                many source documents and many separately coded pieces of evidence.
              </p>
            </div>
          </section>

          <section className="case-section" id="outcome-neutrality">
            <h2 className="case-h">Outcome neutrality</h2>
            <div className="prose" style={{ marginTop: 0 }}>
              <p>
                Outcome neutrality is foundational to the methodology. Transformidable does not begin
                with whether an initiative succeeded or failed and work backward to decide whether
                governance was good or bad. Governance is coded independently of the known outcome: a
                successful initiative may still contain governance deficiencies, and an unsuccessful one
                may contain governance mechanisms that operated effectively.
              </p>
              <p>
                Governance effectiveness, consequences, and any relationship between them are
                characterized separately, and each only after governance itself has been described.
              </p>
            </div>
          </section>

          <section className="case-section" id="domains">
            <h2 className="case-h">The ten governance domains</h2>
            <div className="prose" style={{ marginTop: 0 }}>
              <p>
                Every coded piece of evidence is assigned one primary governance domain, and may be
                assigned secondary domains when independently supported. The ten domains are the core
                of the taxonomy.
              </p>
              {DOMAINS.map((d) => (
                <div key={d.code}>
                  <h3 id={d.code}>{d.code} — {d.name}</h3>
                  <p>{d.definition}</p>
                  <p><strong>Core question:</strong> {d.question}</p>
                  <p><strong>Includes:</strong> {d.includes}</p>
                  {d.note && <p><em>{d.note}</em></p>}
                </div>
              ))}
            </div>
          </section>

          <section className="case-section" id="how-the-analysis-works">
            <h2 className="case-h">How the analysis works</h2>
            <div className="prose" style={{ marginTop: 0 }}>
              <p style={{ fontFamily: "var(--sans)", fontWeight: 700, letterSpacing: ".02em" }}>
                Evidence → Governance → Design &amp; Operation → Effectiveness → Consequences → Relationship
              </p>
              <p>
                Each governance mechanism found in the evidence is described first, then examined for
                how it was designed and how it actually operated in practice, and separately for the
                strength and quality of the evidence supporting that description. Effectiveness and
                consequences are assessed afterward, and only then, cautiously, any relationship between
                them. Several distinctions hold throughout:
              </p>
              <ul>
                <li>Governance mechanisms are not consequences.</li>
                <li>Effectiveness is not inferred from the outcome.</li>
                <li>Governance and consequences are characterized independently before any relationship between them is assessed.</li>
                <li>Causal language is used only to the extent the evidence actually supports it.</li>
              </ul>
            </div>
          </section>

          <section className="case-section" id="evidence-standards">
            <h2 className="case-h">Evidence &amp; research standards</h2>
            <div className="prose" style={{ marginTop: 0 }}>
              <p>
                Findings are built from audits and oversight reports, litigation and court records, laws
                and regulations, policies and governance frameworks, contracts and procurement records,
                institutional records, labor agreements, academic research, journalism, interviews,
                hearings and testimony, and vendor or interested-party material.
              </p>
              <p>
                Not every source carries the same evidentiary weight. Transformidable tracks the role a
                source plays (discovery, evidence, corroboration, or context), how independent or
                interested its origin is, and whether it was produced at the time of the matter or
                afterward. A source that is valuable for locating information is not automatically
                sufficient to support an analytical conclusion on its own.
              </p>
              <p>
                Absence of evidence is not treated as evidence of absence. If available sources are
                silent on a governance mechanism, it is classified as not evidenced, not as absent;
                classifying a mechanism as absent requires evidence that affirmatively supports that
                conclusion.
              </p>
            </div>
          </section>

          <section className="case-section" id="version-status">
            <h2 className="case-h">Version &amp; validation status</h2>
            <div className="prose" style={{ marginTop: 0 }}>
              <p>
                Technology Governance Codebook v0.1 is a prototype, and UCPath is its initial operational
                pilot. UCPath alone cannot validate an outcome-neutral technology-governance codebook, so
                v0.1 should not be read as validated, an industry standard, predictive, statistically
                established, a maturity model, or a best-practice framework. It is a developmental
                instrument, and the research program intentionally allows evidence to test and refine it.
              </p>
              <p>
                Before any promotion to v1.0, the codebook will be tested against a deliberately varied
                set of matters, favorable, adverse, and mixed outcomes; project and non-project
                governance; and matters with genuinely indeterminate evidence, to surface overlapping
                domains, missing mechanisms, and ambiguous definitions before the taxonomy is treated as
                settled.
              </p>
              <p>
                <strong>Current version: 0.1 (Prototype), released August 2026.</strong> Initial release
                of the Technology Governance Codebook, expanding the research methodology from ERP and
                student-information-system failure mechanisms to outcome-neutral analysis of technology
                governance across both project and non-project governance matters. Definitions change
                only through a version bump; no version is silently altered, and prior versions remain
                archived as the codebook evolves.
              </p>
            </div>
          </section>

          <section className="case-section" id="codebook-and-cases">
            <h2 className="case-h">How this connects to the Governance Files</h2>
            <div className="prose" style={{ marginTop: 0 }}>
              <p>
                Every published Governance Files case identifies which version of the Technology
                Governance Codebook governed its analysis. If a case is later recoded under a newer
                version, the original methodological provenance is preserved alongside the current one,
                so a reader can always determine which analytical framework produced a given published
                finding.
              </p>
            </div>
          </section>

          <p className="detail-note">
            The codebook describes governance first. The evidence determines what the research
            concludes.
          </p>

          <div className="detail-foot" style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <Link className="btn" href="/publications/case-files">
              Read the case files
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <Link className="link" href="/about">About the research</Link>
          </div>
        </div>
      </article>
    </ResearchShell>
  );
}

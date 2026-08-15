// Shared source of truth for the G1-G10 taxonomy, drawn from the Technology
// Governance Codebook. Used by both /tools/governance-codebook and
// /tools/mechanism-explorer so the two pages can never drift on meaning.
export const DOMAINS = [
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

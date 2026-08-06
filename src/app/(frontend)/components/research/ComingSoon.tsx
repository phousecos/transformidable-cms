// @ts-nocheck
import { ResearchShell } from "./ResearchShell";
import { Sky } from "./Sky";

// A themed placeholder for pages that are part of the information architecture
// but not built yet. Keeps the whole nav functional (no 404s) while each
// section is fleshed out.
export function ComingSoon({ kicker, title, intro, blurb, sky = "research" }) {
  return (
    <ResearchShell>
      <section className="idx-hero tr-onsky">
        <Sky variant={sky} />
        <div className="wrap idx-hero-in">
          {kicker && <p className="kicker">{kicker}</p>}
          <h1 className="idx-title">{title}</h1>
          {intro && <p className="idx-intro">{intro}</p>}
        </div>
      </section>
      <div className="idx-body">
        <div className="wrap">
          <div className="coming-soon">
            <span className="soon-badge">Coming soon</span>
            <p className="lead">{blurb || "This section is in development. Check back soon."}</p>
          </div>
        </div>
      </div>
    </ResearchShell>
  );
}

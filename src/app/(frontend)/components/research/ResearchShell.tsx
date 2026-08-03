// @ts-nocheck
import "./research.css";
import { ResearchNav } from "./ResearchNav";
import { ResearchFooter } from "./ResearchFooter";

// The shared chrome for every research page: theme-scoped container, sticky
// masthead, and footer. Page content goes in <main> for the skip link.
export function ResearchShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="tr">
      <ResearchNav />
      <main id="main-content">{children}</main>
      <ResearchFooter />
    </div>
  );
}

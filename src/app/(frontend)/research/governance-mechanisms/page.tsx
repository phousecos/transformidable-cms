import { redirect } from "next/navigation";

// This is the G1-G10 taxonomy, now the interactive domain picker on the
// Codebook page instead of a separate page. Redirect any existing
// links/bookmarks.
export default function GovernanceMechanismsRedirect() {
  redirect("/tools/governance-codebook#domains");
}

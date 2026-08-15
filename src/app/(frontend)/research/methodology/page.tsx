import { redirect } from "next/navigation";

// Methodology is covered by the Codebook's Overview, Outcome Neutrality,
// How the Analysis Works, and Evidence & Research Standards sections
// instead of as a separate page. Redirect any existing links/bookmarks.
export default function MethodologyRedirect() {
  redirect("/tools/governance-codebook#overview");
}

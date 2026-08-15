import { redirect } from "next/navigation";

// The domain picker now lives inline on the Codebook page instead of as a
// separate, near-identical page. Redirect any existing links/bookmarks.
export default function MechanismExplorerRedirect() {
  redirect("/tools/governance-codebook#domains");
}

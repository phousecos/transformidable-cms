// @ts-nocheck
import config from "@payload-config";
import { getPayload } from "payload";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const payload = await getPayload({ config });

  // Find the latest published issue and redirect to it
  const issuesResult = await payload.find({
    collection: "issues",
    where: { status: { equals: "published" } },
    sort: "-issueNumber",
    limit: 1,
  });

  const latestIssue = issuesResult.docs[0];
  if (latestIssue) {
    redirect(`/issues/${latestIssue.issueNumber}`);
  }

  // No published issues — show a placeholder
  return (
    <div className="flex min-h-screen items-center justify-center bg-parchment">
      <div className="text-center">
        <h1 className="font-serif text-4xl font-bold text-obsidian">Transformidable</h1>
        <p className="mt-4 text-sm text-obsidian/60">Coming soon.</p>
      </div>
    </div>
  );
}

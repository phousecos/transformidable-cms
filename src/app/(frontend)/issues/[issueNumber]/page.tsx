// @ts-nocheck
import config from "@payload-config";
import { getPayload } from "payload";
import { notFound } from "next/navigation";
import MagazineHomepage from "../../components/MagazineHomepage";
import Footer from "../../components/Footer";

export const dynamic = "force-dynamic";

// Per-issue <title> so browser tabs and screen-reader page announcements
// differentiate issues. WCAG 2.4.2 Page Titled.
export async function generateMetadata({ params }: { params: Promise<{ issueNumber: string }> }) {
  const { issueNumber } = await params;
  const payload = await getPayload({ config });
  const issueResult = await payload.find({
    collection: "issues",
    where: { issueNumber: { equals: Number(issueNumber) } },
    limit: 1,
  });
  const issue = issueResult.docs[0];
  if (!issue) return { title: "Issue not found — Transformidable" };

  const num = String(issue.issueNumber).padStart(2, "0");
  const title = issue.themeTagline
    ? `Issue ${num}: ${issue.themeTagline} — Transformidable`
    : `${issue.title ?? `Issue ${num}`} — Transformidable`;

  return {
    title,
    description: issue.themeSubheading || undefined,
  };
}

export default async function IssuePage({ params }: { params: Promise<{ issueNumber: string }> }) {
  const { issueNumber } = await params;
  const payload = await getPayload({ config });

  const issueResult = await payload.find({
    collection: "issues",
    where: { issueNumber: { equals: Number(issueNumber) } },
    limit: 1,
  });

  const issue = issueResult.docs[0];
  if (!issue) notFound();

  const articlesResult = await payload.find({
    collection: "articles",
    where: {
      issue: { equals: issue.id },
      status: { equals: "published" },
    },
    sort: "displayOrder",
    depth: 2,
  });

  return (
    <>
      <MagazineHomepage issue={issue} articles={articlesResult.docs} />
      <Footer />
    </>
  );
}

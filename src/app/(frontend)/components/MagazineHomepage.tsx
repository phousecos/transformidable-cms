// @ts-nocheck
"use client";
import { useState } from "react";
import Image from "next/image";
import SiteNav from "./SiteNav";

type View =
  | { kind: "cover" }
  | { kind: "editors-letter" }
  | { kind: "this-issue" }
  | { kind: "article"; article: any; position: number };

interface MagazineHomepageProps {
  issue: any;
  articles: any[];
}

function lexicalToHtml(node: any): string {
  if (!node) return "";
  if (node.type === "text" || (!node.type && typeof node.text === "string")) {
    let text = node.text ?? "";
    const fmt = typeof node.format === "number" ? node.format : 0;
    if (fmt & 1) text = `<strong>${text}</strong>`;
    if (fmt & 2) text = `<em>${text}</em>`;
    return text;
  }
  const children = (node.children ?? []).map(lexicalToHtml).join("");
  switch (node.type) {
    case "root": return children;
    case "paragraph": return children ? `<p>${children}</p>` : `<p><br /></p>`;
    case "heading": return `<${node.tag ?? "h2"}>${children}</${node.tag ?? "h2"}>`;
    case "quote": return `<blockquote>${children}</blockquote>`;
    case "list": return node.listType === "number" ? `<ol>${children}</ol>` : `<ul>${children}</ul>`;
    case "listitem": return `<li>${children}</li>`;
    case "linebreak": return "<br />";
    default: return children;
  }
}

function normalizeBody(body: any): string {
  if (typeof body === "string") return body;
  if (body?.root) return lexicalToHtml(body.root);
  return "";
}

export default function MagazineHomepage({ issue, articles }: MagazineHomepageProps) {
  const [view, setView] = useState<View>({ kind: "cover" });

  const num = issue.issueNumber ?? 1;
  const issueNumberFormatted = String(num).padStart(2, "0");

  const sortedArticles = [...articles].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  const flagship = sortedArticles.find((a) => a.isFlagship);
  const remaining = sortedArticles.filter((a) => !a.isFlagship);

  const openArticle = (article: any, position: number) => {
    setView({ kind: "article", article, position });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const tabs = [
    { id: "cover" as const, label: "COVER" },
    { id: "editors-letter" as const, label: "EDITOR\u2019S LETTER" },
    { id: "this-issue" as const, label: "THIS ISSUE" },
  ];

  const activeTabId = view.kind === "article" ? "this-issue" : view.kind;

  return (
    <>
      <SiteNav />
      <div className="sticky top-[56px] z-40 bg-obsidian md:top-[60px]">
        <div className="border-t border-parchment/10">
          <div className="mx-auto flex max-w-5xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView({ kind: tab.id })}
                className={`flex-1 py-3 text-center text-xs font-medium tracking-[0.15em] transition-colors md:text-sm md:tracking-[0.2em] ${
                  activeTabId === tab.id ? "bg-parchment/10 text-gold" : "text-parchment/60 hover:text-parchment"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {view.kind === "article" && (
          <div className="border-t border-parchment/10 bg-obsidian/80">
            <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-2">
              <button onClick={() => setView({ kind: "this-issue" })} className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold transition-colors hover:text-parchment md:text-xs">
                &larr; Back to Issue
              </button>
              <span className="text-parchment/20">|</span>
              <span className="truncate text-[10px] font-medium tracking-[0.1em] text-parchment/50 md:text-xs">
                {String(view.position).padStart(2, "0")} &middot; {view.article.title}
              </span>
            </div>
          </div>
        )}
      </div>

      <main className="min-h-[60vh]">
        {view.kind === "cover" && (
          <CoverView issue={issue} articles={sortedArticles} issueNumber={issueNumberFormatted} onNavigate={() => setView({ kind: "this-issue" })} onOpenArticle={openArticle} />
        )}
        {view.kind === "editors-letter" && (
          <EditorsLetterView issue={issue} />
        )}
        {view.kind === "this-issue" && (
          <ThisIssueView issue={issue} flagship={flagship} remaining={remaining} onOpenArticle={openArticle} />
        )}
        {view.kind === "article" && (
          <ArticleReadView article={view.article} position={view.position} issue={issue} allArticles={sortedArticles} onOpenArticle={openArticle} onBackToIssue={() => setView({ kind: "this-issue" })} />
        )}
      </main>
    </>
  );
}

function CoverView({ issue, articles, issueNumber, onNavigate, onOpenArticle }: { issue: any; articles: any[]; issueNumber: string; onNavigate: () => void; onOpenArticle: (a: any, p: number) => void }) {
  return (
    <section className="bg-obsidian">
      <div className="mx-auto max-w-5xl px-6 pb-16 pt-12 md:pt-16 md:pb-20">
        <p className="mb-10 text-[10px] font-medium uppercase tracking-[0.25em] text-parchment/50 md:mb-14 md:text-xs">
          {issue.volume != null && <>Volume {issue.volume} &nbsp;·&nbsp;</>}
          Powerhouse Industries
        </p>
        <p className="font-serif text-[64px] font-bold leading-none text-parchment/20 md:text-[96px]" aria-hidden="true">
          {issueNumber}
        </p>
        <h1 className="mt-6 font-serif text-3xl font-bold italic leading-tight text-parchment md:mt-8 md:text-[40px] md:leading-[1.15]">
          {issue.themeTagline || issue.title}
        </h1>
        {issue.themeSubheading && (
          <p className="mt-4 text-sm font-light text-parchment/50 md:text-base">{issue.themeSubheading}</p>
        )}
        <div className="mt-10 h-px w-16 bg-gold md:mt-14" />
        <p className="mt-8 text-[10px] font-medium uppercase tracking-[0.25em] text-parchment/50 md:text-xs">In This Issue</p>
        <div className="mt-6 space-y-4">
          {articles.map((a) => (
            <button
              key={a.id}
              onClick={() => onOpenArticle(a, a.displayOrder ?? 0)}
              className="flex w-full items-baseline gap-4 text-left transition-colors hover:opacity-80"
            >
              <span className="w-6 shrink-0 text-right text-xs font-bold text-gold">
                {String(a.displayOrder ?? 0).padStart(2, "0")}
              </span>
              {a.isFlagship && <span className="text-xs text-gold" aria-label="Flagship">★</span>}
              <span className={`font-serif text-sm leading-snug md:text-base ${a.isFlagship ? "font-semibold text-parchment" : "font-normal text-parchment/70"}`}>
                {a.title}
              </span>
            </button>
          ))}
        </div>
        <button onClick={onNavigate} className="mt-10 rounded-sm border border-gold/60 px-8 py-3 text-xs font-medium uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold/10">
          Read This Issue →
        </button>
      </div>
      <div className="border-t border-parchment/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <p className="text-[10px] font-medium tracking-[0.15em] text-parchment/40 md:text-xs">A publication of Powerhouse Industries</p>
        </div>
      </div>
    </section>
  );
}

function EditorsLetterView({ issue }: { issue: any }) {
  const editorLetter = issue.editorLetter;
  const body = editorLetter?.body ? normalizeBody(editorLetter.body) : "";

  if (!body) {
    return (
      <section className="bg-parchment">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <p className="font-serif text-lg text-obsidian/60 italic">Editor&apos;s letter coming soon.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-parchment">
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-12 md:pt-16 md:pb-20">
        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-oxblood md:text-xs">From the Editor</p>
        <div className="mt-4 h-[2px] w-16 bg-oxblood" />
        <div
          className="mt-10 font-serif text-lg leading-[1.8] text-obsidian md:mt-14 md:text-xl [&>p]:mb-6 [&>p:empty]:h-4"
          dangerouslySetInnerHTML={{ __html: body }}
        />
        <div className="mt-12 h-px w-full bg-obsidian/10 md:mt-16" />
        {editorLetter.signoff && (
          <div className="mt-8">
            <p className="text-sm font-semibold text-obsidian">— {editorLetter.signoff}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ThisIssueView({ issue, flagship, remaining, onOpenArticle }: { issue: any; flagship: any; remaining: any[]; onOpenArticle: (a: any, p: number) => void }) {
  const verticalLabel = (article: any) => {
    if (article.vertical && typeof article.vertical === "object") return article.vertical.name?.toUpperCase();
    return "";
  };

  return (
    <section className="bg-parchment">
      <div className="mx-auto max-w-5xl px-6 pb-16 pt-10 md:pt-14 md:pb-20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <Image src="/logo-new.png" alt="Transformidable" width={800} height={200} className="h-16 w-auto brightness-0 md:h-20" />
          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-obsidian/40 md:text-xs">
            {issue.issueNumber != null && <>Issue {String(issue.issueNumber).padStart(2, "0")}</>}
            {issue.issueNumber != null && issue.volume != null && <> · </>}
            {issue.volume != null && <>Volume {issue.volume}</>}
          </p>
        </div>
        <div className="mt-4 h-[2px] bg-oxblood" />
        <h2 className="mt-8 font-serif text-2xl font-bold italic leading-snug text-obsidian md:mt-10 md:text-[32px] md:leading-tight">
          {issue.themeTagline || issue.title}
        </h2>
        {issue.themeSubheading && (
          <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.25em] text-obsidian/50 md:text-xs">
            {issue.themeSubheading.toUpperCase()}
          </p>
        )}
        <p className="mt-10 text-[10px] font-medium uppercase tracking-[0.25em] text-oxblood md:mt-14 md:text-xs">In This Issue</p>

        {flagship && (
          <div className="mt-6 flex flex-col gap-4 md:mt-8 md:flex-row md:gap-8">
            <p className="hidden font-serif text-[72px] font-bold leading-none text-obsidian/15 md:block md:text-[96px]" aria-hidden="true">
              {String(flagship.displayOrder ?? 1).padStart(2, "0")}
            </p>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="rounded-sm border border-obsidian/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-obsidian/60 md:text-[10px]">Flagship</span>
                <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-obsidian/40 md:text-[10px]">{verticalLabel(flagship)}</span>
              </div>
              <h3 className="mt-3 font-serif text-xl font-semibold leading-snug text-obsidian md:text-2xl">
                <button onClick={() => onOpenArticle(flagship, flagship.displayOrder ?? 1)} className="text-left transition-colors hover:text-oxblood">
                  {flagship.title}
                </button>
              </h3>
              {flagship.dek && <p className="mt-3 text-sm leading-relaxed text-obsidian/60 md:text-base">{flagship.dek}</p>}
            </div>
          </div>
        )}

        <div className="mt-8 h-px bg-obsidian/10 md:mt-10" />

        <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-3 md:gap-6">
          {remaining.map((article) => (
            <article key={article.id}>
              <p className="font-serif text-[36px] font-bold leading-none text-obsidian/15 md:text-[48px]" aria-hidden="true">
                {String(article.displayOrder ?? 0).padStart(2, "0")}
              </p>
              <p className="mt-2 text-[9px] font-medium uppercase tracking-[0.2em] text-obsidian/40 md:text-[10px]">{verticalLabel(article)}</p>
              <h3 className="mt-2 font-serif text-base font-semibold leading-snug text-obsidian md:text-lg">
                <button onClick={() => onOpenArticle(article, article.displayOrder ?? 0)} className="text-left transition-colors hover:text-oxblood">
                  {article.title}
                </button>
              </h3>
              {article.dek && <p className="mt-2 text-xs leading-relaxed text-obsidian/50 md:text-sm">{article.dek}</p>}
            </article>
          ))}
        </div>

        <div className="mt-14 flex items-center justify-between border-t border-obsidian/10 pt-4 md:mt-20">
          <p className="text-[10px] font-medium tracking-[0.15em] text-obsidian/40 md:text-xs">A publication of Powerhouse Industries</p>
        </div>
      </div>
    </section>
  );
}

function ArticleReadView({ article, position, issue, allArticles, onOpenArticle, onBackToIssue }: any) {
  const body = normalizeBody(article.body);
  const sorted = [...allArticles].sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  const currentIdx = sorted.findIndex((a: any) => a.id === article.id);
  const prev = currentIdx > 0 ? sorted[currentIdx - 1] : null;
  const next = currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

  const verticalLabel = (a: any) => {
    if (a.vertical && typeof a.vertical === "object") return a.vertical.name;
    return "";
  };

  return (
    <>
      <div className="bg-obsidian">
        <div className="mx-auto max-w-3xl px-6 pb-12 pt-10 md:pt-14 md:pb-16">
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl font-bold text-parchment/20 md:text-3xl">{String(position).padStart(2, "0")}</span>
            {verticalLabel(article) && (
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold">{verticalLabel(article)}</span>
            )}
          </div>
          <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-parchment md:text-5xl md:leading-[1.1]">{article.title}</h1>
          {article.dek && <p className="mt-6 text-lg leading-relaxed text-parchment/65 font-light">{article.dek}</p>}
          <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.2em] text-parchment/30 md:text-xs">
            {issue.issueNumber != null && <>Issue {String(issue.issueNumber).padStart(2, "0")}</>}
            {issue.volume != null && <> · Volume {issue.volume}</>}
          </p>
        </div>
      </div>
      <div className="bg-parchment">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          {body ? (
            <div className="prose prose-lg max-w-none font-light text-obsidian/80 [&>p]:mb-6 [&>p:empty]:h-4" dangerouslySetInnerHTML={{ __html: body }} />
          ) : (
            <p className="font-serif text-lg text-obsidian/60 italic">Full article content coming soon.</p>
          )}
          <div className="mt-16 border-t border-obsidian/10 pt-8">
            <div className="flex items-center justify-between">
              {prev ? (
                <button onClick={() => { onOpenArticle(prev, prev.displayOrder ?? 0); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-left">
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-obsidian/40 md:text-xs">Previous</span>
                  <p className="mt-1 font-serif text-sm font-semibold text-oxblood md:text-base">{prev.title}</p>
                </button>
              ) : <div />}
              <button onClick={onBackToIssue} className="rounded-sm border border-obsidian/20 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-obsidian/60 transition-colors hover:border-oxblood hover:text-oxblood md:text-xs">
                This Issue
              </button>
              {next ? (
                <button onClick={() => { onOpenArticle(next, next.displayOrder ?? 0); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-right">
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-obsidian/40 md:text-xs">Next</span>
                  <p className="mt-1 font-serif text-sm font-semibold text-oxblood md:text-base">{next.title}</p>
                </button>
              ) : <div />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

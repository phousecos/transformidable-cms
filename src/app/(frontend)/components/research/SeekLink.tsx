// @ts-nocheck
"use client";

// A link to a moment in the episode. With the video player on the same page it
// jumps the player there; otherwise it opens the episode page at that time.
export function SeekLink({ href, seconds, className, children }: { href: string; seconds: number; className?: string; children: React.ReactNode }) {
  return (
    <a
      className={className}
      href={href}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        const ev = new CustomEvent("episode:seek", { detail: { seconds }, cancelable: true });
        if (!window.dispatchEvent(ev)) e.preventDefault(); // a player took it
      }}
    >
      {children}
    </a>
  );
}

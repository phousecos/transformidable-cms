import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-obsidian">
      <div className="mx-auto max-w-5xl px-6">
        <div className="h-px bg-gold/30" />
      </div>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <Link href="/" className="block font-serif text-2xl font-bold text-parchment">
            Transformidable
          </Link>
          <div className="flex items-center gap-6 md:gap-8">
            <Link href="/archive" className="text-xs font-medium uppercase tracking-[0.15em] text-parchment/50 transition-colors hover:text-gold">
              Archive
            </Link>
            <Link href="/about" className="text-xs font-medium uppercase tracking-[0.15em] text-parchment/50 transition-colors hover:text-gold">
              About
            </Link>
            <Link href="/reading-room" className="text-xs font-medium uppercase tracking-[0.15em] text-parchment/50 transition-colors hover:text-gold">
              The Reading Room
            </Link>
            <a href="#newsletter" className="text-xs font-medium uppercase tracking-[0.15em] text-parchment/50 transition-colors hover:text-gold">
              Subscribe
            </a>
          </div>
        </div>
        <div className="mt-8 text-center sm:text-left">
          <p className="text-xs text-gold/40">
            &copy; {year} Transformidable. A publication of Powerhouse Industries, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}

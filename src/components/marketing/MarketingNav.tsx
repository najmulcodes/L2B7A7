import Link from "next/link";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

// Plain Server Component — no state, no effects, no event handlers, so it
// never needs "use client". Shared across every public page for a
// consistent header.
export function MarketingNav() {
  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">
          CodeRank
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-gray-600 hover:text-gray-900">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

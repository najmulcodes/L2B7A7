import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-gray-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-400">CodeRank</p>
        <nav className="flex flex-wrap gap-5 text-sm text-gray-500">
          <Link href="/about" className="hover:text-gray-800">
            About
          </Link>
          <Link href="/services" className="hover:text-gray-800">
            Services
          </Link>
          <Link href="/faq" className="hover:text-gray-800">
            FAQ
          </Link>
          <Link href="/contact" className="hover:text-gray-800">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}

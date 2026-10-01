import Link from "next/link";
import { FileQuestion } from "lucide-react";

export const metadata = {
  title: "Page not found — CodeRank",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <FileQuestion className="h-12 w-12 text-gray-300" />
      <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
      <p className="max-w-sm text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist, or you may not have access to it.
      </p>
      <Link href="/" className="mt-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
        Back to home
      </Link>
    </main>
  );
}

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400">
          ← Back
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Privacy Policy
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          This is a placeholder. Add your privacy policy content here.
        </p>
      </div>
    </div>
  );
}

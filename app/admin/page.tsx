import { getAdminFromCookie } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const admin = await getAdminFromCookie();

  return (
    <div>
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
        Welcome back, {admin?.email ?? "Admin"}.
      </p>

      <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Overview
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Manage events and content from here. More sections can be added as you build the app.
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Quick actions
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Add event, view registrations, or edit settings. Configure these links when you add more features.
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Account
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Logged in as <strong>{admin?.email}</strong>. Use the header to sign out.
          </p>
        </div>
      </div>
    </div>
  );
}

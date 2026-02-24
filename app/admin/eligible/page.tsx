import { getAdminFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EligibleClientSection } from "./EligibleClientSection";

export default async function EligibleClientPage() {
  const admin = await getAdminFromCookie();
  if (!admin) redirect("/admin/login");

  return (
    <div>
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
        Eligible Client
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Manage which emails can register for any event. Only these emails will pass the Check step.
      </p>
      <EligibleClientSection />
    </div>
  );
}

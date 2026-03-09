import { notFound } from "next/navigation";
import Link from "next/link";
import { getRegistrationByCode } from "@/lib/models/Registration";
import { PassActions } from "./PassActions";

export default async function PassPage({
  params,
}: {
  params: Promise<{ eventId: string; code: string }>;
}) {
  const { eventId, code } = await params;
  const reg = await getRegistrationByCode(code);
  if (!reg) notFound();

  const qrUrl = `/api/qr?code=${encodeURIComponent(reg.uniqueCode)}`;

  const calendarUrl = [
    "https://calendar.google.com/calendar/render",
    "?action=TEMPLATE",
    "&text=" + encodeURIComponent(reg.eventName),
    "&dates=" + new Date(reg.eventStartDate).toISOString().replace(/[-:]/g, "").slice(0, 15) + "/" + new Date(reg.eventEndDate).toISOString().replace(/[-:]/g, "").slice(0, 15),
    "&details=" + encodeURIComponent(`Venue: ${reg.venue}`),
    "&location=" + encodeURIComponent(reg.venue),
  ].join("");

  return (
    <div className="min-h-screen bg-zinc-100 py-6 dark:bg-zinc-900 sm:py-10">
      <div className="mx-auto max-w-2xl px-4">
        <Link
          href="/"
          className="no-print mb-4 inline-block text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 sm:mb-6"
        >
          ← Back to events
        </Link>

        <p className="no-print mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Your pass has been sent to your email.
        </p>

        {/* On screen: normal card size. Print: 58mm×40mm (same as email PDF). */}
        <div
          id="event-pass"
          className="mr-auto w-full max-w-lg overflow-hidden rounded-xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-700 dark:bg-zinc-800 print:!m-0 print:!h-[40mm] print:!w-[58mm] print:!max-w-[58mm] print:!rounded-none print:!border-black print:!p-2 print:!shadow-none"
        >
          <div className="flex flex-row items-stretch gap-6 print:!h-full print:!items-center print:!gap-2 print:!p-0">
            {/* Top left: logo, then name + designation */}
            <div className="flex min-w-0 flex-1 flex-col items-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://eguardian-uae.s3.us-east-2.amazonaws.com/EGUARDIAN-Lanka-Pvt-Ltd-Logo-1-1024x288.jpg"
                alt="Eguardian"
                className="h-12 w-auto max-w-[200px] object-contain object-left print:!h-8 print:!max-w-full"
              />
              <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100 print:!mt-1 print:!text-[13px]">
                {reg.firstName} {reg.surname}
              </h1>
              <p className="mt-1 text-base text-zinc-600 dark:text-zinc-400 print:!text-[11px]">
                {reg.designation || "—"}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center justify-center">
              <div className="rounded-lg border-2 border-orange-500 bg-white p-2 print:!rounded print:!border-orange-600 print:!p-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrUrl}
                  alt={`Pass code ${reg.uniqueCode}`}
                  width={160}
                  height={160}
                  className="block h-32 w-32 print:!h-20 print:!w-20"
                />
              </div>
              <p className="mt-2 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:!mt-1 print:!text-[8px]">
                {reg.uniqueCode}
              </p>
            </div>
          </div>
        </div>

        <PassActions calendarUrl={calendarUrl} />
      </div>
    </div>
  );
}

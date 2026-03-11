import { notFound } from "next/navigation";
import Link from "next/link";
import { getRegistrationByCode } from "@/lib/models/Registration";
import { formatEventDateTime } from "@/lib/date-utils";
import { PassActions } from "./PassActions";

function formatRegisteredDate(d: Date | string) {
  if (!d) return "—";
  return new Date(d).toISOString().replace("T", " ").slice(0, 19);
}

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
    <div className="min-h-screen bg-zinc-100 py-6 dark:bg-zinc-900 sm:py-12">
      <div className="mx-auto max-w-2xl px-4">
        <Link
          href="/"
          className="no-print mb-4 inline-block text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 sm:mb-6"
        >
          ← Back to events
        </Link>

        <p className="no-print mb-3 text-sm text-zinc-600 dark:text-zinc-400 sm:mb-4">
          Your pass has been sent to your email.
        </p>

        {/* DISPLAY CARD (screen only - hidden when printing) */}
        <div
          className="no-print overflow-hidden border border-black bg-white p-3 dark:bg-zinc-800 sm:p-4"
        >
          <div className="w-full">
            {/* Top row: Logo left, QR + code right */}
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="w-full min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://eguardian-uae.s3.us-east-2.amazonaws.com/EGUARDIAN-Lanka-Pvt-Ltd-Logo-1-1024x288.jpg"
                  alt="Eguardian"
                  className="h-11 w-auto max-w-full object-contain sm:h-[52px]"
                />
                <p className="mt-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Welcome,
                </p>
                <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {reg.firstName} {reg.surname}
                </h1>
                <p className="mt-2 text-base text-zinc-900 dark:text-zinc-100">{reg.mobileNumber}</p>
                <p className="mt-0.5 text-base text-zinc-900 dark:text-zinc-100">{reg.email}</p>
              </div>
              <div className="flex shrink-0 flex-col items-center self-center sm:self-auto">
                <div className="rounded border-2 border-orange-500 p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrUrl}
                    alt={`QR code ${reg.uniqueCode}`}
                    width={140}
                    height={140}
                    className="block h-28 w-28 sm:h-[140px] sm:w-[140px]"
                  />
                </div>
                <p className="mt-2 font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {reg.uniqueCode}
                </p>
              </div>
            </div>

            {/* Event details */}
            <div className="mt-5">
              <h2 className="max-w-[calc(100%-30px)] text-lg font-bold leading-tight text-zinc-900 dark:text-zinc-100">
                {reg.eventName}
              </h2>
              <dl className="mt-3 space-y-2 text-base text-zinc-900 dark:text-zinc-100">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-6">
                  <dt className="min-w-0 shrink-0 font-medium">Start Date</dt>
                  <dd className="sm:flex-1 sm:text-center">{formatEventDateTime(reg.eventStartDate)}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-6">
                  <dt className="min-w-0 shrink-0 font-medium">End Date</dt>
                  <dd className="sm:flex-1 sm:text-center">{formatEventDateTime(reg.eventEndDate)}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-6">
                  <dt className="min-w-0 shrink-0 font-medium">Venue</dt>
                  <dd className="sm:flex-1 sm:text-center">{reg.venue || "—"}</dd>
                </div>
              </dl>
            </div>

            {/* Registered date */}
            <p className="mt-6 text-sm text-zinc-900 dark:text-zinc-100">
              Registered Date – {formatRegisteredDate(reg.createdAt)}
            </p>
          </div>
        </div>

        {/* PRINT PASS (58mm×40mm - only visible when printing) */}
        <div
          id="event-pass"
          className="hidden print:!block print:!m-0 print:!h-[40mm] print:!w-[58mm] print:!max-w-[58mm] print:!overflow-hidden print:!rounded-none print:!border print:!border-black print:!p-2 print:!shadow-none print:!bg-white"
        >
          <div className="print:!flex print:!h-full print:!flex-row print:!items-center print:!gap-2">
            {/* Left: logo, name, designation, org */}
            <div className="print:!flex print:!min-w-0 print:!flex-1 print:!flex-col print:!items-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://eguardian-uae.s3.us-east-2.amazonaws.com/EGUARDIAN-Lanka-Pvt-Ltd-Logo-1-1024x288.jpg"
                alt="Eguardian"
                className="print:!h-8 print:!w-auto print:!max-w-full print:!object-contain print:!object-left"
              />
              <p className="print:!mt-1 print:!text-[13px] print:!font-bold print:!text-black">
                {reg.firstName} {reg.surname}
              </p>
              <p className="print:!text-[11px] print:!text-black">
                {reg.designation || "—"}
              </p>
              {reg.organization ? (
                <p className="print:!text-[11px] print:!text-black">
                  {reg.organization}
                </p>
              ) : null}
            </div>
            {/* Right: QR + code */}
            <div className="print:!flex print:!shrink-0 print:!flex-col print:!items-center print:!justify-center">
              <div className="print:!rounded print:!border-2 print:!border-orange-600 print:!p-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrUrl}
                  alt={`Pass code ${reg.uniqueCode}`}
                  className="print:!block print:!h-20 print:!w-20"
                />
              </div>
              <p className="print:!mt-1 print:!font-mono print:!text-[8px] print:!font-semibold print:!text-black">
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

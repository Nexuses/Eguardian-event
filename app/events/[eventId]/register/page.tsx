import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventByEventId } from "@/lib/models/Event";
import type { EventDoc } from "@/lib/models/Event";
import { RegisterForm } from "./RegisterForm";

function formatDateTime(d: Date | string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function toPlainEvent(event: EventDoc) {
  return {
    eventId: event.eventId,
    eventName: event.eventName,
    eventBanner: event.eventBanner,
    eventStartDate: event.eventStartDate instanceof Date ? event.eventStartDate.toISOString() : String(event.eventStartDate),
    eventEndDate: event.eventEndDate instanceof Date ? event.eventEndDate.toISOString() : String(event.eventEndDate),
    venue: event.venue,
    speaker: event.speaker,
    phone: event.phone,
    registrationStatus: event.registrationStatus,
  };
}

const iconClass = "h-5 w-5 shrink-0 text-orange-500 dark:text-orange-400";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { eventId } = await params;
  const { email } = await searchParams;
  const event = await getEventByEventId(eventId);
  if (!event) notFound();

  const serializedEvent = toPlainEvent(event);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
        <Link
          href={`/events/${eventId}`}
          className="mb-4 inline-block text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 sm:mb-6"
        >
          ← Back to event
        </Link>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-8 sm:gap-8 sm:pb-12 lg:grid-cols-[60%_40%] lg:items-stretch">
        {/* Left: Registration form (60%) */}
        <div className="order-2 min-h-0 lg:order-1">
          <div className="h-full rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 sm:text-xl">
              Register for {event.eventName}
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Fill in your details to complete registration.
            </p>
            <RegisterForm eventId={eventId} event={serializedEvent} prefilledEmail={email || ""} />
          </div>
        </div>

        {/* Right: Event details (40%) - stretches to match form height */}
        <div className="order-1 min-h-0 lg:order-2">
          <div className="sticky top-4 flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:top-6">
            <div className="aspect-[3/2] w-full flex-shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              {event.eventBanner ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={event.eventBanner}
                  alt={event.eventName}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-400 dark:text-zinc-500">
                  No banner
                </div>
              )}
            </div>
            <div className="flex min-h-0 flex-1 flex-col justify-between border-t border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
              <h1 className="text-xl font-bold leading-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl">
                {event.eventName}
              </h1>
              <dl className="mt-6 flex flex-1 flex-col divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                <div className="flex flex-1 min-h-[3rem] items-center gap-3">
                  <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <dt className="font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Start date</dt>
                    <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">{formatDateTime(event.eventStartDate)}</dd>
                  </div>
                </div>
                <div className="flex flex-1 min-h-[3rem] items-center gap-3">
                  <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <dt className="font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">End date</dt>
                    <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">{formatDateTime(event.eventEndDate)}</dd>
                  </div>
                </div>
                {event.venue ? (
                  <div className="flex flex-1 min-h-[3rem] items-center gap-3">
                    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <dt className="font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Venue</dt>
                      <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">{event.venue}</dd>
                    </div>
                  </div>
                ) : null}
                <div className="flex flex-1 min-h-[3rem] items-center gap-3">
                  <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <dt className="font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Phone</dt>
                    <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">{event.phone || "—"}</dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

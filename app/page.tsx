import Link from "next/link";
import { listEvents } from "@/lib/models/Event";

function formatDate(d: Date | string) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(d);
  }
}

export default async function Home() {
  let events: Awaited<ReturnType<typeof listEvents>> = [];
  try {
    events = await listEvents();
  } catch {
    events = [];
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <h1 className="mb-6 text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:mb-8 sm:text-2xl">
          Upcoming Events
        </h1>

        {events.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">
            No events at the moment. Check back later.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => (
              <Link
                key={ev._id?.toString() ?? ev.eventId}
                href={`/events/${ev.eventId}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="aspect-[3/2] w-full shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  {ev.eventBanner ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={ev.eventBanner}
                      alt={ev.eventName}
                      className="h-full w-full object-cover object-top transition-transform group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-400 dark:text-zinc-500">
                      <span className="text-sm">No banner</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h2 className="line-clamp-2 font-semibold text-zinc-900 dark:text-zinc-100">
                      {ev.eventName}
                    </h2>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ev.registrationStatus === "open"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
                      }`}
                    >
                      {ev.registrationStatus === "open" ? "Open" : "Closed"}
                    </span>
                  </div>
                  <p className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                    <span aria-hidden className="text-zinc-400">📅</span>
                    {formatDate(ev.eventStartDate)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

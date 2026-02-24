"use client";

import { useState, useEffect } from "react";

type EventItem = {
  _id: string;
  eventId: string;
  eventName: string;
  eventBanner: string;
  eventStartDate: string;
  eventEndDate: string;
  venue: string;
  speaker: string;
  phone: string;
  registrationStatus: string;
  createdAt: string;
};

export default function CreateEventPage() {
  const [eventName, setEventName] = useState("");
  const [eventBanner, setEventBanner] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [venue, setVenue] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [phone, setPhone] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState<"open" | "closed">("open");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchEvents() {
    setListLoading(true);
    try {
      const res = await fetch("/api/admin/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch {
      setError("Failed to load events");
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      let res: Response;
      if (bannerFile) {
        const formData = new FormData();
        formData.set("eventName", eventName);
        formData.set("eventBanner", eventBanner);
        formData.set("eventStartDate", eventStartDate);
        formData.set("eventEndDate", eventEndDate);
        formData.set("venue", venue);
        formData.set("speaker", speaker);
        formData.set("phone", phone);
        formData.set("registrationStatus", registrationStatus);
        formData.set("bannerFile", bannerFile);
        res = await fetch("/api/admin/events", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/admin/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventName,
            eventBanner,
            eventStartDate,
            eventEndDate,
            venue,
            speaker,
            phone,
            registrationStatus,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create event");
        return;
      }
      setSuccess(`Event created. Event ID: ${data.eventId}`);
      setEventName("");
      setEventBanner("");
      setEventStartDate("");
      setEventEndDate("");
      setVenue("");
      setSpeaker("");
      setPhone("");
      setRegistrationStatus("open");
      setBannerFile(null);
      fetchEvents();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function formatDateTime(d: string) {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return d;
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
        Create Event
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Event ID is generated automatically when you create an event.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 w-full rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {error ? (
            <p className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300 sm:col-span-2">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-md bg-green-100 px-3 py-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300 sm:col-span-2">
              {success}
            </p>
          ) : null}

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Event Name <span className="text-red-500">*</span></label>
            <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="e.g. Annual Tech Summit" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Venue</label>
            <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="e.g. Convention Hall A" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Start date</label>
            <input type="datetime-local" value={eventStartDate} onChange={(e) => setEventStartDate(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">End date</label>
            <input type="datetime-local" value={eventEndDate} onChange={(e) => setEventEndDate(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Banner URL</label>
            <input type="url" value={eventBanner} onChange={(e) => setEventBanner(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="https://example.com/banner.jpg" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Banner upload</label>
            <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-zinc-600 file:mr-2 file:rounded-md file:border-0 file:bg-zinc-200 file:px-3 file:py-1.5 file:text-zinc-800 dark:file:bg-zinc-700 dark:file:text-zinc-200" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Speaker</label>
            <input type="text" value={speaker} onChange={(e) => setSpeaker(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Speaker name" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Contact number" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Registration</label>
            <select value={registrationStatus} onChange={(e) => setRegistrationStatus(e.target.value as "open" | "closed")}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100">
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={loading}
              className="rounded-md bg-zinc-900 px-6 py-2.5 font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
              {loading ? "Creating…" : "Create Event"}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          All Events
        </h2>
        {listLoading ? (
          <p className="mt-4 text-sm text-zinc-500">Loading events…</p>
        ) : events.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No events yet. Create one above.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => (
              <article
                key={ev._id}
                className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="aspect-[3/2] w-full shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  {ev.eventBanner ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={ev.eventBanner}
                      alt={ev.eventName}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-400 dark:text-zinc-500">
                      <span className="text-sm">No banner</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                      {ev.eventName}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        ev.registrationStatus === "open"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
                      }`}
                    >
                      {ev.registrationStatus === "open" ? "Open" : "Closed"}
                    </span>
                  </div>
                  <p className="mb-1 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                    {ev.eventId}
                  </p>
                  <dl className="mt-2 space-y-1.5 text-sm">
                    <div>
                      <dt className="sr-only">Start</dt>
                      <dd className="text-zinc-600 dark:text-zinc-400">
                        {formatDateTime(ev.eventStartDate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="sr-only">End</dt>
                      <dd className="text-zinc-600 dark:text-zinc-400">
                        {formatDateTime(ev.eventEndDate)}
                      </dd>
                    </div>
                    {ev.venue ? (
                      <div>
                        <dt className="sr-only">Venue</dt>
                        <dd className="text-zinc-600 dark:text-zinc-400">{ev.venue}</dd>
                      </div>
                    ) : null}
                    {ev.speaker ? (
                      <div>
                        <dt className="sr-only">Speaker</dt>
                        <dd className="text-zinc-600 dark:text-zinc-400">{ev.speaker}</dd>
                      </div>
                    ) : null}
                    {ev.phone ? (
                      <div>
                        <dt className="sr-only">Phone</dt>
                        <dd className="text-zinc-600 dark:text-zinc-400">{ev.phone}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <a
                    href={`/admin/events/${ev._id}/edit`}
                    className="mt-4 inline-flex w-full justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Edit
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type EventItem = {
  _id: string;
  eventId: string;
  eventName: string;
  eventBanner: string;
  eventStartDate: string;
  eventEndDate: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
  venue: string;
  speaker: string;
  phone: string;
  registrationStatus: string;
  published?: boolean;
  registrationType?: "open_for_all" | "invitees_only";
  collectApparelSize?: boolean;
  collectOvernightStay?: boolean;
  collectPassportNic?: boolean;
  collectTransport?: boolean;
  requireWhatsAppNumber?: boolean;
  requireApparelSize?: boolean;
  requireOvernightStay?: boolean;
  requirePassportNic?: boolean;
  requireTransport?: boolean;
  transportLocations?: string[];
};

import { toDatetimeLocal } from "@/lib/date-utils";

export default function EditEventPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [event, setEvent] = useState<EventItem | null>(null);
  const [eventName, setEventName] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [registrationStartDate, setRegistrationStartDate] = useState("");
  const [registrationEndDate, setRegistrationEndDate] = useState("");
  const [venue, setVenue] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [phone, setPhone] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState<"open" | "closed">("open");
  const [registrationType, setRegistrationType] = useState<"open_for_all" | "invitees_only">("invitees_only");
  const [published, setPublished] = useState(true);
  const [collectApparelSize, setCollectApparelSize] = useState(false);
  const [collectOvernightStay, setCollectOvernightStay] = useState(false);
  const [collectPassportNic, setCollectPassportNic] = useState(false);
  const [collectTransport, setCollectTransport] = useState(false);
  const [requireWhatsAppNumber, setRequireWhatsAppNumber] = useState(false);
  const [requireApparelSize, setRequireApparelSize] = useState(false);
  const [requireOvernightStay, setRequireOvernightStay] = useState(false);
  const [requirePassportNic, setRequirePassportNic] = useState(false);
  const [requireTransport, setRequireTransport] = useState(false);
  const [transportLocation1, setTransportLocation1] = useState("");
  const [transportLocation2, setTransportLocation2] = useState("");
  const [transportLocation3, setTransportLocation3] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      setFetchLoading(true);
      try {
        const res = await fetch(`/api/admin/events/${eventId}`);
        if (!res.ok) {
          if (res.status === 404) setError("Event not found");
          return;
        }
        const data = await res.json();
        setEvent(data);
        setEventName(data.eventName ?? "");
        setEventStartDate(toDatetimeLocal(data.eventStartDate));
        setEventEndDate(toDatetimeLocal(data.eventEndDate));
        setRegistrationStartDate(toDatetimeLocal(data.registrationStartDate));
        setRegistrationEndDate(toDatetimeLocal(data.registrationEndDate));
        setVenue(data.venue ?? "");
        setSpeaker(data.speaker ?? "");
        setPhone(data.phone ?? "");
        setRegistrationStatus(data.registrationStatus === "closed" ? "closed" : "open");
        setRegistrationType(data.registrationType === "open_for_all" ? "open_for_all" : "invitees_only");
        setCollectApparelSize(!!data.collectApparelSize);
        setCollectOvernightStay(!!data.collectOvernightStay);
        setCollectPassportNic(!!data.collectPassportNic);
        setCollectTransport(!!data.collectTransport);
        setPublished(!!data.published);
        setRequireWhatsAppNumber(!!data.requireWhatsAppNumber);
        setRequireApparelSize(!!data.requireApparelSize);
        setRequireOvernightStay(!!data.requireOvernightStay);
        setRequirePassportNic(!!data.requirePassportNic);
        setRequireTransport(!!data.requireTransport);
        setTransportLocation1(data.transportLocations?.[0] ?? "");
        setTransportLocation2(data.transportLocations?.[1] ?? "");
        setTransportLocation3(data.transportLocations?.[2] ?? "");
      } catch {
        setError("Failed to load event");
      } finally {
        setFetchLoading(false);
      }
    }
    if (eventId) load();
  }, [eventId]);

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
        formData.set("eventStartDate", eventStartDate);
        formData.set("eventEndDate", eventEndDate);
        formData.set("registrationStartDate", registrationStartDate);
        formData.set("registrationEndDate", registrationEndDate);
        formData.set("venue", venue);
        formData.set("speaker", speaker);
        formData.set("phone", phone);
        formData.set("registrationStatus", registrationStatus);
        formData.set("registrationType", registrationType);
        formData.set("published", published ? "true" : "false");
        formData.set("collectApparelSize", collectApparelSize ? "true" : "false");
        formData.set("collectOvernightStay", collectOvernightStay ? "true" : "false");
        formData.set("collectPassportNic", collectPassportNic ? "true" : "false");
        formData.set("collectTransport", collectTransport ? "true" : "false");
        formData.set("requireWhatsAppNumber", requireWhatsAppNumber ? "true" : "false");
        formData.set("requireApparelSize", requireApparelSize ? "true" : "false");
        formData.set("requireOvernightStay", requireOvernightStay ? "true" : "false");
        formData.set("requirePassportNic", requirePassportNic ? "true" : "false");
        formData.set("requireTransport", requireTransport ? "true" : "false");
        formData.set("transportLocation1", transportLocation1);
        formData.set("transportLocation2", transportLocation2);
        formData.set("transportLocation3", transportLocation3);
        formData.set("bannerFile", bannerFile);
        res = await fetch(`/api/admin/events/${eventId}`, { method: "PUT", body: formData });
      } else {
        res = await fetch(`/api/admin/events/${eventId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventName,
            eventStartDate,
            eventEndDate,
            registrationStartDate,
            registrationEndDate,
            venue,
            speaker,
            phone,
            registrationStatus,
            registrationType,
            published,
            collectApparelSize,
            collectOvernightStay,
            collectPassportNic,
            collectTransport,
            requireWhatsAppNumber,
            requireApparelSize,
            requireOvernightStay,
            requirePassportNic,
            requireTransport,
            transportLocation1,
            transportLocation2,
            transportLocation3,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update event");
        return;
      }
      setSuccess("Event updated.");
      setEvent(data);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (fetchLoading) {
    return (
      <div>
        <p className="text-zinc-500">Loading event…</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div>
        <p className="text-red-600 dark:text-red-400">{error || "Event not found"}</p>
        <Link
          href="/admin/create-event"
          className="mt-4 inline-block text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to Create Event
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/create-event"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to Create Event
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Edit Event
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Event ID: <span className="font-mono">{event.eventId}</span>
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 w-full rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
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
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Start Registration Date</label>
            <input type="datetime-local" value={registrationStartDate} onChange={(e) => setRegistrationStartDate(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">End Registration Date</label>
            <input type="datetime-local" value={registrationEndDate} onChange={(e) => setRegistrationEndDate(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Banner upload</label>
            <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-zinc-600 file:mr-2 file:rounded-md file:border-0 file:bg-zinc-200 file:px-3 file:py-1.5 file:text-zinc-800 dark:file:bg-zinc-700 dark:file:text-zinc-200" />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Recommended size: 1200 x 800 px (3:2), max 5MB.</p>
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
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Registration Status</label>
            <input
              type="text"
              value="Automatic (based on Start/End Registration Date)"
              readOnly
              className="w-full rounded-md border border-zinc-300 bg-zinc-100 px-3 py-2 text-zinc-700 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Who can register</label>
            <select value={registrationType} onChange={(e) => setRegistrationType(e.target.value as "open_for_all" | "invitees_only")}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100">
              <option value="open_for_all">Open for all</option>
              <option value="invitees_only">Only for invitees</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Publish status</label>
            <select
              value={published ? "published" : "unpublished"}
              onChange={(e) => setPublished(e.target.value === "published")}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="published">Publish</option>
              <option value="unpublished">Unpublish</option>
            </select>
          </div>
          <div className="sm:col-span-2 space-y-3">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Registration form fields (toggle to show in registration)</p>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={collectApparelSize}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setCollectApparelSize(next);
                      if (!next) setRequireApparelSize(false);
                    }}
                    className="h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-zinc-900 dark:text-zinc-100">Apparel - sizes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={collectOvernightStay}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setCollectOvernightStay(next);
                      if (!next) setRequireOvernightStay(false);
                    }}
                    className="h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-zinc-900 dark:text-zinc-100">Overnight Stay</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={collectPassportNic}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setCollectPassportNic(next);
                      if (!next) setRequirePassportNic(false);
                    }}
                    className="h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-zinc-900 dark:text-zinc-100">Passport/NIC</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={collectTransport}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setCollectTransport(next);
                      if (!next) setRequireTransport(false);
                    }}
                    className="h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-zinc-900 dark:text-zinc-100">Transport</span>
                </label>
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireApparelSize}
                    disabled={!collectApparelSize}
                    onChange={(e) => setRequireApparelSize(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-zinc-900 dark:text-zinc-100">Size required</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireOvernightStay}
                    disabled={!collectOvernightStay}
                    onChange={(e) => setRequireOvernightStay(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-zinc-900 dark:text-zinc-100">Stay required</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requirePassportNic}
                    disabled={!collectPassportNic}
                    onChange={(e) => setRequirePassportNic(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-zinc-900 dark:text-zinc-100">Passport required</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireTransport}
                    disabled={!collectTransport}
                    onChange={(e) => setRequireTransport(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-zinc-900 dark:text-zinc-100">Transport required</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireWhatsAppNumber}
                    onChange={(e) => setRequireWhatsAppNumber(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-zinc-900 dark:text-zinc-100">WhatsApp number required</span>
                </label>
              </div>
            </div>

            {collectTransport && (
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Transport Location 1
                  </label>
                  <input
                    type="text"
                    value={transportLocation1}
                    onChange={(e) => setTransportLocation1(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    placeholder="e.g. Location A"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Transport Location 2
                  </label>
                  <input
                    type="text"
                    value={transportLocation2}
                    onChange={(e) => setTransportLocation2(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    placeholder="e.g. Location B"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Transport Location 3
                  </label>
                  <input
                    type="text"
                    value={transportLocation3}
                    onChange={(e) => setTransportLocation3(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    placeholder="e.g. Location C"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-end gap-3">
            <button type="submit" disabled={loading}
              className="rounded-md bg-zinc-900 px-6 py-2.5 font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
              {loading ? "Saving…" : "Save changes"}
            </button>
            <Link href="/admin/create-event"
              className="rounded-md border border-zinc-300 px-6 py-2.5 font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

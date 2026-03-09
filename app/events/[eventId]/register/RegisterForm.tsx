"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type EventSnap = {
  eventId: string;
  eventName: string;
  eventBanner?: string;
  eventStartDate: string;
  eventEndDate: string;
  venue: string;
  speaker?: string;
  phone?: string;
  registrationStatus?: string;
  collectApparelSize?: boolean;
  collectOvernightStay?: boolean;
  collectPassportNic?: boolean;
};

export function RegisterForm({
  eventId,
  event,
  prefilledEmail,
}: {
  eventId: string;
  event: EventSnap;
  prefilledEmail: string;
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState(prefilledEmail);
  const [organization, setOrganization] = useState("");
  const [designation, setDesignation] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [addToWhatsapp, setAddToWhatsapp] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [apparelSize, setApparelSize] = useState("");
  const [overnightStay, setOvernightStay] = useState(false);
  const [passportNic, setPassportNic] = useState("");
  const [specialComment, setSpecialComment] = useState("");
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  const apparelSizes = ["S", "M", "L", "XL", "XXL", "XXXL", "XXXXL", "XXXXXL"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!agreedToPrivacy) {
      setError("You must agree to the Privacy Policy to register.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          surname,
          email,
          organization,
          designation,
          mobileNumber,
          addToWhatsapp,
          whatsappNumber: addToWhatsapp ? whatsappNumber : undefined,
          ...(event.collectApparelSize && { apparelSize: apparelSize || undefined }),
          ...(event.collectOvernightStay && { overnightStay: overnightStay }),
          ...(event.collectPassportNic && { passportNic: passportNic || undefined }),
          specialComment: specialComment || undefined,
          agreedToPrivacy: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      router.push(`/events/${eventId}/pass/${data.uniqueCode}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100";

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      {error && (
        <p className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className={inputClass}
            placeholder="First Name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Surname <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
            className={inputClass}
            placeholder="Surname"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
          placeholder="email@example.com"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Organization
        </label>
        <input
          type="text"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          className={inputClass}
          placeholder="Organization"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Designation
        </label>
        <input
          type="text"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          className={inputClass}
          placeholder="Designation"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Mobile Number
        </label>
        <input
          type="tel"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          className={inputClass}
          placeholder="e.g. 0779400675"
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={addToWhatsapp}
            onClick={() => {
              const next = !addToWhatsapp;
              setAddToWhatsapp(next);
              if (next) setWhatsappNumber(mobileNumber);
            }}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
              addToWhatsapp ? "bg-orange-500" : "bg-zinc-200 dark:bg-zinc-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                addToWhatsapp ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Add to WhatsApp</span>
        </div>
      </div>

      {addToWhatsapp && (
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            WhatsApp Number
          </label>
          <input
            type="tel"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className={inputClass}
            placeholder="WhatsApp number"
          />
        </div>
      )}

      {event.collectApparelSize && (
        <div>
          <div className="mb-1 flex items-center gap-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Apparel - sizes
            </label>
            <button
              type="button"
              onClick={() => setSizeChartOpen(true)}
              className="text-xs font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 underline"
            >
              Size chart
            </button>
          </div>
          <select
            value={apparelSize}
            onChange={(e) => setApparelSize(e.target.value)}
            className={inputClass}
          >
            <option value="">Select size</option>
            {apparelSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          {sizeChartOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
              role="dialog"
              aria-modal="true"
              aria-label="Size chart"
              onClick={() => setSizeChartOpen(false)}
            >
              <div
                className="relative max-h-[90vh] max-w-4xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(false)}
                  className="absolute -top-10 right-0 rounded bg-white/90 px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-white dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  Close
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://nexuseslink2024.s3.us-east-2.amazonaws.com/Screenshot_2026-03-09_at_2.49.27_PM.png"
                  alt="Size chart"
                  className="max-h-[85vh] w-auto rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {event.collectOvernightStay && (
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Overnight Stay
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={overnightStay}
              onClick={() => setOvernightStay(!overnightStay)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                overnightStay ? "bg-orange-500" : "bg-zinc-200 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                  overnightStay ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {overnightStay ? "Yes" : "No"}
            </span>
          </div>
        </div>
      )}

      {event.collectPassportNic && (
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Passport/NIC
          </label>
          <input
            type="text"
            value={passportNic}
            onChange={(e) => setPassportNic(e.target.value)}
            className={inputClass}
            placeholder="Passport or NIC number"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Special Comment
        </label>
        <textarea
          value={specialComment}
          onChange={(e) => setSpecialComment(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="Any special requirements or comments"
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          id="privacy"
          type="checkbox"
          checked={agreedToPrivacy}
          onChange={(e) => setAgreedToPrivacy(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-500"
        />
        <label htmlFor="privacy" className="text-sm text-zinc-700 dark:text-zinc-300">
          I agree to the <a href="/privacy" className="underline hover:no-underline">Privacy Policy</a> <span className="text-red-500">*</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-orange-500 px-4 py-3 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {loading ? "Registering…" : "Register"}
      </button>
    </form>
  );
}

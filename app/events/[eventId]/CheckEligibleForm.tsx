"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CheckEligibleForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/check-eligible`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.alreadyRegistered) {
        setMessage("You are already registered for this event.");
        return;
      }
      if (data.eligible) {
        const params = new URLSearchParams({ email: email.trim() });
        router.push(`/events/${eventId}/register?${params.toString()}`);
        return;
      }
      setError("This email is not eligible to register for this event. Please contact the organizer.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-md bg-green-100 px-3 py-2 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
          {message}
        </p>
      )}
      <label htmlFor="email" className="sr-only">
        Email address
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        required
        className="w-full rounded-md border border-zinc-300 px-3 py-2.5 text-zinc-900 placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
      />
      <button
        type="submit"
        disabled={loading}
        className="check-btn-hover w-full rounded-md bg-orange-500 px-4 py-2.5 font-medium text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:opacity-50"
      >
        <span>{loading ? "Checking…" : "Check"}</span>
      </button>
    </form>
  );
}

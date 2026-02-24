"use client";

import Link from "next/link";

const LOGO_URL =
  "https://eguardian-uae.s3.us-east-2.amazonaws.com/EGUARDIAN-Lanka-Pvt-Ltd-Logo-1-1024x288.jpg";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/create-event", label: "Create Event" },
  { href: "/admin/eligible", label: "Eligible Client" },
  { href: "/admin/registrations", label: "Registered Client" },
  { href: "/admin/scan", label: "QR Scanning" },
];

export function AdminSidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex h-full w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 transition-transform duration-200 ease-out md:relative md:translate-x-0 md:shrink-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-zinc-200 px-4 dark:border-zinc-800 sm:h-20">
          <Link
            href="/admin"
            onClick={onClose}
            className="block w-full focus:outline-none focus:ring-2 focus:ring-zinc-400 rounded-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_URL}
              alt="Eguardian Logo"
              className="h-12 w-full object-contain object-center sm:h-14"
            />
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}

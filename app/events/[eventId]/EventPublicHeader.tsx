import Link from "next/link";
import { EGUARDIAN_LOGO_URL } from "@/lib/constants";

export function EventPublicHeader() {
  return (
    <header className="flex justify-center border-b border-zinc-200 bg-white px-4 py-2 sm:py-2.5">
      <Link
        href="/"
        className="block rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={EGUARDIAN_LOGO_URL}
          alt="Eguardian"
          className="h-[52px] w-auto max-w-[300px] object-contain sm:h-[60px] sm:max-w-[360px]"
        />
      </Link>
    </header>
  );
}

import { descriptionToSafeHtml } from "@/lib/sanitize-description-html";

export function EventDescription({ text }: { text: string }) {
  const safeHtml = descriptionToSafeHtml(text);

  return (
    <div
      className="text-sm leading-relaxed text-zinc-700 [&_b]:font-bold [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-bold"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}

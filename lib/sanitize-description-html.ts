const ALLOWED_TAGS = new Set(["b", "strong", "br", "p", "div", "em", "i"]);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Strip unsafe tags/attributes; keep basic formatting from the admin editor. */
export function sanitizeDescriptionHtml(html: string): string {
  let out = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  out = out.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tagName: string) => {
    const tag = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (tag === "br") return "<br>";
    return match.startsWith("</") ? `</${tag}>` : `<${tag}>`;
  });

  return out.replace(/javascript:/gi, "");
}

/** True when description has visible text (ignores empty HTML from the editor). */
export function hasDescriptionContent(raw?: string | null): boolean {
  if (!raw) return false;
  const trimmed = raw.trim();
  if (!trimmed) return false;

  const text = trimmed
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > 0;
}

/** Plain text → escaped HTML with line breaks; rich HTML → sanitized. */
export function descriptionToSafeHtml(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/<[a-z][^>]*>/i.test(trimmed)) {
    return sanitizeDescriptionHtml(trimmed);
  }
  return escapeHtml(trimmed).replace(/\n/g, "<br>");
}

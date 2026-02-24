import sharp from "sharp";
import QRCode from "qrcode";

type PassData = {
  firstName: string;
  surname: string;
  email: string;
  mobileNumber: string;
  eventName: string;
  eventStartDate: Date | string;
  eventEndDate: Date | string;
  venue: string;
  uniqueCode: string;
  createdAt: Date | string;
};

const LOGO_URL =
  "https://eguardian-uae.s3.us-east-2.amazonaws.com/EGUARDIAN-Lanka-Pvt-Ltd-Logo-1-1024x288.jpg";

function formatDateTime(d: Date | string): string {
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

function formatRegisteredDate(d: Date | string): string {
  if (!d) return "—";
  return new Date(d).toISOString().replace("T", " ").slice(0, 19);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Wrap event name into lines that fit in the allowed width (approx chars per line for 16px bold). */
function wrapEventName(text: string, maxCharsPerLine: number): string[] {
  if (!text.trim()) return [""];
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (word.length > maxCharsPerLine) {
      if (current) {
        lines.push(current);
        current = "";
      }
      for (let i = 0; i < word.length; i += maxCharsPerLine) {
        lines.push(word.slice(i, i + maxCharsPerLine));
      }
      continue;
    }
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxCharsPerLine) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Match pass page exactly: max-w-2xl = 672px, p-5 = 20px, logo h-14 = 56px, QR 140x140, border-2 orange, p-1
// Render at 2x resolution for sharp PNG (retina / print)
const SCALE = 2;
const CARD_WIDTH = 672 * SCALE;
const PADDING = 20 * SCALE;
const LOGO_HEIGHT = 56 * SCALE;
const QR_SIZE = 140 * SCALE;
const QR_BORDER = 2 * SCALE;
const QR_PADDING = 4 * SCALE;
const QR_BOX_W = QR_SIZE + QR_PADDING * 2 + QR_BORDER * 2;
const QR_BOX_LEFT = CARD_WIDTH - PADDING - QR_BOX_W;
const QR_IMAGE_LEFT = QR_BOX_LEFT + QR_PADDING + QR_BORDER;
const QR_TOP = PADDING;
// Pass code sits below QR; start event block below code with extra space so event name never overlaps code
const CODE_BLOCK_BOTTOM = QR_TOP + QR_BOX_W + 8 * SCALE + 12 * SCALE + 14 * SCALE;
const EVENT_TOP = CODE_BLOCK_BOTTOM + 24 * SCALE;
const TITLE_BASELINE = EVENT_TOP + 16 * SCALE;
const EVENT_NAME_MAX_WIDTH = QR_BOX_LEFT - PADDING - 16 * SCALE;
const TITLE_LINE_HEIGHT = 20 * SCALE;
// Max chars per line for event name (approx for 16px bold at 2x); ROW baselines and CARD_HEIGHT computed per pass from title line count
const EVENT_NAME_CHARS_PER_LINE = 48;
// Font sizes for SVG text (scaled)
const FONT_WELCOME = 16 * SCALE;
const FONT_NAME = 20 * SCALE;
const FONT_SM = 14 * SCALE;
const FONT_XS = 12 * SCALE;
const FONT_TITLE = 16 * SCALE;

export async function generatePassPng(data: PassData): Promise<Buffer> {
  const qrBuffer = await QRCode.toBuffer(data.uniqueCode, { width: QR_SIZE, margin: 2, type: "png" });
  const qrResized = await sharp(qrBuffer).resize(QR_SIZE, QR_SIZE).toBuffer();

  // Fetch logo for compositing
  let logoBuffer: Buffer | null = null;
  try {
    const res = await fetch(LOGO_URL);
    if (res.ok) {
      const arr = await res.arrayBuffer();
      logoBuffer = Buffer.from(arr);
    }
  } catch {
    // ignore
  }

  // Wrap event name into multiple lines so full name shows without overlapping pass code
  const eventNameLines = wrapEventName(data.eventName, EVENT_NAME_CHARS_PER_LINE);
  const titleBlockHeight = eventNameLines.length * TITLE_LINE_HEIGHT;
  const row1Baseline = TITLE_BASELINE + titleBlockHeight + 8 * SCALE;
  const row2Baseline = row1Baseline + 8 * SCALE + 14 * SCALE;
  const row3Baseline = row2Baseline + 8 * SCALE + 14 * SCALE;
  const registeredBaseline = row3Baseline + 16 * SCALE + 12 * SCALE;
  const cardHeight = registeredBaseline + PADDING;

  const eventNameClipY = TITLE_BASELINE - 16 * SCALE;
  const eventNameClipH = titleBlockHeight + 8 * SCALE;

  // Y positions for left column text (scaled)
  const yWelcome = PADDING + LOGO_HEIGHT + 12 * SCALE + 16 * SCALE;
  const yName = yWelcome + 4 * SCALE + 20 * SCALE;
  const yMobile = yName + 8 * SCALE + 14 * SCALE;
  const yEmail = yMobile + 14 * SCALE;
  const yCode = QR_TOP + QR_BOX_W + 8 * SCALE + 12 * SCALE;

  const eventNameSvg = eventNameLines
    .map(
      (line, i) =>
        i === 0
          ? `<tspan x="${PADDING}" y="${TITLE_BASELINE}">${escapeXml(line)}</tspan>`
          : `<tspan x="${PADDING}" dy="${TITLE_LINE_HEIGHT}">${escapeXml(line)}</tspan>`
    )
    .join("");

  // SVG matches pass page: no rounded corners, same structure; all dimensions scaled for sharp 2x output
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${cardHeight}" viewBox="0 0 ${CARD_WIDTH} ${cardHeight}">
  <defs><clipPath id="eventNameClip"><rect x="${PADDING}" y="${eventNameClipY}" width="${EVENT_NAME_MAX_WIDTH}" height="${eventNameClipH}"/></clipPath></defs>
  <rect width="100%" height="100%" fill="#ffffff" stroke="#e4e4e7" stroke-width="1"/>
  <text x="${PADDING}" y="${yWelcome}" font-family="Arial, sans-serif" font-size="${FONT_WELCOME}" fill="#18181b">Welcome,</text>
  <text x="${PADDING}" y="${yName}" font-family="Arial, sans-serif" font-size="${FONT_NAME}" font-weight="bold" fill="#18181b">${escapeXml(data.firstName)} ${escapeXml(data.surname)}</text>
  <text x="${PADDING}" y="${yMobile}" font-family="Arial, sans-serif" font-size="${FONT_SM}" fill="#18181b">${escapeXml(data.mobileNumber || "—")}</text>
  <text x="${PADDING}" y="${yEmail}" font-family="Arial, sans-serif" font-size="${FONT_SM}" fill="#18181b">${escapeXml(data.email)}</text>
  <rect x="${QR_BOX_LEFT}" y="${QR_TOP}" width="${QR_BOX_W}" height="${QR_BOX_W}" rx="${4 * SCALE}" ry="${4 * SCALE}" fill="none" stroke="#ea580c" stroke-width="${QR_BORDER}"/>
  <text x="${QR_BOX_LEFT + QR_BOX_W / 2}" y="${yCode}" font-family="Courier, monospace" font-size="${FONT_XS}" font-weight="bold" fill="#18181b" text-anchor="middle">${escapeXml(data.uniqueCode)}</text>
  <g clip-path="url(#eventNameClip)"><text font-family="Arial, sans-serif" font-size="${FONT_TITLE}" font-weight="bold" fill="#18181b">${eventNameSvg}</text></g>
  <text x="${PADDING}" y="${row1Baseline}" font-family="Arial, sans-serif" font-size="${FONT_SM}" fill="#18181b">Start Date</text>
  <text x="${CARD_WIDTH - PADDING}" y="${row1Baseline}" font-family="Arial, sans-serif" font-size="${FONT_SM}" fill="#18181b" text-anchor="end">${escapeXml(formatDateTime(data.eventStartDate))}</text>
  <text x="${PADDING}" y="${row2Baseline}" font-family="Arial, sans-serif" font-size="${FONT_SM}" fill="#18181b">End Date</text>
  <text x="${CARD_WIDTH - PADDING}" y="${row2Baseline}" font-family="Arial, sans-serif" font-size="${FONT_SM}" fill="#18181b" text-anchor="end">${escapeXml(formatDateTime(data.eventEndDate))}</text>
  <text x="${PADDING}" y="${row3Baseline}" font-family="Arial, sans-serif" font-size="${FONT_SM}" fill="#18181b">Venue</text>
  <text x="${CARD_WIDTH - PADDING}" y="${row3Baseline}" font-family="Arial, sans-serif" font-size="${FONT_SM}" fill="#18181b" text-anchor="end">${escapeXml(data.venue || "—")}</text>
  <text x="${PADDING}" y="${registeredBaseline}" font-family="Arial, sans-serif" font-size="${FONT_XS}" fill="#18181b">Registered Date – ${escapeXml(formatRegisteredDate(data.createdAt))}</text>
</svg>
  `.trim();

  const baseImage = await sharp(Buffer.from(svg)).png().toBuffer();
  const composites: sharp.OverlayOptions[] = [
    { input: qrResized, left: QR_IMAGE_LEFT, top: QR_TOP + QR_PADDING + QR_BORDER },
  ];
  if (logoBuffer && logoBuffer.length > 0) {
    const logoResized = await sharp(logoBuffer)
      .resize(undefined, LOGO_HEIGHT)
      .toBuffer();
    composites.push({ input: logoResized, left: PADDING, top: PADDING });
  }

  const composed = await sharp(baseImage).composite(composites).png({ compressionLevel: 6 }).toBuffer();
  return composed;
}

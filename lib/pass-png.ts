import sharp from "sharp";
import QRCode from "qrcode";
import { formatEventDateTime } from "./date-utils";

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

// Match web pass page: max-w-2xl = 672px, p-5 = 20px, logo h-14 = 56px, QR 140x140. Render at 2x for sharp PDF.
export const PASS_WIDTH_MM = 58;
export const PASS_HEIGHT_MM = 40;

const SCALE = 2;
const CARD_WIDTH = 672 * SCALE;
const PADDING = 18 * SCALE;
const LOGO_HEIGHT = 52 * SCALE;
const QR_SIZE = 140 * SCALE;
const QR_BORDER = 2 * SCALE;
const QR_PADDING = 4 * SCALE;
const QR_BOX_W = QR_SIZE + QR_PADDING * 2 + QR_BORDER * 2;
const QR_BOX_LEFT = CARD_WIDTH - PADDING - QR_BOX_W;
const QR_IMAGE_LEFT = QR_BOX_LEFT + QR_PADDING + QR_BORDER;
const QR_TOP = PADDING;

// Slightly larger fonts to utilise card space and improve readability
const FONT_WELCOME = 18 * SCALE;
const FONT_NAME = 24 * SCALE;
const FONT_SM = 16 * SCALE;
const FONT_XS = 14 * SCALE;
const FONT_TITLE = 18 * SCALE;
const TITLE_LINE_HEIGHT = 22 * SCALE;
const EVENT_NAME_CHARS_PER_LINE = 42;

export async function generatePassPng(data: PassData): Promise<Buffer> {
  const qrBuffer = await QRCode.toBuffer(data.uniqueCode, { width: QR_SIZE, margin: 2, type: "png" });
  const qrResized = await sharp(qrBuffer).resize(QR_SIZE, QR_SIZE).toBuffer();

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

  const eventNameLines = wrapEventName(data.eventName, EVENT_NAME_CHARS_PER_LINE);
  const titleBlockHeight = eventNameLines.length * TITLE_LINE_HEIGHT;
  const yWelcome = PADDING + LOGO_HEIGHT + 14 * SCALE + 20;
  const yName = yWelcome + FONT_WELCOME + 4 * SCALE + 5;
  const yMobile = yName + FONT_NAME + 6 * SCALE + 15;
  const yEmail = yMobile + FONT_SM;
  const yCode = QR_TOP + QR_BOX_W + 8 * SCALE + 8;
  const TITLE_BASELINE = yEmail + FONT_SM + 18 * SCALE + 20;
  const EVENT_NAME_MAX_WIDTH = QR_BOX_LEFT - PADDING - 12 * SCALE;
  const eventNameClipY = TITLE_BASELINE - FONT_TITLE;
  const eventNameClipH = titleBlockHeight + 6 * SCALE;
  const rowHeight = 10 * SCALE + FONT_SM;
  const fixedOutputHeight = Math.round(CARD_WIDTH * (PASS_HEIGHT_MM / PASS_WIDTH_MM));
  const gapAfterTitle = 12 * SCALE;
  const gapBeforeRegistered = 20 * SCALE;
  const row1BaselineMin = TITLE_BASELINE + titleBlockHeight + gapAfterTitle;
  const contentHeight = row1BaselineMin + rowHeight * 2 + gapBeforeRegistered + FONT_XS + PADDING;
  const extraSpace = Math.max(0, fixedOutputHeight - contentHeight);
  const spreadAfterTitle = Math.round(extraSpace * 0.5);
  const spreadBeforeRegistered = extraSpace - spreadAfterTitle;
  const row1Baseline = row1BaselineMin + spreadAfterTitle;
  const row2Baseline = row1Baseline + rowHeight;
  const row3Baseline = row2Baseline + rowHeight;
  const registeredBaseline = row3Baseline + gapBeforeRegistered + spreadBeforeRegistered;
  const row1Y = row1Baseline - FONT_SM * 0.35;
  const row2Y = row2Baseline - FONT_SM * 0.35;
  const row3Y = row3Baseline - FONT_SM * 0.35;

  const outputHeight = fixedOutputHeight;

  const eventNameSvg = eventNameLines
    .map(
      (line, i) =>
        i === 0
          ? `<tspan x="${PADDING}" y="${TITLE_BASELINE}">${escapeXml(line)}</tspan>`
          : `<tspan x="${PADDING}" dy="${TITLE_LINE_HEIGHT}">${escapeXml(line)}</tspan>`
    )
    .join("");

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${outputHeight}" viewBox="0 0 ${CARD_WIDTH} ${outputHeight}">
  <defs><clipPath id="eventNameClip"><rect x="${PADDING}" y="${eventNameClipY}" width="${EVENT_NAME_MAX_WIDTH}" height="${eventNameClipH}"/></clipPath></defs>
  <rect width="100%" height="100%" fill="#ffffff" stroke="#000000" stroke-width="1"/>
  <text x="${PADDING}" y="${yWelcome}" font-family="Arial, sans-serif" font-size="${FONT_WELCOME}" font-weight="bold" fill="#18181b">Welcome,</text>
  <text x="${PADDING}" y="${yName}" font-family="Arial, sans-serif" font-size="${FONT_NAME}" font-weight="bold" fill="#18181b">${escapeXml(data.firstName)} ${escapeXml(data.surname)}</text>
  <text x="${PADDING}" y="${yMobile}" font-family="Arial, sans-serif" font-size="${FONT_SM}" fill="#18181b">${escapeXml(data.mobileNumber || "—")}</text>
  <text x="${PADDING}" y="${yEmail}" font-family="Arial, sans-serif" font-size="${FONT_SM}" fill="#18181b">${escapeXml(data.email)}</text>
  <rect x="${QR_BOX_LEFT}" y="${QR_TOP}" width="${QR_BOX_W}" height="${QR_BOX_W}" rx="4" ry="4" fill="none" stroke="#ea580c" stroke-width="${QR_BORDER}"/>
  <text x="${QR_BOX_LEFT + QR_BOX_W / 2}" y="${yCode}" font-family="Courier, monospace" font-size="${FONT_XS}" font-weight="bold" fill="#18181b" text-anchor="middle">${escapeXml(data.uniqueCode)}</text>
  <g clip-path="url(#eventNameClip)"><text font-family="Arial, sans-serif" font-size="${FONT_TITLE}" font-weight="bold" fill="#18181b">${eventNameSvg}</text></g>
  <text x="${PADDING}" y="${row1Y}" font-family="Arial, sans-serif" font-size="${FONT_SM}" fill="#18181b" dominant-baseline="central">Start Date</text>
  <text x="${CARD_WIDTH / 2}" y="${row1Y}" font-family="Arial, sans-serif" font-size="${FONT_SM}" fill="#18181b" text-anchor="middle" dominant-baseline="central">${escapeXml(formatEventDateTime(data.eventStartDate))}</text>
  <text x="${PADDING}" y="${row2Y}" font-family="Arial, sans-serif" font-size="${FONT_SM}" fill="#18181b" dominant-baseline="central">End Date</text>
  <text x="${CARD_WIDTH / 2}" y="${row2Y}" font-family="Arial, sans-serif" font-size="${FONT_SM}" fill="#18181b" text-anchor="middle" dominant-baseline="central">${escapeXml(formatEventDateTime(data.eventEndDate))}</text>
  <text x="${PADDING}" y="${row3Y}" font-family="Arial, sans-serif" font-size="${FONT_SM}" fill="#18181b" dominant-baseline="central">Venue</text>
  <text x="${CARD_WIDTH / 2}" y="${row3Y}" font-family="Arial, sans-serif" font-size="${FONT_SM}" fill="#18181b" text-anchor="middle" dominant-baseline="central">${escapeXml(data.venue || "—")}</text>
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

  const composed = await sharp(baseImage)
    .composite(composites)
    .flatten({ background: "#ffffff" })
    .png({ compressionLevel: 6 })
    .toBuffer();
  return composed;
}

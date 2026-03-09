import sharp from "sharp";
import QRCode from "qrcode";

type PassData = {
  firstName: string;
  surname: string;
  designation: string;
  uniqueCode: string;
};

const LOGO_URL =
  "https://eguardian-uae.s3.us-east-2.amazonaws.com/EGUARDIAN-Lanka-Pvt-Ltd-Logo-1-1024x288.jpg";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Use ASCII-safe chars for pass text so it renders on servers without full Unicode fonts (e.g. Vercel). */
function safePassText(s: string): string {
  if (!s || !s.trim()) return "-";
  return s
    .replace(/\u2014/g, "-")   // em dash
    .replace(/\u2013/g, "-")   // en dash
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .trim();
}

// Pass card: exactly 58mm × 40mm. Match print pass layout (p-2, logo h-8, name 13px, designation 11px, QR 80px, code 8px).
export const PASS_WIDTH_MM = 58;
export const PASS_HEIGHT_MM = 40;

const SCALE = 2;
const CARD_WIDTH = 672 * SCALE;
const CARD_HEIGHT = Math.round(CARD_WIDTH * (PASS_HEIGHT_MM / PASS_WIDTH_MM));

// Match print pass: p-2 (8px), gap-2 (8px), logo 32px, name 13px, designation 11px, QR 80px, code 8px
const PADDING = 25 * SCALE;       // ~8px
const COL_GAP = 25 * SCALE;       // 8px between left col and QR
const LOGO_HEIGHT = 98 * SCALE;   // 32px
const FONT_NAME = 40 * SCALE;     // 13px
const FONT_DESIGNATION = 34 * SCALE; // 11px
const FONT_CODE = 24 * SCALE;     // 8px
const LINE_GAP = 12 * SCALE;      // 4px (mt-1) between logo/name/designation

const QR_SIZE = 245 * SCALE;      // ~80px in print
const QR_BORDER = 2 * SCALE;
const QR_PADDING = 6 * SCALE;     // ~2px (p-0.5)
const QR_BOX_W = QR_SIZE + QR_PADDING * 2 + QR_BORDER * 2;
const QR_BOX_LEFT = CARD_WIDTH - PADDING - QR_BOX_W;
const QR_IMAGE_LEFT = QR_BOX_LEFT + QR_PADDING + QR_BORDER;
const CODE_GAP = 12 * SCALE;      // 4px (mt-1) above code text

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

  const yLogoBottom = PADDING + LOGO_HEIGHT;
  const yName = yLogoBottom + LINE_GAP + FONT_NAME;
  const yDesignation = yName + LINE_GAP + FONT_DESIGNATION;

  // Vertically center the barcode (QR box + code) on the card
  const qrBlockHeight = QR_BOX_W + CODE_GAP + FONT_CODE;
  const QR_TOP = Math.round((CARD_HEIGHT - qrBlockHeight) / 2);
  const yCode = QR_TOP + QR_BOX_W + CODE_GAP + FONT_CODE;

  // Font stack that exists on Linux/serverless (Vercel); Arial/Courier often missing and cause □ glyphs
  const fontSans = "Liberation Sans, DejaVu Sans, Helvetica, Arial, sans-serif";
  const fontMono = "Liberation Mono, DejaVu Sans Mono, Courier New, Courier, monospace";
  const nameText = escapeXml(safePassText(`${data.firstName} ${data.surname}`));
  const designationText = escapeXml(safePassText(data.designation || "-"));
  const codeText = escapeXml(safePassText(data.uniqueCode));

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#000000" stroke-width="1"/>
  <text x="${PADDING}" y="${yName}" font-family="${fontSans}" font-size="${FONT_NAME}" font-weight="bold" fill="#18181b">${nameText}</text>
  <text x="${PADDING}" y="${yDesignation}" font-family="${fontSans}" font-size="${FONT_DESIGNATION}" fill="#18181b">${designationText}</text>
  <rect x="${QR_BOX_LEFT}" y="${QR_TOP}" width="${QR_BOX_W}" height="${QR_BOX_W}" rx="4" ry="4" fill="none" stroke="#ea580c" stroke-width="${QR_BORDER}"/>
  <text x="${QR_BOX_LEFT + QR_BOX_W / 2}" y="${yCode}" font-family="${fontMono}" font-size="${FONT_CODE}" font-weight="bold" fill="#18181b" text-anchor="middle">${codeText}</text>
</svg>`.trim();

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
    .resize(CARD_WIDTH, CARD_HEIGHT)
    .flatten({ background: "#ffffff" })
    .png({ compressionLevel: 6 })
    .toBuffer();
  return composed;
}

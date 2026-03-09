import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

const PT_PER_MM = 72 / 25.4;
export const PASS_WIDTH_MM = 58;
export const PASS_HEIGHT_MM = 40;

const LOGO_URL =
  "https://eguardian-uae.s3.us-east-2.amazonaws.com/EGUARDIAN-Lanka-Pvt-Ltd-Logo-1-1024x288.jpg";

export type PassData = {
  firstName: string;
  surname: string;
  designation: string;
  uniqueCode: string;
};

function safeText(s: string): string {
  if (!s || !s.trim()) return "-";
  return s
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .trim();
}

/**
 * Generate the email pass as PDF directly with pdf-lib.
 * Uses PDF standard fonts (Helvetica, Courier) so text renders in all viewers (Gmail, etc.)
 * without relying on server system fonts (which caused □/dots in Sharp SVG→PNG).
 */
export async function generatePassPdf(data: PassData): Promise<Buffer> {
  const widthPt = PASS_WIDTH_MM * PT_PER_MM;
  const heightPt = PASS_HEIGHT_MM * PT_PER_MM;

  const PADDING = 6;
  const TOP_PADDING = 3;          // logo at top left with minimal gap
  const LOGO_HEIGHT_PT = 24;
  const FONT_NAME = 10;
  const FONT_DESIGNATION = 8;
  const FONT_CODE = 6;
  const LINE_GAP = 3;
  const QR_SIZE_PT = 60;
  const QR_BORDER_PT = 1.5;
  const CODE_GAP = 3;

  const doc = await PDFDocument.create();
  const page = doc.addPage([widthPt, heightPt]);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const courierBold = await doc.embedFont(StandardFonts.CourierBold);

  const black = rgb(0.09, 0.09, 0.11);
  const orange = rgb(0.92, 0.35, 0.04);

  // PDF origin is bottom-left; our layout is top-left
  const fromTop = (pt: number) => heightPt - pt;

  // 1. Eguardian logo at top left (draw first so it stays behind text)
  try {
    const res = await fetch(LOGO_URL);
    if (res.ok) {
      const arr = await res.arrayBuffer();
      const bytes = new Uint8Array(arr);
      const img = LOGO_URL.toLowerCase().endsWith(".png")
        ? await doc.embedPng(bytes)
        : await doc.embedJpg(bytes);
      const logoW = (img.width / img.height) * LOGO_HEIGHT_PT;
      const logoTopY = fromTop(TOP_PADDING + LOGO_HEIGHT_PT);
      page.drawImage(img, {
        x: PADDING,
        y: logoTopY - LOGO_HEIGHT_PT,
        width: Math.min(logoW, widthPt - PADDING * 2 - QR_SIZE_PT - 20),
        height: LOGO_HEIGHT_PT,
      });
    }
  } catch {
    // skip logo
  }

  // 2. Border (after logo so border is on top)
  page.drawRectangle({
    x: 0,
    y: 0,
    width: widthPt,
    height: heightPt,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });

  // Name (below logo)
  const nameStr = safeText(`${data.firstName} ${data.surname}`);
  const designationStr = safeText(data.designation || "-");
  const codeStr = safeText(data.uniqueCode);

  const yNameBaseline = fromTop(TOP_PADDING + LOGO_HEIGHT_PT + LINE_GAP + FONT_NAME);
  page.drawText(nameStr, {
    x: PADDING,
    y: yNameBaseline,
    size: FONT_NAME,
    font: helveticaBold,
    color: black,
  });

  const yDesignationBaseline = yNameBaseline - LINE_GAP - FONT_DESIGNATION;
  page.drawText(designationStr, {
    x: PADDING,
    y: yDesignationBaseline,
    size: FONT_DESIGNATION,
    font: helvetica,
    color: black,
  });

  // QR on the right, vertically centered
  const qrBuffer = await QRCode.toBuffer(data.uniqueCode, {
    width: 256,
    margin: 2,
    type: "png",
  });
  const qrImage = await doc.embedPng(qrBuffer);
  const qrBoxSize = QR_SIZE_PT + QR_BORDER_PT * 2;
  const qrLeft = widthPt - PADDING - qrBoxSize;
  const qrCenterY = heightPt / 2;
  const qrBottom = qrCenterY - QR_SIZE_PT / 2 - QR_BORDER_PT;

  page.drawRectangle({
    x: qrLeft,
    y: qrBottom,
    width: qrBoxSize,
    height: qrBoxSize,
    borderWidth: QR_BORDER_PT,
    borderColor: orange,
  });
  page.drawImage(qrImage, {
    x: qrLeft + QR_BORDER_PT,
    y: qrBottom + QR_BORDER_PT,
    width: QR_SIZE_PT,
    height: QR_SIZE_PT,
  });

  const yCodeBaseline = qrBottom - CODE_GAP - FONT_CODE;
  const codeWidth = courierBold.widthOfTextAtSize(codeStr, FONT_CODE);
  page.drawText(codeStr, {
    x: qrLeft + (qrBoxSize - codeWidth) / 2,
    y: yCodeBaseline,
    size: FONT_CODE,
    font: courierBold,
    color: black,
  });

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}

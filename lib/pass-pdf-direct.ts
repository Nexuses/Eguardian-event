import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const PT_PER_MM = 72 / 25.4;
export const PASS_WIDTH_MM = 58;
export const PASS_HEIGHT_MM = 40;

export type PassData = {
  firstName: string;
  surname: string;
  organization: string;
  designation: string;
  uniqueCode: string;
};

function safeText(s: string): string {
  if (!s || !s.trim()) return "-";
  return s
    .replace(/\u2122/g, "")        // remove ™ (not in PDF standard fonts, can distort)
    .replace(/\u00AE/g, "")        // remove ®
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
  const FONT_NAME = 14;
  const FONT_ORG = 11;
  const LINE_GAP = 4;

  const doc = await PDFDocument.create();
  const page = doc.addPage([widthPt, heightPt]);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);

  const black = rgb(0.09, 0.09, 0.11);

  // 2. Border (after logo so border is on top)
  page.drawRectangle({
    x: 0,
    y: 0,
    width: widthPt,
    height: heightPt,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });

  // Centered content only: Name + Company
  const nameStr = safeText(`${data.firstName} ${data.surname}`);
  const organizationStr = safeText(data.organization || "-");
  const nameWidth = helveticaBold.widthOfTextAtSize(nameStr, FONT_NAME);
  const orgWidth = helvetica.widthOfTextAtSize(organizationStr, FONT_ORG);
  const blockHeight = FONT_NAME + LINE_GAP + FONT_ORG;
  const yNameBaseline = (heightPt + blockHeight) / 2 - FONT_NAME;
  page.drawText(nameStr, {
    x: Math.max(4, (widthPt - nameWidth) / 2),
    y: yNameBaseline,
    size: FONT_NAME,
    font: helveticaBold,
    color: black,
  });

  const yOrgBaseline = yNameBaseline - LINE_GAP - FONT_ORG;
  page.drawText(organizationStr, {
    x: Math.max(4, (widthPt - orgWidth) / 2),
    y: yOrgBaseline,
    size: FONT_ORG,
    font: helvetica,
    color: black,
  });

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}

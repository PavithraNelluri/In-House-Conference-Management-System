import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateCertificate = async (data) => {
  const { name, department, coords } = data;

  const templatePath = path.join(__dirname, '..', '..', 'Certificate_participation.pdf');
  const templateBytes = fs.readFileSync(templatePath);

  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];

  const pdfHeight = page.getHeight();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // ✅ SIMPLE: no scaling, just flip Y
  page.drawText(name, {
    x: coords.name.x,
    y: pdfHeight - coords.name.y,
    size: 11,
    font,
    color: rgb(0, 0, 0),
  });

  page.drawText(department, {
    x: coords.department.x,
    y: pdfHeight - coords.department.y,
    size: 11,
    font,
    color: rgb(0, 0, 0),
  });

  return Buffer.from(await pdfDoc.save());
};
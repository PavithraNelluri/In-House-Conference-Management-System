import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a certificate PDF with dynamic text positioning and font sizing
 * @param {Object} data - Certificate data
 * @param {string} data.name - Participant name
 * @param {string} data.department - Participant department
 * @param {Object} data.coords - Coordinate positions {name: {x, y}, department: {x, y}}
 * @param {Object} data.fontSize - Font sizes {name: size, department: size}
 * @returns {Buffer} PDF buffer
 */
export const generateCertificate = async (data) => {
  const { name, department, coords, fontSize } = data;

  // Validate inputs
  if (!name || !department || !coords) {
    throw new Error('Missing required parameters: name, department, coords');
  }

  const templatePath = path.join(__dirname, '..', '..', 'Certificate_participation.pdf');
  
  // Check if template exists
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Certificate template not found at ${templatePath}`);
  }

  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];
  const pdfHeight = page.getHeight();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Get font sizes or use defaults
  const nameFontSize = fontSize?.name || 11;
  const deptFontSize = fontSize?.department || 11;

  // Draw name at specified coordinates with custom font size
  page.drawText(name, {
    x: coords.name.x,
    y: pdfHeight - coords.name.y,
    size: nameFontSize,
    font,
    color: rgb(0, 0, 0),
  });

  // Draw department at specified coordinates with custom font size
  page.drawText(department, {
    x: coords.department.x,
    y: pdfHeight - coords.department.y,
    size: deptFontSize,
    font,
    color: rgb(0, 0, 0),
  });

  return Buffer.from(await pdfDoc.save());
};
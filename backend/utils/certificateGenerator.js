import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateCertificate = async (data) => {
  const { name, department, coords, fontSize, signature, signaturePosition } = data;

  if (!name || !department || !coords) {
    throw new Error('Missing required parameters: name, department, coords');
  }

  const templatePath = path.join(__dirname, '..', '..', 'Certificate_participation.pdf');
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Certificate template not found at ${templatePath}`);
  }

  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];
  const pdfHeight = page.getHeight();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const nameFontSize = fontSize?.name || 11;
  const deptFontSize = fontSize?.department || 11;

  // Draw name
  page.drawText(name, {
    x: coords.name.x,
    y: pdfHeight - coords.name.y,
    size: nameFontSize,
    font,
    color: rgb(0, 0, 0),
  });

  // Draw department
  page.drawText(department, {
    x: coords.department.x,
    y: pdfHeight - coords.department.y,
    size: deptFontSize,
    font,
    color: rgb(0, 0, 0),
  });

  // Add signature if provided
  if (signature) {
    try {
      const base64Data = signature.replace(/^data:image\/png;base64,/, '');
      const signatureImage = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));
      
      const signatureWidth = 80;
      const signatureHeight = 25;
      
      // Use provided position or defaults
      const sigX = signaturePosition?.x || 50;
      const sigY = signaturePosition?.y || 250;
      
      page.drawImage(signatureImage, {
        x: sigX,
        y: pdfHeight - sigY,
        width: signatureWidth,
        height: signatureHeight,
      });
    } catch (err) {
      console.error('Failed to embed signature:', err);
    }
  }

  return Buffer.from(await pdfDoc.save());
};
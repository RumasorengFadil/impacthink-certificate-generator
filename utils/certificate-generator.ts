"use client";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { CalculateAlignedXParams, CertificateData, TextElement } from "@/types";

// Helper function to convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0, g: 0, b: 0 };
}

// Map font family names to PDF standard fonts
function getFontForFamily(
  fontFamily: string,
  pdfDoc: PDFDocument,
): Promise<any> {
  const fontMap: Record<string, any> = {
    Arial: StandardFonts.Helvetica,
    "Times New Roman": StandardFonts.TimesRoman,
    "Courier New": StandardFonts.Courier,
    Georgia: StandardFonts.TimesRoman,
    Verdana: StandardFonts.Helvetica,
  };

  const standardFont = fontMap[fontFamily] || StandardFonts.Helvetica;
  return pdfDoc.embedFont(standardFont);
}
function calculateAlignedX({
  x,
  width,
  align,
}: CalculateAlignedXParams): number {
  switch (align) {
    case "center":
      return x - width / 2;

    case "right":
      return x - width;

    case "left":
    default:
      return x;
  }
}

// Generate a single certificate PDF
export async function generateCertificate(
  pdfFile: File,
  textElements: TextElement[],
  certificateData: CertificateData,
  canvasWidth: number,
): Promise<Uint8Array> {
  // Load the template PDF
  const templateBytes = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(templateBytes);

  // Get the first page
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();

  // Calculate scaling factor (canvas width to actual PDF width)
  const scale = pageWidth / canvasWidth;

  // Add text elements to the PDF
  for (const element of textElements) {
    let text = "";
    switch (element.type) {
      case "name":
        text = certificateData.recipientName || "";
        break;
      case "certNumber":
        text = certificateData.certificateNumber || "";
        break;
      case "issueDate":
        text = certificateData.issueDate || "";
        break;
    }

    if (!text) continue;

    // Get font
    const font = await getFontForFamily(element.fontFamily, pdfDoc);

    // Convert color
    const color = hexToRgb(element.color);
    const textWidth = font.widthOfTextAtSize(text, element.fontSize);
    // Scale position and font size
    let x = element.x * scale;
    const y = pageHeight - element.y * scale - element.fontSize * scale;
    const fontSize = element.fontSize * scale;
    if (element.align === "center") {
      x = calculateAlignedX({
        x,
        width: textWidth,
        align: element.align,
      });
    }

    // Draw text
    firstPage.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
    });
  }

  // Serialize the PDF
  return await pdfDoc.save();
}

// Download a single certificate
export async function downloadCertificate(
  pdfFile: File,
  textElements: TextElement[],
  certificateData: CertificateData,
  canvasWidth: number,
) {
  if (!pdfFile) {
    toast.error("Please upload a PDF template first");
    return;
  }

  if (!certificateData.recipientName.trim()) {
    toast.error("Please enter a recipient name");
    return;
  }

  try {
    toast.loading("Generating certificate...");

    const pdfBytes = await generateCertificate(
      pdfFile,
      textElements,
      certificateData,
      canvasWidth,
    );

    // Create blob and download
    const blob = new Blob([pdfBytes as unknown as BlobPart], {
      type: "application/pdf",
    });
    const fileName = `Certificate_${certificateData.recipientName.replace(/\s+/g, "_")}.pdf`;
    saveAs(blob, fileName);

    toast.dismiss();
    toast.success("Certificate generated successfully!");
  } catch (error) {
    console.error("Error generating certificate:", error);
    toast.dismiss();
    toast.error("Failed to generate certificate. Please try again.");
  }
}

// Extract and increment certificate number
function incrementCertificateNumber(certNumber: string): string {
  // Pattern: NO: 13.024/IMPCT/V/2025
  // We need to increment the number part (13.024 -> 13.025)
  const match = certNumber.match(/(\d+)\.(\d+)(\/.*)/);

  if (match) {
    const prefix = match[1];
    const number = parseInt(match[2], 10);
    const suffix = match[3];
    const incrementedNumber = (number + 1)
      .toString()
      .padStart(match[2].length, "0");
    return `NO: ${prefix}.${incrementedNumber}${suffix}`;
  }

  // If pattern doesn't match, just return the original
  return certNumber;
}

// Generate and download multiple certificates as ZIP
export async function bulkDownloadCertificates(
  pdfFile: File,
  textElements: TextElement[],
  certificateData: CertificateData,
  bulkRecipients: string,
  canvasWidth: number,
) {
  if (!pdfFile) {
    toast.error("Please upload a PDF template first");
    return;
  }

  const recipients = bulkRecipients
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  if (recipients.length === 0) {
    toast.error("Please enter at least one recipient name");
    return;
  }

  try {
    toast.loading(`Generating ${recipients.length} certificates...`);

    const zip = new JSZip();
    let currentCertNumber = certificateData.certificateNumber;

    for (let i = 0; i < recipients.length; i++) {
      const recipientName = recipients[i];

      // Create certificate data for this recipient
      const recipientData: CertificateData = {
        ...certificateData,
        recipientName,
        certificateNumber: currentCertNumber,
      };

      // Generate PDF
      const pdfBytes = await generateCertificate(
        pdfFile,
        textElements,
        recipientData,
        canvasWidth,
      );

      // Add to ZIP
      const fileName = `Certificate_${recipientName.replace(/\s+/g, "_")}.pdf`;
      zip.file(fileName, pdfBytes);

      // Increment certificate number for next iteration
      currentCertNumber = incrementCertificateNumber(currentCertNumber);
    }

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const timestamp = new Date().toISOString().slice(0, 10);
    saveAs(zipBlob, `Certificates_Bulk_${timestamp}.zip`);

    toast.dismiss();
    toast.success(`${recipients.length} certificates generated successfully!`);
  } catch (error) {
    console.error("Error generating bulk certificates:", error);
    toast.dismiss();
    toast.error("Failed to generate certificates. Please try again.");
  }
}

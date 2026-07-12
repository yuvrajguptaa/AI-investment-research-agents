import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/**
 * Generate a formatted PDF report from the structured knowledge base text
 */
export function generateCompanyPdf(companyName: string, kbText: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Ensure output directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const doc = new PDFDocument({
        bufferPages: true,
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      // --- Title Page / Header ---
      doc.rect(0, 0, doc.page.width, 15).fill("#1e293b"); // dark slate top band
      doc.moveDown(2);
      
      doc.fillColor("#0f172a")
         .font("Helvetica-Bold")
         .fontSize(24)
         .text("INVESTIQ RESEARCH TERMINAL", { align: "center" });
         
      doc.fillColor("#64748b")
         .font("Helvetica")
         .fontSize(10)
         .text("CONFIDENTIAL // INSTITUTIONAL EQUITY RESEARCH", { align: "center", characterSpacing: 1.5 });
      
      doc.moveDown(1.5);
      
      // Horizontal separator line
      doc.moveTo(50, doc.y)
         .lineTo(doc.page.width - 50, doc.y)
         .strokeColor("#cbd5e1")
         .lineWidth(1)
         .stroke();
         
      doc.moveDown(2);

      // Company Banner Title
      doc.fillColor("#2563eb")
         .font("Helvetica-Bold")
         .fontSize(20)
         .text(companyName.toUpperCase(), { align: "left" });
         
      doc.fillColor("#475569")
         .font("Helvetica-Oblique")
         .fontSize(10)
         .text(`Generated Date: ${new Date().toLocaleDateString()} • System Orchestrator Pipeline v2.0`);
         
      doc.moveDown(2.5);

      // --- Parse & Format Body Content ---
      // We read line-by-line to parse markdown headings (H1, H2, H3) and format them beautifully
      const lines = kbText.split("\n");
      
      doc.fillColor("#1e293b"); // Standard text color

      for (let line of lines) {
        line = line.trim();
        if (!line) {
          doc.moveDown(0.5);
          continue;
        }

        // H1 Heading (e.g., # Executive Summary)
        if (line.startsWith("# ")) {
          const headingText = line.replace(/^#\s+/, "");
          doc.addPage(); // Start each major section on a new page for clean, professional layout
          
          // Section header band
          doc.rect(0, 0, doc.page.width, 15).fill("#1e293b");
          doc.moveDown(2);
          
          doc.fillColor("#1e3a8a")
             .font("Helvetica-Bold")
             .fontSize(16)
             .text(headingText)
             .moveDown(0.8);
          doc.fillColor("#1e293b"); // Reset
          continue;
        }

        // H2 Heading (e.g., ## Business Model)
        if (line.startsWith("## ")) {
          const headingText = line.replace(/^##\s+/, "");
          doc.moveDown(0.5);
          doc.fillColor("#1e40af")
             .font("Helvetica-Bold")
             .fontSize(13)
             .text(headingText)
             .moveDown(0.5);
          doc.fillColor("#1e293b"); // Reset
          continue;
        }

        // H3 Heading (e.g., ### Key Highlights)
        if (line.startsWith("### ")) {
          const headingText = line.replace(/^###\s+/, "");
          doc.moveDown(0.3);
          doc.fillColor("#0369a1")
             .font("Helvetica-Bold")
             .fontSize(11)
             .text(headingText)
             .moveDown(0.4);
          doc.fillColor("#1e293b"); // Reset
          continue;
        }

        // List item formatting
        if (line.startsWith("- ") || line.startsWith("* ")) {
          const listText = line.replace(/^[-*]\s+/, "");
          doc.font("Helvetica")
             .fontSize(10)
             .text(`•  ${listText}`, { indent: 15, align: "justify" });
          continue;
        }

        // Default Paragraph Text
        doc.font("Helvetica")
           .fontSize(10)
           .text(line, { align: "justify", lineGap: 2 });
      }

      // Add footers on all pages
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fillColor("#94a3b8")
           .font("Helvetica")
           .fontSize(8)
           .text(
             `Page ${i + 1} of ${pages.count}  •  InvestIQ Institutional Terminal  •  Strictly Confidential`,
             50,
             doc.page.height - 35,
             { align: "center", width: doc.page.width - 100 }
           );
      }

      doc.end();

      writeStream.on("finish", () => {
        console.log(`[PDF Generator] PDF compiled successfully at: ${outputPath}`);
        resolve();
      });
      
      writeStream.on("error", (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

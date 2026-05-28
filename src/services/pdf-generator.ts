import jsPDF from "jspdf";

export function generatePDF(title: string, content: string) {
  const pdf = new jsPDF();
  
  // Header
  pdf.setFillColor(59, 130, 246); // Primary blue
  pdf.rect(0, 0, 210, 40, "F");
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("CRACKLIX STUDY NOTES", 20, 25);
  
  // Title
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(18);
  pdf.text(title.toUpperCase(), 20, 55);
  
  // Content
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  
  const splitContent = pdf.splitTextToSize(content, 170);
  pdf.text(splitContent, 20, 70);
  
  // Footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`© CRACKLIX Learning Ecosystem - Page ${i} of ${pageCount}`, 20, 285);
  }
  
  pdf.save(`${title.replace(/\s+/g, "_")}_notes.pdf`);
}
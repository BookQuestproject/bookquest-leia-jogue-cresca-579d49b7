import jsPDF from "jspdf";

export interface PDFReportInput {
  studentName: string;
  className: string;
  bookTitle?: string | null;
  schoolName?: string | null;
  teacherName?: string | null;
  periodLabel?: string | null;
  metrics: {
    progress: number;
    chapters: number;
    frequency: number;
    reflections: number;
    current_page?: number;
    total_pages?: number;
  };
  analysisText: string;
  teacherNote?: string | null;
  signature?: string | null;
}

export function generateReportPDF(input: PDFReportInput): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 48;
  let y = M;

  // Header band
  doc.setFillColor(30, 58, 138); // royal blue
  doc.rect(0, 0, W, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("BookQuest EDU", M, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Relatório pedagógico de leitura", M, 50);
  if (input.schoolName) {
    doc.setFontSize(10);
    doc.text(input.schoolName, W - M, 32, { align: "right" });
  }
  if (input.teacherName) {
    doc.setFontSize(9);
    doc.text(`Prof. ${input.teacherName}`, W - M, 50, { align: "right" });
  }
  y = 100;

  doc.setTextColor(31, 41, 55);

  // Student / class block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(input.studentName, M, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Turma: ${input.className}`, M, y);
  if (input.bookTitle) doc.text(`Livro: ${input.bookTitle}`, M + 220, y);
  y += 14;
  doc.text(`Período do relatório: ${input.periodLabel ?? new Date().toLocaleDateString("pt-BR")}`, M, y);
  y += 24;

  // Metrics table
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(M, y, W - 2 * M, 80, 6, 6, "FD");
  const cols = [
    { label: "Progresso", value: `${input.metrics.progress}%` },
    { label: "Capítulos lidos", value: String(input.metrics.chapters) },
    { label: "Frequência", value: `${input.metrics.frequency}/7 dias` },
    { label: "Reflexões", value: String(input.metrics.reflections) },
  ];
  const colW = (W - 2 * M) / cols.length;
  cols.forEach((c, i) => {
    const cx = M + i * colW + colW / 2;
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(c.label.toUpperCase(), cx, y + 22, { align: "center" });
    doc.setTextColor(30, 58, 138);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(c.value, cx, y + 54, { align: "center" });
  });
  y += 100;

  if (input.metrics.current_page !== undefined && input.metrics.total_pages) {
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `Página atual: ${input.metrics.current_page} de ${input.metrics.total_pages}`,
      M,
      y
    );
    y += 18;
  }

  // Analysis
  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Análise pedagógica", M, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  const analysisLines = doc.splitTextToSize(input.analysisText, W - 2 * M);
  doc.text(analysisLines, M, y);
  y += analysisLines.length * 14 + 14;

  // Teacher note
  if (input.teacherNote && input.teacherNote.trim()) {
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Observação do professor", M, y);
    y += 14;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    const noteLines = doc.splitTextToSize(input.teacherNote, W - 2 * M);
    doc.text(noteLines, M, y);
    y += noteLines.length * 14 + 18;
  }

  // Signature
  if (input.signature && input.signature.trim()) {
    doc.setDrawColor(226, 232, 240);
    doc.line(M, y, W - M, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    const sigLines = doc.splitTextToSize(input.signature, W - 2 * M);
    doc.text(sigLines, M, y);
  }

  // Footer
  const H = doc.internal.pageSize.getHeight();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Gerado em ${new Date().toLocaleString("pt-BR")} · BookQuest EDU`,
    W / 2,
    H - 24,
    { align: "center" }
  );

  return doc;
}

export function downloadReportPDF(input: PDFReportInput) {
  const doc = generateReportPDF(input);
  const safe = input.studentName.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_");
  doc.save(`Relatorio_${safe}.pdf`);
}

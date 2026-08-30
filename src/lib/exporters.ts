import { LETTERS, type SampleTest } from "./test-types";

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function fileBase(test: SampleTest) {
  return (test.title || "sample-test").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").toLowerCase();
}

export async function exportPdf(test: SampleTest, withKey: boolean) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 56;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const bottom = doc.internal.pageSize.getHeight() - margin;
  let y = margin;

  const ensure = (needed: number) => {
    if (y + needed > bottom) {
      doc.addPage();
      y = margin;
    }
  };

  const writeLines = (text: string, size: number, style: "normal" | "bold" | "italic", indent = 0) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, width - indent) as string[];
    for (const line of lines) {
      ensure(size + 6);
      doc.text(line, margin + indent, y);
      y += size + 4;
    }
  };

  writeLines(test.title, 18, "bold");
  writeLines(`${test.subject} · ${test.gradeLevel}`, 11, "normal");
  y += 6;
  writeLines("Name: ______________________     Date: ____________     Score: ______", 10, "normal");
  y += 12;

  test.questions.forEach((q, i) => {
    ensure(60);
    writeLines(`${i + 1}. ${q.stem}`, 12, "bold");
    q.options.forEach((opt, oi) => writeLines(`${LETTERS[oi]}. ${opt}`, 11, "normal", 18));
    y += 8;
  });

  if (withKey) {
    doc.addPage();
    y = margin;
    writeLines("Answer Key", 16, "bold");
    y += 4;
    test.questions.forEach((q, i) => {
      writeLines(`${i + 1}. ${LETTERS[q.answer]}. ${q.options[q.answer]}`, 11, "normal");
      if (q.explanation) writeLines(q.explanation, 10, "italic", 18);
      y += 4;
    });
  }

  doc.save(`${fileBase(test)}.pdf`);
}

export async function exportWord(test: SampleTest, withKey: boolean) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak } = await import("docx");

  const children: InstanceType<typeof Paragraph>[] = [
    new Paragraph({ text: test.title, heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: `${test.subject} · ${test.gradeLevel}` }),
    new Paragraph({ text: "Name: ______________________   Date: ____________   Score: ______" }),
    new Paragraph({ text: "" }),
  ];

  test.questions.forEach((q, i) => {
    children.push(
      new Paragraph({ children: [new TextRun({ text: `${i + 1}. ${q.stem}`, bold: true })] }),
    );
    q.options.forEach((opt, oi) =>
      children.push(new Paragraph({ text: `${LETTERS[oi]}. ${opt}`, indent: { left: 360 } })),
    );
    children.push(new Paragraph({ text: "" }));
  });

  if (withKey) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(new Paragraph({ text: "Answer Key", heading: HeadingLevel.HEADING_1 }));
    test.questions.forEach((q, i) => {
      children.push(new Paragraph({ text: `${i + 1}. ${LETTERS[q.answer]}. ${q.options[q.answer]}` }));
      if (q.explanation) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: q.explanation, italics: true })],
            indent: { left: 360 },
          }),
        );
      }
    });
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  download(blob, `${fileBase(test)}.docx`);
}

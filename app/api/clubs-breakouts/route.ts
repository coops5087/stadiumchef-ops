import ExcelJS from "exceljs";

export const runtime = "nodejs";

type Club = { column: number; name: string };

function text(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (typeof value === "object") {
    if ("richText" in value) return value.richText.map((part) => part.text).join("").trim();
    if ("text" in value && typeof value.text === "string") return value.text.trim();
    if ("result" in value && value.result != null) return String(value.result).trim();
  }
  return String(value).trim();
}

function isBlack(cell: ExcelJS.Cell): boolean {
  const fill = cell.fill;
  if (!fill || fill.type !== "pattern") return false;
  const pattern = fill as ExcelJS.FillPattern;
  if (pattern.pattern !== "solid") return false;
  const color = pattern.fgColor;
  if (!color) return false;
  const argb = color.argb?.toUpperCase();
  const indexed = (color as { indexed?: number }).indexed;
  return argb === "FF000000" || argb === "000000" || color.theme === 1 || indexed === 0 || indexed === 8;
}

function findHeader(sheet: ExcelJS.Worksheet): { row: number; totalColumn: number; clubs: Club[] } {
  const maxRows = Math.min(sheet.rowCount, 25);
  const maxColumns = Math.min(sheet.columnCount, 40);
  for (let row = 1; row <= maxRows; row += 1) {
    for (let column = 1; column <= maxColumns; column += 1) {
      if (text(sheet.getCell(row, column).value).toUpperCase() !== "TOTAL") continue;
      const clubs: Club[] = [];
      for (let clubColumn = column + 1; clubColumn <= maxColumns; clubColumn += 1) {
        const name = text(sheet.getCell(row, clubColumn).value);
        if (!name) { if (clubs.length) break; continue; }
        const numeric = Number.isFinite(Number(name.replaceAll(",", "")));
        if (numeric) { if (clubs.length) break; continue; }
        clubs.push({ column: clubColumn, name });
      }
      if (clubs.length >= 2) return { row, totalColumn: column, clubs };
    }
  }
  throw new Error("I could not find a TOTAL column followed by the club-space columns near the top of the workbook.");
}

function safeSheetName(name: string, used: Set<string>): string {
  const base = (name.replace(/[:\\/?*\[\]]/g, " ").replace(/\s+/g, " ").trim() || "CLUB").slice(0, 31);
  let candidate = base;
  let index = 2;
  while (used.has(candidate)) {
    const suffix = ` ${index}`;
    candidate = `${base.slice(0, 31 - suffix.length)}${suffix}`;
    index += 1;
  }
  used.add(candidate);
  return candidate;
}

function clone<T>(value: T): T {
  if (value == null) return value;
  return structuredClone(value);
}

function copyCell(source: ExcelJS.Cell, target: ExcelJS.Cell) {
  target.value = clone(source.value);
  target.style = clone(source.style);
  if (source.note) target.note = clone(source.note);
}

function estimateRows(sheet: ExcelJS.Worksheet) {
  const widths = [34, 78, 22, 20];
  widths.forEach((width, index) => { sheet.getColumn(index + 1).width = width; });
  sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    let maxLines = 1;
    let maxFontSize = 11;
    for (let column = 1; column <= 4; column += 1) {
      const cell = row.getCell(column);
      const value = text(cell.value);
      cell.alignment = { ...cell.alignment, wrapText: true, vertical: "middle" };
      if (!value) continue;
      const fontSize = Number(cell.font?.size || 11);
      maxFontSize = Math.max(maxFontSize, fontSize);
      const perLine = Math.max(7, Math.floor(widths[column - 1] * (cell.font?.bold || cell.font?.italic ? 0.5 : 0.57)));
      const lines = value.split("\n").reduce((sum, line) => sum + Math.max(1, Math.ceil(line.trimEnd().length / perLine)), 0);
      maxLines = Math.max(maxLines, lines);
    }
    const lineHeight = Math.max(21, Math.floor(maxFontSize * 1.5));
    row.height = Math.min(200, Math.max(rowNumber <= 5 ? 34 : 30, maxLines * lineHeight + 8));
  });
}

export async function buildBreakouts(buffer: ArrayBuffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  let master: ExcelJS.Worksheet | undefined;
  let header: ReturnType<typeof findHeader> | undefined;
  for (const sheet of workbook.worksheets) {
    try { header = findHeader(sheet); master = sheet; break; } catch { /* continue */ }
  }
  if (!master || !header) throw new Error("No master production sheet was detected in this workbook.");

  const used = new Set(workbook.worksheets.map((sheet) => sheet.name));
  const created: string[] = [];
  for (const club of header.clubs) {
    const name = safeSheetName(club.name, used);
    const output = workbook.addWorksheet(name, {
      properties: clone(master.properties),
      pageSetup: clone(master.pageSetup),
      views: [{ state: "frozen", xSplit: 0, ySplit: header.row, topLeftCell: `A${header.row + 1}`, activeCell: "A1" }],
      headerFooter: clone(master.headerFooter),
    });
    let outputRow = 1;
    for (let sourceRow = 1; sourceRow <= master.rowCount; sourceRow += 1) {
      const clubCell = master.getCell(sourceRow, club.column);
      const keep = sourceRow <= header.row || (!isBlack(clubCell) && text(clubCell.value) !== "");
      if (!keep) continue;
      const sourceColumns = [1, 2, 3, club.column];
      sourceColumns.forEach((sourceColumn, index) => copyCell(master!.getCell(sourceRow, sourceColumn), output.getCell(outputRow, index + 1)));
      outputRow += 1;
    }
    const thinBlack: Partial<ExcelJS.Border> = { style: "thin", color: { argb: "FF000000" } };
    output.eachRow({ includeEmpty: true }, (row) => row.eachCell({ includeEmpty: true }, (cell) => { cell.border = { top: thinBlack, left: thinBlack, bottom: thinBlack, right: thinBlack }; }));
    estimateRows(output);
    created.push(name);
  }
  return { bytes: await workbook.xlsx.writeBuffer(), created };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Please select an Excel workbook." }, { status: 400 });
    if (!file.name.toLowerCase().endsWith(".xlsx")) return Response.json({ error: "The selected file must be an .xlsx workbook." }, { status: 400 });
    if (file.size > 20 * 1024 * 1024) return Response.json({ error: "The workbook is too large. The maximum upload size is 20 MB." }, { status: 400 });
    const result = await buildBreakouts(await file.arrayBuffer());
    const outputName = `${file.name.replace(/\.xlsx$/i, "")} - CLUB BREAKOUTS.xlsx`;
    return new Response(result.bytes as BodyInit, {
      headers: {
        "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "content-disposition": `attachment; filename="${outputName.replaceAll('"', "")}"`,
        "x-club-count": String(result.created.length),
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "The workbook could not be processed." }, { status: 422 });
  }
}

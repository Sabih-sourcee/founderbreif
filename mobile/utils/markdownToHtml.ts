export function markdownToHtml(markdown: string, documentType: string = "PRD"): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = markdown.split("\n");
  const out: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.trim() === "---") {
      closeList();
      out.push("<hr/>");
      continue;
    }

    if (line.startsWith("### ")) {
      closeList();
      out.push(`<h3>${esc(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      closeList();
      out.push(`<h2>${esc(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      closeList();
      out.push(`<h1>${esc(line.slice(2))}</h1>`);
      continue;
    }

    if (line.startsWith("* ") || line.startsWith("- ")) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      let content = esc(line.slice(2));
      content = content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      out.push(`<li>${content}</li>`);
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      closeList();
      out.push(`<p>${esc(line).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`);
      continue;
    }

    if (line.trim() === "") {
      closeList();
      continue;
    }

    closeList();
    let content = esc(line);
    content = content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    out.push(`<p>${content}</p>`);
  }

  closeList();

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    body{font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;padding:40px 48px;color:#1C2120;line-height:1.65;max-width:740px;margin:0 auto;background:#FFFFFF}
    .badge{display:inline-block;background:#FBFF28;color:#1C2120;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:1px;margin-bottom:10px}
    h1{font-size:24px;border-bottom:3px solid #1C2120;padding-bottom:12px;margin-bottom:18px;color:#1C2120}
    h2{font-size:17px;color:#1C2120;background:#DAF7F3;padding:8px 14px;border-radius:12px;margin-top:28px;margin-bottom:12px}
    h3{font-size:14px;margin-top:18px;color:#323B39}
    p,li{font-size:13px;color:#323B39}
    ul{padding-left:20px;margin:8px 0}
    hr{border:none;border-top:1px solid #DAF7F3;margin:24px 0}
    strong{color:#1C2120}
  </style></head><body><div class="badge">FOUNDERBRIEF • ${esc(documentType.toUpperCase())}</div>${out.join("\n")}</body></html>`;
}

export function markdownToWordDoc(markdown: string, title: string, documentType: string = "PRD"): string {
  const htmlBody = markdownToHtml(markdown, documentType);
  return `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${title}</title></head><body>${htmlBody}</body></html>`;
}

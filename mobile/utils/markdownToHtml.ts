export function markdownToHtml(markdown: string): string {
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
    body{font-family:Georgia,'Times New Roman',serif;padding:40px 48px;color:#1a1a1a;line-height:1.65;max-width:720px;margin:0 auto}
    h1{font-size:22px;border-bottom:2px solid #E07B39;padding-bottom:10px;margin-bottom:16px;font-family:system-ui,sans-serif}
    h2{font-size:16px;color:#E07B39;margin-top:28px;margin-bottom:10px;font-family:system-ui,sans-serif}
    h3{font-size:14px;margin-top:20px;font-family:system-ui,sans-serif}
    p,li{font-size:13px;color:#333}
    ul{padding-left:20px;margin:8px 0}
    hr{border:none;border-top:1px solid #E5DDD3;margin:24px 0}
    strong{color:#1a1a1a}
  </style></head><body>${out.join("\n")}</body></html>`;
}

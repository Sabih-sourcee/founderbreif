/** Turns Markdown into plain text (used for TXT export and text-to-speech). */
export function stripMarkdown(md: string): string {
  return md
    .replace(/\r/g, "")
    .replace(/^\s*[-*_]{3,}\s*$/gm, "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Splits text into speakable sentences (handles Urdu/Arabic/Hindi terminators). */
export function splitSentences(text: string, maxLen = 260): string[] {
  const cleaned = text.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();
  if (!cleaned) return [];
  const raw = cleaned.match(/[^.!?۔؟।\n]+[.!?۔؟।]*/g) ?? [cleaned];
  const out: string[] = [];
  for (const piece of raw) {
    const s = piece.trim();
    if (!s) continue;
    if (s.length <= maxLen) {
      out.push(s);
      continue;
    }
    // Break very long sentences on commas / spaces.
    let buf = "";
    for (const word of s.split(" ")) {
      if ((buf + " " + word).trim().length > maxLen) {
        out.push(buf.trim());
        buf = word;
      } else {
        buf = `${buf} ${word}`;
      }
    }
    if (buf.trim()) out.push(buf.trim());
  }
  return out;
}

export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Oct 18" */
export function shortDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}`;
}

export function firstName(fullName: string | undefined | null): string {
  const n = (fullName ?? "").trim().split(/\s+/)[0];
  return n ?? "";
}

/** Rough read-aloud duration estimate at 1.0x (seconds). */
export function estimateReadSeconds(text: string, rate = 1): number {
  const chars = stripMarkdown(text).length;
  return Math.max(3, Math.round(chars / (15 * rate)));
}

import { Share } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { ExportDocFormat, ProjectBrief } from "../types";
import { markdownToHtml, markdownToWordDoc } from "../utils/markdownToHtml";
import { stripMarkdown } from "../utils/text";

function safeName(title: string): string {
  const cleaned = title.replace(/[^\p{L}\p{N}\s_-]/gu, "").trim().replace(/\s+/g, "_");
  return cleaned.slice(0, 60) || "FounderBrief";
}

async function writeCacheFile(name: string, contents: string): Promise<string> {
  const uri = `${FileSystem.cacheDirectory}${name}`;
  await FileSystem.writeAsStringAsync(uri, contents, { encoding: FileSystem.EncodingType.UTF8 });
  return uri;
}

async function shareFile(uri: string, mimeType: string, uti: string, title: string) {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType, UTI: uti, dialogTitle: title });
    return;
  }
  throw new Error("Sharing is not available on this device.");
}

/** Exports THIS generated document in the requested format. */
export async function exportDocument(brief: ProjectBrief, format: ExportDocFormat): Promise<void> {
  const markdown = brief.documentMarkdown || `# ${brief.title}\n\n${brief.tldr}`;
  const base = safeName(brief.title);

  if (format === "TXT") {
    const uri = await writeCacheFile(`${base}.txt`, stripMarkdown(markdown));
    await shareFile(uri, "text/plain", "public.plain-text", `${brief.title} (TXT)`);
    return;
  }

  if (format === "Word") {
    const html = markdownToWordDoc(markdown, brief.title, brief.documentType);
    const uri = await writeCacheFile(`${base}.doc`, html);
    await shareFile(uri, "application/msword", "com.microsoft.word.doc", `${brief.title} (Word)`);
    return;
  }

  // PDF
  const html = markdownToHtml(markdown, brief.documentType);
  const { uri: tmp } = await Print.printToFileAsync({ html });
  const target = `${FileSystem.cacheDirectory}${base}.pdf`;
  let finalUri = tmp;
  try {
    await FileSystem.deleteAsync(target, { idempotent: true });
    await FileSystem.moveAsync({ from: tmp, to: target });
    finalUri = target;
  } catch {
    finalUri = tmp;
  }
  await shareFile(finalUri, "application/pdf", "com.adobe.pdf", `${brief.title} (PDF)`);
}

/** Shares the plain text when file sharing is unavailable. */
export async function shareAsText(brief: ProjectBrief) {
  await Share.share({ title: brief.title, message: stripMarkdown(brief.documentMarkdown) });
}

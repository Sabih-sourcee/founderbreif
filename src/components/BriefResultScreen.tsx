import React, { useState } from "react";
import {
  Download,
  Volume2,
  Plus,
  Check,
  FileText,
} from "lucide-react";
import { ExportDocFormat, ProjectBrief } from "../types";

interface BriefResultScreenProps {
  brief: ProjectBrief;
  onStartOver: () => void;
  onOpenInReadAloud?: (brief: ProjectBrief) => void;
}

export const BriefResultScreen: React.FC<BriefResultScreenProps> = ({
  brief,
  onStartOver,
  onOpenInReadAloud,
}) => {
  const [exportedFmt, setExportedFmt] = useState<ExportDocFormat | null>(null);

  const docType = brief.documentType || "PRD";
  const lang = brief.spokenLanguage || "Urdu";

  const handleExport = (fmt: ExportDocFormat) => {
    const md =
      brief.documentMarkdown ||
      `# ${brief.title} (${docType})\n\n${brief.description}\n\n## Core Features\n${brief.coreFeatures.map((f) => `- ${f}`).join("\n")}\n\n## User Stories\n${brief.userStories.map((s) => `- ${s}`).join("\n")}\n\n## Key Considerations\n${brief.devQuestions.map((q) => `- ${q}`).join("\n")}`;

    const safeName = brief.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (fmt === "PDF") {
      window.print();
    } else if (fmt === "Word") {
      const wordHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${brief.title}</title></head><body style="font-family:sans-serif;padding:32px;color:#1C2120"><h1>${brief.title} (${docType})</h1><p>${brief.description}</p><pre style="white-space:pre-wrap;font-family:sans-serif">${md}</pre></body></html>`;
      const blob = new Blob([wordHtml], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeName}.doc`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([md], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeName}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }

    setExportedFmt(fmt);
    setTimeout(() => setExportedFmt(null), 2200);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-24">
      {/* RIGHT BUBBLE: Original Spoken Voice Note (#1C2120 Dark Bubble) */}
      <div className="flex justify-end mb-5">
        <div className="w-[88%] sm:w-[78%] bg-[#1C2120] text-white rounded-[30px] rounded-br-[10px] p-5 fb-dark-bubble-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] font-extrabold bg-[#272E2C] text-[#FBFF28] px-3 py-1 rounded-full">
              SPOKEN VOICE NOTE • {lang.toUpperCase()}
            </span>
            <div className="flex items-center gap-1">
              {[8, 14, 10, 18, 12, 16, 10, 14].map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${h}px` }}
                  className="w-1 rounded-full bg-[#FBFF28] inline-block"
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-[#B8C7C4] italic leading-relaxed">
            “{brief.originalIdea || brief.description}”
          </p>
        </div>
      </div>

      {/* LEFT BUBBLE: Generated Document Masthead (#FFFFFF Bubble) */}
      <div className="bg-white rounded-[34px] rounded-tl-[10px] p-6 sm:p-8 fb-bubble-shadow mb-6">
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <span className="font-mono text-xs font-extrabold bg-[#FBFF28] text-[#1C2120] px-3.5 py-1 rounded-full">
            {docType.toUpperCase()}
          </span>
          <span className="font-mono text-xs font-extrabold bg-[#DAF7F3] text-[#1C2120] px-3.5 py-1 rounded-full">
            {brief.complexity} Scope
          </span>
          <span className="font-mono text-xs font-extrabold bg-[#1C2120] text-[#FBFF28] px-3.5 py-1 rounded-full">
            {brief.estimatedBudget}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1C2120] tracking-tight mb-4">
          {brief.title}
        </h1>

        <div className="bg-[#DAF7F3] rounded-[24px] p-5 mb-6">
          <div className="font-mono text-[10px] font-extrabold text-[#4A5754] uppercase tracking-wider mb-1">
            EXECUTIVE SUMMARY
          </div>
          <p className="text-sm sm:text-base text-[#1C2120] leading-relaxed font-medium">
            {brief.description}
          </p>
        </div>

        {/* Tinrec-style One-Click Export Row: Word | PDF | TXT */}
        <div className="mb-5">
          <div className="font-mono text-[10px] font-extrabold text-[#4A5754] uppercase tracking-wider mb-2.5">
            ONE-CLICK EXPORT (TINREC FORMATS)
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["Word", "PDF", "TXT"] as ExportDocFormat[]).map((fmt) => {
              const done = exportedFmt === fmt;
              return (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => handleExport(fmt)}
                  className={`fb-interactive py-3.5 px-4 rounded-full font-mono text-xs font-extrabold inline-flex items-center justify-center gap-2 ${
                    fmt === "PDF"
                      ? "bg-[#FBFF28] text-[#1C2120] fb-pill-shadow"
                      : "bg-[#DAF7F3] text-[#1C2120] hover:bg-[#1C2120] hover:text-[#FBFF28]"
                  }`}
                >
                  {done ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  <span>{done ? `Exported ${fmt}` : `Export ${fmt}`}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Direction 2 Bridge: Listen in Read Aloud */}
        {onOpenInReadAloud ? (
          <button
            type="button"
            onClick={() => onOpenInReadAloud(brief)}
            className="fb-interactive fb-dark-bubble-shadow w-full bg-[#1C2120] text-white rounded-[24px] p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#FBFF28] text-[#1C2120] flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-sm text-white">
                  Listen to this {docType} in Read Aloud Studio
                </div>
                <div className="text-xs text-[#B8C7C4]">
                  Select Urdu, Hindi, Arabic, or English voice • 0.5x–1.5x speed • MP3/AAC/WAV
                </div>
              </div>
            </div>
            <span className="font-extrabold text-[#FBFF28] pr-2">→</span>
          </button>
        ) : null}
      </div>

      {/* Structured Sections as Bubble Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="bg-white rounded-[28px] p-6 fb-bubble-shadow">
          <div className="inline-flex items-center gap-2 bg-[#FBFF28] text-[#1C2120] font-mono text-[10px] font-extrabold px-3 py-1 rounded-full mb-3">
            01 • CORE DELIVERABLES & SCOPE
          </div>
          <ul className="space-y-2.5">
            {brief.coreFeatures.map((feat, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[#323B39]">
                <span className="w-2 h-2 rounded-full bg-[#1C2120] mt-1.5 shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-[28px] p-6 fb-bubble-shadow">
          <div className="inline-flex items-center gap-2 bg-[#DAF7F3] text-[#1C2120] font-mono text-[10px] font-extrabold px-3 py-1 rounded-full mb-3">
            02 • USER STORIES & WORKFLOWS
          </div>
          <ul className="space-y-2.5">
            {brief.userStories.map((story, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[#323B39]">
                <span className="w-2 h-2 rounded-full bg-[#1C2120] mt-1.5 shrink-0" />
                <span>{story}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {brief.documentMarkdown ? (
        <div className="bg-white rounded-[30px] p-6 sm:p-8 fb-bubble-shadow mb-6">
          <div className="inline-flex items-center gap-2 bg-[#1C2120] text-[#FBFF28] font-mono text-[10px] font-extrabold px-3.5 py-1 rounded-full mb-4">
            <FileText className="w-3.5 h-3.5" />
            COMPLETE {docType.toUpperCase()} DOSSIER
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm text-[#1C2120] leading-relaxed">
            {brief.documentMarkdown}
          </pre>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onStartOver}
        className="fb-interactive fb-dark-bubble-shadow w-full bg-[#1C2120] text-[#FBFF28] font-extrabold text-sm py-4 rounded-full inline-flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Record Another Voice Document
      </button>
    </div>
  );
};

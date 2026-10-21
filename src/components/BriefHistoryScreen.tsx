import React, { useState, useMemo } from "react";
import {
  Trash2,
  Plus,
  Volume2,
  FileText,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { DocumentOutputType, ProjectBrief } from "../types";

interface BriefHistoryScreenProps {
  briefs: ProjectBrief[];
  onSelectBrief: (brief: ProjectBrief) => void;
  onOpenReadAloudItem?: (brief: ProjectBrief) => void;
  onDeleteBrief: (id: string, e: React.MouseEvent) => void;
  onRestoreBriefs?: (briefs: ProjectBrief[]) => void;
  onNewBrief: () => void;
  onNewReadAloud?: () => void;
}

export const BriefHistoryScreen: React.FC<BriefHistoryScreenProps> = ({
  briefs,
  onSelectBrief,
  onOpenReadAloudItem,
  onDeleteBrief,
  onRestoreBriefs,
  onNewBrief,
  onNewReadAloud,
}) => {
  const [directionFilter, setDirectionFilter] = useState<
    "All" | "voice-to-doc" | "doc-to-voice"
  >("All");
  const [docTypeFilter, setDocTypeFilter] = useState<"All" | DocumentOutputType>("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "title">("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingUndo, setPendingUndo] = useState<{
    item: ProjectBrief;
    snapshot: ProjectBrief[];
  } | null>(null);

  const counts = useMemo(() => {
    const voiceDocs = briefs.filter(
      (b) => (b.direction || "voice-to-doc") === "voice-to-doc"
    ).length;
    const audioReads = briefs.filter((b) => b.direction === "doc-to-voice").length;
    return {
      All: briefs.length,
      "voice-to-doc": voiceDocs,
      "doc-to-voice": audioReads,
    };
  }, [briefs]);

  const filtered = useMemo(() => {
    const list = briefs.filter((b) => {
      const dir = b.direction || "voice-to-doc";
      if (directionFilter !== "All" && dir !== directionFilter) return false;
      if (docTypeFilter !== "All" && (b.documentType || "PRD") !== docTypeFilter)
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q)
        );
      }
      return true;
    });

    if (sortOrder === "title") {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [briefs, directionFilter, docTypeFilter, searchQuery, sortOrder]);

  const handleDeleteWithUndo = (b: ProjectBrief, e: React.MouseEvent) => {
    e.stopPropagation();
    const snapshot = [...briefs];
    setPendingUndo({ item: b, snapshot });
    onDeleteBrief(b.id, e);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-24">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <span className="inline-block font-mono text-[10px] font-extrabold bg-white text-[#1C2120] px-3 py-1 rounded-full fb-bubble-shadow mb-2">
            VOZIFY + TINREC UNIFIED ARCHIVE
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C2120] tracking-tight">
            Shared Library
          </h1>
          <p className="text-sm text-[#323B39] mt-1">
            All generated documents (Voice → Doc) and Read Aloud items (Doc → Voice).
          </p>
        </div>

        <button
          type="button"
          onClick={onNewBrief}
          className="fb-interactive fb-pill-shadow inline-flex items-center gap-2 bg-[#FBFF28] text-[#1C2120] font-extrabold text-xs sm:text-sm px-5 py-3 rounded-full"
        >
          <Plus className="w-4 h-4" />
          New Voice Doc
        </button>
      </div>

      {/* Search & Sort Row */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#5A6966] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PRDs, Business Plans, Resumes, Audio Reads…"
            className="w-full bg-white text-[#1C2120] text-sm rounded-full pl-11 pr-4 py-3 fb-bubble-shadow focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() =>
            setSortOrder((s) => (s === "newest" ? "title" : "newest"))
          }
          className="fb-interactive inline-flex items-center gap-2 bg-[#1C2120] text-[#FBFF28] font-mono text-xs font-extrabold px-4 py-3 rounded-full"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          {sortOrder === "newest" ? "Newest" : "A–Z"}
        </button>
      </div>

      {/* Direction Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {(
          [
            { id: "All", label: `All (${counts.All})` },
            { id: "voice-to-doc", label: `Voice → Doc (${counts["voice-to-doc"]})` },
            { id: "doc-to-voice", label: `Read Aloud (${counts["doc-to-voice"]})` },
          ] as const
        ).map((tab) => {
          const active = directionFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDirectionFilter(tab.id)}
              className={`fb-interactive px-4 py-2 rounded-full text-xs font-extrabold ${
                active
                  ? "bg-[#1C2120] text-[#FBFF28] fb-dark-bubble-shadow"
                  : "bg-white text-[#1C2120] fb-bubble-shadow"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Document Type Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(
          [
            "All",
            "PRD",
            "Business Plan",
            "Resume",
            "Pitch Deck Outline",
            "Generic Brief",
          ] as const
        ).map((dt) => {
          const active = docTypeFilter === dt;
          return (
            <button
              key={dt}
              type="button"
              onClick={() => setDocTypeFilter(dt)}
              className={`fb-interactive px-3.5 py-1.5 rounded-full text-xs font-extrabold ${
                active
                  ? "bg-[#FBFF28] text-[#1C2120] fb-pill-shadow"
                  : "bg-white/70 text-[#323B39]"
              }`}
            >
              {dt}
            </button>
          );
        })}
      </div>

      {/* Undo Banner */}
      {pendingUndo ? (
        <div className="bg-[#1C2120] text-white rounded-full px-5 py-3 mb-5 fb-dark-bubble-shadow flex items-center justify-between">
          <span className="text-xs font-bold truncate">
            Removed “{pendingUndo.item.title}”
          </span>
          <button
            type="button"
            onClick={() => {
              onRestoreBriefs?.(pendingUndo.snapshot);
              setPendingUndo(null);
            }}
            className="fb-interactive bg-[#FBFF28] text-[#1C2120] font-extrabold text-xs px-4 py-1.5 rounded-full"
          >
            Undo
          </button>
        </div>
      ) : null}

      {/* Items List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[34px] p-10 text-center fb-bubble-shadow">
          <div className="w-14 h-14 rounded-full bg-[#DAF7F3] text-[#1C2120] flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-[#1C2120] mb-2">
            Your Unified Library is empty
          </h3>
          <p className="text-sm text-[#4A5754] max-w-md mx-auto mb-6">
            Record a voice note to generate a PRD, Business Plan, Resume, or Pitch Deck — or import a document for Read Aloud.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onNewBrief}
              className="fb-interactive fb-pill-shadow bg-[#FBFF28] text-[#1C2120] font-extrabold text-xs px-6 py-3.5 rounded-full"
            >
              Record Voice → Doc
            </button>
            {onNewReadAloud ? (
              <button
                type="button"
                onClick={onNewReadAloud}
                className="fb-interactive bg-[#DAF7F3] text-[#1C2120] font-extrabold text-xs px-6 py-3.5 rounded-full"
              >
                Open Read Aloud →
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const isAudioRead = b.direction === "doc-to-voice";
            const docType = b.documentType || "PRD";
            const lang = b.spokenLanguage || "Urdu";

            return (
              <div
                key={b.id}
                onClick={() =>
                  isAudioRead && onOpenReadAloudItem
                    ? onOpenReadAloudItem(b)
                    : onSelectBrief(b)
                }
                className="fb-interactive cursor-pointer bg-white rounded-[28px] p-6 fb-bubble-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[10px] font-extrabold px-3 py-1 rounded-full ${
                        isAudioRead
                          ? "bg-[#1C2120] text-[#FBFF28]"
                          : "bg-[#FBFF28] text-[#1C2120]"
                      }`}
                    >
                      {isAudioRead ? "🔊 DOC → VOICE" : `📄 ${docType.toUpperCase()}`}
                    </span>
                    <span className="font-mono text-[10px] font-bold bg-[#DAF7F3] text-[#1C2120] px-2.5 py-1 rounded-full">
                      {lang}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#5A6966]">
                    {b.createdAt}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-[#1C2120] mb-1">
                  {b.title}
                </h3>
                <p className="text-sm text-[#4A5754] line-clamp-2 mb-4">
                  {b.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-[#1C2120]/10">
                  <span className="font-mono text-xs font-bold text-[#4A5754]">
                    {isAudioRead
                      ? `${b.playbackSpeed || 1.0}x • ${b.audioFormat || "MP3"} Audio`
                      : `Word • PDF • TXT • ${b.estimatedBudget}`}
                  </span>

                  <div className="flex items-center gap-2">
                    {onOpenReadAloudItem ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReadAloudItem(b);
                        }}
                        className="fb-interactive inline-flex items-center gap-1.5 bg-[#FBFF28] text-[#1C2120] font-extrabold text-xs px-3.5 py-1.5 rounded-full"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Listen
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={(e) => handleDeleteWithUndo(b, e)}
                      className="fb-interactive w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

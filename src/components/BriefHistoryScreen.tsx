import React, { useState } from "react";
import { motion } from "motion/react";
import { ProjectBrief } from "../types";
import { Plus, FolderOpen, Eye, Trash2 } from "lucide-react";

interface BriefHistoryScreenProps {
  briefs: ProjectBrief[];
  onSelectBrief: (brief: ProjectBrief) => void;
  onDeleteBrief: (id: string) => void;
  onNewBrief: () => void;
}

export default function BriefHistoryScreen({
  briefs,
  onSelectBrief,
  onDeleteBrief,
  onNewBrief
}: BriefHistoryScreenProps) {
  const [filter, setFilter] = useState<"All" | "Low" | "Medium" | "High">("All");

  const filteredBriefs = briefs.filter((b) => {
    if (filter === "All") return true;
    return b.complexity === filter;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex-grow flex flex-col justify-start px-4 sm:px-6 pt-6 pb-24 max-w-2xl mx-auto w-full font-sans text-left"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tracking-tight">Your Brief Archive</h1>
          <p className="text-xs text-[#444748] mt-1">Historically compiled technical startup briefs.</p>
        </div>
        <button
          onClick={onNewBrief}
          className="px-3 py-2 bg-[#E07B39] text-[#FAF8F5] text-xs font-bold rounded-lg flex items-center gap-1 hover:opacity-95 cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Draft New</span>
        </button>
      </div>

      {/* Filter Segment togglers */}
      <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1 no-print">
        {(["All", "Low", "Medium", "High"] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilter(lvl)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
              filter === lvl
                ? "bg-[#1A1A1A] border-[#1A1A1A] text-[#FAF8F5] font-bold"
                : "bg-[#F2EEE8] border-[#E5DDD3] text-[#444748] hover:bg-[#E5DDD3]/50"
            }`}
          >
            {lvl} Complexity
          </button>
        ))}
      </div>

      {/* List content area */}
      <div className="space-y-4">
        {filteredBriefs.length === 0 ? (
          <div className="p-8 border border-dashed border-[#E5DDD3] rounded-2xl flex flex-col items-center text-center gap-2 bg-[#FAF8F5]/30">
            <FolderOpen className="w-10 h-10 text-[#747878] mb-1" />
            <p className="text-sm font-semibold text-[#1A1A1A]">No archived specifications found</p>
            <p className="text-xs text-[#444748] max-w-xs leading-relaxed font-normal">
              Compile your first startup vision concept answers to forge a durable PDF brief!
            </p>
            <button
              onClick={onNewBrief}
              className="mt-2 text-xs font-bold text-[#E07B39] underline hover:text-[#1A1A1A] cursor-pointer"
            >
              Start Onboarding Questionnaire
            </button>
          </div>
        ) : (
          filteredBriefs.map((b) => (
            <motion.div
              key={b.id}
              whileHover={{ scale: 1.01 }}
              className="p-4 sm:p-5 bg-[#F2EEE8] border border-[#E5DDD3] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-[#1A1A1A]/30 transition-all shadow-sm text-left"
            >
              {/* Info column */}
              <div onClick={() => onSelectBrief(b)} className="space-y-1.5 flex-1 select-none text-left">
                <div className="flex items-center gap-2 flex-wrap text-left">
                  <span className="text-[9px] font-mono font-bold bg-[#E5DDD3] text-[#444748] px-2 py-0.5 rounded-full uppercase">
                    {b.answers?.platform || 'Both'}
                  </span>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                    b.complexity === "High" ? "bg-red-100 text-red-700" : b.complexity === "Low" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  }`}>
                    {b.complexity} Complexity
                  </span>
                  <span className="text-[10px] text-[#747878] font-mono">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#1A1A1A] tracking-tight leading-tight">{b.title}</h3>
                <p className="text-xs text-[#444748] line-clamp-2 leading-relaxed font-normal">
                  {b.description}
                </p>
              </div>

              {/* Action column */}
              <div className="flex items-center gap-2 border-t sm:border-t-0 border-[#E5DDD3]/60 pt-3 sm:pt-0 justify-end shrink-0">
                <button
                  onClick={() => onSelectBrief(b)}
                  className="px-3.5 h-10 bg-[#1A1A1A] hover:bg-neutral-800 text-[#FAF8F5] text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Spec</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm("Are you sure you want to delete this technical brief?")) {
                      onDeleteBrief(b.id);
                    }
                  }}
                  className="w-10 h-10 border border-[#E5DDD3] hover:border-red-300 hover:text-red-500 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                  title="Delete specifications archived"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

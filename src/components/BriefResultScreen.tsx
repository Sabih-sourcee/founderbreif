import React, { useState } from "react";
import { motion } from "motion/react";
import { ProjectBrief } from "../types";
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  FileDown, 
  Share2, 
  Users, 
  MessageSquare, 
  Folder, 
  RefreshCw, 
  Activity, 
  DollarSign,
  FileText
} from "lucide-react";

interface BriefResultScreenProps {
  brief: ProjectBrief;
  onRestart: () => void;
  onSave?: (brief: ProjectBrief) => void;
}

export default function BriefResultScreen({ brief, onRestart, onSave }: BriefResultScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyText = () => {
    const textBlock = `
========================================
FOUNDERBRIEF TECHNICAL BLUEPRINT: ${brief.title.toUpperCase()}
========================================

Project Overview:
${brief.description}

Complexity: ${brief.complexity}
Estimated Budget Range: ${brief.estimatedBudget}

----------------------------------------
CORE SYSTEM MVP FEATURES:
----------------------------------------
${brief.coreFeatures.map((f, i) => `${i + 1}. ${f}`).join("\n")}

----------------------------------------
INVESTOR-READY USER STORIES:
----------------------------------------
${brief.userStories.map((u, i) => `Story ${i + 1}: ${u}`).join("\n")}

----------------------------------------
DEV VETTING QUESTIONS: (CTO Level)
----------------------------------------
${brief.devQuestions.map((q, i) => `Question ${i + 1}: ${q}`).join("\n")}

Generated via FounderBrief (c) ${new Date().getFullYear()} - Professional Startup Alignment.
========================================
    `.trim();

    navigator.clipboard.writeText(textBlock).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(err => {
      console.error("Clipboard copy failure:", err);
    });
  };

  const handlePdfTrigger = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const shareText = encodeURIComponent(
      `FounderBrief Project Ready!\n\n🚀 Project: *${brief.title}*\n⭐ Complexity: *${brief.complexity}*\n💳 Est. Budget: *${brief.estimatedBudget}*\n\nRead more details inside your FounderBrief app profile.`
    );
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-grow flex flex-col justify-start px-4 sm:px-6 pt-6 pb-40 max-w-2xl mx-auto w-full print:p-0 print:pb-0 font-sans"
    >
      {/* Print-only Header section */}
      <div className="hidden print:block mb-8">
        <h1 className="text-2xl font-bold text-black border-b pb-2">FOUNDERBRIEF TECHNICAL SPECIFICATIONS</h1>
        <p className="text-xs text-gray-500 mt-1">Generated dynamically on {new Date(brief.createdAt).toLocaleDateString()}</p>
      </div>

      {/* On Screen Main success marker section */}
      <div className="flex flex-col items-center text-center mb-6 print:hidden">
        <div className="w-12 h-12 bg-green-50 text-green-700 rounded-full flex items-center justify-center mb-3 border border-green-100 shadow-sm">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tracking-tight mb-1">
          Your project brief is ready!
        </h1>
        <p className="text-xs text-[#444748]">
          We've compiled your concept response answers into a professional blueprint spec.
        </p>
      </div>

      {/* Main Core Blueprint Grid Sheets */}
      <div className="space-y-4 print-card">
        {/* Row 1: Project Title, Summary */}
        <section className="p-5 bg-[#F2EEE8] border border-[#E5DDD3] rounded-2xl block text-left">
          <span className="text-[10px] font-bold text-[#E07B39] uppercase tracking-wider font-mono">Project Name Draft</span>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#1A1A1A] tracking-tight mt-1 mb-2 leading-tight">{brief.title}</h2>
          <p className="text-xs sm:text-sm text-[#444748] leading-relaxed italic border-l-2 border-[#E07B39] pl-3 font-normal">
            "{brief.description}"
          </p>
        </section>

        {/* Complexity and Budget metrics row - responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Complexity metric */}
          <div className="p-4 bg-[#F2EEE8] border border-[#E5DDD3] rounded-2xl flex flex-col justify-between text-left">
            <span className="text-[10px] font-bold text-[#444748] uppercase tracking-wider font-mono block mb-1">Complexity</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`font-black text-sm uppercase tracking-wider ${
                brief.complexity === "Low" ? "text-green-700" : brief.complexity === "High" ? "text-red-600" : "text-[#E07B39]"
              }`}>
                {brief.complexity}
              </span>
              <Activity className="w-4 h-4 text-[#747878]" />
            </div>
          </div>

          {/* Budget estimate indicator */}
          <div className="p-4 bg-[#F2EEE8] border border-[#E5DDD3] rounded-xl flex flex-col justify-between text-left">
            <span className="text-[10px] font-bold text-[#444748] uppercase tracking-wider font-mono block mb-1">EST. BUDGET</span>
            <div className="flex items-center gap-1 mt-1">
              <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-sm sm:text-base font-extrabold text-[#1A1A1A] tracking-tight">{brief.estimatedBudget}</span>
            </div>
          </div>
        </div>

        {/* Core Features list item group */}
        <section className="p-5 bg-[#F2EEE8] border border-[#E5DDD3] rounded-2xl text-left">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5DDD3]/60">
            <h3 className="text-xs sm:text-sm font-extrabold text-[#1A1A1A] tracking-tight uppercase flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-[#E07B39]" />
              <span>Primary MVP Scope Features</span>
            </h3>
            <span className="text-[9px] font-mono bg-[#E5DDD3] px-2 py-0.5 rounded-full font-bold text-[#444748]">4 Elements</span>
          </div>
          
          <ul className="space-y-3">
            {brief.coreFeatures.map((feat, index) => {
              const parts = feat.split(" - ");
              return (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 text-sm font-bold mt-0.5 shrink-0">✓</span>
                  <div className="text-xs sm:text-sm text-[#1A1A1A] leading-relaxed">
                    {parts.length > 1 ? (
                      <>
                        <strong className="font-bold text-neutral-900">{parts[0]}</strong> — {parts.slice(1).join(" - ")}
                      </>
                    ) : (
                      feat
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Target User Stories cards */}
        <section className="p-5 bg-[#F2EEE8] border border-[#E5DDD3] rounded-2xl text-left">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5DDD3]/60">
            <h3 className="text-xs sm:text-sm font-extrabold text-[#1A1A1A] tracking-tight uppercase flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#E07B39]" />
              <span>Investor-Ready User Stories</span>
            </h3>
            <span className="text-[9px] font-mono bg-[#E5DDD3] px-2 py-0.5 rounded-full font-bold text-[#444748]">Personas v1.0</span>
          </div>

          <div className="space-y-3">
            {brief.userStories.map((story, i) => (
              <div key={i} className="p-3 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl">
                <p className="text-xs text-[#444748] italic leading-relaxed">
                  "{story}"
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ADVANCED DEV QUESTIONS vetting checklist */}
        <section className="p-5 bg-[#F2EEE8] border border-[#E5DDD3] border-l-4 border-l-[#E07B39] rounded-2xl text-left">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-extrabold text-[#1A1A1A] tracking-tight uppercase flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#E07B39]" />
              <span>Dev Agency Vetting Questions</span>
            </h3>
          </div>
          <p className="text-[11px] text-[#444748] mb-4 font-normal leading-relaxed">
            Ask these specific advanced technology questions when you vet development agencies or freelancers:
          </p>

          <div className="space-y-3">
            {brief.devQuestions.map((question, qIdx) => (
              <div key={qIdx} className="flex gap-2.5 items-start">
                <span className="text-[#E07B39] font-bold text-xs mt-0.5 font-mono">•</span>
                <p className="text-xs sm:text-sm text-[#1A1A1A] leading-relaxed font-normal">{question}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Floating Action Trigger Drawer (Sticky layout at bottom matching specs) */}
      <div className="fixed bottom-16 sm:bottom-0 left-0 w-full z-50 pt-6 pb-8 px-5 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/90 to-transparent print:hidden no-print">
        <div className="max-w-md mx-auto space-y-2.5 bg-[#FAF8F5] p-3 rounded-2xl border border-[#E5DDD3]/70 shadow-lg">
          {/* Main Copy Brief Action */}
          <button
            onClick={handleCopyText}
            className="w-full bg-[#1A1A1A] hover:bg-neutral-800 text-[#FAF8F5] h-12 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-[#E07B39]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Specs Copied to Clipboard!" : "Copy Technical Specs"}</span>
          </button>

          {/* Secondary Actions PDF & WhatsApp row */}
          <div className="flex gap-2">
            <button
              onClick={handlePdfTrigger}
              className="flex-1 bg-[#F2EEE8] border border-[#E5DDD3] text-[#1A1A1A] h-11 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#E5DDD3] transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export PDF File</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="flex-1 bg-[#25D366] hover:bg-[#20ba56] text-white h-11 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share to WhatsApp</span>
            </button>
          </div>

          {/* Create new/restart project buttons */}
          <button
            onClick={onRestart}
            className="w-full text-center text-xs font-bold text-[#E07B39] hover:underline pt-1.5 inline-block cursor-pointer"
          >
            Formulate Another Idea Brief
          </button>
        </div>
      </div>
    </motion.div>
  );
}

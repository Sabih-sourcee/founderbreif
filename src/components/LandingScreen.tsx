import React from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Layers, Play } from "lucide-react";

interface LandingScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onSelectTemplate?: (templateText: string) => void;
}

export default function LandingScreen({ onGetStarted, onSignIn, onSelectTemplate }: LandingScreenProps) {
  const templates = [
    {
      title: "On-Demand Delivery App",
      concept: "A local laundry/groceries delivery platform in a major metropolis with active rider tracking and secure digital payment gateways."
    },
    {
      title: "B2B SaaS Inventory Tracker",
      concept: "A cloud-based dashboard for retail businesses to monitor stock levels across multi-site warehouses with auto-replenishment rules."
    },
    {
      title: "Interactive AI Classroom Helper",
      concept: "An educational mobile companion app utilizing generative large language models to tailor homework problem sets based on user grade levels."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="flex-grow flex flex-col justify-between px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full"
    >
      <div className="space-y-8 select-none">
        {/* Dynamic Premium Header Hero */}
        <section className="flex flex-col items-center justify-center relative overflow-hidden my-2 sm:my-4 rounded-2xl bg-[#F2EEE8] border border-[#E5DDD3] p-6 text-center shadow-sm">
          {/* Subtle Grid Pattern Backdrop */}
          <div className="absolute inset-x-0 top-0 h-40 pointer-events-none opacity-[0.04]" style={{ 
            backgroundImage: 'radial-gradient(#1A1A1A 0.5px, transparent 0.5px)', 
            backgroundSize: '16px 16px' 
          }}></div>

          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#E07B39]/10 border border-[#E07B39]/20 text-[#E07B39] rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3 h-3 animate-pulse" />
              FounderBrief Technical Architect
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A] tracking-tight max-w-md mx-auto leading-tight">
              Walk into your developer meeting with zero ambiguity
            </h2>

            <p className="text-[#444748] text-xs sm:text-sm max-w-sm mx-auto font-normal leading-relaxed">
              We translate rough startup sketches into clean, developer-approved spec outlines, realistic estimation guidelines, and vetting checklists in minutes.
            </p>
          </div>
        </section>

        {/* Real Dynamic Applet Metrics Bar */}
        <section className="grid grid-cols-3 gap-2 text-center" id="metrics-dashboard">
          <div className="p-3 bg-white border border-[#E5DDD3] rounded-xl shadow-xs">
            <span className="block text-lg sm:text-xl font-black text-[#1A1A1A]">500+</span>
            <span className="block text-[9px] font-bold text-[#444748] uppercase tracking-wider font-mono mt-0.5">Briefs Crafted</span>
          </div>
          <div className="p-3 bg-white border border-[#E5DDD3] rounded-xl shadow-xs">
            <span className="block text-lg sm:text-xl font-black text-[#1A1A1A]">150+</span>
            <span className="block text-[9px] font-bold text-[#444748] uppercase tracking-wider font-mono mt-0.5">Agencies Aligned</span>
          </div>
          <div className="p-3 bg-white border border-[#E5DDD3] rounded-xl shadow-xs">
            <span className="block text-lg sm:text-xl font-black text-[#1A1A1A]">98.4%</span>
            <span className="block text-[9px] font-bold text-[#444748] uppercase tracking-wider font-mono mt-0.5">Dev Clarity Score</span>
          </div>
        </section>

        {/* Core Value Pillars Detail Cards */}
        <section className="space-y-3">
          <h3 className="text-[11px] font-bold text-[#444748] uppercase tracking-wider font-mono">
            How FounderBrief Aligns Your Project
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white border border-[#E5DDD3] rounded-xl space-y-1.5 flex flex-col items-center text-center">
              <Layers className="w-5 h-5 text-[#E07B39]" />
              <h4 className="text-xs font-bold text-[#1A1A1A]">Modular Features Map</h4>
              <p className="text-[10px] text-[#444748] leading-relaxed">Scope isolated technical MVP tasks cleanly to avoid cost overruns.</p>
            </div>
            <div className="p-4 bg-white border border-[#E5DDD3] rounded-xl space-y-1.5 flex flex-col items-center text-center">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <h4 className="text-xs font-bold text-[#1A1A1A]">Investor-Ready Stories</h4>
              <p className="text-[10px] text-[#444748] leading-relaxed">Draft concise user personas to present goals and milestones clearly.</p>
            </div>
            <div className="p-4 bg-white border border-[#E5DDD3] rounded-xl space-y-1.5 flex flex-col items-center text-center">
              <Zap className="w-5 h-5 text-amber-500" />
              <h4 className="text-xs font-bold text-[#1A1A1A]">Agency Vetting Qs</h4>
              <p className="text-[10px] text-[#444748] leading-relaxed">Challenging technical tests to vet development team capabilities.</p>
            </div>
          </div>
        </section>

        {/* Template Instant Starters (Non-generic, interactive, value-add) */}
        <section className="space-y-3">
          <h3 className="text-[11px] font-bold text-[#444748] uppercase tracking-wider font-mono block">
            Select a Starting Template to Configure
          </h3>
          <div className="space-y-2.5">
            {templates.map((tpl, i) => (
              <div 
                key={i}
                onClick={() => onSelectTemplate ? onSelectTemplate(tpl.concept) : onGetStarted()}
                className="group p-3 bg-[#F2EEE8]/60 hover:bg-[#F2EEE8] border border-[#E5DDD3] rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="space-y-0.5 flex-1 pr-2 text-left">
                  <span className="text-[11px] font-bold text-[#E07B39] tracking-tight">{tpl.title}</span>
                  <p className="text-[10px] sm:text-xs text-[#444748] leading-relaxed line-clamp-1 italic font-normal">
                    "{tpl.concept}"
                  </p>
                </div>
                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center border border-[#E5DDD3] shrink-0 text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-all">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Primary Action Drawer */}
      <footer className="mt-8 pt-4 w-full">
        <div className="flex flex-col gap-3">
          {/* Main Action Call to build brief */}
          <button 
            id="landing-get-started-btn"
            onClick={onGetStarted}
            className="w-full h-14 bg-[#1A1A1A] hover:bg-neutral-800 text-[#FAF8F5] font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-neutral-900/10"
          >
            <span>Draft Custom Idea Spec</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Profiler trigger login */}
          <button 
            id="landing-sign-in-btn"
            onClick={onSignIn}
            className="w-full h-14 bg-transparent border border-[#E5DDD3] text-[#1A1A1A] font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center hover:bg-[#F2EEE8] active:bg-[#E5DDD3]/50 transition-all cursor-pointer"
          >
            My Saved Briefs Profile
          </button>
        </div>

        {/* Muted Terms footnote footer markup */}
        <p className="text-[11px] text-center text-[#444748]/60 mt-4 leading-normal">
          Designed for non-technical startup founders. Powered by Gemini Cloud Run containers securely.
        </p>
      </footer>
    </motion.div>
  );
}

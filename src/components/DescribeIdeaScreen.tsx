import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Mic, MicOff, Lightbulb, ArrowRight, AlertTriangle } from "lucide-react";

interface DescribeIdeaScreenProps {
  initialIdea: string;
  onContinue: (idea: string) => void;
  onBack: () => void;
}

export default function DescribeIdeaScreen({ initialIdea, onContinue, onBack }: DescribeIdeaScreenProps) {
  const [idea, setIdea] = useState(initialIdea);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState("");
  const recognitionRef = useRef<any>(null);

  // Load browser Web Speech API support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const text = event.results[lastResultIndex][0].transcript;
        setIdea((prev) => {
          const updated = prev ? `${prev} ${text}` : text;
          return updated.slice(0, 500);
        });
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setMicError("Microphone error occurred. Please type instead.");
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleMicToggle = () => {
    if (!recognitionRef.current) {
      setMicError("Voice dictation is unsupported in this browser frame. Please type your idea.");
      setTimeout(() => setMicError(""), 4000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setMicError("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
        setMicError("Unable to activate mic. Check site permissions.");
        setTimeout(() => setMicError(""), 4000);
      }
    }
  };

  const handleExampleInject = () => {
    setIdea("A B2B SaaS platform for independent coffee shop owners to manage inventory across multiple locations, including automated reordering from local roasters.");
  };

  const charCount = idea.length;
  const isOverLimit = charCount > 500;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex-grow flex flex-col justify-between px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full"
    >
      <div className="space-y-6">
        {/* Back navigation button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#444748] hover:text-[#1A1A1A] transition-colors cursor-pointer self-start py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Narrative Title Area */}
        <section className="space-y-1 text-left">
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight">
            What are you building?
          </h1>
          <p className="text-xs sm:text-sm text-[#444748] leading-relaxed">
            Tell us about your product vision. We'll turn your idea into a professional CTO strategy brief.
          </p>
        </section>

        {/* Input Text Card container */}
        <div className="relative w-full bg-[#F2EEE8] border border-[#E5DDD3] rounded-2xl p-4 flex flex-col gap-4 transition-all focus-within:border-[#1A1A1A] focus-within:ring-1 focus-within:ring-[#1A1A1A]/10">
          <textarea
            id="describe-idea-textarea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={6}
            className="w-full bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-[#1A1A1A] text-sm sm:text-base placeholder-[#747878] resize-none leading-relaxed"
            placeholder="e.g., I want a laundry delivery app in Karachi with rider tracking and online payments..."
            maxLength={600}
          />

          {/* Bottom Actions section of target card */}
          <div className="flex items-center justify-between border-t border-[#E5DDD3] pt-3">
            <span className={`text-[11px] font-semibold font-mono ${isOverLimit ? "text-red-600" : "text-[#444748]"}`}>
              {charCount} / 500 characters
            </span>

            {/* Voice Dictation Button */}
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {isListening && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[11px] font-bold text-[#E07B39] animate-pulse font-mono"
                  >
                    Listening...
                  </motion.span>
                )}
              </AnimatePresence>
              
              <button
                type="button"
                onClick={handleMicToggle}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                  isListening
                    ? "bg-red-50 text-red-600 border-red-200 shadow-md shadow-red-200/50"
                    : "bg-[#FAF8F5] text-[#1A1A1A] border-[#E5DDD3] hover:bg-[#F2EEE8]"
                }`}
                title="Dictate with voice input"
              >
                {isListening ? (
                  <MicOff className="w-4 h-4 sm:w-5 h-5" />
                ) : (
                  <Mic className="w-4 h-4 sm:w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Browser Alert messages for Mic Error state */}
        {micError && (
          <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            <span>{micError}</span>
          </p>
        )}

        {/* Dynamic Guided Suggestions Card */}
        <section id="example-prompt-card">
          <div 
            onClick={handleExampleInject}
            className="bg-[#FAF8F5]/50 border border-[#E5DDD3] border-dashed rounded-xl p-4 cursor-pointer hover:bg-[#F2EEE8]/30 transition-colors group select-none"
          >
            <div className="flex items-center gap-1.5 mb-1 text-[#E07B39]">
              <Lightbulb className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Example Setup Prompt (Click to load)</span>
            </div>
            <p className="text-xs text-[#444748] leading-relaxed italic group-hover:text-[#1A1A1A] font-normal text-left">
              "A B2B SaaS platform for independent coffee shop owners to manage inventory across multiple locations, including automated reordering from local roasters."
            </p>
          </div>
        </section>
      </div>

      {/* Primary Transition trigger */}
      <footer className="mt-8 pt-4">
        <button
          onClick={() => onContinue(idea)}
          disabled={!idea.trim() || isOverLimit}
          className="w-full h-14 bg-[#1A1A1A] text-[#FAF8F5] font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#1A1A1A]/90 active:scale-[0.98] transition-all disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer shadow-sm"
        >
          <span>Continue Questionnaire</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </footer>
    </motion.div>
  );
}

import React, { useState } from "react";
import { motion } from "motion/react";
import { BriefAnswers } from "../types";
import { 
  ArrowLeft, 
  ArrowRight, 
  Smartphone, 
  Laptop, 
  Mail, 
  User, 
  Lock, 
  CreditCard, 
  MapPin, 
  Cpu, 
  Layers, 
  Palette, 
  Briefcase, 
  Hourglass, 
  Calendar, 
  ShieldAlert,
  Sparkles,
  Check,
  Zap,
  Lightbulb
} from "lucide-react";

interface QuestionsScreenProps {
  onFinish: (answers: BriefAnswers) => void;
  onBack: () => void;
}

interface OptionConfig {
  value: string;
  label: string;
  icon: React.ElementType;
}

interface QuestionConfig {
  id: keyof BriefAnswers | string;
  field: keyof BriefAnswers;
  detailField: keyof BriefAnswers;
  title: string;
  prompt: string;
  options: OptionConfig[];
  placeholder: string;
  label: string;
}

const QUESTIONS: QuestionConfig[] = [
  {
    id: "platform",
    field: "platform",
    detailField: "platformDetails",
    title: "Launch Platform",
    prompt: "What platforms are you prioritizing for your initial launch?",
    options: [
      { value: "Android", label: "Android Only", icon: Smartphone },
      { value: "iPhone", label: "iPhone Only", icon: Smartphone },
      { value: "Both", label: "Cross-Platform", icon: Laptop }
    ],
    placeholder: "e.g., Offline mode, real-time sync, or specific hardware integrations...",
    label: "platform details"
  },
  {
    id: "auth",
    field: "auth",
    detailField: "authDetails",
    title: "User Management",
    prompt: "How will your target users log in and register profiles?",
    options: [
      { value: "Email & Password", label: "Email / Pass", icon: Mail },
      { value: "Social Accounts", label: "Social OAuth", icon: User },
      { value: "No authentication", label: "No Auth Needed", icon: Lock }
    ],
    placeholder: "e.g., custom profiles, multi-factor auth (MFA), passwordless verification...",
    label: "auth details"
  },
  {
    id: "integrations",
    field: "integrations",
    detailField: "integrationsDetails",
    title: "Key Integrations",
    prompt: "Are there third-party tools or external APIs to link up?",
    options: [
      { value: "Payments", label: "Payments Stripe", icon: CreditCard },
      { value: "Maps & Location", label: "Map/Routes API", icon: MapPin },
      { value: "AI or Messaging", label: "Custom GenAI", icon: Cpu }
    ],
    placeholder: "e.g., Stripe Connect split-payments, shipment trackers, Google Maps SDK...",
    label: "integration details"
  },
  {
    id: "design",
    field: "design",
    detailField: "designDetails",
    title: "Visual Theme style",
    prompt: "What visual identity fits your product best?",
    options: [
      { value: "Modern Minimalism", label: "Sleek Minimal", icon: Layers },
      { value: "Bold & Colorful", label: "Vibrant/Graphic", icon: Palette },
      { value: "Classic Corporate", label: "Classic/Clean", icon: Briefcase }
    ],
    placeholder: "e.g., specific brand colors, dark-mode default, glassmorphism elements...",
    label: "theme details"
  },
  {
    id: "timeline",
    field: "timeline",
    detailField: "timelineDetails",
    title: "Target Timeline",
    prompt: "What timeline is targeted for your MVP release limit?",
    options: [
      { value: "Sprints MVP (1-2 months)", label: "MVP (1-2 mo)", icon: Hourglass },
      { value: "Full Release (3-6 months)", label: "Core (3-6 mo)", icon: Calendar },
      { value: "Enterprise Scale (6+ months)", label: "Scale (6+ mo)", icon: TrophyIconHelper }
    ],
    placeholder: "e.g., fixed target investor demo date, modular milestones, budget constraints...",
    label: "timeline details"
  }
];

// Simple icon wrapper fallback for Trophy/Scale
function TrophyIconHelper() {
  return <Zap className="w-5 h-5" />;
}

export default function QuestionsScreen({ onFinish, onBack }: QuestionsScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<BriefAnswers>({
    platform: "Both",
    platformDetails: "",
    auth: "Email & Password",
    authDetails: "",
    integrations: "Payments",
    integrationsDetails: "",
    design: "Modern Minimalism",
    designDetails: "",
    timeline: "Full Release (3-6 months)",
    timelineDetails: ""
  });

  const question = QUESTIONS[currentStep];
  const percentComplete = Math.round(((currentStep + 1) / QUESTIONS.length) * 100);

  const handleOptionSelect = (val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [question.field]: val
    }));
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onFinish(answers);
    }
  };

  const handlePrevStepClick = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onBack();
    }
  };

  const handleSkip = () => {
    onFinish(answers);
  };

  const selectedValue = answers[question.field] as string;
  const detailValue = answers[question.detailField] as string;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-grow flex flex-col justify-between px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full"
    >
      <div>
        {/* Navigation Row */}
        <button
          onClick={handlePrevStepClick}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#444748] hover:text-[#1A1A1A] mb-5 transition-colors cursor-pointer py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Progress Timeline Header Card */}
        <div className="w-full mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-[#444748] uppercase tracking-wider font-mono">
              Question {currentStep + 1} of {QUESTIONS.length}
            </span>
            <span className="text-xs font-extrabold text-[#E07B39] font-mono">
              {percentComplete}% Complete
            </span>
          </div>
          <div className="w-full h-1 bg-[#E5DDD3] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E07B39] transition-all duration-300 ease-out"
              style={{ width: `${percentComplete}%` }}
            ></div>
          </div>
        </div>

        {/* Questionnaire Slide Section */}
        <div className="w-full space-y-6">
          <div className="space-y-1.5 text-left">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tracking-tight leading-tight">
              Let's clarify your project details.
            </h1>
            <p className="text-xs sm:text-sm text-[#444748] font-normal leading-relaxed">
              {question.prompt}
            </p>
          </div>

          {/* Option Toggle Chips Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {question.options.map((opt) => {
              const isActive = selectedValue === opt.value;
              const OptIconComponent = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleOptionSelect(opt.value)}
                  className={`py-4 px-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer border ${
                    isActive
                      ? "bg-[#1A1A1A] text-[#FAF8F5] border-[#1A1A1A]"
                      : "bg-[#F2EEE8] text-[#1A1A1A] border-[#E5DDD3] hover:bg-[#F2EEE8]/80 hover:border-[#1A1A1A]/30"
                  }`}
                >
                  <OptIconComponent className={`w-5 h-5 ${isActive ? "text-[#E07B39]" : "text-[#747878]"}`} />
                  <span className="text-xs font-bold whitespace-nowrap tracking-tight">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Details optional Text Entry fields */}
          <div className="space-y-2 text-left">
            <label
              className="text-[10px] font-bold text-[#444748] uppercase tracking-wider block font-mono"
              htmlFor={`details-textarea-${question.id}`}
            >
              Any specific technical requirements or details?
            </label>
            <textarea
              id={`details-textarea-${question.id}`}
              value={detailValue}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [question.detailField]: e.target.value
                }))
              }
              rows={3}
              placeholder={question.placeholder}
              className="w-full p-4 bg-[#F2EEE8] border border-[#E5DDD3] rounded-xl focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A]/10 text-sm text-[#1A1A1A] placeholder-[#444748]/50 resize-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Control Actions & Visual Anchors */}
      <footer className="mt-8 pt-4">
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Main forward progression button */}
          <button
            onClick={handleNext}
            className="w-full h-14 bg-[#E07B39] text-[#FAF8F5] font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer shadow-md"
          >
            <span>{currentStep === QUESTIONS.length - 1 ? "Generate Project Brief" : "Continue"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Skip layout toggle */}
          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-[#444748] hover:text-[#1A1A1A] hover:underline transition-all py-1 cursor-pointer"
          >
            I'll skip this questionnaire for now
          </button>
        </div>

        {/* Brand visual blueprint indicator card */}
        <div className="mt-8 opacity-65 select-none pointer-events-none">
          <div className="bg-[#F2EEE8] p-4 rounded-xl flex items-center justify-center border-dashed border border-[#E5DDD3] h-20 overflow-hidden">
            <div className="flex flex-col items-center text-center gap-1 text-[#747878]">
              <Lightbulb className="w-4 h-4 text-[#E07B39]" />
              <p className="text-[9px] font-semibold max-w-xs uppercase tracking-wider font-mono">
                Clarity fuels execution. Your requirements guide Gemini to forge an elite blueprint.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}

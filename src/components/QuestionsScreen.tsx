import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { BriefAnswers } from "../types";

interface QuestionsScreenProps {
  onComplete: (answers: BriefAnswers) => void;
  onBack: () => void;
}

const STEPS = [
  {
    badge: "STEP 01 • PLATFORM",
    title: "Where will users access this?",
    sub: "Select your primary target launch channel.",
    field: "platform" as const,
    detailField: "platformDetails" as const,
    options: [
      { id: "Android", sub: "Play Store & regional Android devices" },
      { id: "iPhone", sub: "iOS App Store launch" },
      { id: "Both", sub: "Cross-platform Android + iOS + Web" },
    ],
  },
  {
    badge: "STEP 02 • ACCESS & IDENTITY",
    title: "How do users sign in?",
    sub: "Pick the onboarding and verification flow.",
    field: "auth" as const,
    detailField: "authDetails" as const,
    options: [
      { id: "Email & Password", sub: "Standard email + magic link" },
      { id: "Social Login", sub: "Google, Apple & WhatsApp OTP" },
      { id: "No Login Needed", sub: "Instant guest access" },
    ],
  },
  {
    badge: "STEP 03 • CORE INTEGRATIONS",
    title: "Which services are essential?",
    sub: "Select the primary third-party capability.",
    field: "integrations" as const,
    detailField: "integrationsDetails" as const,
    options: [
      { id: "Payments", sub: "Stripe, JazzCash, EasyPaisa, Razorpay, Tap" },
      { id: "Maps & Location", sub: "Live rider GPS, geofencing & routes" },
      { id: "Camera & Media", sub: "Voice notes, OCR scan & document uploads" },
    ],
  },
  {
    badge: "STEP 04 • DESIGN DIRECTION",
    title: "Preferred interface feel?",
    sub: "Sets the tone for your generated document and UI.",
    field: "design" as const,
    detailField: "designDetails" as const,
    options: [
      { id: "Dynamic Bubble UI", sub: "Soft teal #DAF7F3, #FBFF28 yellow pop & #1C2120" },
      { id: "Dark Onyx Pro", sub: "High-contrast dark surfaces with electric yellow" },
      { id: "Clean White Studio", sub: "Crisp white cards with generous breathing room" },
    ],
  },
  {
    badge: "STEP 05 • DELIVERY TIMELINE",
    title: "Target delivery horizon?",
    sub: "Calibrates phased milestones and budget estimates.",
    field: "timeline" as const,
    detailField: "timelineDetails" as const,
    options: [
      { id: "ASAP (1-2 months)", sub: "Lean v1 validation launch" },
      { id: "Full Release (3-6 months)", sub: "Production-grade rollout" },
      { id: "Flexible", sub: "Iterative milestone sprints" },
    ],
  },
];

export const QuestionsScreen: React.FC<QuestionsScreenProps> = ({
  onComplete,
  onBack,
}) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<BriefAnswers>({
    platform: "Both",
    platformDetails: "",
    auth: "Email & Password",
    authDetails: "",
    integrations: "Payments",
    integrationsDetails: "",
    design: "Dynamic Bubble UI",
    designDetails: "",
    timeline: "Full Release (3-6 months)",
    timelineDetails: "",
  });

  const current = STEPS[step];

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-24">
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={handlePrev}
          className="fb-interactive inline-flex items-center gap-2 bg-white text-[#1C2120] font-extrabold text-xs px-4 py-2.5 rounded-full fb-bubble-shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 0 ? "Voice Note" : "Previous"}
        </button>

        <span className="font-mono text-xs font-extrabold bg-[#1C2120] text-[#FBFF28] px-4 py-1.5 rounded-full">
          0{step + 1} / 0{STEPS.length}
        </span>
      </div>

      {/* Step Strip */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {STEPS.map((_, idx) => {
          const isCurrent = idx === step;
          const isDone = idx < step;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setStep(idx)}
              className={`fb-interactive h-10 rounded-full font-mono text-xs font-extrabold ${
                isCurrent
                  ? "bg-[#FBFF28] text-[#1C2120] fb-pill-shadow"
                  : isDone
                  ? "bg-[#1C2120] text-[#FBFF28]"
                  : "bg-white text-[#4A5754]"
              }`}
            >
              0{idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question Card Bubble */}
      <div className="bg-white rounded-[34px] p-6 sm:p-8 fb-bubble-shadow mb-6">
        <span className="font-mono text-[10px] font-extrabold text-[#4A5754] tracking-wider uppercase block mb-2">
          {current.badge}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C2120] mb-1">
          {current.title}
        </h2>
        <p className="text-sm text-[#4A5754] mb-6">{current.sub}</p>

        <div className="space-y-3 mb-5">
          {current.options.map((opt) => {
            const selected = answers[current.field] === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  setAnswers({
                    ...answers,
                    [current.field]: opt.id,
                  })
                }
                className={`fb-interactive w-full text-left rounded-[24px] p-4 flex items-center justify-between gap-4 ${
                  selected
                    ? "bg-[#1C2120] text-white fb-dark-bubble-shadow"
                    : "bg-[#DAF7F3] text-[#1C2120]"
                }`}
              >
                <div>
                  <div className="font-extrabold text-sm sm:text-base">
                    {opt.id}
                  </div>
                  <div
                    className={`text-xs mt-0.5 ${
                      selected ? "text-[#B8C7C4]" : "text-[#4A5754]"
                    }`}
                  >
                    {opt.sub}
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                    selected
                      ? "bg-[#FBFF28] border-[#FBFF28] text-[#1C2120]"
                      : "border-[#1C2120]/30"
                  }`}
                >
                  {selected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                </div>
              </button>
            );
          })}
        </div>

        <input
          type="text"
          value={answers[current.detailField]}
          onChange={(e) =>
            setAnswers({ ...answers, [current.detailField]: e.target.value })
          }
          placeholder="Optional details or regional requirements…"
          className="w-full bg-[#DAF7F3] text-[#1C2120] text-sm rounded-[20px] px-4 py-3.5 focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="fb-interactive fb-pill-shadow w-full bg-[#FBFF28] text-[#1C2120] font-extrabold text-sm py-4 px-6 rounded-full flex items-center justify-between mb-3"
      >
        <span>
          {step === STEPS.length - 1
            ? "Synthesize Document Now"
            : "Next Parameter"}
        </span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => onComplete(answers)}
        className="fb-interactive w-full text-center text-xs font-extrabold text-[#323B39] py-2"
      >
        Skip remaining steps & generate immediately →
      </button>
    </div>
  );
};

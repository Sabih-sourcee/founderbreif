import React, { useState } from "react";
import { Crown, Check, Sparkles } from "lucide-react";
import { ProjectBrief, UserProfile } from "../types";

interface ProfileScreenProps {
  profile: UserProfile;
  briefsCount: number;
  briefs?: ProjectBrief[];
  onUpdateProfile: (profile: UserProfile) => void;
  onSignOut: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  briefsCount,
  briefs = [],
  onUpdateProfile,
  onSignOut,
}) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [company, setCompany] = useState(profile.companyName || "");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [savedNotice, setSavedNotice] = useState("");

  const isPro = Boolean(profile.isPro);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: name.trim() || "Founder",
      email: email.trim(),
      companyName: company.trim(),
      isLoggedIn: true,
    });
    setSavedNotice("Founder profile updated!");
    setTimeout(() => setSavedNotice(""), 3000);
  };

  const toggleProTier = () => {
    const nextPro = !isPro;
    onUpdateProfile({
      ...profile,
      isPro: nextPro,
      isLoggedIn: true,
    });
    setSavedNotice(
      nextPro
        ? "FounderBrief Pro activated! Crown neural voices, WAV download & unlimited generations unlocked."
        : "Switched to Free Tier (3 generations/reads per month)."
    );
    setTimeout(() => setSavedNotice(""), 4000);
  };

  const voiceDocsCount = briefs.filter(
    (b) => (b.direction || "voice-to-doc") === "voice-to-doc"
  ).length;
  const audioReadsCount = briefs.filter((b) => b.direction === "doc-to-voice").length;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-24">
      <span className="inline-block font-mono text-[10px] font-extrabold bg-white text-[#1C2120] px-3 py-1 rounded-full fb-bubble-shadow mb-2">
        ACCOUNT • PRICING RESTRUCTURE • TELEMETRY
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C2120] tracking-tight mb-2">
        Founder Profile & Plans
      </h1>
      <p className="text-sm sm:text-base text-[#323B39] mb-6">
        Manage your workspace identity and switch between Free (3/mo) and Pro ($18/mo or $139/yr).
      </p>

      {savedNotice ? (
        <div className="bg-[#FBFF28] text-[#1C2120] font-extrabold text-xs sm:text-sm px-5 py-3.5 rounded-[22px] mb-6 fb-bubble-shadow">
          ✓ {savedNotice}
        </div>
      ) : null}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-[26px] p-5 text-center fb-bubble-shadow">
          <div className="font-mono text-[10px] font-extrabold text-[#4A5754] mb-1">
            VOICE → DOCS
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#1C2120]">
            {String(voiceDocsCount).padStart(2, "0")}
          </div>
        </div>
        <div className="bg-white rounded-[26px] p-5 text-center fb-bubble-shadow">
          <div className="font-mono text-[10px] font-extrabold text-[#4A5754] mb-1">
            AUDIO READS
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#1C2120]">
            {String(audioReadsCount).padStart(2, "0")}
          </div>
        </div>
        <div className="bg-white rounded-[26px] p-5 text-center fb-bubble-shadow">
          <div className="font-mono text-[10px] font-extrabold text-[#4A5754] mb-1">
            MONTHLY QUOTA
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#1C2120]">
            {isPro ? "∞" : `${Math.max(0, 3 - briefsCount)}/3`}
          </div>
        </div>
      </div>

      {/* Pricing Restructure Section */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-2xl font-extrabold text-[#1C2120]">
          Subscription Tiers
        </h2>
        <div className="inline-flex bg-white p-1 rounded-full fb-bubble-shadow">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`fb-interactive px-4 py-1.5 rounded-full text-xs font-extrabold ${
              billingCycle === "monthly"
                ? "bg-[#1C2120] text-[#FBFF28]"
                : "text-[#1C2120]"
            }`}
          >
            Monthly ($18/mo)
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`fb-interactive px-4 py-1.5 rounded-full text-xs font-extrabold ${
              billingCycle === "annual"
                ? "bg-[#1C2120] text-[#FBFF28]"
                : "text-[#1C2120]"
            }`}
          >
            Annual ($139/yr • Save 35%)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* Free Plan Bubble */}
        <div className="bg-white rounded-[32px] p-7 fb-bubble-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] font-extrabold bg-[#DAF7F3] text-[#1C2120] px-3 py-1 rounded-full">
                STARTER WEDGE
              </span>
              <span className="font-mono text-xl font-extrabold text-[#1C2120]">
                $0 / mo
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-[#1C2120] mb-4">
              Free Plan
            </h3>
            <ul className="space-y-3 text-sm text-[#323B39] mb-6">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#1C2120] mt-0.5 shrink-0" />
                <span>
                  <strong>3 generations or audio reads</strong> per month
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#1C2120] mt-0.5 shrink-0" />
                <span>
                  All 5 output document types (PRD, Business Plan, Resume, Pitch Deck, Brief)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#1C2120] mt-0.5 shrink-0" />
                <span>
                  Standard voices only (Urdu, Hindi, Arabic, English) — no voice cloning
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#1C2120] mt-0.5 shrink-0" />
                <span>MP3 & AAC audio playback at 0.5x–1.5x speed</span>
              </li>
            </ul>
          </div>

          <div className="font-mono text-xs font-bold text-[#5A6966] pt-4 border-t border-[#1C2120]/10">
            {isPro ? "Included in your account" : "✓ Current Active Tier"}
          </div>
        </div>

        {/* Pro Plan Dark Bubble (#1C2120 with #FBFF28 Accent Pop) */}
        <div className="bg-[#1C2120] text-white rounded-[32px] p-7 fb-dark-bubble-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-extrabold bg-[#FBFF28] text-[#1C2120] px-3 py-1 rounded-full">
                <Crown className="w-3.5 h-3.5" />
                FOUNDERBRIEF PRO
              </span>
              <span className="font-mono text-xl font-extrabold text-[#FBFF28]">
                {billingCycle === "monthly" ? "$18 / mo" : "$139 / yr"}
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-white mb-1">
              Pro Studio Unlimited
            </h3>
            <p className="text-xs text-[#B8C7C4] mb-4">
              $16–20/mo creator & founder tier (or $139/yr annual billing)
            </p>

            <ul className="space-y-2.5 text-sm text-white mb-5">
              <li className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#FBFF28] mt-0.5 shrink-0" />
                <span>
                  <strong className="text-[#FBFF28]">Unlimited</strong> Voice → Doc generations & Read Aloud reads
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#FBFF28] mt-0.5 shrink-0" />
                <span>
                  <strong className="text-[#FBFF28]">Crown Neural Voices</strong> across Urdu, Hindi, Arabic & English
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#FBFF28] mt-0.5 shrink-0" />
                <span>
                  <strong className="text-[#FBFF28]">All Export Formats:</strong> Word (.doc), PDF, TXT + Lossless WAV, MP3, AAC
                </span>
              </li>
            </ul>

            <div className="bg-[#272E2C] rounded-[20px] p-4 mb-3">
              <div className="font-mono text-[10px] font-extrabold text-[#FBFF28] uppercase tracking-wider mb-1">
                REVENUECAT PAYWALL SDK INTEGRATED
              </div>
              <p className="text-xs text-[#B8C7C4] leading-relaxed">
                Android Public Key: <code className="text-[#FBFF28]">goog_qZzNIGNlYjRSlaVgkQtcPrZyaYC</code> • Offering: <code className="text-[#FBFF28]">FounderBreif Pro Plans</code> • Paywall ID: <code className="text-[#FBFF28]">pw161ff1e8882f4f42</code>
              </p>
            </div>

            <div className="bg-[#272E2C] rounded-[20px] p-4 mb-5">
              <div className="font-mono text-[10px] font-extrabold text-[#FBFF28] uppercase tracking-wider mb-1">
                WHY $18/MO VS OLD $7 PRD-ONLY PLAN?
              </div>
              <p className="text-xs text-[#B8C7C4] leading-relaxed">
                Justified by the dedicated neural TTS & multi-language audio synthesis pipeline compute cost on every Read Aloud stream and download — not just higher PRD volume.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleProTier}
            className="fb-interactive fb-pill-shadow w-full bg-[#FBFF28] text-[#1C2120] font-extrabold text-sm py-4 px-6 rounded-full flex items-center justify-between"
          >
            <span>
              {isPro
                ? "✓ Pro Active (Click to Preview Free)"
                : `Activate Pro (${billingCycle === "monthly" ? "$18/mo" : "$139/yr"})`}
            </span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Identity Form Bubble */}
      <form
        onSubmit={handleSave}
        className="bg-white rounded-[32px] p-6 sm:p-8 fb-bubble-shadow"
      >
        <h3 className="text-xl font-extrabold text-[#1C2120] mb-4">
          Founder Identity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="block font-mono text-[10px] font-extrabold text-[#4A5754] mb-1.5">
              FOUNDER NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#DAF7F3] text-[#1C2120] font-bold text-sm rounded-[18px] px-4 py-3 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] font-extrabold text-[#4A5754] mb-1.5">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#DAF7F3] text-[#1C2120] font-bold text-sm rounded-[18px] px-4 py-3 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] font-extrabold text-[#4A5754] mb-1.5">
              COMPANY / VENTURE
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-[#DAF7F3] text-[#1C2120] font-bold text-sm rounded-[18px] px-4 py-3 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="submit"
            className="fb-interactive fb-pill-shadow bg-[#FBFF28] text-[#1C2120] font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-full"
          >
            Save Identity Details
          </button>

          <button
            type="button"
            onClick={onSignOut}
            className="fb-interactive text-xs font-extrabold text-red-700 px-4 py-2"
          >
            Reset Session
          </button>
        </div>
      </form>
    </div>
  );
};

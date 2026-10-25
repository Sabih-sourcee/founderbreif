import React from "react";
import {
  DOCUMENT_OUTPUT_TYPES,
  DocumentOutputType,
  SpokenLanguage,
} from "../types";

interface Props {
  userName?: string;
  isPro?: boolean;
  savedBriefsCount?: number;
  onGetStarted: (docType?: DocumentOutputType, language?: SpokenLanguage) => void;
  onOpenReadAloud: () => void;
  onOpenLibrary: () => void;
  onOpenProfile: () => void;
  onSelectTemplate: (
    prompt: string,
    docType?: DocumentOutputType,
    language?: SpokenLanguage
  ) => void;
}

const SOUTH_ASIAN_TEMPLATES: {
  title: string;
  language: SpokenLanguage;
  nativeTag: string;
  docType: DocumentOutputType;
  prompt: string;
}[] = [
  {
    title: "Kiryana & Retail Ledger",
    language: "Urdu",
    nativeTag: "اردو / Roman Urdu",
    docType: "PRD",
    prompt:
      "Mera idea ek B2B kiryana inventory aur udhaar khata app hai jo dukandaaron ko WhatsApp par automatic payment reminders bhejti hai aur JazzCash/Easypaisa se instant settlement karti hai.",
  },
  {
    title: "D2C Modest Fashion Plan",
    language: "Hindi",
    nativeTag: "हिन्दी / Hinglish",
    docType: "Business Plan",
    prompt:
      "Hum tier-2 cities ke liye ek direct-to-consumer modest fashion aur artisanal ethnic wear brand bana rahe hain jisme WhatsApp video shopping aur COD verification ho.",
  },
  {
    title: "MENA Cross-Border Logistics",
    language: "Arabic",
    nativeTag: "العربية / GCC",
    docType: "Pitch Deck Outline",
    prompt:
      "منصة لوجستية ذكية تربط التجار في باكستان والهند بالمستودعات في الرياض ودبي مع تخليص جمركي فوري وتتبع الشحنات.",
  },
];

export function LandingScreen({
  userName = "Founder",
  isPro = false,
  savedBriefsCount = 0,
  onGetStarted,
  onOpenReadAloud,
  onOpenLibrary,
  onOpenProfile,
  onSelectTemplate,
}: Props) {
  const firstName = userName.split(" ")[0] || "Founder";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* REFERENCE 4 HERO CARD — White Rounded Surface with Greeting + 2x2 Pastel Grid + Search/Speak Pill */}
      <div
        className="bubble-card"
        style={{
          padding: 26,
          borderRadius: 36,
          background: "#FFFFFF",
        }}
      >
        {/* Top Utility Icon Row (? on left, Bell + Orange Badge on right) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <button
            type="button"
            onClick={() => onGetStarted("PRD", "Urdu")}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#F3F4F6",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                border: "1.8px solid #1C2120",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 12,
                color: "#1C2120",
              }}
            >
              ?
            </span>
          </button>

          <span
            className="pill-badge"
            style={{
              background: "#F3F4F6",
              color: "#1C2120",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            اردو • हिन्दी • العربية • EN
          </span>

          <button
            type="button"
            onClick={onOpenLibrary}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#F3F4F6",
              border: "none",
              cursor: "pointer",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
            }}
          >
            🔔
            <span
              style={{
                position: "absolute",
                top: 4,
                left: 2,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                background: "#F97316",
                color: "#FFFFFF",
                fontSize: 10,
                fontWeight: 900,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                border: "1.5px solid #FFFFFF",
              }}
            >
              {savedBriefsCount > 0 ? savedBriefsCount : 5}
            </span>
          </button>
        </div>

        {/* Bold 3-Line Greeting Header matching Reference 4 */}
        <h1
          style={{
            margin: "0 0 22px",
            fontSize: "clamp(2rem, 4vw, 2.5rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.12,
            color: "#1C2120",
          }}
        >
          Hi {firstName},
          <br />
          How can I help
          <br />
          you today?
        </h1>

        {/* 2x2 Symmetrical Pastel Bubble Grid matching Reference 4 ("Scan / Edit / Convert / Ask AI") */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 14,
            marginBottom: 16,
          }}
        >
          {/* Tile 1: Record (Soft Sky Teal #DAF7F3) */}
          <button
            type="button"
            onClick={() => onGetStarted("PRD", "Urdu")}
            style={{
              background: "#DAF7F3",
              border: "none",
              borderRadius: 28,
              padding: "26px 16px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "transform 0.15s ease",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M4 16v2a2 2 0 0 0 2 2h2M16 20h2a2 2 0 0 0 2-2v-2"
                  stroke="#1C2120"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <rect x="7" y="9" width="10" height="6" rx="3" stroke="#1C2120" strokeWidth="1.8" />
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#1C2120" }}>Record</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#4A5956", marginTop: 2 }}>
                Voice → Doc
              </div>
            </div>
          </button>

          {/* Tile 2: Generate Doc (Soft Alabaster #F4F5F7) */}
          <button
            type="button"
            onClick={() => onGetStarted("Business Plan", "Urdu")}
            style={{
              background: "#F4F5F7",
              border: "1px solid #E5E7EB",
              borderRadius: 28,
              padding: "26px 16px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "transform 0.15s ease",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="6" width="12" height="12" stroke="#1C2120" strokeWidth="1.6" />
                <circle cx="6" cy="6" r="2" fill="#FFFFFF" stroke="#1C2120" strokeWidth="1.5" />
                <circle cx="18" cy="6" r="2" fill="#FFFFFF" stroke="#1C2120" strokeWidth="1.5" />
                <circle cx="6" cy="18" r="2" fill="#FFFFFF" stroke="#1C2120" strokeWidth="1.5" />
                <circle cx="18" cy="18" r="2" fill="#FFFFFF" stroke="#1C2120" strokeWidth="1.5" />
                <path d="M9 10h6M9 13.5h4" stroke="#1C2120" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#1C2120" }}>Generate Doc</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#4A5956", marginTop: 2 }}>
                5 Doc Types
              </div>
            </div>
          </button>

          {/* Tile 3: Read Aloud (Soft Mint Green #E3F9E5) */}
          <button
            type="button"
            onClick={onOpenReadAloud}
            style={{
              background: "#E3F9E5",
              border: "none",
              borderRadius: 28,
              padding: "26px 16px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "transform 0.15s ease",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="11" height="11" rx="3" stroke="#1C2120" strokeWidth="1.7" />
                <rect
                  x="9"
                  y="9"
                  width="11"
                  height="11"
                  rx="3"
                  fill="#FFFFFF"
                  stroke="#1C2120"
                  strokeWidth="1.7"
                />
                <path d="M11 13l3-3m0 0h-2.5m2.5 0v2.5" stroke="#1C2120" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#1C2120" }}>Read Aloud</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#4A5956", marginTop: 2 }}>
                Doc → Voice
              </div>
            </div>
          </button>

          {/* Tile 4: Library (Soft Butter Yellow #FEF9C3) */}
          <button
            type="button"
            onClick={onOpenLibrary}
            style={{
              background: "#FEF9C3",
              border: "none",
              borderRadius: 28,
              padding: "26px 16px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "transform 0.15s ease",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="6.5" stroke="#1C2120" strokeWidth="1.6" />
                <ellipse cx="12" cy="12" rx="3" ry="6.5" stroke="#1C2120" strokeWidth="1.4" />
                <path d="M5.8 12h12.4" stroke="#1C2120" strokeWidth="1.4" />
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#1C2120" }}>Library</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#4A5956", marginTop: 2 }}>
                {savedBriefsCount > 0 ? `${savedBriefsCount} Saved` : "Docs & Audio"}
              </div>
            </div>
          </button>
        </div>

        {/* Search / Speak Prompt Pill Bar directly under 2x2 grid (matches Reference 4) */}
        <button
          type="button"
          onClick={() => onGetStarted("PRD", "Urdu")}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 999,
            padding: "9px 10px 9px 18px",
            cursor: "pointer",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10, color: "#6E7F7C", fontSize: 14, fontWeight: 600 }}>
            <span>🔍</span>
            <span>Ask or speak in Urdu, Hindi, Arabic…</span>
          </span>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "1.6px solid #1C2120",
              background: "#FFFFFF",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 900,
              color: "#1C2120",
            }}
          >
            |||
          </span>
        </button>
      </div>

      {/* REFERENCE 3 DARK SHOWCASE CARD — Dark #1C2120 Outer Card + Soft Teal #DAF7F3 Inner Card + Bright Yellow #FBFF28 Pill CTA */}
      <div
        className="bubble-card-dark"
        style={{
          padding: 24,
          borderRadius: 36,
          background: "#1C2120",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#FBFF28",
                color: "#1C2120",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 16,
              }}
            >
              {firstName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#FFFFFF" }}>Hi, {firstName}</div>
              <div style={{ fontSize: 12, color: "#A9B8B5" }}>
                {isPro ? "Pro Studio Active" : "3 Free Monthly Runs"}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenProfile}
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "#FFFFFF",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            👑
          </button>
        </div>

        <div style={{ fontSize: 26, fontWeight: 400, color: "#FFFFFF", lineHeight: 1.15 }}>
          Your Voice-First
        </div>
        <div
          style={{
            fontSize: 30,
            fontWeight: 900,
            color: "#FFFFFF",
            letterSpacing: "-0.03em",
            marginBottom: 16,
          }}
        >
          Founder Studio
        </div>

        {/* Filter Chips Row matching Reference 3 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#FFFFFF",
              color: "#1C2120",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
            }}
          >
            ★
          </span>
          <button
            type="button"
            onClick={() => onGetStarted("PRD", "Urdu")}
            className="pill-badge"
            style={{
              background: "#262D2B",
              color: "#A9B8B5",
              border: "none",
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            Voice → 5 Docs
          </button>
          <button
            type="button"
            onClick={onOpenReadAloud}
            className="pill-badge"
            style={{
              background: "#262D2B",
              color: "#A9B8B5",
              border: "none",
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            Vozify Read Aloud
          </button>
        </div>

        {/* Soft Mint-Teal (#DAF7F3) Inner Feature Card with Bright Yellow (#FBFF28) Pill Button */}
        <div
          style={{
            background: "#DAF7F3",
            borderRadius: 28,
            padding: 22,
            marginBottom: 14,
            color: "#1C2120",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 21, fontWeight: 500 }}>Speak in Urdu or Hindi</div>
              <div style={{ fontSize: 25, fontWeight: 900, letterSpacing: "-0.03em" }}>
                Ship Any Document
              </div>
            </div>
            <span
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "#FFFFFF",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 12,
              }}
            >
              DOC
            </span>
          </div>

          <p style={{ margin: "10px 0 18px", fontSize: 13, color: "#4A5956", fontWeight: 600, lineHeight: 1.5 }}>
            PRD • Business Plan • Resume • Pitch Deck • Generic Brief
            <br />
            One-click Word (.doc), PDF & TXT export
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="pill-cta"
              onClick={() => onGetStarted("PRD", "Urdu")}
              style={{ padding: "12px 24px" }}
            >
              Draft Now
            </button>
            <button
              type="button"
              className="pill-secondary"
              onClick={onOpenReadAloud}
              style={{ padding: "12px 18px", background: "#FFFFFF" }}
            >
              Read Aloud →
            </button>
          </div>
        </div>

        {/* Bottom Translucent Action Strip matching Reference 3 ("Get Started >>> ✓") */}
        <button
          type="button"
          onClick={onOpenProfile}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#262D2B",
            border: "none",
            borderRadius: 999,
            padding: "6px 6px 6px 20px",
            cursor: "pointer",
            color: "#FFFFFF",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 800 }}>
            {isPro
              ? "Pro Unlocked • Unlimited Docs & Neural Voices"
              : "Unlock Pro ($18/mo or $139/yr) • RevenueCat Paywall"}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#A9B8B5", letterSpacing: 2 }}>›››</span>
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#FFFFFF",
                color: "#1C2120",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
              }}
            >
              ✓
            </span>
          </span>
        </button>
      </div>

      {/* 5 Post-Recording Output Types */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em" }}>
            5 Output Document Types
          </h2>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 800, color: "var(--text-muted)" }}>
            WORD • PDF • TXT
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
            gap: 12,
          }}
        >
          {DOCUMENT_OUTPUT_TYPES.map((dt) => (
            <button
              key={dt.type}
              type="button"
              onClick={() => onGetStarted(dt.type, "Urdu")}
              className="bubble-card"
              style={{
                padding: 18,
                textAlign: "left",
                border: "none",
                cursor: "pointer",
              }}
            >
              <span
                className="pill-badge"
                style={{
                  background: "var(--accent)",
                  color: "var(--dark-surface)",
                  marginBottom: 10,
                }}
              >
                {dt.shortLabel}
              </span>
              <div style={{ fontSize: 16, fontWeight: 900, color: "var(--text)", marginBottom: 4 }}>
                {dt.type}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                {dt.tagline}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* South Asian Founder Voice Input Wedge */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em" }}>
            Try Spoken Founder Notes
          </h2>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 800, color: "var(--text-muted)" }}>
            URDU • HINDI • ARABIC
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {SOUTH_ASIAN_TEMPLATES.map((tpl) => (
            <button
              key={tpl.title}
              type="button"
              onClick={() => onSelectTemplate(tpl.prompt, tpl.docType, tpl.language)}
              className="bubble-card"
              style={{
                padding: 18,
                textAlign: "left",
                border: "none",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span
                  className="pill-badge"
                  style={{ background: "var(--bg)", color: "var(--dark-surface)" }}
                >
                  {tpl.nativeTag}
                </span>
                <span
                  className="pill-badge"
                  style={{ background: "var(--dark-surface)", color: "var(--accent)" }}
                >
                  → {tpl.docType}
                </span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>{tpl.title}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", fontStyle: "italic" }}>
                “{tpl.prompt}”
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  DOCUMENT_OUTPUT_TYPES,
  DocumentOutputType,
  SPOKEN_LANGUAGES,
  SpokenLanguage,
} from "../types";

interface Props {
  initialIdea: string;
  initialDocType?: DocumentOutputType;
  initialLanguage?: SpokenLanguage;
  onContinue: (idea: string, docType: DocumentOutputType, language: SpokenLanguage) => void;
  onInstantGenerate: (idea: string, docType: DocumentOutputType, language: SpokenLanguage) => void;
  onBack: () => void;
}

const QUICK_VOICE_CHIPS = [
  "+ Real-time rider tracking",
  "+ Cash-on-Delivery & JazzCash/UPI",
  "+ WhatsApp order bot",
  "+ Multi-branch inventory",
];

const WAVE_HEIGHTS = [
  12, 16, 26, 20, 36, 52, 32, 44, 24, 54, 40, 48, 22, 34, 18, 42, 28, 50, 38, 22,
  44, 28, 34, 20, 14, 10,
];

function formatDuration(sec: number): string {
  const mins = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

export default function DescribeIdeaScreen({
  initialIdea,
  initialDocType = "PRD",
  initialLanguage = "Urdu",
  onContinue,
  onInstantGenerate,
  onBack,
}: Props) {
  const [idea, setIdea] = useState(initialIdea);
  const [selectedDocType, setSelectedDocType] = useState<DocumentOutputType>(initialDocType);
  const [selectedLanguage, setSelectedLanguage] = useState<SpokenLanguage>(initialLanguage);
  const [voiceSheetOpen, setVoiceSheetOpen] = useState(false);
  const [recordingSec, setRecordingSec] = useState(0);

  useEffect(() => {
    setIdea(initialIdea);
  }, [initialIdea]);

  useEffect(() => {
    if (!voiceSheetOpen) return;
    const t = setInterval(() => setRecordingSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [voiceSheetOpen]);

  const openVoiceNoteSheet = () => {
    setRecordingSec(0);
    setVoiceSheetOpen(true);
  };

  const confirmVoiceNoteSheet = () => {
    setVoiceSheetOpen(false);
    if (!idea.trim()) {
      const langObj =
        SPOKEN_LANGUAGES.find((l) => l.id === selectedLanguage) ?? SPOKEN_LANGUAGES[0];
      setIdea(langObj.samplePrompt);
    }
  };

  const loadSample = (lang: SpokenLanguage) => {
    setSelectedLanguage(lang);
    const found = SPOKEN_LANGUAGES.find((l) => l.id === lang);
    if (found) setIdea(found.samplePrompt);
  };

  const appendChip = (chip: string) => {
    const clean = chip.replace(/^\+\s*/, "");
    setIdea((prev) => `${prev.trim()}${prev.trim() ? " • " : ""}${clean}`.slice(0, 1000));
  };

  const canProceed = idea.trim().length > 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: "#EEF4F2",
        borderRadius: 36,
        padding: 22,
        position: "relative",
      }}
    >
      {/* REFERENCE 1 CHAT HEADER: Circular Back (←) + Centered Contact Title + Circular Menu (•••) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          className="bubble-card"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            fontWeight: 900,
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ←
        </button>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#1C2120" }}>
            FounderBrief Studio
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6E7F7C" }}>
            {selectedLanguage} Voice ↔ {selectedDocType}
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadSample(selectedLanguage)}
          className="bubble-card"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            fontWeight: 900,
            fontSize: 14,
            letterSpacing: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          •••
        </button>
      </div>

      {/* Centered Date Pill matching Reference 1 */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <span
          className="bubble-card"
          style={{
            padding: "6px 18px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            color: "#6E7F7C",
          }}
        >
          Today • Multilingual Voice Thread
        </span>
      </div>

      {/* Spoken Language Selector Chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {SPOKEN_LANGUAGES.map((lang) => {
          const active = selectedLanguage === lang.id;
          return (
            <button
              key={lang.id}
              type="button"
              onClick={() => setSelectedLanguage(lang.id)}
              className="pill-badge"
              style={{
                cursor: "pointer",
                border: "none",
                padding: "8px 14px",
                background: active ? "var(--dark-surface)" : "var(--surface)",
                color: active ? "var(--accent)" : "var(--text)",
              }}
            >
              {lang.nativeScript} {lang.label}
            </button>
          );
        })}
      </div>

      {/* LEFT BUBBLE 1: Incoming White Message Bubble (#FFFFFF) + Timestamp */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div
          className="bubble-card"
          style={{
            maxWidth: "85%",
            padding: 18,
            borderRadius: "24px 24px 24px 8px",
          }}
        >
          <p style={{ margin: "0 0 10px", fontSize: 14, lineHeight: 1.55, color: "#1C2120" }}>
            Assalam-o-Alaikum! Describe your product idea or business workflow in{" "}
            <strong>Urdu, Hindi, Arabic, or English</strong>. How can I structure it for you?
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SPOKEN_LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => loadSample(lang.id)}
                className="pill-badge"
                style={{
                  background: "var(--bg)",
                  color: "var(--dark-surface)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                + {lang.label} Sample
              </button>
            ))}
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#6E7F7C", marginTop: 5, marginLeft: 4 }}>
          10:30 AM
        </span>
      </div>

      {/* RIGHT BUBBLE 1: Outgoing Near-Black Message Bubble (#1C2120) + Timestamp & Blue Checkmarks */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <div
          className="bubble-card-dark"
          style={{
            width: "90%",
            padding: 18,
            borderRadius: "24px 24px 8px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <span
              className="pill-badge"
              style={{ background: "var(--dark-elevated)", color: "var(--accent)" }}
            >
              ● VOICE / TEXT • {selectedLanguage.toUpperCase()}
            </span>

            <button
              type="button"
              onClick={openVoiceNoteSheet}
              className="pill-badge"
              style={{
                background: "var(--dark-elevated)",
                color: "var(--accent)",
                border: "none",
                cursor: "pointer",
              }}
            >
              🎙 Record Voice Note
            </button>
          </div>

          <textarea
            rows={3}
            maxLength={1000}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Tap the mic button or type your message here in Urdu, Hindi, Arabic, or English…"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#FFFFFF",
              fontSize: 15,
              lineHeight: 1.55,
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              paddingTop: 10,
              borderTop: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {QUICK_VOICE_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => appendChip(chip)}
                className="pill-badge"
                style={{
                  background: "var(--dark-elevated)",
                  color: "var(--text-muted-on-dark)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            marginTop: 5,
            marginRight: 4,
            fontSize: 11,
            fontWeight: 600,
            color: "#6E7F7C",
          }}
        >
          <span>10:40 AM</span>
          <span style={{ color: "#0EA5E9", fontWeight: 900 }}>✓✓</span>
        </div>
      </div>

      {/* LEFT BUBBLE 2: Post-Recording Document-Type Selector Bubble */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div
          className="bubble-card"
          style={{
            width: "94%",
            padding: 20,
            borderRadius: "24px 24px 24px 8px",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900, color: "#1C2120", marginBottom: 12 }}>
            Voice note captured. Which document format should I compile?
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 10,
              marginBottom: 14,
            }}
          >
            {DOCUMENT_OUTPUT_TYPES.map((dt) => {
              const active = selectedDocType === dt.id;
              return (
                <button
                  key={dt.id}
                  type="button"
                  onClick={() => setSelectedDocType(dt.id)}
                  style={{
                    background: active ? "var(--dark-surface)" : "#F3F7F6",
                    color: active ? "#FFFFFF" : "var(--text)",
                    border: "none",
                    borderRadius: 18,
                    padding: 13,
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <span
                      className="pill-badge"
                      style={{
                        background: active ? "var(--accent)" : "var(--surface)",
                        color: "var(--dark-surface)",
                        fontSize: 10,
                      }}
                    >
                      {dt.badge}
                    </span>
                    {active && <span style={{ color: "var(--accent)", fontWeight: 900 }}>✓</span>}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900 }}>{dt.label}</div>
                  <div style={{ fontSize: 11, opacity: 0.78, marginTop: 2 }}>{dt.tagline}</div>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={!canProceed}
              onClick={() => onInstantGenerate(idea.trim(), selectedDocType, selectedLanguage)}
              className="pill-cta"
              style={{ flex: 2, opacity: canProceed ? 1 : 0.45 }}
            >
              <span>Generate {selectedDocType} Now</span>
              <span>→</span>
            </button>
            <button
              type="button"
              disabled={!canProceed}
              onClick={() => onContinue(idea.trim(), selectedDocType, selectedLanguage)}
              className="pill-secondary"
              style={{ flex: 1, opacity: canProceed ? 1 : 0.45, background: "#DAF7F3" }}
            >
              Calibrate 7 Scope Questions →
            </button>
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#6E7F7C", marginTop: 5, marginLeft: 4 }}>
          10:45 AM • Exports: Word, PDF, TXT
        </span>
      </div>

      {/* REFERENCE 1 BOTTOM COMPOSER BAR ("Type messages..." + Paper Plane + Vertical Action Pill) */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 12,
          marginTop: 8,
        }}
      >
        <div
          className="bubble-card"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            borderRadius: 999,
            padding: "6px 6px 6px 18px",
            gap: 10,
          }}
        >
          <input
            type="text"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Type messages or tap mic…"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 14,
              color: "#1C2120",
            }}
          />
          <button
            type="button"
            disabled={!canProceed}
            onClick={() => onInstantGenerate(idea.trim(), selectedDocType, selectedLanguage)}
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              border: "none",
              background: "linear-gradient(135deg, #CA8A04, #84CC16)",
              color: "#FFFFFF",
              cursor: canProceed ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
            }}
          >
            ➤
          </button>
        </div>

        {/* Vertical Action Pill matching Reference 1 */}
        <div
          className="bubble-card"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: 6,
            borderRadius: 999,
          }}
        >
          <button
            type="button"
            onClick={() => {
              const idx = DOCUMENT_OUTPUT_TYPES.findIndex((d) => d.id === selectedDocType);
              const next = DOCUMENT_OUTPUT_TYPES[(idx + 1) % DOCUMENT_OUTPUT_TYPES.length];
              setSelectedDocType(next.id);
            }}
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: "none",
              background: "#F4F6F5",
              cursor: "pointer",
            }}
            title="Cycle Document Type"
          >
            📄
          </button>
          <button
            type="button"
            onClick={openVoiceNoteSheet}
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: "none",
              background: "#FBFF28",
              cursor: "pointer",
            }}
            title="Open Voice Note Sheet"
          >
            🎙
          </button>
        </div>
      </div>

      {/* REFERENCE 2 SLIDE-UP WHITE "VOICE NOTE" BOTTOM SHEET OVERLAY */}
      {voiceSheetOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(28, 33, 32, 0.35)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 20,
            zIndex: 100,
          }}
        >
          <div
            className="bubble-card"
            style={{
              width: "100%",
              maxWidth: 460,
              borderRadius: 36,
              padding: "26px 24px 20px",
              textAlign: "center",
              background: "#FFFFFF",
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 900, color: "#1C2120" }}>Voice Note</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6E7F7C", marginTop: 2, marginBottom: 20 }}>
              Speaking in {selectedLanguage} → {selectedDocType}
            </div>

            {/* Dual-Tone Yellow-Green + Soft Gray Waveform matching Reference 2 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                height: 62,
                marginBottom: 14,
              }}
            >
              {WAVE_HEIGHTS.map((h, i) => {
                const isFilled = i < 13;
                const bg = isFilled
                  ? i % 3 === 0
                    ? "#CA8A04"
                    : "#84CC16"
                  : "#E5E7EB";
                return (
                  <span
                    key={i}
                    style={{
                      width: 4,
                      height: h,
                      borderRadius: 3,
                      background: bg,
                      display: "inline-block",
                    }}
                  />
                );
              })}
            </div>

            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                fontWeight: 700,
                color: "#9CA3AF",
                marginBottom: 20,
              }}
            >
              {recordingSec > 0 ? formatDuration(recordingSec) : "02:50"}
            </div>

            {/* Bottom Control Pill: X on left, Yellow-Green Mic in center, Paper Plane on right */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#F9FAFB",
                border: "1px solid #F3F4F6",
                borderRadius: 999,
                padding: "8px 14px",
              }}
            >
              <button
                type="button"
                onClick={() => setVoiceSheetOpen(false)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "none",
                  background: "#F3F4F6",
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: 15,
                }}
              >
                ✕
              </button>

              <button
                type="button"
                onClick={confirmVoiceNoteSheet}
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  border: "3px solid #FBFF28",
                  background: "linear-gradient(180deg, #EAB308, #84CC16)",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  fontSize: 20,
                }}
              >
                🎙
              </button>

              <button
                type="button"
                onClick={confirmVoiceNoteSheet}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "none",
                  background: "#F3F4F6",
                  cursor: "pointer",
                  fontWeight: 900,
                  fontSize: 16,
                }}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

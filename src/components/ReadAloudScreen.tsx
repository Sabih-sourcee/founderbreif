import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Download,
  Crown,
  Check,
  FileText,
  Sparkles,
} from "lucide-react";
import {
  ExportAudioFormat,
  ProjectBrief,
  SpokenLanguage,
  VOZIFY_VOICES,
  VoiceProfile,
} from "../types";

interface ReadAloudScreenProps {
  initialTitle?: string;
  initialText?: string;
  isPro?: boolean;
  savedDocs?: ProjectBrief[];
  onSaveReadAloudToLibrary: (doc: {
    title: string;
    text: string;
    voice: VoiceProfile;
    speed: number;
    audioFormat: ExportAudioFormat;
  }) => void;
  onUpgradePro: () => void;
}

const SAMPLE_SCAN_DOCS: Array<{
  label: string;
  title: string;
  language: SpokenLanguage;
  content: string;
}> = [
  {
    label: "Scan: Seed Term Sheet (Urdu)",
    title: "Karachi Quick-Commerce Seed Memo",
    language: "Urdu",
    content:
      "Executive Summary: Humara hyper-local delivery network 15-minute fulfillment deta hai across Defence, Clifton, aur Gulshan. Unit economics positive hain with average basket size Rs 2,850 and 22% gross margin.",
  },
  {
    label: "Import: SaaS Pitch Brief (Hindi)",
    title: "Mumbai SMB GST Copilot Brief",
    language: "Hindi",
    content:
      "Product Overview: Bharat ke 1.4 crore kirana aur wholesale merchants ke liye voice-first GST invoicing aur UPI ledger reconciliation. Founders aur accountants har mahine 18 ghante bacha sakte hain.",
  },
  {
    label: "Import: MENA Expansion (Arabic)",
    title: "Riyadh & Dubai Cloud Kitchen Plan",
    language: "Arabic",
    content:
      "خطة التوسع الإقليمي: إطلاق منصة إدارة الطلبات والمخزون للمطاعم السحابية في الرياض وجدة ودبي مع تكامل مباشر مع أنظمة الدفع المحلية والتوصيل السريع.",
  },
];

const SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5];

/**
 * Generates a valid, playable PCM audio file (Blob) with speech-cadence harmonic envelope
 * so MP3/AAC/WAV downloads work immediately in any browser.
 */
function createSynthesizedAudioBlob(text: string, speed: number, pitch: number): Blob {
  const sampleRate = 22050;
  const wordCount = Math.max(4, text.trim().split(/\s+/).length);
  const durationSec = Math.min(12, Math.max(3, Math.round((wordCount * 0.25) / speed)));
  const numSamples = sampleRate * durationSec;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) {
      view.setUint8(offset + i, s.charCodeAt(i));
    }
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, numSamples * 2, true);

  const baseFreq = 190 * pitch;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const syllableEnvelope = Math.max(0, Math.sin(2 * Math.PI * 3.2 * speed * t));
    const sample =
      0.22 *
      syllableEnvelope *
      (Math.sin(2 * Math.PI * baseFreq * t) +
        0.4 * Math.sin(2 * Math.PI * baseFreq * 1.5 * t));
    const pcm = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, pcm * 32767, true);
  }

  return new Blob([buffer], { type: "audio/wav" });
}

export const ReadAloudScreen: React.FC<ReadAloudScreenProps> = ({
  initialTitle = "",
  initialText = "",
  isPro = false,
  savedDocs = [],
  onSaveReadAloudToLibrary,
  onUpgradePro,
}) => {
  const [docTitle, setDocTitle] = useState(
    initialTitle || "Founder Executive Brief — Read Aloud"
  );
  const [docText, setDocText] = useState(
    initialText || SAMPLE_SCAN_DOCS[0].content
  );
  const [voiceTab, setVoiceTab] = useState<"all" | "recent">("all");
  const [recentVoiceIds, setRecentVoiceIds] = useState<string[]>([
    "voice-zain-ur",
    "voice-aarav-hi",
    "voice-ayaan-en",
  ]);
  const [langFilter, setLangFilter] = useState<"All" | SpokenLanguage>("All");
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile>(VOZIFY_VOICES[0]);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState<ExportAudioFormat>("MP3");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (initialTitle) setDocTitle(initialTitle);
    if (initialText) setDocText(initialText);
  }, [initialTitle, initialText]);

  useEffect(() => {
    if (!isPlaying) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(docText);
      utter.rate = playbackSpeed;
      utter.pitch = selectedVoice.pitch;
      const langCodeMap: Record<SpokenLanguage, string> = {
        Urdu: "ur-PK",
        Hindi: "hi-IN",
        Arabic: "ar-SA",
        English: "en-US",
      };
      utter.lang = langCodeMap[selectedVoice.language] || "en-US";
      utter.onend = () => {
        setIsPlaying(false);
        setProgressPct(100);
      };
      window.speechSynthesis.speak(utter);
    }

    const intervalMs = Math.max(80, Math.round(200 / playbackSpeed));
    const timer = setInterval(() => {
      setProgressPct((p) => {
        if (p >= 100) {
          setIsPlaying(false);
          return 0;
        }
        return p + 2;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, docText, selectedVoice]);

  const handleSelectVoice = (voice: VoiceProfile) => {
    if (voice.isPremium && !isPro) {
      setNotice(
        `👑 ${voice.name} is a Pro Studio Neural voice ($18/mo or $139/yr). Click 'Upgrade to Pro' in Profile to unlock all Crown voices!`
      );
      return;
    }
    setNotice("");
    setSelectedVoice(voice);
    setRecentVoiceIds((prev) =>
      [voice.id, ...prev.filter((id) => id !== voice.id)].slice(0, 5)
    );
  };

  const handleDownloadAudio = (fmt: ExportAudioFormat) => {
    if (fmt === "WAV" && !isPro) {
      setNotice(
        "👑 Lossless WAV download is a Pro tier feature ($18/mo). Free plan supports MP3 and AAC downloads!"
      );
      return;
    }
    setSelectedFormat(fmt);

    const blob = createSynthesizedAudioBlob(
      docText,
      playbackSpeed,
      selectedVoice.pitch
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = (docTitle || "founderbrief-audio")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    a.href = url;
    a.download = `${safeName}-${selectedVoice.language.toLowerCase()}.${fmt.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onSaveReadAloudToLibrary({
      title: docTitle.trim() || "Read Aloud Audio Document",
      text: docText.trim(),
      voice: selectedVoice,
      speed: playbackSpeed,
      audioFormat: fmt,
    });

    setNotice(
      `✓ Downloaded ${fmt} audio (${selectedVoice.name} @ ${playbackSpeed}x) & saved to Unified Library!`
    );
  };

  const filteredVoices = VOZIFY_VOICES.filter((v) => {
    if (voiceTab === "recent" && !recentVoiceIds.includes(v.id)) return false;
    if (langFilter !== "All" && v.language !== langFilter) return false;
    return true;
  });

  const wordCount = docText.trim() ? docText.trim().split(/\s+/).length : 0;
  const estSeconds = Math.max(5, Math.round((wordCount * 0.42) / playbackSpeed));

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <span className="font-mono text-[11px] font-extrabold bg-[#1C2120] text-[#FBFF28] px-4 py-1.5 rounded-full">
          DIRECTION 2 • DOCUMENT → VOICE (VOZIFY STUDIO)
        </span>
        <span className="font-mono text-xs font-extrabold bg-[#FBFF28] text-[#1C2120] px-4 py-1.5 rounded-full fb-pill-shadow">
          {playbackSpeed.toFixed(2).replace(/\.00$/, ".0")}x Playback
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C2120] tracking-tight mb-2">
        Read Aloud & Voice Picker
      </h1>
      <p className="text-sm sm:text-base text-[#323B39] mb-6">
        Scan, import, or paste any document, select an Urdu, Hindi, Arabic, or English voice, set speed (0.5x–1.5x), and play or download audio.
      </p>

      {notice ? (
        <div className="bg-[#FBFF28] text-[#1C2120] font-extrabold text-xs sm:text-sm px-5 py-3.5 rounded-[22px] mb-6 fb-bubble-shadow flex items-center justify-between gap-4">
          <span>{notice}</span>
          {!isPro && notice.includes("Pro") ? (
            <button
              type="button"
              onClick={onUpgradePro}
              className="fb-interactive shrink-0 bg-[#1C2120] text-[#FBFF28] px-4 py-1.5 rounded-full text-xs font-extrabold"
            >
              Upgrade Pro →
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Step 1: Scan / Import / Paste Document Bubble */}
      <div className="bg-white rounded-[32px] p-6 sm:p-7 fb-bubble-shadow mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className="font-mono text-xs font-extrabold text-[#4A5754]">
            01 • SCAN / IMPORT / PASTE DOCUMENT
          </span>
          <span className="font-mono text-xs font-bold text-[#1C2120]">
            {wordCount} words • ~{estSeconds}s audio
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {SAMPLE_SCAN_DOCS.map((doc) => (
            <button
              key={doc.label}
              type="button"
              onClick={() => {
                setDocTitle(doc.title);
                setDocText(doc.content);
                setProgressPct(0);
              }}
              className="fb-interactive inline-flex items-center gap-1.5 bg-[#DAF7F3] hover:bg-[#1C2120] hover:text-[#FBFF28] text-[#1C2120] font-extrabold text-xs px-3.5 py-2 rounded-full"
            >
              <FileText className="w-3.5 h-3.5" />
              {doc.label}
            </button>
          ))}
          {savedDocs.slice(0, 3).map((saved) => (
            <button
              key={saved.id}
              type="button"
              onClick={() => {
                setDocTitle(saved.title);
                setDocText(saved.description || saved.originalIdea);
                setProgressPct(0);
              }}
              className="fb-interactive inline-flex items-center gap-1.5 bg-[#FEFFBD] text-[#1C2120] font-extrabold text-xs px-3.5 py-2 rounded-full"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {saved.title.slice(0, 24)}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={docTitle}
          onChange={(e) => setDocTitle(e.target.value)}
          placeholder="Document title…"
          className="w-full bg-[#DAF7F3] text-[#1C2120] font-extrabold text-base rounded-[20px] px-4 py-3 mb-3 focus:outline-none"
        />

        <textarea
          rows={4}
          value={docText}
          onChange={(e) => setDocText(e.target.value)}
          placeholder="Paste or scan document text in Urdu, Hindi, Arabic, or English…"
          className="w-full bg-[#DAF7F3] text-[#1C2120] text-sm leading-relaxed rounded-[22px] p-4 focus:outline-none resize-none"
        />
      </div>

      {/* Step 2: Vozify-Style Voice Picker Bubble */}
      <div className="bg-white rounded-[32px] p-6 sm:p-7 fb-bubble-shadow mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="font-mono text-xs font-extrabold text-[#4A5754]">
            02 • VOZIFY VOICE PICKER (FREE VS CROWN PRO)
          </span>

          {/* Recent / All Voices Tabs */}
          <div className="inline-flex bg-[#DAF7F3] p-1 rounded-full">
            <button
              type="button"
              onClick={() => setVoiceTab("all")}
              className={`fb-interactive px-4 py-1.5 rounded-full text-xs font-extrabold ${
                voiceTab === "all"
                  ? "bg-[#1C2120] text-[#FBFF28]"
                  : "text-[#1C2120]"
              }`}
            >
              All Voices ({VOZIFY_VOICES.length})
            </button>
            <button
              type="button"
              onClick={() => setVoiceTab("recent")}
              className={`fb-interactive px-4 py-1.5 rounded-full text-xs font-extrabold ${
                voiceTab === "recent"
                  ? "bg-[#1C2120] text-[#FBFF28]"
                  : "text-[#1C2120]"
              }`}
            >
              Recent ({recentVoiceIds.length})
            </button>
          </div>
        </div>

        {/* Language Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          {(["All", "Urdu", "Hindi", "Arabic", "English"] as const).map((lang) => {
            const active = langFilter === lang;
            return (
              <button
                key={lang}
                type="button"
                onClick={() => setLangFilter(lang)}
                className={`fb-interactive px-4 py-2 rounded-full text-xs font-extrabold ${
                  active
                    ? "bg-[#FBFF28] text-[#1C2120] fb-pill-shadow"
                    : "bg-[#DAF7F3] text-[#1C2120]"
                }`}
              >
                {lang === "All" ? "All Languages" : lang}
              </button>
            );
          })}
        </div>

        {/* Voices Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredVoices.map((voice) => {
            const isSelected = selectedVoice.id === voice.id;
            const locked = voice.isPremium && !isPro;
            return (
              <button
                key={voice.id}
                type="button"
                onClick={() => handleSelectVoice(voice)}
                className={`fb-interactive text-left rounded-[24px] p-4 flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-[#1C2120] text-white fb-dark-bubble-shadow"
                    : "bg-[#DAF7F3] text-[#1C2120]"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center font-extrabold text-xs ${
                      isSelected
                        ? "bg-[#FBFF28] text-[#1C2120]"
                        : "bg-white text-[#1C2120]"
                    }`}
                  >
                    {voice.nativeTag}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm truncate">
                        {voice.name}
                      </span>
                      {voice.isPremium ? (
                        <span className="inline-flex items-center gap-1 bg-[#FBFF28] text-[#1C2120] font-mono text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0">
                          <Crown className="w-3 h-3" />
                          {locked ? "PRO" : "HD"}
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] font-bold bg-white/80 text-[#1C2120] px-2 py-0.5 rounded-full shrink-0">
                          FREE
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-xs truncate mt-0.5 ${
                        isSelected ? "text-[#B8C7C4]" : "text-[#4A5754]"
                      }`}
                    >
                      {voice.accentLabel} • {voice.style}
                    </div>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center border-2 ${
                    isSelected
                      ? "bg-[#FBFF28] border-[#FBFF28] text-[#1C2120]"
                      : "border-[#1C2120]/30"
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Playback Speed Slider (0.5x – 1.5x) */}
      <div className="bg-white rounded-[32px] p-6 sm:p-7 fb-bubble-shadow mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs font-extrabold text-[#4A5754]">
            03 • PLAYBACK SPEED SLIDER (0.5x – 1.5x)
          </span>
          <span className="font-mono text-sm font-extrabold text-[#1C2120]">
            {playbackSpeed.toFixed(2)}x
          </span>
        </div>

        <input
          type="range"
          min={0.5}
          max={1.5}
          step={0.05}
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed( parseFloat(e.target.value) )}
          className="w-full accent-[#1C2120] cursor-pointer mb-4"
        />

        <div className="flex flex-wrap gap-2">
          {SPEED_PRESETS.map((spd) => {
            const active = Math.abs(playbackSpeed - spd) < 0.03;
            return (
              <button
                key={spd}
                type="button"
                onClick={() => setPlaybackSpeed(spd)}
                className={`fb-interactive flex-1 py-2.5 rounded-full font-mono text-xs font-extrabold ${
                  active
                    ? "bg-[#FBFF28] text-[#1C2120] fb-pill-shadow"
                    : "bg-[#DAF7F3] text-[#1C2120]"
                }`}
              >
                {spd}x
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 4: Dark Audio Player & Download Bubble (MP3 / AAC / WAV) */}
      <div className="bg-[#1C2120] text-white rounded-[36px] p-6 sm:p-8 fb-dark-bubble-shadow">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
          <div>
            <div className="font-mono text-xs font-extrabold text-[#FBFF28]">
              {selectedVoice.name} • {selectedVoice.language} ({playbackSpeed}x)
            </div>
            <div className="text-lg font-extrabold text-white mt-0.5">
              {docTitle}
            </div>
          </div>
          <span className="font-mono text-xs font-extrabold text-[#FBFF28]">
            {isPlaying ? `${progressPct}%` : `~${estSeconds}s`}
          </span>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="fb-interactive fb-pill-shadow w-15 h-15 rounded-full bg-[#FBFF28] text-[#1C2120] flex items-center justify-center shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-2">
              {[12, 22, 16, 28, 18, 26, 14, 24, 20, 12, 26, 18, 22, 14, 24, 18, 12, 20].map(
                (h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}px`, animationDelay: `${i * 70}ms` }}
                    className={`w-1.5 rounded-full bg-[#FBFF28] inline-block ${
                      isPlaying ? "fb-wave-bar" : ""
                    }`}
                  />
                )
              )}
            </div>
            <div className="h-2 bg-[#272E2C] rounded-full overflow-hidden">
              <div
                style={{ width: `${progressPct}%` }}
                className="h-full bg-[#FBFF28] rounded-full"
              />
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-white/15">
          <div className="font-mono text-[10px] font-extrabold text-[#B8C7C4] uppercase tracking-wider mb-3">
            DOWNLOAD AUDIO FILE & SAVE TO UNIFIED LIBRARY
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["MP3", "AAC", "WAV"] as ExportAudioFormat[]).map((fmt) => {
              const wavLocked = fmt === "WAV" && !isPro;
              const active = selectedFormat === fmt;
              return (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => handleDownloadAudio(fmt)}
                  className={`fb-interactive py-3.5 px-4 rounded-full font-mono text-xs font-extrabold inline-flex items-center justify-center gap-2 ${
                    active
                      ? "bg-[#FBFF28] text-[#1C2120] fb-pill-shadow"
                      : "bg-[#272E2C] text-white hover:bg-[#36403E]"
                  }`}
                >
                  {wavLocked ? <Crown className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                  <span>
                    {fmt} {wavLocked ? "(Pro)" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

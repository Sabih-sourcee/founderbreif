import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutGrid,
  Mic,
  Volume2,
  FolderKanban,
  User,
  Crown,
} from "lucide-react";
import { LandingScreen } from "./components/LandingScreen";
import { DescribeIdeaScreen } from "./components/DescribeIdeaScreen";
import { QuestionsScreen } from "./components/QuestionsScreen";
import { BriefResultScreen } from "./components/BriefResultScreen";
import { ReadAloudScreen } from "./components/ReadAloudScreen";
import { BriefHistoryScreen } from "./components/BriefHistoryScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import {
  BriefAnswers,
  DocumentOutputType,
  ExportAudioFormat,
  ProjectBrief,
  SpokenLanguage,
  UserProfile,
  VoiceProfile,
} from "./types";

type Screen =
  | "Landing"
  | "Input"
  | "Questions"
  | "Result"
  | "ReadAloud"
  | "History"
  | "Profile";

const STORAGE_KEY_BRIEFS = "founder_brief_archives";
const STORAGE_KEY_PROFILE = "founder_brief_user_profile";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("Landing");
  const [idea, setIdea] = useState("");
  const [selectedDocType, setSelectedDocType] = useState<DocumentOutputType>("PRD");
  const [selectedLanguage, setSelectedLanguage] = useState<SpokenLanguage>("Urdu");
  const [activeBrief, setActiveBrief] = useState<ProjectBrief | null>(null);
  const [readAloudSeed, setReadAloudSeed] = useState<{ title: string; text: string }>({
    title: "",
    text: "",
  });
  const [briefs, setBriefs] = useState<ProjectBrief[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Founder",
    email: "founder@founderbrief.app",
    companyName: "Venture Studio",
    isLoggedIn: false,
    isPro: false,
  });

  useEffect(() => {
    const savedBriefs = localStorage.getItem(STORAGE_KEY_BRIEFS);
    if (savedBriefs) {
      try {
        setBriefs(JSON.parse(savedBriefs));
      } catch {
        /* ignore */
      }
    }
    const savedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const syncBriefs = (updated: ProjectBrief[]) => {
    setBriefs(updated);
    localStorage.setItem(STORAGE_KEY_BRIEFS, JSON.stringify(updated));
  };

  const syncProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updated));
  };

  const runGeneration = async (
    ideaText: string,
    answers: BriefAnswers,
    docType: DocumentOutputType,
    lang: SpokenLanguage
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-brief", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Id": "web-founder-studio",
        },
        body: JSON.stringify({
          idea: ideaText,
          answers,
          documentType: docType,
          spokenLanguage: lang,
        }),
      });

      const data = await response.json();
      const generatedBrief: ProjectBrief = {
        id: `doc-${Date.now()}`,
        title: data.title || `FounderBrief — ${docType}`,
        description: data.tldr || data.description || ideaText,
        complexity: data.complexity || "Medium",
        estimatedBudget: data.estimatedBudget || "$12,000 - $18,000",
        coreFeatures:
          data.functionalRequirements?.map(
            (r: { name: string; details: string }) => `${r.name}: ${r.details}`
          ) ||
          data.businessGoals || [
            `Structured ${docType} synthesis from ${lang} voice input`,
          ],
        userStories: data.userStories || [
          `As a founder speaking in ${lang}, I want a clear ${docType}.`,
        ],
        devQuestions: data.technicalConsiderations?.challenges || [],
        createdAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        originalIdea: ideaText,
        answers,
        documentMarkdown: data.documentMarkdown,
        documentType: docType,
        direction: "voice-to-doc",
        spokenLanguage: lang,
      };

      setActiveBrief(generatedBrief);
      syncBriefs([generatedBrief, ...briefs]);
      setCurrentScreen("Result");
    } catch {
      const fallback: ProjectBrief = {
        id: `doc-${Date.now()}`,
        title: `FounderBrief — ${docType}`,
        description: `[${docType}] Synthesized from ${lang} voice input: ${ideaText}`,
        complexity: "Medium",
        estimatedBudget: "$12,000 - $18,000",
        coreFeatures: [
          `Complete ${docType} structure tailored to ${lang} founder input`,
          `Platform: ${answers.platform} • Auth: ${answers.auth}`,
          `Integrations: ${answers.integrations} • Timeline: ${answers.timeline}`,
        ],
        userStories: [
          `As a founder speaking in ${lang}, I want my voice note converted into a ${docType}.`,
        ],
        devQuestions: ["Confirm regional payment gateway & messaging hooks."],
        createdAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        originalIdea: ideaText,
        answers,
        documentType: docType,
        direction: "voice-to-doc",
        spokenLanguage: lang,
      };
      setActiveBrief(fallback);
      syncBriefs([fallback, ...briefs]);
      setCurrentScreen("Result");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveReadAloud = (payload: {
    title: string;
    text: string;
    voice: VoiceProfile;
    speed: number;
    audioFormat: ExportAudioFormat;
  }) => {
    const newAudioDoc: ProjectBrief = {
      id: `audio-${Date.now()}`,
      title: payload.title,
      description: payload.text,
      complexity: "Low",
      estimatedBudget: `${payload.audioFormat} Audio`,
      coreFeatures: [
        `Voice: ${payload.voice.name} (${payload.voice.language})`,
        `Playback Speed: ${payload.speed}x`,
      ],
      userStories: [],
      devQuestions: [],
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      originalIdea: payload.text,
      answers: {
        platform: "Both",
        platformDetails: "",
        auth: "Email & Password",
        authDetails: "",
        integrations: "Payments",
        integrationsDetails: "",
        design: "Dynamic Bubble UI",
        designDetails: "",
        timeline: "Flexible",
        timelineDetails: "",
      },
      documentType: "Generic Brief",
      direction: "doc-to-voice",
      spokenLanguage: payload.voice.language,
      voiceId: payload.voice.id,
      playbackSpeed: payload.speed,
      audioFormat: payload.audioFormat,
    };
    syncBriefs([newAudioDoc, ...briefs]);
  };

  const navItems: Array<{
    id: Screen;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    badge?: number;
  }> = [
    {
      id: "Landing",
      label: "Home",
      icon: <LayoutGrid className="w-4 h-4" />,
      active: currentScreen === "Landing" || currentScreen === "Result",
    },
    {
      id: "Input",
      label: "Record",
      icon: <Mic className="w-4 h-4" />,
      active: currentScreen === "Input" || currentScreen === "Questions",
    },
    {
      id: "ReadAloud",
      label: "Read Aloud",
      icon: <Volume2 className="w-4 h-4" />,
      active: currentScreen === "ReadAloud",
    },
    {
      id: "History",
      label: "Library",
      icon: <FolderKanban className="w-4 h-4" />,
      active: currentScreen === "History",
      badge: briefs.length > 0 ? briefs.length : undefined,
    },
    {
      id: "Profile",
      label: "Profile",
      icon: <User className="w-4 h-4" />,
      active: currentScreen === "Profile",
    },
  ];

  return (
    <div className="min-h-screen bg-[#DAF7F3] text-[#1C2120] flex flex-col">
      {/* Top Bubble Masthead */}
      <header className="sticky top-0 z-30 bg-[#DAF7F3]/90 backdrop-blur-md px-4 sm:px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo (Speech-Bubble Document with Checkmark Badge) */}
          <button
            type="button"
            onClick={() => setCurrentScreen("Landing")}
            className="fb-interactive flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-[14px] bg-[#1C2120] flex items-center justify-center relative fb-pill-shadow">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 4H14L18 8V15C18 16.1046 17.1046 17 16 17H11L7.5 20V17H6C4.89543 17 4 16.1046 4 15V6C4 4.89543 4.89543 4 6 4Z"
                  stroke="#FBFF28"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line x1="7.5" y1="8.5" x2="13.5" y2="8.5" stroke="#FBFF28" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="7.5" y1="11.5" x2="13.5" y2="11.5" stroke="#FBFF28" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="17.5" cy="17.5" r="4.5" fill="#FBFF28" />
                <path
                  d="M15.8 17.5L17 18.7L19.4 16.3"
                  stroke="#1C2120"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight text-[#1C2120] leading-none">
                FounderBrief
              </div>
              <div className="font-mono text-[10px] font-bold text-[#4A5754] tracking-wider uppercase mt-0.5">
                VOICE ↔ DOCUMENT PLATFORM
              </div>
            </div>
          </button>

          {/* Desktop Bubble Nav */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#1C2120] p-1.5 rounded-full fb-dark-bubble-shadow">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentScreen(item.id)}
                className={`fb-interactive inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold ${
                  item.active
                    ? "bg-[#FBFF28] text-[#1C2120]"
                    : "text-[#B8C7C4] hover:text-white"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge ? (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                      item.active
                        ? "bg-[#1C2120] text-[#FBFF28]"
                        : "bg-white/15 text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>

          {/* Profile Avatar Pill */}
          <button
            type="button"
            onClick={() => setCurrentScreen("Profile")}
            className="fb-interactive inline-flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-full fb-bubble-shadow"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-extrabold ${
                userProfile.isPro
                  ? "bg-[#FBFF28] text-[#1C2120]"
                  : "bg-[#1C2120] text-[#FBFF28]"
              }`}
            >
              {userProfile.isPro ? (
                <Crown className="w-3.5 h-3.5" />
              ) : (
                userProfile.name.charAt(0).toUpperCase()
              )}
            </div>
            <span className="text-xs font-extrabold text-[#1C2120] hidden sm:inline">
              {userProfile.name}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {currentScreen === "Landing" && (
              <LandingScreen
                userName={userProfile.name}
                isPro={Boolean(userProfile.isPro)}
                savedBriefsCount={briefs.length}
                onGetStarted={(dt, lang) => {
                  if (dt) setSelectedDocType(dt);
                  if (lang) setSelectedLanguage(lang);
                  setCurrentScreen("Input");
                }}
                onOpenReadAloud={() => setCurrentScreen("ReadAloud")}
                onOpenLibrary={() => setCurrentScreen("History")}
                onSignIn={() => setCurrentScreen("Profile")}
                onSelectTemplate={(tpl, dt, lang) => {
                  setIdea(tpl);
                  if (dt) setSelectedDocType(dt);
                  if (lang) setSelectedLanguage(lang);
                  setCurrentScreen("Input");
                }}
              />
            )}

            {currentScreen === "Input" && (
              <DescribeIdeaScreen
                initialIdea={idea}
                initialDocType={selectedDocType}
                initialLanguage={selectedLanguage}
                onNext={(txt, dt, lang) => {
                  setIdea(txt);
                  if (dt) setSelectedDocType(dt);
                  if (lang) setSelectedLanguage(lang);
                  setCurrentScreen("Questions");
                }}
                onInstantGenerate={(txt, dt, lang) => {
                  setIdea(txt);
                  setSelectedDocType(dt);
                  setSelectedLanguage(lang);
                  runGeneration(
                    txt,
                    {
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
                    },
                    dt,
                    lang
                  );
                }}
                onBack={() => setCurrentScreen("Landing")}
              />
            )}

            {currentScreen === "Questions" && (
              <QuestionsScreen
                onComplete={(ans) =>
                  runGeneration(idea, ans, selectedDocType, selectedLanguage)
                }
                onBack={() => setCurrentScreen("Input")}
              />
            )}

            {currentScreen === "Result" && activeBrief && (
              <BriefResultScreen
                brief={activeBrief}
                onStartOver={() => {
                  setIdea("");
                  setCurrentScreen("Input");
                }}
                onOpenInReadAloud={(b) => {
                  setReadAloudSeed({
                    title: b.title,
                    text: b.description || b.originalIdea,
                  });
                  setCurrentScreen("ReadAloud");
                }}
              />
            )}

            {currentScreen === "ReadAloud" && (
              <ReadAloudScreen
                initialTitle={readAloudSeed.title}
                initialText={readAloudSeed.text}
                isPro={Boolean(userProfile.isPro)}
                savedDocs={briefs}
                onSaveReadAloudToLibrary={handleSaveReadAloud}
                onUpgradePro={() => setCurrentScreen("Profile")}
              />
            )}

            {currentScreen === "History" && (
              <BriefHistoryScreen
                briefs={briefs}
                onSelectBrief={(b) => {
                  setActiveBrief(b);
                  setCurrentScreen("Result");
                }}
                onOpenReadAloudItem={(b) => {
                  setReadAloudSeed({
                    title: b.title,
                    text: b.description || b.originalIdea,
                  });
                  setCurrentScreen("ReadAloud");
                }}
                onDeleteBrief={(id) => {
                  syncBriefs(briefs.filter((b) => b.id !== id));
                }}
                onRestoreBriefs={syncBriefs}
                onNewBrief={() => {
                  setIdea("");
                  setCurrentScreen("Input");
                }}
                onNewReadAloud={() => setCurrentScreen("ReadAloud")}
              />
            )}

            {currentScreen === "Profile" && (
              <ProfileScreen
                profile={userProfile}
                briefsCount={briefs.length}
                briefs={briefs}
                onUpdateProfile={syncProfile}
                onSignOut={() => {
                  syncProfile({
                    name: "Founder",
                    email: "founder@founderbrief.app",
                    companyName: "Venture Studio",
                    isLoggedIn: false,
                    isPro: false,
                  });
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Floating Bubble Bottom Navigation */}
      <nav className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-md bg-[#1C2120] rounded-full p-2 fb-dark-bubble-shadow flex items-center justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCurrentScreen(item.id)}
            className={`fb-interactive flex flex-col items-center justify-center px-3 py-1.5 rounded-full text-[10px] font-extrabold ${
              item.active
                ? "bg-[#FBFF28] text-[#1C2120]"
                : "text-[#B8C7C4]"
            }`}
          >
            {item.icon}
            <span className="mt-0.5">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Loading Synthesis Modal */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-[#1C2120]/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C2120] text-white rounded-[34px] p-8 max-w-sm w-full fb-dark-bubble-shadow text-center">
            <div className="w-12 h-12 rounded-full bg-[#FBFF28] text-[#1C2120] flex items-center justify-center mx-auto mb-4 animate-pulse font-mono font-extrabold">
              ✦
            </div>
            <div className="font-mono text-xs font-extrabold text-[#FBFF28] uppercase tracking-wider mb-1">
              SYNTHESIZING {selectedDocType.toUpperCase()}
            </div>
            <h3 className="text-xl font-extrabold mb-2">
              Formatting your {selectedLanguage} voice note…
            </h3>
            <p className="text-xs text-[#B8C7C4]">
              Preparing Word, PDF, TXT exports & Read Aloud audio hooks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

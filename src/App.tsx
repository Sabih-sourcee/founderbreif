import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BriefAnswers, ProjectBrief, UserProfile } from "./types";
import LandingScreen from "./components/LandingScreen";
import DescribeIdeaScreen from "./components/DescribeIdeaScreen";
import QuestionsScreen from "./components/QuestionsScreen";
import BriefResultScreen from "./components/BriefResultScreen";
import BriefHistoryScreen from "./components/BriefHistoryScreen";
import ProfileScreen from "./components/ProfileScreen";
import { Home, HelpCircle, FileText, User, AlertCircle, Cpu, Loader2, Sparkles, Terminal } from "lucide-react";

export default function App() {
  // Navigation & Step Tracking
  // Current active view coordinate options: "Landing" | "Input" | "Questions" | "Result" | "History" | "Profile"
  const [activeTab, setActiveTab] = useState<"Landing" | "Input" | "Questions" | "Result" | "History" | "Profile">("Landing");
  
  // Persistent State Objects
  const [idea, setIdea] = useState("");
  const [activeAnswers, setActiveAnswers] = useState<BriefAnswers | null>(null);
  const [activeBrief, setActiveBrief] = useState<ProjectBrief | null>(null);
  const [briefs, setBriefs] = useState<ProjectBrief[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepName, setLoadingStepName] = useState("");
  const [apiError, setApiError] = useState("");

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Founder Guest",
    email: "bookspower218@gmail.com",
    companyName: "Startup Inc.",
    isLoggedIn: true
  });

  // Pull existing list of specifications in LocalStorage on startup
  useEffect(() => {
    try {
      const cached = localStorage.getItem("founder_brief_archives");
      if (cached) {
        setBriefs(JSON.parse(cached));
      }
    } catch (err) {
      console.error("Cache loading failure:", err);
    }

    try {
      const userCached = localStorage.getItem("founder_brief_user_profile");
      if (userCached) {
        setUserProfile(JSON.parse(userCached));
      }
    } catch (err) {
      console.error("User profile reading failure:", err);
    }
  }, []);

  // Sync cache with local storage
  const syncBriefsCache = (updatedList: ProjectBrief[]) => {
    setBriefs(updatedList);
    localStorage.setItem("founder_brief_archives", JSON.stringify(updatedList));
  };

  const handleStartOnboarding = () => {
    setActiveTab("Input");
    setApiError("");
  };

  const handleSelectTemplate = (templateText: string) => {
    setIdea(templateText);
    setActiveTab("Questions");
    setApiError("");
  };

  const handleIdeaSubmitted = (describedIdea: string) => {
    setIdea(describedIdea);
    setActiveTab("Questions");
  };

  // Triggers Gemini backend construction
  const handleQuestionsFinished = async (finalAnswers: BriefAnswers) => {
    setActiveAnswers(finalAnswers);
    setIsLoading(true);
    setApiError("");

    // Simulate progressive processing steps
    const steps = [
      "Translating startup vision into functional features...",
      "Analyzing technical complexity hurdles...",
      "Constructing investor-ready user story personas...",
      "Forging CTO-level vetting questions...",
      "Assembling estimated USD developer budget maps..."
    ];

    let currentStepIndex = 0;
    setLoadingStepName(steps[0]);
    const stepInterval = setInterval(() => {
      currentStepIndex++;
      if (currentStepIndex < steps.length) {
        setLoadingStepName(steps[currentStepIndex]);
      }
    }, 1500);

    try {
      const response = await fetch("/api/generate-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          answers: finalAnswers
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate your technical spec brief. Please try again.");
      }

      const generated: ProjectBrief = {
        id: `spec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: data.title || "Calculated Project Specs",
        description: data.description || "Generated Startup Blueprint spec checklist.",
        complexity: data.complexity || "Medium",
        estimatedBudget: data.estimatedBudget || "$12,000 - $18,000",
        coreFeatures: data.coreFeatures || [],
        userStories: data.userStories || [],
        devQuestions: data.devQuestions || [],
        createdAt: new Date().toISOString(),
        originalIdea: idea,
        answers: finalAnswers
      };

      // Push to active states and sync caches
      setActiveBrief(generated);
      const updatedArchive = [generated, ...briefs];
      syncBriefsCache(updatedArchive);
      
      // Advance to specs stage
      setActiveTab("Result");
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "An unexpected error occurred during brief generation. Keep prompts safe and simple.");
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  const handleDeleteBrief = (id: string) => {
    const updated = briefs.filter((b) => b.id !== id);
    syncBriefsCache(updated);
    if (activeBrief?.id === id) {
      setActiveBrief(null);
    }
  };

  const handleSelectBrief = (selected: ProjectBrief) => {
    setActiveBrief(selected);
    setIdea(selected.originalIdea);
    setActiveAnswers(selected.answers);
    setActiveTab("Result");
  };

  const handleOnboardingRestart = () => {
    setIdea("");
    setActiveAnswers(null);
    setActiveBrief(null);
    setActiveTab("Input");
    setApiError("");
  };

  // Render dynamic view selection coordinate mapping
  const renderInteractiveBlock = () => {
    switch (activeTab) {
      case "Input":
        return (
          <DescribeIdeaScreen
            initialIdea={idea}
            onContinue={handleIdeaSubmitted}
            onBack={() => setActiveTab("Landing")}
          />
        );
      case "Questions":
        return (
          <QuestionsScreen
            onFinish={handleQuestionsFinished}
            onBack={() => setActiveTab("Input")}
          />
        );
      case "Result":
        return activeBrief ? (
          <BriefResultScreen
            brief={activeBrief}
            onRestart={handleOnboardingRestart}
          />
        ) : (
          <LandingScreen
            onGetStarted={handleStartOnboarding}
            onSignIn={() => setActiveTab("Profile")}
            onSelectTemplate={handleSelectTemplate}
          />
        );
      case "History":
        return (
          <BriefHistoryScreen
            briefs={briefs}
            onSelectBrief={handleSelectBrief}
            onDeleteBrief={handleDeleteBrief}
            onNewBrief={handleOnboardingRestart}
          />
        );
      case "Profile":
        return (
          <ProfileScreen
            userEmail={userProfile.email}
            savedBriefsCount={briefs.length}
            briefs={briefs}
            onAuthChanged={(profile) => setUserProfile(profile)}
          />
        );
      case "Landing":
      default:
        return (
          <LandingScreen
            onGetStarted={handleStartOnboarding}
            onSignIn={() => setActiveTab("Profile")}
            onSelectTemplate={handleSelectTemplate}
          />
        );
    }
  };

  return (
    <div className="bg-[#FAF8F5] text-[#1A1A1A] min-h-screen flex flex-col font-sans selection:bg-[#E07B39]/20 relative">
      
      {/* Dynamic Loading Overlay during active generation API requests */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#FAF8F5]/90 flex flex-col items-center justify-center p-6 text-center"
          >
            {/* Spinning technical lock elements */}
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
              <Loader2 className="absolute w-16 h-16 text-[#E07B39] animate-spin" />
              <Cpu className="w-8 h-8 text-[#1A1A1A] animate-pulse" />
            </div>

            <motion.h3 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-lg font-bold text-[#1A1A1A] max-w-sm mb-2"
            >
              Generating your Blueprint...
            </motion.h3>
            
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingStepName}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-[#444748] max-w-xs font-semibold leading-relaxed"
              >
                {loadingStepName}
              </motion.p>
            </AnimatePresence>

            <span className="text-[10px] text-[#444748] mt-20 uppercase font-mono font-bold tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#E07B39]" />
              Powered by Google Gemini
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Top AppBar Bar */}
      <header className="w-full top-0 sticky z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E5DDD3] no-print">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16 w-full max-w-7xl mx-auto">
          {/* Brand header */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab("Landing")}
              className="p-1.5 hover:bg-[#F2EEE8] transition-colors rounded-lg cursor-pointer flex items-center justify-center"
            >
              <Terminal className="text-[#1A1A1A] w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <span 
              onClick={() => setActiveTab("Landing")}
              className="text-lg sm:text-xl font-black text-[#1A1A1A] cursor-pointer tracking-tight"
            >
              FounderBrief
            </span>
          </div>

          {/* Dynamic Active User Indicator Profile button */}
          <div 
            onClick={() => setActiveTab("Profile")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-xs font-semibold text-[#444748] max-w-[120px] truncate hidden sm:inline group-hover:text-[#1A1A1A] transition-colors font-mono">
              {userProfile.name}
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1A1A1A] text-[#FAF8F5] border border-[#E5DDD3] flex items-center justify-center overflow-hidden font-bold text-sm relative uppercase leading-none">
              {userProfile.name ? userProfile.name.charAt(0) : "F"}
            </div>
          </div>
        </div>
      </header>

      {/* Main Canvas Segment Router */}
      <main className="flex-grow flex flex-col justify-start pb-20">
        
        {/* Dynamic global error banner inside the applet view screen */}
        {apiError && (
          <div className="max-w-2xl mx-auto w-full px-4 sm:px-5 pt-4 no-print text-left">
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs text-left">
                <p className="font-bold mb-1">Brief Generation Hindered</p>
                <p className="leading-relaxed font-semibold">{apiError}</p>
                <button
                  onClick={() => setApiError("")}
                  className="mt-2 text-[10px] font-mono font-bold bg-white text-red-700 border border-red-200 px-2 py-0.5 rounded uppercase hover:bg-red-100"
                >
                  Dismiss Banner
                </button>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {renderInteractiveBlock()}
        </AnimatePresence>
      </main>

      {/* Global persistent Bottom tabbar Navigation shell */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-16 bg-[#FAF8F5]/90 backdrop-blur-md border-t border-[#E5DDD3] z-[45] pb-safe no-print">
        <button
          onClick={() => {
            if (activeBrief) {
              setActiveTab("Result");
            } else {
              setActiveTab("Landing");
            }
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            activeTab === "Landing" || activeTab === "Input" || activeTab === "Result"
              ? "text-[#E07B39] font-bold scale-105"
              : "text-[#444748] hover:text-[#1A1A1A]"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Home</span>
        </button>

        <button
          onClick={() => {
            if (idea) {
              setActiveTab("Questions");
            } else {
              setActiveTab("Input");
            }
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            activeTab === "Questions"
              ? "text-[#E07B39] font-bold scale-105"
              : "text-[#444748] hover:text-[#1A1A1A]"
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Questions</span>
        </button>

        <button
          onClick={() => setActiveTab("History")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            activeTab === "History"
              ? "text-[#E07B39] font-bold scale-105"
              : "text-[#444748] hover:text-[#1A1A1A]"
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Briefs</span>
        </button>

        <button
          onClick={() => setActiveTab("Profile")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            activeTab === "Profile"
              ? "text-[#E07B39] font-bold scale-105"
              : "text-[#444748] hover:text-[#1A1A1A]"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Profile</span>
        </button>
      </nav>
    </div>
  );
}

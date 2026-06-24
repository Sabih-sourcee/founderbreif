import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import LandingScreen from "./components/LandingScreen";
import DescribeIdeaScreen from "./components/DescribeIdeaScreen";
import QuestionsScreen from "./components/QuestionsScreen";
import BriefResultScreen from "./components/BriefResultScreen";
import BriefHistoryScreen from "./components/BriefHistoryScreen";
import ProfileScreen from "./components/ProfileScreen";
import { BriefAnswers, DEFAULT_ANSWERS, ProjectBrief, SessionDraft, Tab, UserProfile, BriefApiResponse } from "./types";
import { normalizeBrief } from "./utils/normalizeBrief";
import { COLORS } from "./constants/theme";
import {
  generateFounderBrief,
  checkBackendHealth,
  getApiBaseUrl,
  startPrefetchBrief,
  getGenerationStatus,
} from "./services/api";
import {
  loadBriefs,
  saveBriefs,
  loadProfile,
  saveProfile,
  loadSessionDraft,
  saveSessionDraft,
} from "./services/storage";

const LOADING_STEPS = [
  "Translating startup vision into functional features...",
  "Drafting business and user goals...",
  "Building functional requirements and UX flow...",
  "Writing narrative and success metrics...",
  "Finalizing milestones and PDF document...",
];

const TAB_BAR_HEIGHT = 56;

export default function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}

function apiToProjectBrief(data: BriefApiResponse, idea: string, answers: BriefAnswers): ProjectBrief {
  return normalizeBrief({
    id: `spec-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    originalIdea: idea,
    answers,
  });
}

function AppShell() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>("Landing");
  const [idea, setIdea] = useState("");
  const [sessionAnswers, setSessionAnswers] = useState<BriefAnswers>(DEFAULT_ANSWERS);
  const [questionStep, setQuestionStep] = useState(0);
  const [questionnaireActive, setQuestionnaireActive] = useState(false);
  const [activeBrief, setActiveBrief] = useState<ProjectBrief | null>(null);
  const [briefs, setBriefs] = useState<ProjectBrief[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [apiError, setApiError] = useState("");
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Founder Guest",
    email: "founder@founderbrief.app",
    companyName: "Startup Inc.",
    isLoggedIn: false,
    isAdmin: false,
  });

  const prefetchRef = useRef<Promise<BriefApiResponse> | null>(null);
  const prefetchIdeaRef = useRef("");

  useEffect(() => {
    (async () => {
      setBriefs(await loadBriefs());
      const p = await loadProfile();
      if (p) setUserProfile(p);

      const draft = await loadSessionDraft();
      if (draft?.inProgress && draft.idea) {
        setIdea(draft.idea);
        setSessionAnswers(draft.answers);
        setQuestionStep(draft.step);
        setQuestionnaireActive(true);
        setActiveTab("Questions");
        startPrefetch(draft.idea, p?.authToken);
      }

      checkBackendHealth().then(setBackendOk).catch(() => setBackendOk(false));
    })();
  }, []);

  const startPrefetch = useCallback((ideaText: string, authToken?: string) => {
    prefetchIdeaRef.current = ideaText;
    prefetchRef.current = startPrefetchBrief(ideaText, authToken);
  }, []);

  const persistSession = useCallback(
    async (partial: Partial<SessionDraft>) => {
      const draft: SessionDraft = {
        idea: partial.idea ?? idea,
        answers: partial.answers ?? sessionAnswers,
        step: partial.step ?? questionStep,
        inProgress: partial.inProgress ?? questionnaireActive,
        updatedAt: new Date().toISOString(),
      };
      await saveSessionDraft(draft.inProgress ? draft : null);
    },
    [idea, sessionAnswers, questionStep, questionnaireActive]
  );

  const syncBriefs = async (list: ProjectBrief[]) => {
    setBriefs(list);
    await saveBriefs(list);
  };

  const beginQuestionnaire = async (ideaText: string) => {
    setIdea(ideaText);
    setSessionAnswers(DEFAULT_ANSWERS);
    setQuestionStep(0);
    setQuestionnaireActive(true);
    setActiveTab("Questions");
    setApiError("");
    await persistSession({ idea: ideaText, answers: DEFAULT_ANSWERS, step: 0, inProgress: true });
    startPrefetch(ideaText, userProfile.authToken);
  };

  const handleQuestionsProgress = (answers: BriefAnswers, step: number) => {
    setSessionAnswers(answers);
    setQuestionStep(step);
    persistSession({ answers, step, inProgress: true });
  };

  const handleQuestionsFinished = async (answers: BriefAnswers) => {
    setIsLoading(true);
    setApiError("");

    let stepIdx = 0;
    setLoadingStep(LOADING_STEPS[0]);
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < LOADING_STEPS.length) setLoadingStep(LOADING_STEPS[stepIdx]);
    }, 1500);

    try {
      const status = await getGenerationStatus(userProfile.authToken);
      if (!status.isAdmin && status.remaining === 0) {
        throw new Error("Free generation limit reached. Log in as admin in Profile for unlimited briefs.");
      }

      let data: BriefApiResponse;

      const finalPromise = generateFounderBrief(idea, answers, { authToken: userProfile.authToken });

      if (prefetchRef.current && prefetchIdeaRef.current === idea) {
        try {
          await Promise.race([prefetchRef.current, new Promise((_, rej) => setTimeout(() => rej("timeout"), 500))]);
        } catch {
          /* prefetch still running */
        }
      }

      data = await finalPromise;

      const generated = apiToProjectBrief(data, idea, answers);
      setActiveBrief(generated);
      await syncBriefs([generated, ...briefs]);
      setQuestionnaireActive(false);
      await saveSessionDraft(null);
      prefetchRef.current = null;
      setActiveTab("Result");
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  const tryLeaveQuestionnaire = (target: Tab) => {
    if (!questionnaireActive) {
      setActiveTab(target);
      return;
    }
    Alert.alert(
      "Complete your brief",
      "You can't leave the questionnaire until you finish. Your progress is saved on this device.",
      [{ text: "Continue questionnaire", style: "default" }]
    );
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "Input":
        return (
          <DescribeIdeaScreen
            initialIdea={idea}
            onContinue={beginQuestionnaire}
            onBack={() => setActiveTab("Landing")}
          />
        );
      case "Questions":
        return (
          <QuestionsScreen
            initialAnswers={sessionAnswers}
            initialStep={questionStep}
            onFinish={handleQuestionsFinished}
            onProgress={handleQuestionsProgress}
          />
        );
      case "Result":
        return activeBrief ? (
          <BriefResultScreen
            brief={activeBrief}
            onRestart={async () => {
              setIdea("");
              setActiveBrief(null);
              setQuestionnaireActive(false);
              await saveSessionDraft(null);
              setActiveTab("Input");
            }}
          />
        ) : (
          <LandingScreen
            bottomInset={insets.bottom}
            onGetStarted={() => setActiveTab("Input")}
            onSignIn={() => setActiveTab("Profile")}
            onSelectTemplate={(t) => beginQuestionnaire(t)}
          />
        );
      case "History":
        return (
          <BriefHistoryScreen
            bottomInset={insets.bottom}
            briefs={briefs}
            onSelectBrief={(b) => {
              setActiveBrief(b);
              setIdea(b.originalIdea);
              setActiveTab("Result");
            }}
            onDeleteBrief={async (id) => {
              const updated = briefs.filter((b) => b.id !== id);
              await syncBriefs(updated);
              if (activeBrief?.id === id) setActiveBrief(null);
            }}
            onNewBrief={() => {
              setIdea("");
              setActiveTab("Input");
            }}
          />
        );
      case "Profile":
        return (
          <ProfileScreen
            bottomInset={insets.bottom}
            profile={userProfile}
            savedBriefsCount={briefs.length}
            briefs={briefs}
            onAuthChanged={async (p) => {
              setUserProfile(p);
              await saveProfile(p);
            }}
          />
        );
      default:
        return (
          <LandingScreen
            bottomInset={insets.bottom}
            onGetStarted={() => {
              setApiError("");
              setActiveTab("Input");
            }}
            onSignIn={() => setActiveTab("Profile")}
            onSelectTemplate={(t) => beginQuestionnaire(t)}
          />
        );
    }
  };

  const isHomeTab = activeTab === "Landing" || activeTab === "Input" || activeTab === "Result";

  return (
    <View style={styles.root}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={styles.brandRow}
          onPress={() => (questionnaireActive ? tryLeaveQuestionnaire("Landing") : setActiveTab("Landing"))}
        >
          <Text style={styles.brandIcon}>⌘</Text>
          <Text style={styles.brand}>FounderBrief</Text>
        </Pressable>
        <Pressable style={styles.avatar} onPress={() => tryLeaveQuestionnaire("Profile")} hitSlop={12}>
          <Text style={styles.avatarText}>{userProfile.name.charAt(0).toUpperCase()}</Text>
        </Pressable>
      </View>

      {backendOk === false && (
        <View style={styles.warn}>
          <Text style={styles.warnText}>
            Cannot reach server at {getApiBaseUrl()}. Ensure npm run dev is running and EXPO_PUBLIC_API_URL uses your PC IP.
          </Text>
        </View>
      )}

      {apiError ? (
        <View style={styles.error}>
          <Text style={styles.errorTitle}>Brief Generation Hindered</Text>
          <Text style={styles.errorText}>{apiError}</Text>
          <Pressable onPress={() => setApiError("")}>
            <Text style={styles.dismiss}>Dismiss</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.main}>{renderScreen()}</View>

      <View
        style={[
          styles.tabBar,
          {
            paddingBottom: Math.max(insets.bottom, 10),
            height: TAB_BAR_HEIGHT + Math.max(insets.bottom, 10),
          },
        ]}
      >
        {[
          {
            id: "home",
            label: "Home",
            active: isHomeTab,
            onPress: () =>
              questionnaireActive
                ? tryLeaveQuestionnaire(activeBrief ? "Result" : "Landing")
                : setActiveTab(activeBrief ? "Result" : "Landing"),
          },
          {
            id: "questions",
            label: "Questions",
            active: activeTab === "Questions",
            onPress: () =>
              questionnaireActive
                ? setActiveTab("Questions")
                : setActiveTab(idea ? "Questions" : "Input"),
          },
          {
            id: "briefs",
            label: "Briefs",
            active: activeTab === "History",
            onPress: () => tryLeaveQuestionnaire("History"),
          },
          {
            id: "profile",
            label: "Profile",
            active: activeTab === "Profile",
            onPress: () => tryLeaveQuestionnaire("Profile"),
          },
        ].map((tab) => (
          <Pressable key={tab.id} style={styles.tab} onPress={tab.onPress}>
            <Text style={[styles.tabIcon, tab.active && styles.tabActive]}>
              {tab.id === "home" ? "⌂" : tab.id === "questions" ? "?" : tab.id === "briefs" ? "📄" : "👤"}
            </Text>
            <Text style={[styles.tabLabel, tab.active && styles.tabActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>

      <Modal visible={isLoading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingTitle}>Generating your Blueprint...</Text>
          <Text style={styles.loadingStep}>{loadingStep}</Text>
          <Text style={styles.powered}>✦ Powered by Google Gemini</Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandIcon: { fontSize: 18, color: COLORS.text },
  brand: { fontSize: 20, fontWeight: "900", color: COLORS.text },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.text,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: COLORS.bg, fontWeight: "800", fontSize: 15 },
  warn: { backgroundColor: "#FEF3C7", padding: 10, marginHorizontal: 16, marginTop: 8, borderRadius: 8 },
  warnText: { fontSize: 11, color: "#92400E", lineHeight: 16 },
  error: {
    margin: 16,
    marginBottom: 0,
    padding: 14,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorTitle: { fontWeight: "800", fontSize: 12, color: "#B91C1C", marginBottom: 4 },
  errorText: { fontSize: 12, color: "#B91C1C" },
  dismiss: { fontSize: 10, fontWeight: "800", color: "#B91C1C", marginTop: 8 },
  main: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 6 },
  tabIcon: { fontSize: 18, color: COLORS.textMuted },
  tabLabel: { fontSize: 10, fontWeight: "600", color: COLORS.textMuted, marginTop: 2 },
  tabActive: { color: COLORS.accent, fontWeight: "800" },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(250,248,245,0.95)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingTitle: { fontSize: 18, fontWeight: "900", color: COLORS.text, marginTop: 20 },
  loadingStep: { fontSize: 12, color: COLORS.textMuted, textAlign: "center", marginTop: 10 },
  powered: { fontSize: 10, color: COLORS.textDim, marginTop: 40, fontWeight: "700" },
});

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, Keyboard, Linking, Platform, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/inter";

import { COLORS, SHADOW } from "./constants/theme";
import { getQuestions } from "./constants/questions";
import {
  Card,
  NavBar,
  ProgressBar,
  ScreenTransition,
  Toast,
  TransitionDirection,
  Txt,
  TYPE,
} from "./components/kit";
import HomeScreen, { AppNotification } from "./screens/HomeScreen";
import RecordScreen from "./screens/RecordScreen";
import QuestionsScreen from "./screens/QuestionsScreen";
import ResultScreen from "./screens/ResultScreen";
import LibraryScreen from "./screens/LibraryScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ReadPickScreen from "./screens/ReadPickScreen";
import VoiceSelectScreen from "./screens/VoiceSelectScreen";
import PlayerScreen from "./screens/PlayerScreen";

import {
  BriefApiResponse,
  CalibrationAnswer,
  DEFAULT_PREFERENCES,
  DOCUMENT_OUTPUT_TYPES,
  DocumentOutputType,
  ExportDocFormat,
  ProjectBrief,
  Screen,
  SessionDraft,
  SpokenLanguage,
  TabId,
  UserPreferences,
  UserProfile,
  VOICES,
  VoiceProfile,
} from "./types";
import { normalizeBrief } from "./utils/normalizeBrief";
import { buildApiAnswers, buildLocalFallbackBrief } from "./utils/fallbackBrief";
import { FREE_MONTHLY_LIMIT, countThisMonth } from "./utils/usage";
import { generateFounderBrief, getGenerationStatus, loginUser } from "./services/api";
import {
  loadBriefs,
  loadPreferences,
  loadProfile,
  loadRecentVoiceIds,
  loadSessionDraft,
  saveBriefs,
  savePreferences,
  saveProfile,
  saveRecentVoiceIds,
  saveSessionDraft,
} from "./services/storage";
import {
  initRevenueCat,
  presentRevenueCatPaywall,
  restoreRevenueCatPurchases,
} from "./services/revenuecat";

const PROFILE_PROMPTED_KEY = "founderbrief_profile_prompted_v1";

const LOADING_STEPS = [
  "Understanding your idea",
  "Writing each section",
  "Formatting your document",
];

const EMPTY_PROFILE: UserProfile = { name: "", email: "", isLoggedIn: false };

interface Reading {
  title: string;
  text: string;
  /** Library document this text came from, if any. */
  sourceId?: string;
}

interface NavState {
  screen: Screen;
  stack: Screen[];
  dir: TransitionDirection;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  return (
    <SafeAreaProvider>
      {fontsLoaded ? <AppShell /> : <View style={{ flex: 1, backgroundColor: COLORS.bg }} />}
    </SafeAreaProvider>
  );
}

function apiToProjectBrief(
  data: BriefApiResponse,
  idea: string,
  answers: ProjectBrief["answers"],
  documentType: DocumentOutputType,
  spokenLanguage: SpokenLanguage
): ProjectBrief {
  return normalizeBrief({
    id: `spec-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    originalIdea: idea,
    answers,
    documentType: data.documentType ?? documentType,
    spokenLanguage: data.spokenLanguage ?? spokenLanguage,
    direction: "voice-to-doc",
  });
}

function titleFromText(text: string): string {
  const words = text.trim().split(/\s+/);
  const head = words.slice(0, 6).join(" ");
  return words.length > 6 ? `${head}…` : head || "Pasted text";
}

function AppShell() {
  const insets = useSafeAreaInsets();

  /* ---------------- navigation ---------------- */
  const [nav, setNav] = useState<NavState>({ screen: "Home", stack: [], dir: "tab" });
  const navRef = useRef(nav);
  navRef.current = nav;
  const { screen } = nav;

  const navigate = useCallback(
    (next: Screen) =>
      setNav((n) => ({ screen: next, stack: [...n.stack, n.screen], dir: "forward" })),
    []
  );
  const resetTo = useCallback(
    (next: Screen, stack: Screen[] = [], dir: TransitionDirection = "tab") =>
      setNav({ screen: next, stack, dir }),
    []
  );
  const goBack = useCallback(
    () =>
      setNav((n) =>
        n.stack.length
          ? { screen: n.stack[n.stack.length - 1], stack: n.stack.slice(0, -1), dir: "back" }
          : { screen: "Home", stack: [], dir: "back" }
      ),
    []
  );

  const goTab = useCallback(
    (tab: TabId) => {
      switch (tab) {
        case "Home":
          return resetTo("Home");
        case "Record":
          return resetTo("Record", ["Home"]);
        case "ReadAloud":
          return resetTo("ReadPick", ["Home"]);
        case "Library":
          return resetTo("Library", ["Home"]);
        case "Profile":
          return resetTo("Profile", ["Home"]);
      }
    },
    [resetTo]
  );

  /* ---------------- data ---------------- */
  const [briefs, setBriefs] = useState<ProjectBrief[]>([]);
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [recentVoiceIds, setRecentVoiceIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [promptedProfile, setPromptedProfile] = useState(true);

  /* ---------------- idea / questions ---------------- */
  const [messages, setMessages] = useState<string[]>([]);
  const [docType, setDocType] = useState<DocumentOutputType>("PRD");
  const [language, setLanguage] = useState<SpokenLanguage>("English");
  const [answers, setAnswers] = useState<string[]>([]);
  const [questionsKey, setQuestionsKey] = useState(0);
  const [draftSaved, setDraftSaved] = useState(false);

  /* ---------------- result / reading ---------------- */
  const [activeBrief, setActiveBrief] = useState<ProjectBrief | null>(null);
  const [resultFrom, setResultFrom] = useState<"generate" | "library">("library");
  const [reading, setReading] = useState<Reading | null>(null);
  const [voice, setVoice] = useState<VoiceProfile | null>(null);
  const [rate, setRate] = useState(1);
  const [voiceMode, setVoiceMode] = useState<"read" | "default">("read");
  const [voiceSelectKey, setVoiceSelectKey] = useState(0);

  /* ---------------- ui ---------------- */
  const [toast, setToast] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const isPro = Boolean(profile.isPro || profile.isAdmin);
  const documentsThisMonth = useMemo(
    () => countThisMonth(briefs.filter((b) => b.direction === "voice-to-doc")),
    [briefs]
  );
  const idea = messages.join("\n\n");

  const updateProfile = useCallback((updater: (p: UserProfile) => UserProfile) => {
    setProfile((prev) => {
      const next = updater(prev);
      saveProfile(next.name || next.email || next.isLoggedIn || next.isPro ? next : null);
      return next;
    });
  }, []);

  /* ---------------- startup ---------------- */
  useEffect(() => {
    (async () => {
      const [storedBriefs, storedProfile, storedPrefs, recents, draft, prompted] = await Promise.all([
        loadBriefs(),
        loadProfile(),
        loadPreferences(),
        loadRecentVoiceIds(),
        loadSessionDraft(),
        AsyncStorage.getItem(PROFILE_PROMPTED_KEY),
      ]);
      setBriefs(storedBriefs);
      if (storedProfile) setProfile(storedProfile);
      setPrefs(storedPrefs);
      setLanguage(storedPrefs.language);
      setRecentVoiceIds(recents);
      setPromptedProfile(prompted === "1");

      if (draft?.inProgress && draft.idea) {
        setMessages([draft.idea]);
        setAnswers(draft.calibrationAnswers ?? []);
        if (draft.documentType) setDocType(draft.documentType);
        if (draft.spokenLanguage) setLanguage(draft.spokenLanguage);
        setDraftSaved(true);
      }
      setHydrated(true);

      initRevenueCat((hasPro) => {
        updateProfile((prev) => (prev.isAdmin ? prev : { ...prev, isPro: hasPro }));
      }).catch(() => undefined);
    })();
  }, [updateProfile]);

  /* keyboard + hardware back */
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const hide = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () =>
      setKeyboardVisible(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      const n = navRef.current;
      if (n.screen === "Home" && n.stack.length === 0) return false;
      goBack();
      return true;
    });
    return () => sub.remove();
  }, [goBack]);

  /* ---------------- helpers ---------------- */
  const syncBriefs = useCallback(async (list: ProjectBrief[]) => {
    setBriefs(list);
    await saveBriefs(list);
  }, []);

  const changePrefs = useCallback((next: UserPreferences) => {
    setPrefs(next);
    savePreferences(next);
  }, []);

  const launchPaywall = useCallback(async (): Promise<boolean> => {
    const result = await presentRevenueCatPaywall();
    if (result.purchased || result.restored) {
      updateProfile((p) => ({ ...p, isPro: true }));
      setToast("Welcome to Pro. Everything is unlocked.");
      return true;
    }
    if (!result.nativePaywallShown) {
      setToast("Upgrades are available in the installed Android or iOS app.");
    }
    return false;
  }, [updateProfile]);

  const persistDraft = useCallback(
    async (draftAnswers: string[], inProgress = true) => {
      if (!inProgress) {
        await saveSessionDraft(null);
        setDraftSaved(false);
        return;
      }
      const draft: SessionDraft = {
        idea,
        calibrationAnswers: draftAnswers,
        step: draftAnswers.length,
        inProgress: true,
        documentType: docType,
        spokenLanguage: language,
        updatedAt: new Date().toISOString(),
      };
      await saveSessionDraft(draft);
      setDraftSaved(true);
    },
    [idea, docType, language]
  );

  /* ---------------- generation ---------------- */
  const runGeneration = async (calibration: CalibrationAnswer[]) => {
    if (isLoading) return;
    const ideaText = idea.trim();
    if (!ideaText) {
      setToast("Describe your idea first.");
      return;
    }

    setIsLoading(true);
    setLoadingStep(0);
    const interval = setInterval(() => setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 1400);

    try {
      if (!isPro && documentsThisMonth >= FREE_MONTHLY_LIMIT) {
        let allowed = false;
        try {
          const status = await getGenerationStatus(profile.authToken);
          allowed = status.isAdmin || status.remaining === null || (status.remaining ?? 0) > 0;
        } catch {
          allowed = false;
        }
        if (!allowed) {
          const purchased = await launchPaywall();
          if (!purchased) {
            setToast(`You've used all ${FREE_MONTHLY_LIMIT} free documents this month. Upgrade to Pro for unlimited.`);
            return;
          }
        }
      }

      const apiAnswers = buildApiAnswers(docType, calibration);
      let data: BriefApiResponse;
      let offline = false;
      try {
        data = await generateFounderBrief(ideaText, apiAnswers, {
          authToken: profile.authToken,
          documentType: docType,
          spokenLanguage: language,
        });
      } catch {
        offline = true;
        data = buildLocalFallbackBrief(ideaText, apiAnswers, docType, language);
      }

      const generated = apiToProjectBrief(data, ideaText, apiAnswers, docType, language);
      await syncBriefs([generated, ...briefs]);
      await persistDraft([], false);
      setActiveBrief(generated);
      setResultFrom("generate");
      setMessages([]);
      setAnswers([]);
      setQuestionsKey((k) => k + 1);
      resetTo("Result", ["Home"], "forward");
      if (offline) {
        setToast("Couldn't reach the server, so this document was built on your device.");
      }
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Generation failed. Please try again.");
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  const toCalibration = (list: string[]): CalibrationAnswer[] => {
    const qs = getQuestions(docType);
    return list
      .map((a, i) => ({ question: qs[i], answer: a.trim() }))
      .filter((x) => x.question && x.answer);
  };

  /* ---------------- reading ---------------- */
  const openReadFlow = (next: Reading, fallbackLanguage?: SpokenLanguage) => {
    setReading(next);
    setVoiceMode("read");
    setVoiceSelectKey((k) => k + 1);
    if (fallbackLanguage) setLanguage((l) => l);
    navigate("VoiceSelect");
  };

  const confirmVoice = (picked: VoiceProfile) => {
    if (voiceMode === "default") {
      changePrefs({ ...prefs, voiceId: picked.id, language: picked.language });
      setToast(`${picked.name} is now your default voice.`);
      goBack();
      return;
    }
    const ids = [picked.id, ...recentVoiceIds.filter((id) => id !== picked.id)].slice(0, 3);
    setRecentVoiceIds(ids);
    saveRecentVoiceIds(ids);
    changePrefs({ ...prefs, voiceId: picked.id });
    setVoice(picked);
    navigate("Player");
  };

  const saveAudio = async (durationSec: number) => {
    if (!reading || !voice) return;
    const exists = briefs.some(
      (b) =>
        b.direction === "doc-to-voice" &&
        b.title === reading.title &&
        b.voiceId === voice.id &&
        b.documentMarkdown === `# ${reading.title}\n\n${reading.text}`
    );
    if (exists) {
      setToast("Already saved in your Library.");
      return;
    }
    const item = normalizeBrief({
      id: `audio-${Date.now()}`,
      title: reading.title,
      tldr: reading.text.slice(0, 220),
      description: reading.text,
      originalIdea: reading.text,
      documentMarkdown: `# ${reading.title}\n\n${reading.text}`,
      documentType: "Generic Brief",
      direction: "doc-to-voice",
      spokenLanguage: voice.language,
      voiceId: voice.id,
      playbackSpeed: rate,
      audioFormat: prefs.audioFormat,
      durationSec,
      createdAt: new Date().toISOString(),
    });
    await syncBriefs([item, ...briefs]);
    setToast("Saved to your Library.");
  };

  /* ---------------- library ---------------- */
  const openLibraryItem = (b: ProjectBrief) => {
    if (b.direction === "doc-to-voice") {
      const savedVoice = VOICES.find((v) => v.id === b.voiceId) ?? VOICES.find((v) => v.language === b.spokenLanguage);
      if (!savedVoice) {
        setToast("This voice isn't available anymore.");
        return;
      }
      setReading({
        title: b.title,
        text: b.documentMarkdown.replace(/^#\s.*\n+/, ""),
      });
      setVoice(savedVoice);
      setRate(b.playbackSpeed ?? 1);
      navigate("Player");
      return;
    }
    setActiveBrief(b);
    setResultFrom("library");
    navigate("Result");
  };

  const readLibraryDoc = (b: ProjectBrief) => {
    openReadFlow({ title: b.title, text: b.documentMarkdown, sourceId: b.id });
  };

  const deleteBrief = async (b: ProjectBrief) => {
    await syncBriefs(briefs.filter((x) => x.id !== b.id));
    if (activeBrief?.id === b.id) setActiveBrief(null);
    setToast("Deleted from your Library.");
  };

  /* ---------------- profile ---------------- */
  const markPrompted = useCallback(() => {
    setPromptedProfile(true);
    AsyncStorage.setItem(PROFILE_PROMPTED_KEY, "1");
  }, []);

  const saveProfileDetails = (name: string, email: string) => {
    updateProfile((p) => ({ ...p, name, email }));
    markPrompted();
  };

  const signIn = async (email: string, password: string) => {
    const res = await loginUser(email, password);
    updateProfile((p) => ({
      ...p,
      name: res.name || p.name,
      email: res.email,
      isLoggedIn: true,
      isAdmin: res.isAdmin,
      isPro: res.isAdmin ? true : p.isPro,
      authToken: res.token,
    }));
    markPrompted();
    setToast(res.isAdmin ? "Signed in as admin." : "Signed in.");
  };

  const logout = () => {
    updateProfile((p) => ({
      name: p.name,
      email: p.email,
      avatarUrl: p.avatarUrl,
      isLoggedIn: false,
      isPro: p.isAdmin ? false : p.isPro,
    }));
    setToast("Logged out.");
  };

  const restorePurchases = async () => {
    const res = await restoreRevenueCatPurchases();
    if (res.isPro) {
      updateProfile((p) => ({ ...p, isPro: true }));
      setToast("Pro restored.");
    } else if (!res.nativeSupported) {
      setToast("Restoring purchases works in the installed Android or iOS app.");
    } else {
      setToast(res.errorMessage ?? "No active subscription found for this account.");
    }
  };

  const manageSubscription = () => {
    const url =
      Platform.OS === "ios"
        ? "https://apps.apple.com/account/subscriptions"
        : "https://play.google.com/store/account/subscriptions";
    Linking.openURL(url).catch(() => setToast("Couldn't open subscription settings."));
  };

  const clearAllData = async () => {
    await Promise.all([
      saveBriefs([]),
      saveProfile(null),
      savePreferences(DEFAULT_PREFERENCES),
      saveRecentVoiceIds([]),
      saveSessionDraft(null),
      AsyncStorage.removeItem(PROFILE_PROMPTED_KEY),
    ]);
    setBriefs([]);
    setProfile(EMPTY_PROFILE);
    setPrefs(DEFAULT_PREFERENCES);
    setLanguage(DEFAULT_PREFERENCES.language);
    setRecentVoiceIds([]);
    setMessages([]);
    setAnswers([]);
    setDraftSaved(false);
    setPromptedProfile(false);
    setToast("Local data cleared.");
    resetTo("Home");
  };

  /* ---------------- notifications ---------------- */
  const notifications: AppNotification[] = [];
  if (draftSaved && messages.length > 0) {
    const typeLabel = DOCUMENT_OUTPUT_TYPES.find((d) => d.id === docType)?.barLabel ?? "document";
    notifications.push({
      id: "draft",
      title: `Resume your ${typeLabel}`,
      subtitle: `${answers.length} of ${getQuestions(docType).length} questions answered`,
      onPress: () => resetTo("Questions", ["Home", "Record"], "forward"),
    });
  }
  if (!isPro && documentsThisMonth >= FREE_MONTHLY_LIMIT - 1) {
    notifications.push({
      id: "usage",
      title:
        documentsThisMonth >= FREE_MONTHLY_LIMIT
          ? "Free documents used up"
          : "One free document left",
      subtitle: `${documentsThisMonth} of ${FREE_MONTHLY_LIMIT} used this month`,
      onPress: () => goTab("Profile"),
    });
  }

  /* ---------------- render ---------------- */
  const activeTab: TabId = (() => {
    switch (screen) {
      case "Home":
        return "Home";
      case "Record":
      case "Questions":
        return "Record";
      case "Result":
        return resultFrom === "generate" ? "Record" : "Library";
      case "ReadPick":
      case "Player":
        return "ReadAloud";
      case "VoiceSelect":
        return voiceMode === "default" ? "Profile" : "ReadAloud";
      case "Library":
        return "Library";
      case "Profile":
        return "Profile";
    }
  })();

  const showNav = screen !== "Questions" && !keyboardVisible;

  const renderScreen = () => {
    switch (screen) {
      case "Home":
        return (
          <HomeScreen
            name={profile.name}
            notifications={notifications}
            needsProfile={hydrated && !promptedProfile && !profile.name}
            onSaveProfile={saveProfileDetails}
            onSkipProfile={markPrompted}
            onNavigate={goTab}
          />
        );

      case "Record":
        return (
          <RecordScreen
            messages={messages}
            docType={docType}
            language={language}
            onChangeDocType={setDocType}
            onChangeLanguage={setLanguage}
            onAddMessage={(t) => setMessages((m) => [...m, t])}
            onClear={() => {
              setMessages([]);
              setAnswers([]);
              persistDraft([], false);
            }}
            onCreateNow={() => runGeneration([])}
            onAnswerQuestions={() => {
              setAnswers([]);
              setQuestionsKey((k) => k + 1);
              persistDraft([]);
              navigate("Questions");
            }}
            onBack={goBack}
          />
        );

      case "Questions":
        return (
          <QuestionsScreen
            key={questionsKey}
            docType={docType}
            initialAnswers={answers}
            onProgress={(a) => {
              setAnswers(a);
              persistDraft(a);
            }}
            onFinish={(a) => runGeneration(toCalibration(a))}
            onGenerateNow={(a) => runGeneration(toCalibration(a))}
            onRestart={() => {
              setAnswers([]);
              setQuestionsKey((k) => k + 1);
              persistDraft([]);
            }}
            onBack={goBack}
            onNotice={setToast}
          />
        );

      case "Result":
        return activeBrief ? (
          <ResultScreen
            key={activeBrief.id}
            brief={activeBrief}
            defaultFormat={prefs.docFormat}
            onExported={(format: ExportDocFormat) => {
              if (format !== prefs.docFormat) changePrefs({ ...prefs, docFormat: format });
            }}
            onReadAloud={() =>
              openReadFlow({
                title: activeBrief.title,
                text: activeBrief.documentMarkdown,
                sourceId: activeBrief.id,
              })
            }
            onDelete={async () => {
              await deleteBrief(activeBrief);
              goBack();
            }}
            onBack={goBack}
            onNotice={setToast}
          />
        ) : null;

      case "ReadPick":
        return (
          <ReadPickScreen
            briefs={briefs}
            onBack={goBack}
            onChoose={(title, text, source) => {
              if (source) setLanguage(source.spokenLanguage);
              openReadFlow({
                title: title === "Pasted text" ? titleFromText(text) : title,
                text,
                sourceId: source?.id,
              });
            }}
          />
        );

      case "VoiceSelect":
        return (
          <VoiceSelectScreen
            key={voiceSelectKey}
            isPro={isPro}
            initialLanguage={VOICES.find((v) => v.id === prefs.voiceId)?.language ?? language}
            selectedId={prefs.voiceId}
            recentIds={recentVoiceIds}
            onConfirm={confirmVoice}
            onClose={goBack}
            onUpgrade={() => {
              launchPaywall();
            }}
          />
        );

      case "Player":
        return reading && voice ? (
          <PlayerScreen
            key={`${reading.title}-${voice.id}`}
            title={reading.title}
            text={reading.text}
            voice={voice}
            rate={rate}
            onRateChange={setRate}
            onSave={saveAudio}
            onBack={goBack}
          />
        ) : null;

      case "Library":
        return (
          <LibraryScreen
            briefs={briefs}
            onOpen={openLibraryItem}
            onReadAloud={readLibraryDoc}
            onDelete={deleteBrief}
            onRecord={() => goTab("Record")}
          />
        );

      case "Profile":
        return (
          <ProfileScreen
            profile={profile}
            isPro={isPro}
            usage={{ used: documentsThisMonth, limit: isPro ? null : FREE_MONTHLY_LIMIT }}
            prefs={prefs}
            onPrefsChange={(next) => {
              changePrefs(next);
              setLanguage(next.language);
            }}
            onSaveProfile={saveProfileDetails}
            onSignIn={signIn}
            onLogout={logout}
            onUpgrade={() => {
              launchPaywall();
            }}
            onManageSubscription={manageSubscription}
            onRestore={restorePurchases}
            onOpenVoiceSettings={() => {
              setVoiceMode("default");
              setVoiceSelectKey((k) => k + 1);
              navigate("VoiceSelect");
            }}
            onClearData={clearAllData}
            onToggleSandboxPro={
              __DEV__ && !profile.isAdmin
                ? () => updateProfile((p) => ({ ...p, isPro: !p.isPro }))
                : undefined
            }
          />
        );
    }
  };

  const typeLabel = DOCUMENT_OUTPUT_TYPES.find((d) => d.id === docType)?.barLabel ?? "document";

  return (
    <View style={styles.root}>
      <StatusBar hidden={screen !== "Home"} style="dark" />

      <View
        style={{
          flex: 1,
          paddingBottom: showNav || keyboardVisible ? 0 : Math.max(insets.bottom, 10),
        }}
      >
        <ScreenTransition triggerKey={screen} direction={nav.dir}>
          {renderScreen()}
        </ScreenTransition>

        {isLoading ? (
          <View style={styles.loadingOverlay} pointerEvents="auto">
            <Card style={styles.loadingCard}>
              <ActivityIndicator color={COLORS.ink} />
              <Txt style={[TYPE.title, { marginTop: 16, textAlign: "center" }]}>
                {`Creating your ${typeLabel}`}
              </Txt>
              <Txt style={[TYPE.body, { color: COLORS.inkMuted, marginTop: 6, textAlign: "center" }]}>
                {LOADING_STEPS[loadingStep]}
              </Txt>
              <ProgressBar
                progress={(loadingStep + 1) / LOADING_STEPS.length}
                height={10}
                style={{ alignSelf: "stretch", marginTop: 18 }}
              />
            </Card>
          </View>
        ) : null}
      </View>

      {showNav ? (
        <NavBar
          active={activeTab}
          bottomInset={insets.bottom}
          onSelect={(tab) => {
            if (!isLoading) goTab(tab);
          }}
        />
      ) : null}

      <Toast message={toast} onClose={() => setToast("")} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.scrim,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  loadingCard: { alignSelf: "stretch", alignItems: "center", paddingVertical: 28, ...SHADOW },
});

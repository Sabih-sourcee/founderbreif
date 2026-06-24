import React, { useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, BackHandler } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BriefAnswers,
  COLOR_THEME_OPTIONS,
  DEFAULT_ANSWERS,
  FONT_OPTIONS,
  GRID_OPTIONS,
} from "../types";
import { COLORS } from "../constants/theme";

interface Props {
  initialAnswers?: BriefAnswers;
  initialStep?: number;
  onFinish: (answers: BriefAnswers) => void;
  onProgress: (answers: BriefAnswers, step: number) => void;
}

const QUESTIONS = [
  {
    field: "platform" as const,
    detailField: "platformDetails" as const,
    prompt: "What platforms are you prioritizing for your initial launch?",
    options: ["Android", "iPhone", "Both"],
    labels: ["Android Only", "iPhone Only", "Cross-Platform"],
    placeholder: "e.g., Offline mode, real-time sync...",
    kind: "standard" as const,
  },
  {
    field: "auth" as const,
    detailField: "authDetails" as const,
    prompt: "How will your target users log in and register profiles?",
    options: ["Email & Password", "Social Accounts", "No authentication"],
    labels: ["Email / Pass", "Social OAuth", "No Auth Needed"],
    placeholder: "e.g., MFA, passwordless...",
    kind: "standard" as const,
  },
  {
    field: "integrations" as const,
    detailField: "integrationsDetails" as const,
    prompt: "Are there third-party tools or external APIs to link up?",
    options: ["Payments", "Maps & Location", "AI or Messaging"],
    labels: ["Payments", "Maps API", "GenAI / Chat"],
    placeholder: "e.g., Stripe, Google Maps...",
    kind: "standard" as const,
  },
  {
    field: "gridSystem" as const,
    prompt: "Pick a grid system for your app's layout structure.",
    options: GRID_OPTIONS,
    labels: ["3×3 Grid", "3×4 Grid", "1×2 Split"],
    kind: "grid" as const,
  },
  {
    field: "fontStyle" as const,
    prompt: "Choose a font style that matches your app personality.",
    options: FONT_OPTIONS,
    labels: ["Modern Sans", "Editorial Serif", "Playful Rounded"],
    kind: "font" as const,
  },
  {
    field: "colorTheme" as const,
    prompt: "Select a color theme for your brand feel.",
    options: COLOR_THEME_OPTIONS,
    labels: ["Warm Minimal", "Dark Pro", "Bold Startup"],
    kind: "color" as const,
  },
  {
    field: "timeline" as const,
    detailField: "timelineDetails" as const,
    prompt: "What timeline is targeted for your MVP release?",
    options: ["Sprints MVP (1-2 months)", "Full Release (3-6 months)", "Enterprise Scale (6+ months)"],
    labels: ["MVP (1-2 mo)", "Core (3-6 mo)", "Scale (6+ mo)"],
    placeholder: "e.g., investor demo date...",
    kind: "standard" as const,
  },
];

export default function QuestionsScreen({ initialAnswers, initialStep = 0, onFinish, onProgress }: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = React.useState(initialStep);
  const [answers, setAnswers] = React.useState<BriefAnswers>(initialAnswers ?? DEFAULT_ANSWERS);

  const q = QUESTIONS[step];
  const pct = Math.round(((step + 1) / QUESTIONS.length) * 100);
  const selected = answers[q.field] as string;
  const detailField = "detailField" in q ? q.detailField : null;
  const detail = detailField ? (answers[detailField] as string) : "";

  useEffect(() => {
    onProgress(answers, step);
  }, [answers, step]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (step > 0) {
        setStep((s) => s - 1);
        return true;
      }
      Alert.alert(
        "Complete your brief",
        "Please finish the questionnaire to generate your project brief. Your progress is saved on this device.",
        [{ text: "Continue", style: "default" }]
      );
      return true;
    });
    return () => sub.remove();
  }, [step]);

  const next = () => {
    if (step < QUESTIONS.length - 1) setStep((s) => s + 1);
    else onFinish(answers);
  };

  const showDetail = q.kind === "standard" && detailField;

  return (
    <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 100 + insets.bottom }]} keyboardShouldPersistTaps="handled">
      <View style={styles.lockBanner}>
        <Text style={styles.lockText}>🔒 Questionnaire in progress — progress saved on device</Text>
      </View>

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>
          Question {step + 1} of {QUESTIONS.length}
        </Text>
        <Text style={styles.progressPct}>{pct}% Complete</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>

      <Text style={styles.title}>Let's clarify your project details.</Text>
      <Text style={styles.sub}>{q.prompt}</Text>

      <View style={styles.options}>
        {q.options.map((opt, i) => (
          <Pressable
            key={opt}
            style={[styles.option, selected === opt && styles.optionActive]}
            onPress={() => setAnswers((a) => ({ ...a, [q.field]: opt }))}
          >
            <Text style={[styles.optionText, selected === opt && styles.optionTextActive]}>{q.labels[i]}</Text>
            {q.kind === "grid" && (
              <Text style={[styles.optionHint, selected === opt && styles.optionHintActive]}>{opt} layout</Text>
            )}
          </Pressable>
        ))}
      </View>

      {showDetail && (
        <>
          <Text style={styles.detailLabel}>Any specific technical requirements or details?</Text>
          <TextInput
            style={styles.detailInput}
            value={detail}
            onChangeText={(t) => detailField && setAnswers((a) => ({ ...a, [detailField]: t }))}
            placeholder={q.placeholder}
            placeholderTextColor={COLORS.textDim}
            multiline
            textAlignVertical="top"
          />
        </>
      )}

      <Pressable style={styles.nextBtn} onPress={next}>
        <Text style={styles.nextText}>
          {step === QUESTIONS.length - 1 ? "Generate Project Brief" : "Continue"} →
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  lockBanner: {
    backgroundColor: "#FEF3C7",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  lockText: { fontSize: 11, fontWeight: "700", color: "#92400E", textAlign: "center" },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressLabel: { fontSize: 11, fontWeight: "800", color: COLORS.textMuted, textTransform: "uppercase" },
  progressPct: { fontSize: 11, fontWeight: "900", color: COLORS.accent },
  progressBar: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginBottom: 24, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: COLORS.accent },
  title: { fontSize: 22, fontWeight: "900", color: COLORS.text, marginBottom: 6 },
  sub: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20, marginBottom: 20 },
  options: { gap: 10, marginBottom: 20 },
  option: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: "center",
  },
  optionActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  optionText: { fontSize: 12, fontWeight: "800", color: COLORS.text },
  optionTextActive: { color: COLORS.bg },
  optionHint: { fontSize: 10, color: COLORS.textDim, marginTop: 4 },
  optionHintActive: { color: "#ccc" },
  detailLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  detailInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    minHeight: 80,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 24,
  },
  nextBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  nextText: { color: COLORS.bg, fontWeight: "800", fontSize: 14 },
});

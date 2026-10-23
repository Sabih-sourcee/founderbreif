import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { COLORS, FONTS } from "../constants/theme";
import { getQuestions } from "../constants/questions";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { transcribeVoiceRecording } from "../services/api";
import {
  AccentCircle,
  ActionSheet,
  ChatBubble,
  Composer,
  Ionicons,
  ProgressBar,
  ScreenFrame,
  TopBar,
  Txt,
  TYPE,
} from "../components/kit";
import { DocumentOutputType } from "../types";

interface Props {
  docType: DocumentOutputType;
  initialAnswers: string[];
  onProgress: (answers: string[]) => void;
  /** Called with all answers once the last question is answered. */
  onFinish: (answers: string[]) => void;
  /** Generate with whatever has been answered so far. */
  onGenerateNow: (answers: string[]) => void;
  onRestart: () => void;
  onBack: () => void;
  onNotice: (message: string) => void;
}

/** Calibration Questions — full height, no navbar. */
export default function QuestionsScreen({
  docType,
  initialAnswers,
  onProgress,
  onFinish,
  onGenerateNow,
  onRestart,
  onBack,
  onNotice,
}: Props) {
  const questions = getQuestions(docType);
  const total = questions.length;
  const [answers, setAnswers] = useState<string[]>(() => initialAnswers.slice(0, total));
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const rec = useVoiceRecorder();
  const scroller = useRef<ScrollView>(null);

  const step = Math.min(answers.length, total - 1);

  useEffect(() => {
    const t = setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [answers.length]);

  const commit = (value: string) => {
    const next = [...answers, value];
    setAnswers(next);
    setDraft("");
    onProgress(next);
    if (next.length >= total) onFinish(next);
  };

  const submit = () => {
    const text = draft.trim();
    if (!text || transcribing) return;
    commit(text);
  };

  const toggleMic = async () => {
    if (transcribing) return;
    if (rec.phase !== "idle") {
      const uri = await rec.stop();
      if (!uri) return;
      setTranscribing(true);
      try {
        const text = (await transcribeVoiceRecording(uri)).trim();
        if (text) setDraft((d) => (d ? `${d} ${text}` : text));
        else onNotice("We couldn't hear any speech. Try again or type your answer.");
      } catch (e) {
        const message = e instanceof Error ? e.message : "";
        onNotice(
          message && message.length < 140
            ? message
            : "Couldn't transcribe that. Check your connection or type your answer."
        );
      } finally {
        setTranscribing(false);
      }
      return;
    }
    const res = await rec.start();
    if (!res.ok) onNotice(res.error ?? "Couldn't start recording.");
  };

  const answered = answers.length;
  const done = answered >= total;
  const shownQuestions = questions.slice(0, Math.min(answered + 1, total));
  const progress = Math.min(total, answered + 1) / total;
  const recording = rec.phase !== "idle";

  return (
    <ScreenFrame>
      <TopBar
        title="Calibration Questions"
        left="back"
        onLeft={onBack}
        rightIcon="ellipsis-horizontal"
        onRight={() => setMenuOpen(true)}
      />

      <Txt style={styles.stepLabel}>{`Question ${step + 1} of ${total}`}</Txt>
      <ProgressBar progress={progress} height={10} style={{ marginHorizontal: 4, marginBottom: 14 }} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
      >
        <ScrollView
          ref={scroller}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 14 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {shownQuestions.map((q, i) => (
            <View key={q}>
              <ChatBubble variant="ai" text={q} />
              {i < answered ? (
                <ChatBubble variant="user" text={answers[i] ? answers[i] : "Skipped"} />
              ) : null}
            </View>
          ))}
        </ScrollView>

        <View style={styles.composerWrap}>
          <Composer
            value={draft}
            onChangeText={setDraft}
            placeholder={
              transcribing
                ? "Transcribing…"
                : recording
                  ? "Listening… tap to finish"
                  : "Type or speak your answer…"
            }
            editable={!recording && !transcribing && !done}
            onSubmit={submit}
            trailing={
              draft.trim() && !recording ? (
                <AccentCircle onPress={submit} accessibilityLabel="Send answer">
                  <Ionicons name="arrow-up" size={22} color={COLORS.ink} />
                </AccentCircle>
              ) : (
                <AccentCircle
                  onPress={toggleMic}
                  dark={recording}
                  accessibilityLabel={recording ? "Stop recording" : "Record answer"}
                >
                  <Ionicons
                    name={recording ? "stop" : "mic"}
                    size={22}
                    color={recording ? COLORS.white : COLORS.ink}
                  />
                </AccentCircle>
              )
            }
          />
        </View>
      </KeyboardAvoidingView>

      <ActionSheet
        visible={menuOpen}
        title="Calibration"
        onClose={() => setMenuOpen(false)}
        options={[
          {
            label: "Skip this question",
            icon: "play-skip-forward-outline",
            onPress: () => commit(""),
          },
          {
            label: "Generate now with what I have",
            icon: "flash-outline",
            onPress: () => onGenerateNow(answers),
          },
          { label: "Start over", icon: "refresh-outline", onPress: onRestart },
        ]}
      />
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  stepLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.inkMuted,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 10,
  },
  composerWrap: { paddingTop: 8, paddingBottom: 14 },
});

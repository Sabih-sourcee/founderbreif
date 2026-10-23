import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { COLORS, FONTS, SHADOW } from "../constants/theme";
import VoiceNoteSheet from "../components/VoiceNoteSheet";
import {
  AccentCircle,
  ActionSheet,
  Button,
  ChatBubble,
  Composer,
  DayPill,
  FilterChip,
  Ionicons,
  ScreenFrame,
  Tap,
  TopBar,
  TYPE,
  Txt,
} from "../components/kit";
import { TourAnchor } from "../components/Tour";
import {
  DOCUMENT_OUTPUT_TYPES,
  DocumentOutputType,
  SPOKEN_LANGUAGES,
  SpokenLanguage,
} from "../types";
import { CALIBRATION_QUESTIONS } from "../constants/questions";

interface Props {
  messages: string[];
  docType: DocumentOutputType;
  language: SpokenLanguage;
  onChangeDocType: (t: DocumentOutputType) => void;
  onChangeLanguage: (l: SpokenLanguage) => void;
  onAddMessage: (text: string) => void;
  onClear: () => void;
  onCreateNow: () => void;
  onAnswerQuestions: () => void;
  onBack: () => void;
}

export default function RecordScreen({
  messages,
  docType,
  language,
  onChangeDocType,
  onChangeLanguage,
  onAddMessage,
  onClear,
  onCreateNow,
  onAnswerQuestions,
  onBack,
}: Props) {
  const [draft, setDraft] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const scroller = useRef<ScrollView>(null);

  useEffect(() => {
    const t = setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [messages.length]);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onAddMessage(text);
    setDraft("");
  };

  const hasIdea = messages.length > 0;
  const questionCount = CALIBRATION_QUESTIONS[docType].length;

  return (
    <ScreenFrame>
      <TopBar
        title="Describe Your Idea"
        left="back"
        onLeft={onBack}
        rightIcon="ellipsis-horizontal"
        onRight={() => setMenuOpen(true)}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
      >
        <ScrollView
          ref={scroller}
          style={{ flex: 1 }}
          contentContainerStyle={styles.thread}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <DayPill label="today" />

          <ChatBubble
            variant="ai"
            text="Tell me about your idea. Speak or type it, as much or as little as you like."
          />

          {messages.map((m, i) => (
            <ChatBubble key={`${i}-${m.slice(0, 12)}`} variant="user" text={m} />
          ))}

          {!hasIdea ? (
            <View style={styles.micBlock}>
              <TourAnchor id="record.mic">
                <Tap
                  onPress={() => setVoiceOpen(true)}
                  scaleTo={0.94}
                  style={styles.bigMic}
                  accessibilityLabel="Start voice note"
                >
                  <Ionicons name="mic" size={56} color={COLORS.ink} />
                </Tap>
              </TourAnchor>
              <Txt style={[TYPE.body, { color: COLORS.inkMuted, marginTop: 16, textAlign: "center" }]}>
                Tap the mic to start talking
              </Txt>
            </View>
          ) : (
            <>
              <View style={styles.options}>
                <Txt style={styles.optionsTitle}>What should I create?</Txt>

                <Txt style={styles.groupLabel}>Language</Txt>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chips}
                >
                  {SPOKEN_LANGUAGES.map((l) => (
                    <FilterChip
                      small
                      key={l.id}
                      label={l.label}
                      active={language === l.id}
                      onPress={() => onChangeLanguage(l.id)}
                    />
                  ))}
                </ScrollView>

                <Txt style={styles.groupLabel}>Document</Txt>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chips}
                >
                  {DOCUMENT_OUTPUT_TYPES.map((d) => (
                    <FilterChip
                      small
                      key={d.id}
                      label={d.shortLabel}
                      active={docType === d.id}
                      onPress={() => onChangeDocType(d.id)}
                    />
                  ))}
                </ScrollView>
              </View>

              <Button
                label={`Answer ${questionCount} quick questions`}
                onPress={onAnswerQuestions}
                style={{ marginTop: 18 }}
              />
              <Tap onPress={onCreateNow} style={styles.skip} accessibilityLabel="Skip questions and create now">
                <Txt style={styles.skipText}>Skip and create now</Txt>
              </Tap>
            </>
          )}
        </ScrollView>

        <TourAnchor id="record.composer">
          <View style={styles.composerWrap}>
            <Composer
              value={draft}
              onChangeText={setDraft}
              placeholder={hasIdea ? "Add more detail…" : "Describe your idea…"}
              onSubmit={submit}
              trailing={
                draft.trim() ? (
                  <AccentCircle onPress={submit} accessibilityLabel="Send">
                    <Ionicons name="arrow-up" size={22} color={COLORS.ink} />
                  </AccentCircle>
                ) : hasIdea ? (
                  <TourAnchor id="record.mic">
                    <AccentCircle onPress={() => setVoiceOpen(true)} accessibilityLabel="Record voice note">
                      <Ionicons name="mic" size={22} color={COLORS.ink} />
                    </AccentCircle>
                  </TourAnchor>
                ) : (
                  <AccentCircle onPress={() => setVoiceOpen(true)} accessibilityLabel="Record voice note">
                    <Ionicons name="mic" size={22} color={COLORS.ink} />
                  </AccentCircle>
                )
              }
            />
          </View>
        </TourAnchor>
      </KeyboardAvoidingView>

      <VoiceNoteSheet
        visible={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onTranscript={onAddMessage}
      />

      <ActionSheet
        visible={menuOpen}
        title="Conversation"
        onClose={() => setMenuOpen(false)}
        options={[
          {
            label: "Clear conversation",
            icon: "trash-outline",
            onPress: onClear,
          },
        ]}
      />
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  thread: { paddingTop: 4, paddingBottom: 16 },
  micBlock: { alignItems: "center", marginTop: 36 },
  bigMic: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: COLORS.inkWash,
    alignItems: "center",
    justifyContent: "center",
  },
  options: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    paddingTop: 16,
    paddingBottom: 18,
    paddingLeft: 16,
    marginTop: 6,
    ...SHADOW,
  },
  optionsTitle: { fontFamily: FONTS.bold, fontSize: 17, marginBottom: 4 },
  groupLabel: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.inkMuted,
    marginTop: 14,
    marginBottom: 8,
  },
  chips: { flexDirection: "row", gap: 8, paddingRight: 16 },
  skip: { alignItems: "center", justifyContent: "center", height: 48, marginTop: 4 },
  skipText: { fontFamily: FONTS.semibold, fontSize: 15, color: COLORS.inkMuted },
  composerWrap: { paddingTop: 8, paddingBottom: 6 },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from "expo-audio";
import { COLORS } from "../constants/theme";
import { transcribeVoiceRecording } from "../services/api";

interface Props {
  initialIdea: string;
  onContinue: (idea: string) => void;
  onBack: () => void;
}

export default function DescribeIdeaScreen({ initialIdea, onContinue, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const [idea, setIdea] = useState(initialIdea);
  const [micError, setMicError] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const isRecording = recorderState.isRecording;
  const charCount = idea.length;

  useEffect(() => {
    AudioModule.requestRecordingPermissionsAsync().catch(console.error);
    setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true }).catch(console.error);
  }, []);

  const startRecording = async () => {
    try {
      setMicError("");
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Microphone required", "Enable microphone access to dictate your idea.");
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch {
      setMicError("Could not start recording. Check microphone permissions.");
    }
  };

  const stopAndTranscribe = async () => {
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) {
        setMicError("Recording failed. Please try again.");
        return;
      }

      setIsTranscribing(true);
      setMicError("");
      const text = await transcribeVoiceRecording(uri);
      setIdea((prev) => {
        const combined = prev ? `${prev} ${text}` : text;
        return combined.slice(0, 500);
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transcription failed.";
      setMicError(msg);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleMicPress = () => {
    if (isTranscribing) return;
    if (isRecording) stopAndTranscribe();
    else startRecording();
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, { paddingBottom: 100 + insets.bottom }]}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>What are you building?</Text>
      <Text style={styles.sub}>
        Tell us about your product vision. We'll turn your idea into a professional CTO strategy brief.
      </Text>

      <View style={styles.card}>
        <TextInput
          style={styles.textarea}
          value={idea}
          onChangeText={setIdea}
          placeholder="e.g., I want a laundry delivery app in Karachi with rider tracking and online payments..."
          placeholderTextColor={COLORS.textDim}
          multiline
          maxLength={600}
          textAlignVertical="top"
          editable={!isRecording && !isTranscribing}
        />
        <View style={styles.cardFooter}>
          <Text style={[styles.counter, charCount > 500 && styles.counterOver]}>
            {charCount} / 500 characters
          </Text>
          <View style={styles.micRow}>
            {isRecording && <Text style={styles.listening}>Listening...</Text>}
            {isTranscribing && <Text style={styles.listening}>Transcribing...</Text>}
            <Pressable
              onPress={handleMicPress}
              disabled={isTranscribing}
              style={[
                styles.micBtn,
                isRecording && styles.micBtnActive,
                isTranscribing && styles.micBtnDisabled,
              ]}
            >
              {isTranscribing ? (
                <ActivityIndicator size="small" color={COLORS.text} />
              ) : (
                <Text style={styles.micIcon}>{isRecording ? "■" : "🎙"}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>

      {micError ? <Text style={styles.micError}>{micError}</Text> : null}

      <Pressable
        style={styles.example}
        onPress={() =>
          setIdea(
            "A B2B SaaS platform for independent coffee shop owners to manage inventory across multiple locations, including automated reordering from local roasters."
          )
        }
      >
        <Text style={styles.exampleLabel}>💡 Example Setup Prompt (Tap to load)</Text>
        <Text style={styles.exampleText}>
          "A B2B SaaS platform for independent coffee shop owners to manage inventory..."
        </Text>
      </Pressable>

      <Pressable
        style={[styles.continueBtn, (!idea.trim() || isRecording || isTranscribing) && styles.disabled]}
        onPress={() => onContinue(idea)}
        disabled={!idea.trim() || charCount > 500 || isRecording || isTranscribing}
      >
        <Text style={styles.continueText}>Continue Questionnaire →</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 12, fontWeight: "600", color: COLORS.textMuted },
  title: { fontSize: 24, fontWeight: "900", color: COLORS.text, marginBottom: 6 },
  sub: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20, marginBottom: 20 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 8,
  },
  textarea: { minHeight: 140, fontSize: 15, color: COLORS.text, lineHeight: 22 },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 12,
    paddingTop: 10,
  },
  counter: { fontSize: 11, fontWeight: "600", color: COLORS.textMuted },
  counterOver: { color: COLORS.red },
  micRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  listening: { fontSize: 11, fontWeight: "800", color: COLORS.accent },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  micBtnActive: {
    backgroundColor: "#FEE2E2",
    borderColor: COLORS.red,
  },
  micBtnDisabled: { opacity: 0.6 },
  micIcon: { fontSize: 20 },
  micError: { fontSize: 12, color: COLORS.red, marginBottom: 12, fontWeight: "600" },
  example: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    marginTop: 8,
  },
  exampleLabel: { fontSize: 10, fontWeight: "800", color: COLORS.accent, marginBottom: 6 },
  exampleText: { fontSize: 12, color: COLORS.textMuted, fontStyle: "italic" },
  continueBtn: {
    backgroundColor: COLORS.text,
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  continueText: { color: COLORS.bg, fontWeight: "800", fontSize: 14 },
  disabled: { opacity: 0.45 },
});

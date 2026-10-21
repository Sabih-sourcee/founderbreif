import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { COLORS, FONTS, RADIUS, SHADOW } from "../constants/theme";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { transcribeVoiceRecording } from "../services/api";
import { formatClock } from "../utils/text";
import { Ionicons, Sheet, Tap, TYPE, Txt, Waveform } from "./kit";

interface Props {
  visible: boolean;
  onClose: () => void;
  onTranscript: (text: string) => void;
}

/** "Voice Note" bottom sheet: live waveform, timer, ✕ / mic / send. */
export default function VoiceNoteSheet({ visible, onClose, onTranscript }: Props) {
  const rec = useVoiceRecorder();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const wasVisible = useRef(false);

  const begin = async () => {
    setError("");
    const res = await rec.start();
    if (!res.ok) setError(res.error ?? "Couldn't start recording.");
  };

  useEffect(() => {
    if (visible && !wasVisible.current) begin();
    if (!visible && wasVisible.current) rec.cancel();
    wasVisible.current = visible;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const cancel = async () => {
    await rec.cancel();
    setError("");
    onClose();
  };

  const send = async () => {
    if (busy) return;
    const uri = await rec.stop();
    if (!uri) {
      setError("Nothing was recorded. Tap the mic and try again.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const text = (await transcribeVoiceRecording(uri)).trim();
      if (!text) {
        setError("We couldn't hear any speech. Tap the mic and try again.");
      } else {
        onTranscript(text);
        onClose();
      }
    } catch {
      setError("Couldn't transcribe your recording. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const status = busy
    ? "Transcribing…"
    : error
      ? error
      : rec.phase === "recording"
        ? "Recording…"
        : rec.phase === "paused"
          ? "Paused"
          : "Tap the mic to record";

  return (
    <Sheet visible={visible} onClose={cancel}>
      <Txt style={[TYPE.title, styles.center]}>Voice Note</Txt>
      <Txt
        style={[
          TYPE.sub,
          styles.center,
          { color: error ? COLORS.ink : COLORS.inkMuted, marginTop: 4, marginBottom: 14 },
        ]}
      >
        {status}
      </Txt>

      <Waveform levels={rec.levels} />

      <Txt style={styles.timer}>{formatClock(rec.durationSec)}</Txt>

      <View style={styles.controls}>
        <Tap onPress={cancel} style={styles.sideBtn} accessibilityLabel="Cancel recording">
          <Ionicons name="close" size={24} color={COLORS.ink} />
        </Tap>

        <Tap
          onPress={rec.phase === "idle" ? begin : rec.togglePause}
          disabled={busy}
          style={[styles.orb, SHADOW]}
          accessibilityLabel={rec.phase === "recording" ? "Pause recording" : "Start recording"}
        >
          <Ionicons
            name={rec.phase === "recording" ? "pause" : "mic"}
            size={30}
            color={COLORS.ink}
          />
        </Tap>

        <Tap
          onPress={send}
          disabled={busy || rec.phase === "idle"}
          style={[styles.sideBtn, (busy || rec.phase === "idle") && { opacity: 0.4 }]}
          accessibilityLabel="Send voice note"
        >
          <Ionicons name="arrow-up" size={24} color={COLORS.ink} />
        </Tap>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: "center" },
  timer: {
    fontFamily: FONTS.semibold,
    fontSize: 15,
    color: COLORS.ink,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
  },
  sideBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  orb: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});

import { useCallback, useEffect, useRef, useState } from "react";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

export type RecorderPhase = "idle" | "recording" | "paused";

/** Maps the recorder's dB metering (-160..0) to a 0..1 bar height. */
function normalizeDb(db: number | undefined): number {
  if (typeof db !== "number" || !isFinite(db)) return 0.12;
  const v = (db + 52) / 52;
  return Math.max(0.1, Math.min(1, v));
}

/**
 * Microphone recording with live metering.
 * `levels` is a rolling list of 0..1 loudness samples that drives the waveform.
 */
export function useVoiceRecorder() {
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const state = useAudioRecorderState(recorder, 110);
  const [phase, setPhase] = useState<RecorderPhase>("idle");
  const [levels, setLevels] = useState<number[]>([]);
  const phaseRef = useRef<RecorderPhase>("idle");
  phaseRef.current = phase;

  useEffect(() => {
    if (phaseRef.current !== "recording") return;
    setLevels((prev) => [...prev.slice(-120), normalizeDb(state.metering)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.durationMillis]);

  const start = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    try {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        return { ok: false, error: "Microphone permission is needed to record your idea." };
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setLevels([]);
      setPhase("recording");
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Could not start the microphone.",
      };
    }
  }, [recorder]);

  const togglePause = useCallback(() => {
    try {
      if (phaseRef.current === "recording") {
        recorder.pause();
        setPhase("paused");
      } else if (phaseRef.current === "paused") {
        recorder.record();
        setPhase("recording");
      }
    } catch {
      /* ignore */
    }
  }, [recorder]);

  /** Stops and returns the local audio file URI (or null). */
  const stop = useCallback(async (): Promise<string | null> => {
    try {
      await recorder.stop();
    } catch {
      /* already stopped */
    }
    setPhase("idle");
    try {
      await setAudioModeAsync({ allowsRecording: false });
    } catch {
      /* ignore */
    }
    return recorder.uri ?? null;
  }, [recorder]);

  const cancel = useCallback(async () => {
    await stop();
    setLevels([]);
  }, [stop]);

  return {
    phase,
    levels,
    durationSec: Math.floor((state.durationMillis ?? 0) / 1000),
    start,
    togglePause,
    stop,
    cancel,
  };
}

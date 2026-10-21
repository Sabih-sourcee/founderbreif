import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Speech from "expo-speech";
import { SPOKEN_LANGUAGES, VoiceProfile } from "../types";
import { splitSentences, stripMarkdown } from "../utils/text";

const EST_CHARS_PER_SEC = 15; // average speech rate at 1.0x, used until real timings are measured

/* ------------------------------------------------------------------ */
/* Device voice mapping                                                */
/* ------------------------------------------------------------------ */

let deviceVoicesPromise: Promise<Speech.Voice[]> | null = null;

function getDeviceVoices(): Promise<Speech.Voice[]> {
  if (!deviceVoicesPromise) {
    deviceVoicesPromise = Speech.getAvailableVoicesAsync().catch(() => []);
  }
  return deviceVoicesPromise;
}

const norm = (s: string) => s.toLowerCase().replace("_", "-");

/** Finds the closest installed TTS voice for one of our catalogue voices. */
export async function resolveDeviceVoice(voice: VoiceProfile): Promise<string | undefined> {
  const all = await getDeviceVoices();
  const base = norm(voice.locale).split("-")[0];
  const sameLang = all.filter((v) => norm(v.language).startsWith(base));
  if (sameLang.length === 0) return undefined;
  const exact = sameLang.filter((v) => norm(v.language) === norm(voice.locale));
  const pool = exact.length ? exact : sameLang;
  const wantFemale = voice.gender === "Female";
  const byGender = pool.filter((v) => {
    const n = v.name.toLowerCase();
    return wantFemale ? /female/.test(n) : /(^|[^fe])male/.test(n);
  });
  const finalPool = byGender.length ? byGender : pool;
  const enhanced = finalPool.find((v) => v.quality === Speech.VoiceQuality.Enhanced);
  return (enhanced ?? finalPool[0]).identifier;
}

export async function previewVoice(voice: VoiceProfile): Promise<void> {
  const line = SPOKEN_LANGUAGES.find((l) => l.id === voice.language)?.previewLine ?? "Hello";
  Speech.stop();
  const deviceVoice = await resolveDeviceVoice(voice);
  Speech.speak(line, {
    language: voice.locale,
    voice: deviceVoice,
    pitch: voice.pitch,
    rate: 1.0,
  });
}

export function stopSpeech() {
  Speech.stop();
}

/* ------------------------------------------------------------------ */
/* Sentence-by-sentence player with real position & duration           */
/* ------------------------------------------------------------------ */

interface Options {
  text: string;
  voice: VoiceProfile | undefined;
  rate: number;
}

export function useTtsPlayer({ text, voice, rate }: Options) {
  const sentences = useMemo(() => splitSentences(stripMarkdown(text)), [text]);

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tick, setTick] = useState(0);

  // Mutable playback bookkeeping (kept in refs so callbacks never go stale).
  const gen = useRef(0);
  const indexRef = useRef(0);
  const startedAt = useRef(0);
  const rateRef = useRef(rate);
  const voiceRef = useRef(voice);
  const deviceVoiceRef = useRef<string | undefined>(undefined);
  /** Measured duration of each finished sentence, normalised to 1.0x speed. */
  const measured = useRef<Array<number | undefined>>([]);
  const playingRef = useRef(false);

  rateRef.current = rate;
  voiceRef.current = voice;

  useEffect(() => {
    let alive = true;
    if (voice) {
      resolveDeviceVoice(voice).then((id) => {
        if (alive) deviceVoiceRef.current = id;
      });
    }
    return () => {
      alive = false;
    };
  }, [voice?.id]);

  // New document => reset everything.
  useEffect(() => {
    Speech.stop();
    gen.current += 1;
    measured.current = [];
    indexRef.current = 0;
    playingRef.current = false;
    setIndex(0);
    setIsPlaying(false);
  }, [sentences]);

  useEffect(
    () => () => {
      gen.current += 1;
      Speech.stop();
    },
    []
  );

  /* ---- timeline math (all values normalised to 1.0x, divide by rate for display) ---- */

  const estNorm = useCallback(
    (i: number) => Math.max(0.8, (sentences[i]?.length ?? 0) / EST_CHARS_PER_SEC),
    [sentences]
  );

  const calibration = () => {
    let m = 0;
    let e = 0;
    measured.current.forEach((val, i) => {
      if (val !== undefined) {
        m += val;
        e += estNorm(i);
      }
    });
    if (e === 0) return 1;
    return Math.max(0.5, Math.min(2, m / e));
  };

  const durNorm = (i: number) => {
    const m = measured.current[i];
    return m !== undefined ? m : estNorm(i) * calibration();
  };

  const offsetNorm = (i: number) => {
    let sum = 0;
    for (let j = 0; j < i; j++) sum += durNorm(j);
    return sum;
  };

  const totalNorm = () => offsetNorm(sentences.length);

  const elapsedInCurrentNorm = () => {
    if (!playingRef.current) return 0;
    const actual = (Date.now() - startedAt.current) / 1000;
    return Math.min(actual * rateRef.current, durNorm(indexRef.current));
  };

  /* ---- playback ---- */

  const speakFrom = useCallback(
    (i: number) => {
      if (i >= sentences.length) {
        playingRef.current = false;
        setIsPlaying(false);
        return;
      }
      Speech.stop();
      gen.current += 1;
      const myGen = gen.current;
      indexRef.current = i;
      setIndex(i);
      startedAt.current = Date.now();
      playingRef.current = true;
      setIsPlaying(true);

      const finish = () => {
        if (gen.current !== myGen) return;
        const actual = (Date.now() - startedAt.current) / 1000;
        measured.current[i] = Math.max(0.4, actual * rateRef.current);
        if (i + 1 < sentences.length) {
          speakFrom(i + 1);
        } else {
          playingRef.current = false;
          setIsPlaying(false);
          setTick((t) => t + 1);
        }
      };

      const v = voiceRef.current;
      Speech.speak(sentences[i], {
        language: v?.locale,
        voice: deviceVoiceRef.current,
        pitch: v?.pitch ?? 1,
        rate: rateRef.current,
        onDone: finish,
        onError: finish,
      });
    },
    [sentences]
  );

  const play = useCallback(() => {
    const last = sentences.length - 1;
    const atEnd =
      last >= 0 &&
      indexRef.current >= last &&
      !playingRef.current &&
      measured.current[last] !== undefined;
    speakFrom(atEnd ? 0 : indexRef.current);
  }, [sentences, speakFrom]);

  const pause = useCallback(() => {
    gen.current += 1;
    Speech.stop();
    playingRef.current = false;
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (playingRef.current) pause();
    else play();
  }, [pause, play]);

  const seekTo = useCallback(
    (sec: number) => {
      if (sentences.length === 0) return;
      const targetNorm = Math.max(0, sec) * rateRef.current;
      let acc = 0;
      let target = sentences.length - 1;
      for (let i = 0; i < sentences.length; i++) {
        const d = durNorm(i);
        if (targetNorm < acc + d) {
          target = i;
          break;
        }
        acc += d;
      }
      if (playingRef.current) {
        speakFrom(target);
      } else {
        indexRef.current = target;
        setIndex(target);
        setTick((t) => t + 1);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sentences, speakFrom]
  );

  const finishedNow = () =>
    !playingRef.current &&
    sentences.length > 0 &&
    indexRef.current === sentences.length - 1 &&
    measured.current[sentences.length - 1] !== undefined;

  const positionNow = () =>
    finishedNow()
      ? totalNorm() / rateRef.current
      : (offsetNorm(indexRef.current) + elapsedInCurrentNorm()) / rateRef.current;

  const jumpTo = useCallback(
    (i: number) => {
      const target = Math.max(0, Math.min(sentences.length - 1, i));
      if (playingRef.current) {
        speakFrom(target);
      } else {
        indexRef.current = target;
        setIndex(target);
        setTick((t) => t + 1);
      }
    },
    [sentences, speakFrom]
  );

  const skip = useCallback(
    (deltaSec: number) => {
      const total = totalNorm() / rateRef.current;
      seekTo(Math.max(0, Math.min(total, positionNow() + deltaSec)));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seekTo]
  );

  // Speed change while playing => continue the current sentence at the new speed.
  const prevRate = useRef(rate);
  useEffect(() => {
    if (prevRate.current !== rate) {
      prevRate.current = rate;
      if (playingRef.current) speakFrom(indexRef.current);
      else setTick((t) => t + 1);
    }
  }, [rate, speakFrom]);

  // Drive the UI clock.
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setTick((t) => t + 1), 200);
    return () => clearInterval(id);
  }, [isPlaying]);

  const durationSec = totalNorm() / rate;
  const positionSec = Math.min(durationSec, positionNow());

  return {
    sentences,
    index,
    isPlaying,
    positionSec,
    durationSec,
    play,
    pause,
    toggle,
    seekTo,
    skip,
    jumpTo,
    tick,
  };
}

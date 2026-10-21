import React, { useEffect, useRef, useState } from "react";
import { PanResponder, ScrollView, StyleSheet, View } from "react-native";
import { COLORS, FONTS, RADIUS, SHADOW } from "../constants/theme";
import { useTtsPlayer } from "../hooks/useTtsPlayer";
import {
  Card,
  Ionicons,
  MaterialIcons,
  ScreenFrame,
  Tap,
  TopBar,
  Txt,
} from "../components/kit";
import { VoiceProfile } from "../types";
import { formatClock } from "../utils/text";

const SPEEDS = [0.75, 1, 1.25, 1.5];

interface Props {
  title: string;
  text: string;
  voice: VoiceProfile;
  rate: number;
  onRateChange: (rate: number) => void;
  onSave: (durationSec: number) => void;
  onBack: () => void;
}

/** Thin seek bar; commits the position on release. */
function SeekBar({
  progress,
  onSeek,
}: {
  progress: number;
  onSeek: (fraction: number) => void;
}) {
  const ref = useRef<View>(null);
  const bounds = useRef({ x: 0, w: 1 });
  const seekRef = useRef(onSeek);
  seekRef.current = onSeek;
  const [dragging, setDragging] = useState<number | null>(null);

  const fractionAt = (pageX: number) =>
    Math.max(0, Math.min(1, (pageX - bounds.current.x) / Math.max(1, bounds.current.w)));

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        const pageX = e.nativeEvent.pageX;
        ref.current?.measureInWindow((x, _y, w) => {
          bounds.current = { x, w };
          setDragging(fractionAt(pageX));
        });
      },
      onPanResponderMove: (_e, g) => setDragging(fractionAt(g.moveX)),
      onPanResponderRelease: (_e, g) => {
        const f = fractionAt(g.moveX || g.x0);
        setDragging(null);
        seekRef.current(f);
      },
      onPanResponderTerminate: () => setDragging(null),
    })
  ).current;

  const shown = dragging ?? progress;
  return (
    <View
      ref={ref}
      collapsable={false}
      {...responder.panHandlers}
      style={styles.seekHit}
      accessibilityRole="adjustable"
      accessibilityLabel="Seek"
    >
      <View style={styles.seekTrack}>
        <View style={[styles.seekFill, { width: `${shown * 100}%` }]} />
      </View>
      <View style={[styles.seekKnob, { left: `${shown * 100}%` }]} />
    </View>
  );
}

export default function PlayerScreen({
  title,
  text,
  voice,
  rate,
  onRateChange,
  onSave,
  onBack,
}: Props) {
  const player = useTtsPlayer({ text, voice, rate });
  const scroller = useRef<ScrollView>(null);
  const offsets = useRef<number[]>([]);
  const started = useRef(false);

  // Start automatically once, after the device voice has resolved.
  useEffect(() => {
    if (started.current || player.sentences.length === 0) return;
    started.current = true;
    const t = setTimeout(() => player.play(), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.sentences.length]);

  useEffect(() => {
    const y = offsets.current[player.index];
    if (y !== undefined) scroller.current?.scrollTo({ y: Math.max(0, y - 70), animated: true });
  }, [player.index]);

  const progress = player.durationSec > 0 ? player.positionSec / player.durationSec : 0;

  const cycleSpeed = () => {
    const i = SPEEDS.findIndex((s) => Math.abs(s - rate) < 0.01);
    onRateChange(SPEEDS[(i + 1) % SPEEDS.length]);
  };

  return (
    <ScreenFrame>
      <TopBar
        title={`Reading: ${title}`}
        left="back"
        onLeft={onBack}
        rightIcon="download-outline"
        rightLabel="Save to Library"
        onRight={() => onSave(Math.round(player.durationSec * rate))}
      />

      <Card style={styles.textCard}>
        <ScrollView
          ref={scroller}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 12 }}
        >
          {player.sentences.map((s, i) => {
            const current = i === player.index;
            return (
              <View
                key={`${i}-${s.slice(0, 10)}`}
                onLayout={(e) => {
                  offsets.current[i] = e.nativeEvent.layout.y;
                }}
              >
                <Tap
                  scaleTo={0.99}
                  onPress={() => player.jumpTo(i)}
                  accessibilityLabel={`Jump to sentence ${i + 1}`}
                  style={[styles.sentence, current && { backgroundColor: COLORS.accent }]}
                >
                  <Txt
                    style={{
                      fontFamily: current ? FONTS.semibold : FONTS.regular,
                      fontSize: 17,
                      lineHeight: 26,
                      color: COLORS.ink,
                    }}
                  >
                    {s}
                  </Txt>
                </Tap>
              </View>
            );
          })}
        </ScrollView>
      </Card>

      <View style={styles.player}>
        <SeekBar progress={progress} onSeek={(f) => player.seekTo(f * player.durationSec)} />
        <View style={styles.times}>
          <Txt style={styles.time}>{formatClock(player.positionSec)}</Txt>
          <Txt style={styles.time}>{formatClock(player.durationSec)}</Txt>
        </View>

        <View style={styles.controls}>
          <View style={styles.side} />
          <Tap onPress={() => player.skip(-10)} accessibilityLabel="Back 10 seconds" hitSlop={10}>
            <MaterialIcons name="replay-10" size={38} color={COLORS.ink} />
          </Tap>
          <Tap
            onPress={player.toggle}
            scaleTo={0.94}
            style={[styles.playBtn, SHADOW]}
            accessibilityLabel={player.isPlaying ? "Pause" : "Play"}
          >
            <Ionicons
              name={player.isPlaying ? "pause" : "play"}
              size={34}
              color={COLORS.white}
              style={player.isPlaying ? undefined : { marginLeft: 4 }}
            />
          </Tap>
          <Tap onPress={() => player.skip(10)} accessibilityLabel="Forward 10 seconds" hitSlop={10}>
            <MaterialIcons name="forward-10" size={38} color={COLORS.ink} />
          </Tap>
          <View style={styles.side}>
            <Tap onPress={cycleSpeed} accessibilityLabel={`Speed ${rate}x`} style={styles.speed}>
              <Txt style={{ fontFamily: FONTS.bold, fontSize: 14 }}>{`${rate}x`}</Txt>
            </Tap>
          </View>
        </View>
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  textCard: { flex: 1, marginTop: 16, paddingHorizontal: 12, paddingVertical: 14 },
  sentence: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 4,
  },
  player: { paddingTop: 16, paddingBottom: 6 },
  seekHit: { height: 30, justifyContent: "center", marginHorizontal: 8 },
  seekTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.inkTrack,
    overflow: "hidden",
  },
  seekFill: { height: "100%", backgroundColor: COLORS.ink },
  seekKnob: {
    position: "absolute",
    marginLeft: -9,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.ink,
  },
  times: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 8 },
  time: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.inkMuted },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    paddingHorizontal: 4,
  },
  side: { width: 64, alignItems: "flex-end" },
  playBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  speed: {
    height: 36,
    minWidth: 58,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.inkTrack,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
});

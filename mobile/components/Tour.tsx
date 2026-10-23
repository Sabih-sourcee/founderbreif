import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Easing,
  LayoutChangeEvent,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, FONTS, RADIUS, SHADOW } from "../constants/theme";
import { TOUR_STEPS, TOUR_STORAGE_KEY, TourAnchorId, TourStep } from "../constants/onboarding";
import { Screen } from "../types";

export interface AnchorBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

type AnchorRef = React.RefObject<View | null>;

interface TourContextValue {
  active: boolean;
  step: TourStep | null;
  index: number;
  total: number;
  register: (id: TourAnchorId, ref: AnchorRef) => void;
  unregister: (id: TourAnchorId) => void;
  start: () => void;
  next: () => void;
  skip: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) {
    return {
      active: false,
      step: null,
      index: 0,
      total: TOUR_STEPS.length,
      register: () => undefined,
      unregister: () => undefined,
      start: () => undefined,
      next: () => undefined,
      skip: () => undefined,
    } as TourContextValue;
  }
  return ctx;
}

export function TourAnchor({
  id,
  children,
  style,
}: {
  id: TourAnchorId;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { register, unregister } = useTour();
  const ref = useRef<View>(null);

  useEffect(() => {
    register(id, ref);
    return () => unregister(id);
  }, [id, register, unregister]);

  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
}

interface ProviderProps {
  children: React.ReactNode;
  currentScreen: Screen;
  goToScreen: (screen: Screen) => void;
  /** Wait until first-run name prompt is finished. */
  ready: boolean;
}

export function TourProvider({ children, currentScreen, goToScreen, ready }: ProviderProps) {
  const anchors = useRef<Partial<Record<TourAnchorId, AnchorRef>>>({});
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState<AnchorBox | null>(null);
  const [knownDone, setKnownDone] = useState<boolean | null>(null);

  const step = active ? TOUR_STEPS[index] ?? null : null;

  const register = useCallback((id: TourAnchorId, ref: AnchorRef) => {
    anchors.current[id] = ref;
  }, []);
  const unregister = useCallback((id: TourAnchorId) => {
    if (anchors.current[id]) delete anchors.current[id];
  }, []);

  const finish = useCallback(async () => {
    setActive(false);
    setBox(null);
    setIndex(0);
    await AsyncStorage.setItem(TOUR_STORAGE_KEY, "1");
    setKnownDone(true);
    goToScreen("Home");
  }, [goToScreen]);

  const start = useCallback(() => {
    setIndex(0);
    setActive(true);
    goToScreen("Home");
  }, [goToScreen]);

  const next = useCallback(() => {
    setIndex((i) => {
      if (i >= TOUR_STEPS.length - 1) {
        finish();
        return i;
      }
      return i + 1;
    });
  }, [finish]);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.getItem(TOUR_STORAGE_KEY).then((v) => setKnownDone(v === "1"));
  }, [ready]);

  useEffect(() => {
    if (!ready || knownDone !== false || active) return;
    const t = setTimeout(() => start(), 500);
    return () => clearTimeout(t);
  }, [ready, knownDone, active, start]);

  useEffect(() => {
    if (!step) return;
    if (currentScreen !== step.screen) goToScreen(step.screen);
  }, [step?.id, step?.screen, currentScreen, goToScreen]);

  const measure = useCallback((anchor?: TourAnchorId) => {
    if (!anchor) {
      setBox(null);
      return;
    }
    const ref = anchors.current[anchor];
    const node = ref?.current;
    if (!node) {
      setBox(null);
      return;
    }
    node.measureInWindow((x, y, width, height) => {
      if (width < 2 || height < 2) {
        setBox(null);
        return;
      }
      setBox({ x, y, width, height });
    });
  }, []);

  useEffect(() => {
    if (!step) return;
    const delays = [80, 280, 560, 920];
    const ids = delays.map((ms) => setTimeout(() => measure(step.anchor), ms));
    return () => ids.forEach(clearTimeout);
  }, [step?.id, currentScreen, measure, step]);

  const value = useMemo(
    () => ({
      active,
      step,
      index,
      total: TOUR_STEPS.length,
      register,
      unregister,
      start,
      next,
      skip,
    }),
    [active, step, index, register, unregister, start, next, skip]
  );

  return (
    <TourContext.Provider value={value}>
      {children}
      <TourOverlay step={step} box={box} index={index} total={TOUR_STEPS.length} onNext={next} onSkip={skip} />
    </TourContext.Provider>
  );
}

function TourOverlay({
  step,
  box,
  index,
  total,
  onNext,
  onSkip,
}: {
  step: TourStep | null;
  box: AnchorBox | null;
  index: number;
  total: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const fade = useRef(new Animated.Value(0)).current;
  const [cardH, setCardH] = useState(180);

  useEffect(() => {
    if (!step) {
      fade.setValue(0);
      return;
    }
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [step?.id, fade]);

  if (!step) return null;

  const { width: sw, height: sh } = Dimensions.get("window");
  const pad = 8;
  const hole = box
    ? {
        x: Math.max(8, box.x - pad),
        y: Math.max(8, box.y - pad),
        w: box.width + pad * 2,
        h: box.height + pad * 2,
        r: Math.min(28, (box.width + pad * 2) / 2, (box.height + pad * 2) / 2),
      }
    : null;

  const preferAbove = step.placement === "above" || (!step.placement && hole && hole.y > sh * 0.45);
  let cardTop = sh * 0.32;
  if (hole) {
    cardTop = preferAbove ? hole.y - cardH - 18 : hole.y + hole.h + 18;
    if (cardTop < 48) cardTop = hole.y + hole.h + 18;
    if (cardTop + cardH > sh - 24) cardTop = Math.max(48, hole.y - cardH - 18);
  }

  const onCardLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (Math.abs(h - cardH) > 4) setCardH(h);
  };

  const last = index >= total - 1;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <View style={styles.root} pointerEvents="box-none">
        {hole ? (
          <>
            <Dim top={0} left={0} width={sw} height={Math.max(0, hole.y)} />
            <Dim top={hole.y} left={0} width={Math.max(0, hole.x)} height={hole.h} />
            <Dim
              top={hole.y}
              left={hole.x + hole.w}
              width={Math.max(0, sw - hole.x - hole.w)}
              height={hole.h}
            />
            <Dim top={hole.y + hole.h} left={0} width={sw} height={Math.max(0, sh - hole.y - hole.h)} />
            <View
              pointerEvents="none"
              style={[
                styles.ring,
                {
                  top: hole.y,
                  left: hole.x,
                  width: hole.w,
                  height: hole.h,
                  borderRadius: hole.r,
                },
              ]}
            />
          </>
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.veil]} />
        )}

        <Animated.View
          onLayout={onCardLayout}
          style={[
            styles.card,
            SHADOW,
            { top: cardTop, opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] },
          ]}
        >
          <Text style={styles.kicker}>{`${index + 1} of ${total}`}</Text>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.body}>{step.body}</Text>
          <View style={styles.row}>
            <Pressable onPress={onSkip} hitSlop={10} accessibilityLabel="Skip tour">
              <Text style={styles.skip}>Skip</Text>
            </Pressable>
            <View style={styles.dots}>
              {TOUR_STEPS.map((s, i) => (
                <View key={s.id} style={[styles.dot, i === index && styles.dotOn]} />
              ))}
            </View>
            <Pressable
              onPress={onNext}
              style={styles.next}
              accessibilityLabel={last ? "Finish tour" : "Next tip"}
            >
              <Text style={styles.nextLabel}>{last ? "Let's go" : "Next"}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Dim({ top, left, width, height }: { top: number; left: number; width: number; height: number }) {
  if (width <= 0 || height <= 0) return null;
  return <View style={[styles.veil, { position: "absolute", top, left, width, height }]} />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  veil: { backgroundColor: "rgba(28, 33, 32, 0.38)" },
  ring: {
    position: "absolute",
    borderWidth: 3,
    borderColor: COLORS.accent,
    backgroundColor: "transparent",
  },
  card: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    padding: 20,
  },
  kicker: {
    fontFamily: FONTS.semibold,
    fontSize: 12,
    color: COLORS.inkMuted,
    marginBottom: 6,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    lineHeight: 28,
    color: COLORS.ink,
    marginBottom: 8,
  },
  body: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 23,
    color: COLORS.ink,
    marginBottom: 18,
  },
  row: { flexDirection: "row", alignItems: "center" },
  skip: { fontFamily: FONTS.semibold, fontSize: 15, color: COLORS.inkMuted, width: 56 },
  dots: { flex: 1, flexDirection: "row", justifyContent: "center", gap: 5, flexWrap: "wrap" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.inkTrack },
  dotOn: { backgroundColor: COLORS.ink, width: 14 },
  next: {
    backgroundColor: COLORS.accent,
    borderRadius: 999,
    paddingHorizontal: 18,
    height: 40,
    justifyContent: "center",
  },
  nextLabel: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.ink },
});

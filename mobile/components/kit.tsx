import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from "../constants/theme";
import { TabId } from "../types";

/* ------------------------------------------------------------------ */
/* Typography                                                          */
/* ------------------------------------------------------------------ */

export const TYPE = {
  greeting: { fontFamily: FONTS.bold, fontSize: 31, lineHeight: 38, letterSpacing: -0.5 },
  largeTitle: { fontFamily: FONTS.bold, fontSize: 34, lineHeight: 40, letterSpacing: -0.6 },
  docTitle: { fontFamily: FONTS.bold, fontSize: 23, lineHeight: 30, letterSpacing: -0.3 },
  title: { fontFamily: FONTS.bold, fontSize: 18, lineHeight: 24 },
  rowTitle: { fontFamily: FONTS.bold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: FONTS.regular, fontSize: 16, lineHeight: 23 },
  sub: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: FONTS.medium, fontSize: 11, lineHeight: 14 },
} as const;

/** Inter by default, #1C2120 by default. */
export function Txt({ style, ...rest }: TextProps) {
  return <Text {...rest} style={[{ fontFamily: FONTS.regular, color: COLORS.ink }, style]} />;
}

export function Input({ style, ...rest }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={COLORS.inkSoft}
      selectionColor={COLORS.ink}
      {...rest}
      style={[
        { fontFamily: FONTS.regular, fontSize: 16, color: COLORS.ink, padding: 0 },
        style,
      ]}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

export type IonName = React.ComponentProps<typeof Ionicons>["name"];
export type McName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];
export type MiName = React.ComponentProps<typeof MaterialIcons>["name"];
export { Ionicons, MaterialCommunityIcons, MaterialIcons };

/* ------------------------------------------------------------------ */
/* Pressable with a soft press animation                               */
/* ------------------------------------------------------------------ */

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TapProps {
  children?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  scaleTo?: number;
  accessibilityLabel?: string;
  accessibilityRole?: "button" | "tab" | "link";
  accessibilityState?: { selected?: boolean; disabled?: boolean };
  hitSlop?: number;
}

export function Tap({
  children,
  onPress,
  style,
  disabled,
  scaleTo = 0.96,
  accessibilityLabel,
  accessibilityRole = "button",
  accessibilityState,
  hitSlop = 6,
}: TapProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (v: number) =>
    Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => animate(scaleTo)}
      onPressOut={() => animate(1)}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled, ...accessibilityState }}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}

/* ------------------------------------------------------------------ */
/* Staggered enter animation (driven by ScreenTransition)              */
/* ------------------------------------------------------------------ */

interface EnterContextValue {
  progress: Animated.Value;
  next: () => number;
}

const EnterContext = createContext<EnterContextValue | null>(null);

const ENTER_EASE = Easing.bezier(0.2, 0.9, 0.25, 1.05);
const ENTER_STEP = 0.07;
const ENTER_SPAN = 0.46;
const ENTER_MAX_START = 1 - ENTER_SPAN;
const EASE_SAMPLES = [0, 0.08, 0.16, 0.26, 0.38, 0.52, 0.68, 0.84, 1];
const EASE_VALUES = EASE_SAMPLES.map((x) => (x === 0 ? 0 : x === 1 ? 1 : ENTER_EASE(x)));

export type EnterKind = "rise" | "drop" | "pop" | "fromLeft" | "fromRight";

/**
 * Each element takes the next slot in the current screen's sequence and
 * animates inside its own keyframe window of the shared progress value.
 */
export function useEnterStyle(kind: EnterKind = "rise") {
  const ctx = useContext(EnterContext);
  const order = useRef<number | null>(null);
  if (ctx && order.current === null) order.current = ctx.next();
  if (!ctx || order.current === null) return undefined;

  const start = Math.min(order.current * ENTER_STEP, ENTER_MAX_START);
  // The native driver can't run an easing inside interpolate, so the curve is
  // baked into keyframes instead.
  const t = ctx.progress.interpolate({
    inputRange: [0, ...EASE_SAMPLES.map((x) => start + x * ENTER_SPAN), 1],
    outputRange: [0, ...EASE_VALUES, 1],
    extrapolate: "clamp",
  });
  const opacity = ctx.progress.interpolate({
    inputRange: [0, start, start + ENTER_SPAN * 0.5, 1],
    outputRange: [0, 0, 1, 1],
    extrapolate: "clamp",
  });

  const move = (from: number) => t.interpolate({ inputRange: [0, 1], outputRange: [from, 0] });
  const grow = (from: number) => t.interpolate({ inputRange: [0, 1], outputRange: [from, 1] });

  switch (kind) {
    case "drop":
      return { opacity, transform: [{ translateY: move(-18) }, { scale: grow(0.97) }] };
    case "pop":
      return { opacity, transform: [{ translateY: move(14) }, { scale: grow(0.84) }] };
    case "fromLeft":
      return { opacity, transform: [{ translateX: move(-30) }, { scale: grow(0.96) }] };
    case "fromRight":
      return { opacity, transform: [{ translateX: move(30) }, { scale: grow(0.96) }] };
    default:
      return { opacity, transform: [{ translateY: move(26) }, { scale: grow(0.965) }] };
  }
}

/** Wrapper for pressable components that already own their transform. */
export function Enter({
  children,
  kind,
  style,
}: {
  children: React.ReactNode;
  kind?: EnterKind;
  style?: StyleProp<ViewStyle>;
}) {
  const enter = useEnterStyle(kind);
  return <Animated.View style={[style, enter]}>{children}</Animated.View>;
}

/* ------------------------------------------------------------------ */
/* Screen frame                                                        */
/* ------------------------------------------------------------------ */

export function ScreenFrame({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.frame, { paddingTop: Math.max(insets.top, 14) + 6 }, style]}>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Circle icon bubble (Home top row, search, etc.)                     */
/* ------------------------------------------------------------------ */

export function CircleButton({
  onPress,
  children,
  size = 44,
  dot,
  accessibilityLabel,
  style,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  size?: number;
  dot?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Enter kind="pop">
      <Tap
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.circleBtn,
          { width: size, height: size, borderRadius: size / 2 },
          SHADOW,
          style,
        ]}
      >
        {children}
        {dot ? <View style={styles.dot} /> : null}
      </Tap>
    </Enter>
  );
}

/* ------------------------------------------------------------------ */
/* Top bar: white pill  [ ←   Title   ••• ]                            */
/* ------------------------------------------------------------------ */

export interface TopBarProps {
  title: string;
  left?: "back" | "close";
  onLeft?: () => void;
  rightIcon?: IonName;
  onRight?: () => void;
  rightLabel?: string;
}

export function TopBar({
  title,
  left = "back",
  onLeft,
  rightIcon,
  onRight,
  rightLabel,
}: TopBarProps) {
  const enter = useEnterStyle("drop");
  return (
    <Animated.View style={[styles.topBar, SHADOW, enter]}>
      <Tap
        onPress={onLeft}
        style={styles.topBarSlot}
        accessibilityLabel={left === "close" ? "Close" : "Back"}
        hitSlop={10}
      >
        <Ionicons name={left === "close" ? "close" : "arrow-back"} size={26} color={COLORS.ink} />
      </Tap>
      <Txt style={[TYPE.title, styles.topBarTitle]} numberOfLines={1}>
        {title}
      </Txt>
      <View style={styles.topBarSlot}>
        {rightIcon ? (
          <Tap
            onPress={onRight}
            style={styles.topBarSlot}
            accessibilityLabel={rightLabel ?? "More options"}
            hitSlop={10}
          >
            <Ionicons name={rightIcon} size={24} color={COLORS.ink} />
          </Tap>
        ) : null}
      </View>
    </Animated.View>
  );
}

/** Large left-aligned screen title used by Library and Profile. */
export function ScreenTitle({ title, right }: { title: string; right?: React.ReactNode }) {
  const enter = useEnterStyle("drop");
  return (
    <Animated.View style={[styles.screenTitleRow, enter]}>
      <Txt style={TYPE.largeTitle}>{title}</Txt>
      {right}
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/* Bottom navbar: white pill, 5 tabs, yellow circle on the active tab  */
/* ------------------------------------------------------------------ */

const NAV_PILL_H = 70;
const NAV_LIFT = 24;

const NAV_ITEMS: Array<{
  id: TabId;
  label: string;
  icon: IonName;
  iconActive: IonName;
}> = [
  { id: "Home", label: "Home", icon: "home-outline", iconActive: "home" },
  { id: "Record", label: "Record", icon: "mic-outline", iconActive: "mic" },
  { id: "ReadAloud", label: "Read Aloud", icon: "volume-high-outline", iconActive: "volume-high" },
  { id: "Library", label: "Library", icon: "folder-outline", iconActive: "folder" },
  { id: "Profile", label: "Profile", icon: "person-outline", iconActive: "person" },
];

/** Raised yellow circle; pops up from the bar whenever a tab becomes active. */
function NavActiveBubble({ icon }: { icon: IonName }) {
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(pop, {
      toValue: 1,
      useNativeDriver: true,
      damping: 13,
      stiffness: 190,
      mass: 0.8,
    }).start();
  }, [pop]);

  const ringStyle = {
    opacity: pop.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
    transform: [
      { translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
      { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }) },
    ],
  };
  const iconStyle = {
    transform: [
      { scale: pop.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.4, 1.12, 1] }) },
      { rotate: pop.interpolate({ inputRange: [0, 1], outputRange: ["-14deg", "0deg"] }) },
    ],
  };

  return (
    <Animated.View style={[styles.navActiveRing, ringStyle]}>
      <View style={styles.navActiveCircle}>
        <Animated.View style={iconStyle}>
          <Ionicons name={icon} size={26} color={COLORS.ink} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

export function NavBar({
  active,
  onSelect,
  bottomInset,
}: {
  active: TabId;
  onSelect: (tab: TabId) => void;
  bottomInset: number;
}) {
  return (
    <View style={styles.navWrap}>
      <View style={{ height: NAV_PILL_H + NAV_LIFT + bottomInset }}>
        <View style={[styles.navPill, SHADOW, { height: NAV_PILL_H + bottomInset }]} />
        <View style={styles.navRow}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === active;
            return (
              <Tap
                key={item.id}
                style={styles.navTab}
                scaleTo={0.94}
                accessibilityRole="tab"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: isActive }}
                onPress={() => onSelect(item.id)}
              >
                {isActive ? (
                  <NavActiveBubble icon={item.iconActive} />
                ) : (
                  <Ionicons name={item.icon} size={23} color={COLORS.ink} />
                )}
                <Txt
                  style={[
                    styles.navLabel,
                    isActive
                      ? { color: COLORS.ink, fontFamily: FONTS.bold }
                      : { color: COLORS.inkSoft },
                  ]}
                >
                  {item.label}
                </Txt>
              </Tap>
            );
          })}
        </View>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Chat bubble (AI = white / left, user = #1C2120 / right)             */
/* ------------------------------------------------------------------ */

export function ChatBubble({
  variant,
  text,
  meta,
  children,
  wide,
}: {
  variant: "ai" | "user";
  text?: string;
  meta?: string;
  children?: React.ReactNode;
  wide?: boolean;
}) {
  const isUser = variant === "user";
  const enter = useEnterStyle(isUser ? "fromRight" : "fromLeft");
  return (
    <Animated.View
      style={[styles.bubbleRow, { justifyContent: isUser ? "flex-end" : "flex-start" }, enter]}
    >
      <View
        style={[
          styles.bubble,
          wide && { maxWidth: "100%", flexShrink: 1 },
          SHADOW,
          isUser
            ? { backgroundColor: COLORS.ink, borderBottomRightRadius: RADIUS.tail }
            : { backgroundColor: COLORS.white, borderBottomLeftRadius: RADIUS.tail },
        ]}
      >
        {text ? (
          <Txt style={[TYPE.body, { color: isUser ? COLORS.white : COLORS.ink }]}>{text}</Txt>
        ) : null}
        {children}
        {meta ? (
          <Txt
            style={[
              TYPE.label,
              { marginTop: 8, color: isUser ? COLORS.whiteOnInk : COLORS.inkSoft },
            ]}
          >
            {meta}
          </Txt>
        ) : null}
      </View>
    </Animated.View>
  );
}

/** Small centered label pill, e.g. "today". */
export function DayPill({ label }: { label: string }) {
  const enter = useEnterStyle("pop");
  return (
    <Animated.View style={[styles.dayPillWrap, enter]}>
      <View style={styles.dayPill}>
        <Txt style={[TYPE.label, { color: COLORS.white, fontFamily: FONTS.semibold }]}>{label}</Txt>
      </View>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/* List row (library items, voices)                                    */
/* ------------------------------------------------------------------ */

export function RowLeading({
  tone = "teal",
  children,
  size = 46,
}: {
  tone?: "teal" | "accent";
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.rowLeading,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: tone === "accent" ? COLORS.accent : COLORS.bg,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  onPress,
  dimmed,
  selected,
  accessibilityLabel,
}: {
  leading: React.ReactNode;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  dimmed?: boolean;
  selected?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Enter>
    <Tap
      onPress={onPress}
      scaleTo={0.985}
      accessibilityLabel={accessibilityLabel ?? title}
      style={[
        styles.row,
        SHADOW,
        dimmed && { backgroundColor: COLORS.whiteSoft },
        selected && styles.rowSelected,
      ]}
    >
      <View style={dimmed ? { opacity: 0.55 } : undefined}>{leading}</View>
      <View style={[styles.rowText, dimmed && { opacity: 0.55 }]}>
        <Txt style={TYPE.rowTitle} numberOfLines={2}>
          {title}
        </Txt>
        {subtitle ? (
          <Txt style={[TYPE.sub, { color: COLORS.inkMuted, marginTop: 3 }]} numberOfLines={1}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {trailing}
    </Tap>
    </Enter>
  );
}

/** Slim pill row used for Profile settings. */
export function MenuRow({
  icon,
  label,
  onPress,
  right,
}: {
  icon: IonName;
  label: string;
  onPress: () => void;
  right?: string;
}) {
  return (
    <Enter>
      <Tap onPress={onPress} scaleTo={0.985} style={[styles.menuRow, SHADOW]} accessibilityLabel={label}>
        <Ionicons name={icon} size={21} color={COLORS.ink} style={{ width: 28 }} />
        <Txt style={[{ fontFamily: FONTS.medium, fontSize: 15, flex: 1 }]}>{label}</Txt>
        {right ? (
          <Txt style={[TYPE.sub, { color: COLORS.inkMuted, marginRight: 6 }]}>{right}</Txt>
        ) : null}
        <Ionicons name="chevron-forward" size={20} color={COLORS.ink} />
      </Tap>
    </Enter>
  );
}

/* ------------------------------------------------------------------ */
/* Filter chip + segmented toggle                                      */
/* ------------------------------------------------------------------ */

export function FilterChip({
  label,
  active,
  onPress,
  icon,
  small,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: IonName;
  small?: boolean;
}) {
  return (
    <Tap
      onPress={onPress}
      scaleTo={0.95}
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={[styles.chip, small && { height: 36, paddingHorizontal: 16 }, active ? styles.chipActive : styles.chipIdle]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={15}
          color={active ? COLORS.ink : COLORS.inkMuted}
          style={{ marginRight: 5 }}
        />
      ) : null}
      <Txt
        style={{
          fontFamily: active ? FONTS.bold : FONTS.medium,
          fontSize: small ? 14 : 15,
          color: active ? COLORS.ink : COLORS.inkMuted,
        }}
      >
        {label}
      </Txt>
    </Tap>
  );
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ id: T; label: string }>;
  value: T;
  onChange: (id: T) => void;
}) {
  const enter = useEnterStyle();
  return (
    <Animated.View style={[styles.segment, SHADOW, enter]}>
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <Tap
            key={opt.id}
            onPress={() => onChange(opt.id)}
            scaleTo={0.97}
            accessibilityLabel={opt.label}
            accessibilityState={{ selected: active }}
            style={[styles.segmentItem, active && { backgroundColor: COLORS.accent }]}
          >
            <Txt
              style={{
                fontFamily: active ? FONTS.bold : FONTS.medium,
                fontSize: 14,
                color: active ? COLORS.ink : COLORS.inkMuted,
              }}
            >
              {opt.label}
            </Txt>
          </Tap>
        );
      })}
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled,
  loading,
  small,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "dark" | "secondary";
  icon?: IonName;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bg =
    variant === "primary" ? COLORS.accent : variant === "dark" ? COLORS.ink : COLORS.white;
  const fg = variant === "dark" ? COLORS.white : COLORS.ink;
  return (
    <Enter style={style}>
      <Tap
        onPress={onPress}
        disabled={disabled || loading}
        accessibilityLabel={label}
        style={[
          styles.button,
          SHADOW,
          { backgroundColor: bg, height: small ? 46 : 56, opacity: disabled ? 0.45 : 1 },
        ]}
      >
        {icon ? (
          <Ionicons name={icon} size={20} color={fg} style={{ marginRight: 8 }} />
        ) : null}
        <Txt style={{ fontFamily: FONTS.bold, fontSize: small ? 15 : 17, color: fg }}>
          {loading ? "Please wait…" : label}
        </Txt>
      </Tap>
    </Enter>
  );
}

/* ------------------------------------------------------------------ */
/* Cards & progress                                                    */
/* ------------------------------------------------------------------ */

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const enter = useEnterStyle();
  return <Animated.View style={[styles.card, SHADOW, style, enter]}>{children}</Animated.View>;
}

/** Big square action tile for the Home grid. */
export function ActionTile({
  label,
  children,
  tinted,
  onPress,
}: {
  label: string;
  children: React.ReactNode;
  tinted?: boolean;
  onPress: () => void;
}) {
  return (
    <Enter kind="pop" style={{ flex: 1 }}>
      <Tap
        onPress={onPress}
        accessibilityLabel={label}
        style={[
          styles.tile,
          SHADOW,
          { backgroundColor: tinted ? COLORS.whiteSoft : COLORS.white },
        ]}
      >
        {children}
        <Txt style={[TYPE.rowTitle, { fontSize: 16, marginTop: 14 }]}>{label}</Txt>
      </Tap>
    </Enter>
  );
}

export function ProgressBar({
  progress,
  height = 12,
  track = COLORS.inkTrack,
  style,
}: {
  progress: number;
  height?: number;
  track?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={[{ height, borderRadius: height / 2, backgroundColor: track, overflow: "hidden" }, style]}>
      <View
        style={{
          width: `${clamped * 100}%`,
          height: "100%",
          borderRadius: height / 2,
          backgroundColor: COLORS.accent,
        }}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Search bar                                                          */
/* ------------------------------------------------------------------ */

export function SearchBar({
  value,
  onChangeText,
  placeholder,
  right,
  autoFocus,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  right?: React.ReactNode;
  autoFocus?: boolean;
}) {
  const enter = useEnterStyle();
  return (
    <Animated.View style={[styles.searchBar, SHADOW, enter]}>
      <Ionicons name="search" size={21} color={COLORS.inkSoft} />
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{ flex: 1, marginLeft: 10, fontSize: 16 }}
        returnKeyType="search"
      />
      {right}
    </Animated.View>
  );
}

/** Input pill with a trailing circular yellow button (chat composer). */
export function Composer({
  value,
  onChangeText,
  placeholder,
  onSubmit,
  trailing,
  editable = true,
  multiline,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  onSubmit?: () => void;
  trailing: React.ReactNode;
  editable?: boolean;
  multiline?: boolean;
}) {
  const enter = useEnterStyle("rise");
  return (
    <Animated.View style={[styles.composer, SHADOW, enter]}>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        editable={editable}
        onSubmitEditing={onSubmit}
        multiline={multiline}
        blurOnSubmit={!multiline}
        returnKeyType="send"
        style={{ flex: 1, fontSize: 16, maxHeight: 96, paddingVertical: 4 }}
      />
      {trailing}
    </Animated.View>
  );
}

/** Circular yellow button (mic / send) used inside the composer. */
export function AccentCircle({
  onPress,
  children,
  size = 44,
  dark,
  accessibilityLabel,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  size?: number;
  dark?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Tap
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: dark ? COLORS.ink : COLORS.accent,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </Tap>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar                                                              */
/* ------------------------------------------------------------------ */

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  name,
  uri,
  size = 96,
  glyph,
}: {
  name?: string;
  uri?: string;
  size?: number;
  glyph?: IonName;
}) {
  const initials = name ? initialsOf(name) : "";
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: COLORS.bg,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderWidth: 3,
        borderColor: COLORS.white,
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} />
      ) : glyph ? (
        <Ionicons name={glyph} size={size * 0.6} color={COLORS.ink} />
      ) : initials ? (
        <Txt style={{ fontFamily: FONTS.bold, fontSize: size * 0.38 }}>{initials}</Txt>
      ) : (
        <Ionicons name="person" size={size * 0.6} color={COLORS.ink} />
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Sheet (renders inside the screen so the navbar stays visible)       */
/* ------------------------------------------------------------------ */

export function Sheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const slide = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(slide, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (mounted) {
      Animated.timing(slide, {
        toValue: 0,
        duration: 170,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!mounted) return null;

  return (
    <KeyboardAvoidingView
      style={StyleSheet.absoluteFill}
      behavior="padding"
      pointerEvents="box-none"
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.scrim, opacity: slide }]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Dismiss" />
      </Animated.View>
      <View style={styles.sheetAnchor} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.sheet,
            SHADOW,
            {
              transform: [
                { translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [340, 0] }) },
              ],
            },
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

export interface SheetOption {
  label: string;
  icon: IonName;
  onPress: () => void;
  selected?: boolean;
}

export function ActionSheet({
  visible,
  title,
  options,
  onClose,
}: {
  visible: boolean;
  title?: string;
  options: SheetOption[];
  onClose: () => void;
}) {
  return (
    <Sheet visible={visible} onClose={onClose}>
      {title ? <Txt style={[TYPE.title, { marginBottom: 10 }]}>{title}</Txt> : null}
      {options.map((opt) => (
        <Tap
          key={opt.label}
          onPress={() => {
            onClose();
            opt.onPress();
          }}
          scaleTo={0.985}
          accessibilityLabel={opt.label}
          style={[styles.sheetOption, opt.selected && { backgroundColor: COLORS.accent }]}
        >
          <Ionicons name={opt.icon} size={21} color={COLORS.ink} style={{ width: 30 }} />
          <Txt style={{ fontFamily: opt.selected ? FONTS.bold : FONTS.medium, fontSize: 16, flex: 1 }}>
            {opt.label}
          </Txt>
          {opt.selected ? <Ionicons name="checkmark" size={20} color={COLORS.ink} /> : null}
        </Tap>
      ))}
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Toast                                                               */
/* ------------------------------------------------------------------ */

export function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, [message, onClose]);
  if (!message) return null;
  return (
    <View style={[styles.toastWrap, { top: Math.max(insets.top, 14) + 6 }]} pointerEvents="box-none">
      <View style={[styles.toast, SHADOW]} accessibilityRole="alert">
        <Txt style={[{ fontFamily: FONTS.medium, fontSize: 14, flex: 1 }]}>{message}</Txt>
        <Tap onPress={onClose} accessibilityLabel="Dismiss">
          <View style={styles.toastBtn}>
            <Txt style={{ fontFamily: FONTS.bold, fontSize: 13 }}>OK</Txt>
          </View>
        </Tap>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Waveform (voice note sheet)                                         */
/* ------------------------------------------------------------------ */

export function Waveform({ levels, slots = 38 }: { levels: number[]; slots?: number }) {
  const ghost = useRef(
    Array.from({ length: slots }, (_, i) => 0.18 + 0.32 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)))
  ).current;
  const visible = levels.slice(-slots);
  return (
    <View style={styles.waveRow}>
      {Array.from({ length: slots }, (_, i) => {
        const filled = i < visible.length;
        const v = filled ? visible[i] : ghost[i];
        return (
          <View
            key={i}
            style={{
              width: 4,
              height: Math.max(5, v * 56),
              borderRadius: 2,
              backgroundColor: filled ? COLORS.ink : COLORS.inkTrack,
            }}
          />
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Simple fade-in for screen transitions                               */
/* ------------------------------------------------------------------ */

export type TransitionDirection = "forward" | "back" | "tab";

const SCREEN_EASE = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * Screen enter animation driven by one 0→1 progress value with keyframed
 * interpolations: opening a screen slides in from the right, going back from
 * the left, and switching tabs rises up with a gentle scale.
 */
export function ScreenTransition({
  children,
  triggerKey,
  direction,
}: {
  children: React.ReactNode;
  triggerKey: string;
  direction: TransitionDirection;
}) {
  const progress = useRef(new Animated.Value(1)).current;
  const stagger = useRef(new Animated.Value(1)).current;
  const counter = useRef(0);
  const lastKey = useRef(triggerKey);
  const first = useRef(true);

  // New screen: restart element numbering during this render so its children
  // pick up their stagger order as they mount.
  if (lastKey.current !== triggerKey) {
    lastKey.current = triggerKey;
    counter.current = 0;
  }

  const ctx = useRef<EnterContextValue>({
    progress: stagger,
    next: () => counter.current++,
  }).current;

  // Layout effect so values are reset before the new screen is painted (no flash).
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    progress.setValue(0);
    stagger.setValue(0);
    Animated.parallel([
      Animated.timing(progress, {
        toValue: 1,
        duration: direction === "tab" ? 420 : 460,
        easing: SCREEN_EASE,
        useNativeDriver: true,
      }),
      Animated.timing(stagger, {
        toValue: 1,
        duration: 820,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  }, [triggerKey, direction, progress, stagger]);

  const opacity = progress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.85, 1],
  });
  const shift = direction === "back" ? -42 : 42;
  const translateX =
    direction === "tab"
      ? 0
      : progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [shift, shift * 0.12, 0] });
  const translateY =
    direction === "tab"
      ? progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [18, 2, 0] })
      : 0;
  const scale = progress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [direction === "tab" ? 0.965 : 0.985, 0.997, 1],
  });

  return (
    <EnterContext.Provider value={ctx}>
      <Animated.View
        style={{ flex: 1, opacity, transform: [{ translateX }, { translateY }, { scale }] }}
      >
        {children}
      </Animated.View>
    </EnterContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  frame: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: SPACING.md },

  circleBtn: {
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
  },

  topBar: {
    height: 54,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  topBarSlot: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  topBarTitle: { flex: 1, textAlign: "center", paddingHorizontal: 4 },
  screenTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    minHeight: 48,
  },

  navWrap: { backgroundColor: COLORS.bg },
  navPill: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.white,
  },
  navRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: NAV_PILL_H + NAV_LIFT,
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  navTab: {
    flex: 1,
    height: NAV_PILL_H + NAV_LIFT,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 12,
    gap: 3,
  },
  navLabel: { fontFamily: FONTS.medium, fontSize: 11, lineHeight: 14 },
  // Page-coloured ring around the yellow circle makes it look scooped out of the bar.
  navActiveRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -1,
  },
  navActiveCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },

  bubbleRow: { flexDirection: "row", marginBottom: 14 },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.bubble,
  },
  dayPillWrap: { alignItems: "center", marginTop: 14, marginBottom: 12 },
  dayPill: {
    backgroundColor: COLORS.inkSoft,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },

  rowLeading: { alignItems: "center", justifyContent: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 78,
    borderRadius: RADIUS.row,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 16,
    marginBottom: 14,
  },
  rowSelected: { borderWidth: 3, borderColor: COLORS.accent },
  rowText: { flex: 1, marginLeft: 14, marginRight: 8 },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    marginBottom: 12,
  },

  chip: {
    height: 42,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: { backgroundColor: COLORS.accent },
  chipIdle: { borderWidth: 1.5, borderColor: COLORS.inkFaint },

  segment: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.pill,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    height: 40,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  button: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    padding: 20,
  },
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: RADIUS.tile,
    alignItems: "center",
    justifyContent: "center",
  },

  searchBar: {
    height: 52,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 18,
    paddingRight: 8,
  },
  composer: {
    minHeight: 56,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 6,
    paddingVertical: 6,
  },

  sheetAnchor: { flex: 1, justifyContent: "flex-end", paddingHorizontal: 12, paddingBottom: 10 },
  sheet: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card + 4,
    padding: 20,
  },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 16,
    marginBottom: 4,
  },

  toastWrap: { position: "absolute", left: 0, right: 0, paddingHorizontal: SPACING.md, zIndex: 50 },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.bubble,
    paddingVertical: 12,
    paddingLeft: 18,
    paddingRight: 12,
  },
  toastBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  waveRow: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

import { Platform, ViewStyle } from "react-native";

/**
 * FounderBrief design tokens — STRICT 4-color system.
 *
 *   #DAF7F3  base canvas of every screen
 *   #FFFFFF  cards, bubbles, inputs, top bar pill, navbar pill
 *   #FBFF28  accent: primary CTA, active/selected states, progress fill
 *   #1C2120  all text, icons, user bubbles, dark action buttons
 *
 * Greys are NOT new colours: they are #1C2120 at reduced opacity.
 */
export const COLORS = {
  bg: "#DAF7F3",
  white: "#FFFFFF",
  accent: "#FBFF28",
  ink: "#1C2120",

  // #1C2120 at reduced opacity (subtext, placeholders, tracks, outlines)
  inkMuted: "rgba(28, 33, 32, 0.62)",
  inkSoft: "rgba(28, 33, 32, 0.46)",
  inkFaint: "rgba(28, 33, 32, 0.24)",
  inkTrack: "rgba(28, 33, 32, 0.14)",
  inkWash: "rgba(28, 33, 32, 0.07)",

  // #FFFFFF at reduced opacity (tinted tiles on the teal canvas)
  whiteTint: "rgba(255, 255, 255, 0.55)",
  /** White at 55% over the page colour, but opaque, so elevated surfaces never show a shadow through. */
  whiteSoft: "#EDFBF9",
  whiteOnInk: "rgba(255, 255, 255, 0.72)",

  // Soft ink veil — teal still reads through; never a muddy gray slab
  scrim: "rgba(28, 33, 32, 0.16)",
} as const;

export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

/** Two shape styles only: large bubble radius and full pill. */
export const RADIUS = {
  bubble: 22, // chat bubbles, inputs, small cards
  card: 28, // large cards / sheets
  row: 34, // tall list rows
  tile: 30, // home tiles
  pill: 999,
  tail: 6, // chat bubble tail corner
} as const;

/** One lift for every elevated surface — airy on teal, never a gray fringe. */
export const SHADOW: ViewStyle = Platform.select<ViewStyle>({
  ios: {
    shadowColor: "#1C2120",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(28, 33, 32, 0.04)",
  },
  android: {
    elevation: 1,
    shadowColor: "#1C2120",
    borderWidth: 1,
    borderColor: "rgba(28, 33, 32, 0.05)",
  },
  default: {},
}) as ViewStyle;

export const FONTS = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extrabold: "Inter_800ExtraBold",
} as const;

export const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

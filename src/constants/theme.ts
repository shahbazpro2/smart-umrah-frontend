/**
 * Genesis Design System - Adapted for Smart Umrah
 * Professional, clean aesthetic with Islamic-inspired warm tones
 * Primary: Indigo (#6366F1) for interactive elements
 * Accents: Warm Islamic-inspired tones (creams, soft golds)
 */

import { Platform } from "react-native";

// Genesis Primary Colors
const PRIMARY = "#6366F1";
const PRIMARY_HOVER = "#4F46E5";
const SECONDARY = "#20970B";
const NEUTRAL = "#9C9C9C";

// Islamic-inspired warm tones
const CREAM = "#FBF8F3";
const SOFT_GOLD = "#D4AF37";
const CALMING_BLUE = "#E8F4F8";

export const Colors = {
  light: {
    // Text - Genesis system
    text: "#0A0A0A", // Near-black
    textSecondary: "#6B6B6B", // Secondary labels
    background: "#FAFAFA", // Light warm gray

    // Interactive - Genesis primary
    primary: PRIMARY,
    primaryHover: PRIMARY_HOVER,

    // Semantic colors
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",

    // Surfaces
    card: "#FFFFFF",
    cardAlt: CREAM,
    surface: "#FFFFFF",

    // Utility
    tint: PRIMARY,
    icon: NEUTRAL,
    tabIconDefault: NEUTRAL,
    tabIconSelected: PRIMARY,

    // Borders & shadows - Genesis subtle approach
    border: "#E8E8EC",
    borderLight: "#F3F3F5",
    shadow: "rgba(0, 0, 0, 0.08)",
    shadowHover: "rgba(99, 102, 241, 0.15)",
  },
  dark: {
    // Dark mode - muted and calming
    text: "#F5F5F5",
    textSecondary: "#B0B0B0",
    background: "#1A1A1A",

    primary: PRIMARY,
    primaryHover: PRIMARY_HOVER,

    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",

    card: "#2D2D2D",
    cardAlt: "#1F1F1F",
    surface: "#252525",

    tint: PRIMARY,
    icon: "#A0A0A0",
    tabIconDefault: "#A0A0A0",
    tabIconSelected: PRIMARY,

    border: "#3A3A3A",
    borderLight: "#2F2F2F",
    shadow: "rgba(0, 0, 0, 0.3)",
    shadowHover: "rgba(99, 102, 241, 0.25)",
  },
};

// Genesis 4px spacing grid
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
  section: 64,
};

// Genesis border radius values
export const BorderRadius = {
  xs: 4, // Tags, chips, badges
  sm: 6, // Buttons, inputs
  md: 8, // Metadata cards, dropdowns
  lg: 12, // Kit cards, search bar
  xl: 16, // Featured sections
  full: 999, // Avatars, pills
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Genesis Typography Scale
export const Typography = {
  display: { fontSize: 72, fontWeight: "800", letterSpacing: -0.04 },
  headline: { fontSize: 60, fontWeight: "800", letterSpacing: -0.03 },
  section: { fontSize: 32, fontWeight: "700", letterSpacing: -0.02 },
  subhead: { fontSize: 24, fontWeight: "700", letterSpacing: -0.01 },
  body: { fontSize: 15, fontWeight: "400", letterSpacing: 0 },
  bodyMedium: { fontSize: 15, fontWeight: "500", letterSpacing: 0 },
  small: { fontSize: 13, fontWeight: "400", letterSpacing: 0 },
  caption: { fontSize: 12, fontWeight: "400", letterSpacing: 0 },
  overline: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.05,
    textTransform: "uppercase",
  },
} as const;

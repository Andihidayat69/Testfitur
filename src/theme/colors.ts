// Color tokens from docs/design/design-system.md. Screens never use hex values directly.
export const colors = {
  primary: "#4385F5", // Electric Blue
  secondary: "#78B8F5", // Sky Blue (never for text)
  accent: "#B9D9FF", // Baby Blue (never for text)
  bg1: "#EAF3FF", // Ice Blue
  bg2: "#F7FAFF", // Soft White
  highlight: "#FFE28A", // Butter Yellow: points, badges, premium, celebrations only
  text: "#172B55", // Deep Navy
  dangerSoft: "#E5484D",
  success: "#3DBE8B",
  card: "#FFFFFF",
  white: "#FFFFFF",
} as const;

export type ColorToken = keyof typeof colors;

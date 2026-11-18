import { colors } from "./colors";

export const space = (steps: number) => steps * 8;

export const layout = {
  sideMargin: 20,
  radius: 16,
  heroRadius: 32,
  pill: 999,
  touchTarget: 48,
  controlHeight: 52,
} as const;

export const shadow = {
  shadowColor: colors.text,
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
} as const;

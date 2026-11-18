// Minimal Reanimated stand-in for Jest. The package's own mock (react-native-reanimated/mock)
// fails to load under Jest in 4.7 ("setCSSEventHandler is not available in JSReanimated"),
// and expo-router's testing library then silently replaces it with an empty object.
// Covers only the APIs the app uses; extend it when a component needs more.
import { View } from "react-native";

const identity = <T,>(value: T) => value;

const Animated = { View };

module.exports = {
  __esModule: true,
  default: Animated,
  ...Animated,
  useReducedMotion: () => false,
  useSharedValue: <T,>(initial: T) => ({ value: initial }),
  useAnimatedStyle: (factory: () => object) => factory(),
  withRepeat: identity,
  withTiming: identity,
  withDelay: (_delay: number, animation: unknown) => animation,
  Easing: { inOut: identity, out: identity, quad: identity, linear: identity },
};

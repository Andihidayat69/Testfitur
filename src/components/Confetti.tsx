import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/theme";

const PIECES = 24;
const palette = [colors.primary, colors.highlight, colors.secondary, colors.success];

/** Short confetti burst for celebrations. Renders nothing when the phone asks for reduced motion. */
export function Confetti({ height = 260 }: { height?: number }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} testID="confetti">
      {Array.from({ length: PIECES }, (_, i) => (
        <Piece key={i} index={i} height={height} />
      ))}
    </View>
  );
}

function Piece({ index, height }: { index: number; height: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay((index % 7) * 70, withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }));
  }, [index, progress]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ translateY: -20 + progress.value * height }, { rotate: `${progress.value * 360}deg` }],
  }));
  return (
    <Animated.View
      style={[
        styles.piece,
        { left: `${(index * 37) % 100}%`, backgroundColor: palette[index % palette.length] },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  piece: { position: "absolute", top: 0, width: 8, height: 12, borderRadius: 2 },
});

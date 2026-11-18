import { Image } from "expo-image";
import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const mascotPoses = {
  sapa: { source: require("@/assets/mascot/sapa.webp"), ratio: 210 / 480 },
  jempol: { source: require("@/assets/mascot/jempol.webp"), ratio: 457 / 480 },
  semangat: { source: require("@/assets/mascot/semangat.webp"), ratio: 404 / 480 },
  gembira: { source: require("@/assets/mascot/gembira.webp"), ratio: 398 / 480 },
  juara: { source: require("@/assets/mascot/juara.webp"), ratio: 391 / 480 },
  keren: { source: require("@/assets/mascot/keren.webp"), ratio: 386 / 480 },
  berpikir: { source: require("@/assets/mascot/berpikir.webp"), ratio: 380 / 480 },
  kaget: { source: require("@/assets/mascot/kaget.webp"), ratio: 381 / 480 },
  "cek-hp": { source: require("@/assets/mascot/cek-hp.webp"), ratio: 382 / 480 },
  menabung: { source: require("@/assets/mascot/menabung.webp"), ratio: 384 / 480 },
  "tabungan-aman": { source: require("@/assets/mascot/tabungan-aman.webp"), ratio: 449 / 480 },
  sayang: { source: require("@/assets/mascot/sayang.webp"), ratio: 377 / 480 },
  fokus: { source: require("@/assets/mascot/fokus.webp"), ratio: 399 / 480 },
  ngantuk: { source: require("@/assets/mascot/ngantuk.webp"), ratio: 417 / 480 },
  sedih: { source: require("@/assets/mascot/sedih.webp"), ratio: 368 / 480 },
} as const;

export type MascotPose = keyof typeof mascotPoses;

const MIN_HEIGHT = 96;
const MIN_HEIGHT_FULL_BODY = 240; // sapa

/** Design-system minimum: 96 px, or 240 px for the full-body `sapa`. */
export function mascotHeight(pose: MascotPose, requested: number): number {
  const min = pose === "sapa" ? MIN_HEIGHT_FULL_BODY : MIN_HEIGHT;
  return Math.max(requested, min);
}

type Props = { pose: MascotPose; height: number; float?: boolean };

export function Mascot({ pose, height, float = true }: Props) {
  const h = mascotHeight(pose, height);
  const { source, ratio } = mascotPoses[pose];
  const reduceMotion = useReducedMotion();
  const offset = useSharedValue(0);

  useEffect(() => {
    if (!float || reduceMotion) return;
    offset.value = withRepeat(withTiming(-6, { duration: 1600, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [float, reduceMotion, offset]);

  const animated = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }));

  return (
    <Animated.View style={animated} testID={`mascot-${pose}`}>
      <Image source={source} style={{ height: h, width: h * ratio }} contentFit="contain" accessible={false} />
    </Animated.View>
  );
}

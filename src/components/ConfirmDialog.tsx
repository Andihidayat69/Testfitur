import { Modal, StyleSheet, View } from "react-native";

import { colors, layout } from "@/theme";

import { AppText } from "./AppText";
import { Button } from "./Button";

type Props = {
  visible: boolean;
  title: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** In-app confirmation pop-up (no system alert). */
export function ConfirmDialog({ visible, title, confirmLabel, cancelLabel = "Batal", onConfirm, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal>
          <AppText variant="title" align="center">
            {title}
          </AppText>
          <View style={styles.actions}>
            <Button label={confirmLabel} onPress={onConfirm} />
            <Button label={cancelLabel} variant="secondary" onPress={onCancel} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(23, 43, 85, 0.4)", // Deep Navy 40%
    alignItems: "center",
    justifyContent: "center",
    padding: layout.sideMargin,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.card,
    borderRadius: layout.radius,
    padding: 24,
    gap: 20,
  },
  actions: { gap: 12 },
});

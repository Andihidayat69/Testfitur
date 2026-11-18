import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { addDays, dayLabel, fromLocalDate, toLocalDate } from "@/lib/dates";

import { AppText } from "./AppText";
import { Chip } from "./Chip";

type Props = { value: string; today: string; onChange: (localDate: string) => void };

/** "Hari ini", "Kemarin" or a picked past date (no future dates). Values are local YYYY-MM-DD. */
export function DateField({ value, today, onChange }: Props) {
  const [iosPickerOpen, setIosPickerOpen] = useState(false);
  const yesterday = addDays(today, -1);
  const custom = value !== today && value !== yesterday;

  const pick = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: fromLocalDate(value),
        mode: "date",
        maximumDate: fromLocalDate(today),
        onValueChange: (_event, date) => onChange(toLocalDate(date)),
      });
    } else {
      setIosPickerOpen((open) => !open);
    }
  };

  return (
    <View style={styles.field}>
      <AppText variant="label">Tanggal</AppText>
      <View style={styles.chips}>
        <Chip label="Hari ini" selected={value === today} onPress={() => onChange(today)} />
        <Chip label="Kemarin" selected={value === yesterday} onPress={() => onChange(yesterday)} />
        <Chip label={custom ? dayLabel(value, today) : "Pilih tanggal"} selected={custom} onPress={pick} />
      </View>
      {Platform.OS === "ios" && iosPickerOpen ? (
        <DateTimePicker
          value={fromLocalDate(value)}
          mode="date"
          display="inline"
          maximumDate={fromLocalDate(today)}
          onValueChange={(_event, date) => onChange(toLocalDate(date))}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});

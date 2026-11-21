
import * as SecureStore from 'expo-secure-store';

export type EntryChoice = 'guest' | 'account' | 'signed-out';

const ENTRY_CHOICE_KEY = 'jajantenang-entry-choice-v1';

export async function getEntryChoice(): Promise<EntryChoice | null> {
  const value = await SecureStore.getItemAsync(ENTRY_CHOICE_KEY);

  if (value === 'guest' || value === 'account' || value === 'signed-out') {
    return value;
  }

  return null;
}

export async function setEntryChoice(choice: EntryChoice): Promise<void> {
  await SecureStore.setItemAsync(ENTRY_CHOICE_KEY, choice);
}

export async function clearEntryChoice(): Promise<void> {
  await SecureStore.deleteItemAsync(ENTRY_CHOICE_KEY);
}

import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const KEY_NAME = "db-encryption-key";

/**
 * The SQLCipher key (decision 0003): generated on first launch, kept only in the
 * platform secure store (Keychain / Keystore). Never log it or write it anywhere else.
 */
export async function getOrCreateDatabaseKey(): Promise<string> {
  const options = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY };
  const existing = await SecureStore.getItemAsync(KEY_NAME, options);
  if (existing) return existing;
  const key = Array.from(Crypto.getRandomBytes(32), (b) => b.toString(16).padStart(2, "0")).join("");
  await SecureStore.setItemAsync(KEY_NAME, key, options);
  return key;
}

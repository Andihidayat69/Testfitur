
// Dummy Supabase environment khusus Jest.
// Tidak mengubah environment aplikasi maupun kredensial produksi.
jest.mock("expo-sqlite/localStorage/install", () => ({}));

// Mock ikon Lucide khusus Jest.
jest.mock("lucide-react-native", () => ({
  Eye: () => null,
  EyeOff: () => null,
}));

process.env.EXPO_PUBLIC_SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || "https://example.supabase.co";

process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "jest-test-publishable-key";

// Simulasi localStorage khusus Jest.
const testStorage = new Map();

global.localStorage = {
  getItem(key) {
    return testStorage.has(key) ? testStorage.get(key) : null;
  },
  setItem(key, value) {
    testStorage.set(key, String(value));
  },
  removeItem(key) {
    testStorage.delete(key);
  },
  clear() {
    testStorage.clear();
  },
};

// Replace Reanimated before anything else loads it.
jest.mock("react-native-reanimated", () =>
  require("./src/test-utils/reanimated-mock")
);
require("react-native-reanimated");

// expo-notifications has no native module under Jest.
jest.mock("expo-notifications", () =>
  require("./src/test-utils/notifications-mock")
);

// expo-constants: use the real app.json config.
jest.mock("expo-constants", () => {
  const actual = jest.requireActual("expo-constants");
  const expoConfig = require("./app.json").expo;
  const constants = { ...(actual.default ?? actual), expoConfig };

  return {
    __esModule: true,
    ...constants,
    default: constants,
  };
});

// Replace Reanimated before anything else loads it. The package's own mock fails under Jest
// in 4.7, and expo-router/testing-library would then swap in an empty object. Requiring the
// mock here caches it, so later jest.mock calls (expo-router's) do not replace it.
jest.mock("react-native-reanimated", () => require("./src/test-utils/reanimated-mock"));
require("react-native-reanimated");

// expo-notifications has no native module under Jest; use an in-memory stand-in.
jest.mock("expo-notifications", () => require("./src/test-utils/notifications-mock"));

// expo-constants has no embedded app config under Jest; read the real app.json so the version
// shown in Profil is tested against the actual configuration.
jest.mock("expo-constants", () => {
  const actual = jest.requireActual("expo-constants");
  const expoConfig = require("./app.json").expo;
  const constants = { ...(actual.default ?? actual), expoConfig };
  return { __esModule: true, ...constants, default: constants };
});

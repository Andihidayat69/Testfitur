// In-memory stand-in for expo-notifications under Jest (its native module is not available).
// Mirrors Android 13+: a never-asked permission reports status "denied" with canAskAgain = true;
// "denied" here means refused for good (canAskAgain = false).
type Scheduled = { identifier: string; content: unknown; trigger: { date: Date } };

const state = {
  permission: "undetermined" as "granted" | "denied" | "undetermined",
  askedResult: "granted" as "granted" | "denied",
  scheduled: [] as Scheduled[],
  requests: 0,
};

export const notificationsMockState = state;

function permissionResponse() {
  return {
    status: state.permission === "granted" ? "granted" : "denied",
    granted: state.permission === "granted",
    canAskAgain: state.permission === "undetermined",
  };
}

export function resetNotificationsMock(opts: { permission?: typeof state.permission; askedResult?: typeof state.askedResult } = {}) {
  state.permission = opts.permission ?? "undetermined";
  state.askedResult = opts.askedResult ?? "granted";
  state.scheduled = [];
  state.requests = 0;
}

module.exports = {
  notificationsMockState: state,
  resetNotificationsMock,
  SchedulableTriggerInputTypes: { DATE: "date" },
  AndroidImportance: { DEFAULT: 3 },
  getPermissionsAsync: async () => permissionResponse(),
  requestPermissionsAsync: async () => {
    state.requests += 1;
    state.permission = state.askedResult;
    return permissionResponse();
  },
  getAllScheduledNotificationsAsync: async () => [...state.scheduled],
  cancelScheduledNotificationAsync: async (id: string) => {
    state.scheduled = state.scheduled.filter((n) => n.identifier !== id);
  },
  scheduleNotificationAsync: async (request: Scheduled) => {
    state.scheduled.push(request);
    return request.identifier;
  },
  setNotificationChannelAsync: async () => null,
  setNotificationHandler: () => {},
};

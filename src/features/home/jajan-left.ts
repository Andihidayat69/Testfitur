export type JajanMood = "safe" | "low" | "over";

export const LOW_THRESHOLD = 0.2; // below 20% of the budget left

export type JajanStatus = {
  left: number; // may be negative
  spentShare: number; // 0..1, for the progress bar
  mood: JajanMood;
};

export function jajanStatus(budget: number, spent: number): JajanStatus {
  const left = budget - spent;
  const spentShare = budget > 0 ? Math.min(1, Math.max(0, spent / budget)) : 1;
  const mood: JajanMood = left < 0 ? "over" : left < budget * LOW_THRESHOLD ? "low" : "safe";
  return { left, spentShare, mood };
}

export const moodContent: Record<JajanMood, { line: string; mascot: "jempol" | "semangat" | "kaget" }> = {
  safe: { line: "Jajanmu masih aman!", mascot: "jempol" },
  low: { line: "Jajanmu mulai menipis. Pelan-pelan, ya.", mascot: "semangat" },
  over: { line: "Kuota jajanmu sudah lewat. Tenang, bulan depan mulai lagi.", mascot: "kaget" },
};

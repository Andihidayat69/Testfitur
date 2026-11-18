
export const habitTypes = [
  "planner",
  "saver",
  "impulsive",
  "spontaneous",
  "balanced",
] as const;

export type HabitType = (typeof habitTypes)[number];

export const habitTypeContent: Record<
  HabitType,
  { name: string; description: string }
> = {
  planner: {
    name: "The Planner",
    description:
      "Kamu terbiasa mengatur keuangan dengan perencanaan. Pertahankan kebiasaan menyusun anggaran dan menentukan prioritas.",
  },
  saver: {
    name: "The Saver",
    description:
      "Kamu memiliki kebiasaan menyisihkan uang untuk masa depan. Pertahankan konsistensi menabung.",
  },
  impulsive: {
    name: "The Impulsive",
    description:
      "Kamu terkadang mudah tergoda untuk membeli sesuatu. Yuk, belajar mempertimbangkan kebutuhan sebelum membeli.",
  },
  spontaneous: {
    name: "The Spontaneous",
    description:
      "Kamu cenderung menggunakan uang secara spontan. Mulailah membuat perencanaan sederhana agar pengeluaran lebih terarah.",
  },
  balanced: {
    name: "The Balanced",
    description:
      "Kamu berusaha menjaga keseimbangan antara kebutuhan, keinginan, dan tabungan. Pertahankan kebiasaan baikmu.",
  },
};

export function isHabitType(value: string): value is HabitType {
  return (habitTypes as readonly string[]).includes(value);
}

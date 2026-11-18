import { describe, expect, test } from "@jest/globals";

import { formatRupiah, formatRupiahInput, parseRupiahInput } from "../lib/money";

describe("formatRupiah", () => {
  test("uses dot thousands separators and no space", () => {
    expect(formatRupiah(400000)).toBe("Rp400.000");
    expect(formatRupiah(1000)).toBe("Rp1.000");
    expect(formatRupiah(999)).toBe("Rp999");
    expect(formatRupiah(0)).toBe("Rp0");
    expect(formatRupiah(100000000)).toBe("Rp100.000.000");
  });

  test("puts a minus sign before Rp for negative values", () => {
    expect(formatRupiah(-25000)).toBe("−Rp25.000");
  });
});

describe("parseRupiahInput", () => {
  test("keeps digits only", () => {
    expect(parseRupiahInput("Rp 1.250.000")).toBe(1250000);
    expect(parseRupiahInput("800000")).toBe(800000);
  });

  test("drops leading zeros", () => {
    expect(parseRupiahInput("000500")).toBe(500);
    expect(parseRupiahInput("0")).toBe(0);
  });

  test("returns null when there are no digits", () => {
    expect(parseRupiahInput("")).toBeNull();
    expect(parseRupiahInput("abc")).toBeNull();
  });
});

describe("formatRupiahInput", () => {
  test("groups thousands while typing", () => {
    expect(formatRupiahInput("1250000")).toBe("1.250.000");
    expect(formatRupiahInput("12")).toBe("12");
    expect(formatRupiahInput("")).toBe("");
  });
});

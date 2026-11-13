export type ColorHarmony =
  "complementary" | "split-complementary" | "analogous" | "triadic"
export const HARMONY_OFFSETS: Record<ColorHarmony, readonly number[]> = {
  complementary: [0, 180, 180],
  "split-complementary": [0, 150, 210],
  analogous: [0, 30, 330],
  triadic: [0, 120, 240],
}
export function harmonize<T extends { h: number; s: number; v: number }>(
  main: T,
  harmony: ColorHarmony,
  count = 3
): T[] {
  return HARMONY_OFFSETS[harmony].map((offset, index) => ({
    ...main,
    h:
      (main.h + (harmony === "analogous" && count === 2 ? 0 : offset) + 360) %
      360,
    s:
      (harmony === "analogous" && count === 2 && index === 1) ||
      (harmony === "complementary" && count === 3 && index === 2)
        ? main.s * 0.55
        : main.s,
  }))
}
export function inferHarmony(hues: number[]): ColorHarmony {
  const distance = (a: number, b: number) =>
    Math.abs(((a - b + 540) % 360) - 180)
  if (hues.length < 2) return "analogous"
  if (hues.length === 2)
    return distance(hues[0], hues[1]) < 3 ? "analogous" : "complementary"
  return (["split-complementary", "analogous", "triadic"] as const).reduce(
    (best, rule) => {
      const score = (candidate: ColorHarmony) =>
        HARMONY_OFFSETS[candidate]
          .slice(1)
          .reduce(
            (sum, offset, i) => sum + distance(hues[i + 1], hues[0] + offset),
            0
          )
      return score(rule) < score(best) ? rule : best
    },
    "analogous" as ColorHarmony
  )
}

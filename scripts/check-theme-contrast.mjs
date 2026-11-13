import assert from "node:assert/strict"
import {
  generateColorPalette,
  contrastRatio,
  hslToHex,
  readableInkOn,
  normalizeThemeColor,
  generateLegacyPalette,
  generateM3Palette,
  THEME_ENGINE,
} from "../lib/color-utils.ts"

const colors = new Set([
  "#000000",
  "#ffffff",
  "#808080",
  "#777777",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#00ffff",
  "#ff00ff",
])
for (let hue = 0; hue < 360; hue += 15) {
  for (const saturation of [0, 5, 20, 50, 80, 100]) {
    for (let lightness = 0; lightness <= 100; lightness += 5)
      colors.add(hslToHex(hue, saturation, lightness))
  }
}
const pairs = [
  ["text", "primary", 4.5],
  ["secondaryText", "primary", 4.5],
  ["cardText", "surface", 4.5],
  ["cardSecondaryText", "surface", 4.5],
  ["cardHeading", "surface", 4.5],
  ["mutedForeground", "base", 4.5],
  ["mutedForeground", "primary", 4.5],
  ["primaryForeground", "primary", 4.5],
  ["brandForeground", "brand", 4.5],
  ["secondaryForeground", "secondary", 4.5],
  ["baseForeground", "base", 4.5],
  ["surfaceForeground", "surface", 4.5],
  ["border", "primary", 3],
  ["cardBorder", "surface", 3],
  ["ring", "primary", 3],
  ["effectText", "effectSurface", 7],
  ["success", "surface", 4.5],
  ["warning", "surface", 4.5],
]
let checks = 0
for (const color of colors) {
  const palette = generateColorPalette(color)
  for (const [fg, bg, minimum] of pairs) {
    const ratio = contrastRatio(palette[fg], palette[bg])
    assert.ok(
      ratio >= minimum,
      `${color}: ${fg}/${bg}: ${ratio.toFixed(3)} < ${minimum}`
    )
    checks++
  }
  assert.ok(
    contrastRatio(readableInkOn(color), color) >= 4.5,
    `Ink failed on ${color}`
  )
  const original =
    THEME_ENGINE === "m3" ? generateM3Palette : generateLegacyPalette
  assert.equal(
    palette.surface,
    original(color).surface,
    `Surface changed for ${color}`
  )
  for (const [companion, third] of [
    ["#f6693e", null],
    ["#7935ed", "#36d024"],
  ]) {
    const multiple = generateColorPalette(color, companion, third)
    assert.equal(multiple.surface, original(companion).surface)
    assert.equal(multiple.brand, original(third || companion).brand)
    for (const [fg, bg, minimum] of pairs) {
      assert.ok(
        contrastRatio(multiple[fg], multiple[bg]) >= minimum,
        `${color}/${companion}/${third}: ${fg}/${bg} contrast failed`
      )
      checks++
    }
  }
}
assert.equal(normalizeThemeColor(" #AbC "), "#aabbcc")
assert.equal(generateColorPalette("#fff"), generateColorPalette("#ffffff"))
for (const invalid of ["", "red", "#12345", "#ggg", "url(example.com)"])
  assert.throws(() => normalizeThemeColor(invalid))
console.log(
  `PASS: ${checks} token contrast checks across ${colors.size} colors, plus readable ink and input validation.`
)

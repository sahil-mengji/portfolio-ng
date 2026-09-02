// import React, { useEffect, useMemo, useRef, useState } from "react"
// import { Download, RotateCcw } from "lucide-react"

// const DEFAULTS = {
//   xUnits: 50,
//   yUnits: 35,
//   majorEvery: 5,
//   cellSize: 20,
//   bgColor: "#00332A",
//   inkColor: "#E5E55A",
//   showArcs: true,
//   showAngles: true,
// }

// const ANGLES = [15, 30, 45, 60]

// const PRESETS = [
//   { name: "Classic", bg: "#00332A", ink: "#E5E55A" },
//   { name: "Monochrome", bg: "#111111", ink: "#FFFFFF" },
//   { name: "Neutral", bg: "#2B2A28", ink: "#D9D4C7" },
//   { name: "Dark Red", bg: "#3D0000", ink: "#FF2E2E" },
//   { name: "Blue", bg: "#002F9E", ink: "#EDEEFD" },
//   { name: "Warm Orange", bg: "#FF3F0A", ink: "#000000" },
//   { name: "Pink", bg: "#CA6395", ink: "#FFFFFF" },
//   { name: "Teal", bg: "#095848", ink: "#30F8AB" },
// ]

// // Lets the person type freely (including clearing the field or typing a
// // number below the minimum digit by digit) without snapping to a clamped
// // value on every keystroke. The value only gets clamped into range once
// // they blur the field; the raw text is what's shown while they're typing.
// function useNumberField(value, setValue, min, max) {
//   const [draft, setDraft] = useState(String(value))

//   useEffect(() => {
//     setDraft(String(value))
//   }, [value])

//   const onChange = (e) => {
//     const raw = e.target.value
//     setDraft(raw)
//     if (raw === "" || raw === "-") return
//     const num = Number(raw)
//     if (Number.isFinite(num)) {
//       // Live-update the render so the preview keeps up, but only cap the
//       // upper bound here — the lower bound is enforced on blur so partial
//       // input (like the "3" on the way to typing "35") isn't punished.
//       setValue(Math.min(max, Math.max(0, Math.round(num))))
//     }
//   }

//   const onBlur = () => {
//     const num = Number(draft)
//     const clamped = Number.isFinite(num)
//       ? Math.max(min, Math.min(max, Math.round(num)))
//       : min
//     setValue(clamped)
//     setDraft(String(clamped))
//   }

//   return { value: draft, onChange, onBlur }
// }

// function hexToRgba(hex, alpha) {
//   let h = (hex || "#000000").replace("#", "")
//   if (h.length === 3)
//     h = h
//       .split("")
//       .map((c) => c + c)
//       .join("")
//   const num = parseInt(h, 16) || 0
//   const r = (num >> 16) & 255
//   const g = (num >> 8) & 255
//   const b = num & 255
//   return `rgba(${r}, ${g}, ${b}, ${alpha})`
// }

// export default function DraftingGrid() {
//   const [xUnits, setXUnits] = useState(DEFAULTS.xUnits)
//   const [yUnits, setYUnits] = useState(DEFAULTS.yUnits)
//   const [majorEvery, setMajorEvery] = useState(DEFAULTS.majorEvery)
//   const [cellSize, setCellSize] = useState(DEFAULTS.cellSize)
//   const [bgColor, setBgColor] = useState(DEFAULTS.bgColor)
//   const [inkColor, setInkColor] = useState(DEFAULTS.inkColor)
//   const [showArcs, setShowArcs] = useState(DEFAULTS.showArcs)
//   const [showAngles, setShowAngles] = useState(DEFAULTS.showAngles)
//   const svgRef = useRef(null)
//   const bgColorInputRef = useRef(null)

//   const widthField = useNumberField(xUnits, setXUnits, 5, 200)
//   const heightField = useNumberField(yUnits, setYUnits, 5, 200)
//   const majorField = useNumberField(
//     majorEvery,
//     setMajorEvery,
//     1,
//     Math.max(1, Math.min(xUnits, yUnits))
//   )
//   const cellField = useNumberField(cellSize, setCellSize, 6, 48)

//   const geometry = useMemo(() => {
//     const margin = 60
//     const plotW = xUnits * cellSize
//     const plotH = yUnits * cellSize
//     const LEFT = margin
//     const TOP = margin
//     const RIGHT = margin + plotW
//     const BOTTOM = margin + plotH
//     const svgW = plotW + margin * 2
//     const svgH = plotH + margin * 2

//     const isEdgeI = (i) => i === 0 || i === xUnits
//     const isEdgeJ = (j) => j === 0 || j === yUnits

//     const verticalLines = []
//     for (let i = 0; i <= xUnits; i++) {
//       verticalLines.push({
//         x: LEFT + i * cellSize,
//         major: i % majorEvery === 0 || isEdgeI(i),
//       })
//     }

//     const horizontalLines = []
//     for (let j = 0; j <= yUnits; j++) {
//       horizontalLines.push({
//         y: BOTTOM - j * cellSize,
//         major: j % majorEvery === 0 || isEdgeJ(j),
//       })
//     }

//     const topTicks = []
//     const bottomTicks = []
//     for (let i = 0; i <= xUnits; i++) {
//       const x = LEFT + i * cellSize
//       const major = i % majorEvery === 0 || isEdgeI(i)
//       topTicks.push({ x, major })
//       bottomTicks.push({ x, major })
//     }

//     const leftTicks = []
//     const rightTicks = []
//     for (let j = 0; j <= yUnits; j++) {
//       const y = BOTTOM - j * cellSize
//       const major = j % majorEvery === 0 || isEdgeJ(j)
//       leftTicks.push({ y, major })
//       rightTicks.push({ y, major })
//     }

//     const topLabels = []
//     const bottomLabels = []
//     for (let i = 0; i <= xUnits; i += majorEvery) {
//       const x = LEFT + i * cellSize
//       topLabels.push({ x, value: i })
//       bottomLabels.push({ x, value: i })
//     }
//     if (xUnits % majorEvery !== 0) {
//       topLabels.push({ x: RIGHT, value: xUnits })
//       bottomLabels.push({ x: RIGHT, value: xUnits })
//     }

//     const leftLabels = []
//     const rightLabels = []
//     for (let j = 0; j <= yUnits; j += majorEvery) {
//       const y = BOTTOM - j * cellSize
//       leftLabels.push({ y, value: j })
//       rightLabels.push({ y, value: j })
//     }
//     if (yUnits % majorEvery !== 0) {
//       leftLabels.push({ y: TOP, value: yUnits })
//       rightLabels.push({ y: TOP, value: yUnits })
//     }

//     // corner compass arcs (quarter circles from the origin, radii in units)
//     const minUnits = Math.min(xUnits, yUnits)
//     const arcStep = majorEvery * 2
//     let arcRadii = []
//     for (let r = arcStep; r < minUnits; r += arcStep) arcRadii.push(r)
//     if (arcRadii.length > 5) {
//       const stride = Math.ceil(arcRadii.length / 5)
//       arcRadii = arcRadii.filter((_, idx) => idx % stride === 0)
//     }
//     const arcs = arcRadii.map((r) => {
//       const radiusPx = r * cellSize
//       const ticks = []
//       for (let deg = 0; deg <= 90; deg += 5) {
//         const rad = (deg * Math.PI) / 180
//         const dir = { x: Math.cos(rad), y: -Math.sin(rad) }
//         const half = Math.min(8, Math.max(2, cellSize * 0.2))
//         ticks.push({
//           x1: LEFT + (radiusPx - half) * dir.x,
//           y1: BOTTOM + (radiusPx - half) * dir.y,
//           x2: LEFT + (radiusPx + half) * dir.x,
//           y2: BOTTOM + (radiusPx + half) * dir.y,
//         })
//       }
//       const labelRad = (45 * Math.PI) / 180
//       const labelDist = radiusPx + Math.max(10, cellSize * 0.6)
//       return {
//         path: `M ${LEFT} ${BOTTOM - radiusPx} A ${radiusPx} ${radiusPx} 0 0 1 ${LEFT + radiusPx} ${BOTTOM}`,
//         ticks,
//         label: {
//           x: LEFT + labelDist * Math.cos(labelRad),
//           y: BOTTOM - labelDist * Math.sin(labelRad),
//           text: String(r),
//         },
//       }
//     })

//     // angle reference guides, drawn from the origin to the plot boundary
//     const angleGuides = ANGLES.map((angle) => {
//       const rad = (angle * Math.PI) / 180
//       const dyAtRight = plotW * Math.tan(rad)
//       const end =
//         dyAtRight <= plotH
//           ? { x: RIGHT, y: BOTTOM - dyAtRight }
//           : { x: LEFT + plotH / Math.tan(rad), y: TOP }
//       const lineLength = Math.hypot(end.x - LEFT, end.y - BOTTOM) || 1
//       const targetDist = 0.3 * Math.min(plotW, plotH)
//       const t = Math.min(0.85, Math.max(0.12, targetDist / lineLength))
//       return {
//         angle,
//         end,
//         label: {
//           x: LEFT + t * (end.x - LEFT),
//           y: BOTTOM + t * (end.y - BOTTOM),
//           text: `${angle}\u00B0`,
//         },
//       }
//     })

//     return {
//       LEFT,
//       TOP,
//       RIGHT,
//       BOTTOM,
//       svgW,
//       svgH,
//       verticalLines,
//       horizontalLines,
//       topTicks,
//       bottomTicks,
//       leftTicks,
//       rightTicks,
//       topLabels,
//       bottomLabels,
//       leftLabels,
//       rightLabels,
//       arcs,
//       angleGuides,
//     }
//   }, [xUnits, yUnits, majorEvery, cellSize])

//   const majorStroke = inkColor
//   const minorStroke = hexToRgba(inkColor, 0.45)
//   const guideStroke = hexToRgba(inkColor, 0.45)
//   const isCustomPalette = !PRESETS.some(
//     (p) =>
//       p.bg.toLowerCase() === bgColor.toLowerCase() &&
//       p.ink.toLowerCase() === inkColor.toLowerCase()
//   )

//   const { LEFT, TOP, RIGHT, BOTTOM, svgW, svgH } = geometry
//   const tickOuter = 24
//   const tickMinorStop = 12
//   const labelOffset = 40

//   const handleDownload = () => {
//     if (!svgRef.current) return
//     const source = new XMLSerializer().serializeToString(svgRef.current)
//     const blob = new Blob([source], { type: "image/svg+xml" })
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement("a")
//     a.href = url
//     a.download = `drafting-grid-${xUnits}x${yUnits}.svg`
//     a.click()
//     URL.revokeObjectURL(url)
//   }

//   const handleReset = () => {
//     setXUnits(DEFAULTS.xUnits)
//     setYUnits(DEFAULTS.yUnits)
//     setMajorEvery(DEFAULTS.majorEvery)
//     setCellSize(DEFAULTS.cellSize)
//     setBgColor(DEFAULTS.bgColor)
//     setInkColor(DEFAULTS.inkColor)
//     setShowArcs(DEFAULTS.showArcs)
//     setShowAngles(DEFAULTS.showAngles)
//   }

//   return (
//     <div className="flex min-h-screen w-full flex-col items-center gap-5 bg-neutral-950 px-4 py-8 text-neutral-200">
//       <div className="w-full max-w-5xl">
//         <h1 className="text-base font-medium text-neutral-200">
//           Drafting grid generator
//         </h1>
//         <p className="mt-1 text-sm text-neutral-500">
//           Set the grid size in units and pick your own colors.
//         </p>
//       </div>

//       <div className="flex w-full max-w-5xl flex-wrap items-end gap-x-6 gap-y-4 border border-neutral-800 bg-neutral-900 p-4">
//         <label className="flex flex-col gap-1 text-xs text-neutral-400">
//           Width (units)
//           <input
//             type="number"
//             min={5}
//             max={200}
//             value={widthField.value}
//             onChange={widthField.onChange}
//             onBlur={widthField.onBlur}
//             className="w-24 border border-neutral-700 bg-neutral-950 px-2 py-1 font-mono text-sm text-neutral-100 focus:border-neutral-400 focus:outline-none"
//           />
//         </label>

//         <label className="flex flex-col gap-1 text-xs text-neutral-400">
//           Height (units)
//           <input
//             type="number"
//             min={5}
//             max={200}
//             value={heightField.value}
//             onChange={heightField.onChange}
//             onBlur={heightField.onBlur}
//             className="w-24 border border-neutral-700 bg-neutral-950 px-2 py-1 font-mono text-sm text-neutral-100 focus:border-neutral-400 focus:outline-none"
//           />
//         </label>

//         <label className="flex flex-col gap-1 text-xs text-neutral-400">
//           Major line every
//           <input
//             type="number"
//             min={1}
//             max={Math.max(1, Math.min(xUnits, yUnits))}
//             value={majorField.value}
//             onChange={majorField.onChange}
//             onBlur={majorField.onBlur}
//             className="w-20 border border-neutral-700 bg-neutral-950 px-2 py-1 font-mono text-sm text-neutral-100 focus:border-neutral-400 focus:outline-none"
//           />
//         </label>

//         <label className="flex flex-col gap-1 text-xs text-neutral-400">
//           Cell size (px)
//           <input
//             type="number"
//             min={6}
//             max={48}
//             value={cellField.value}
//             onChange={cellField.onChange}
//             onBlur={cellField.onBlur}
//             className="w-20 border border-neutral-700 bg-neutral-950 px-2 py-1 font-mono text-sm text-neutral-100 focus:border-neutral-400 focus:outline-none"
//           />
//         </label>

//         <div className="mt-1 flex w-full flex-wrap items-center gap-3 border-t border-neutral-800 pt-3">
//           <span className="text-xs text-neutral-500">Presets</span>
//           {PRESETS.map((p) => {
//             const active =
//               !isCustomPalette &&
//               bgColor.toLowerCase() === p.bg.toLowerCase() &&
//               inkColor.toLowerCase() === p.ink.toLowerCase()
//             return (
//               <button
//                 key={p.name}
//                 type="button"
//                 onClick={() => {
//                   setBgColor(p.bg)
//                   setInkColor(p.ink)
//                 }}
//                 title={p.name}
//                 className="group flex flex-col items-center gap-1"
//               >
//                 <span
//                   className={`block h-7 w-7 rounded-full border-2 ${active ? "border-neutral-100" : "border-neutral-700 group-hover:border-neutral-500"}`}
//                   style={{
//                     background: `linear-gradient(135deg, ${p.bg} 50%, ${p.ink} 50%)`,
//                   }}
//                 />
//                 <span
//                   className={`text-[10px] ${active ? "text-neutral-200" : "text-neutral-500 group-hover:text-neutral-300"}`}
//                 >
//                   {p.name}
//                 </span>
//               </button>
//             )
//           })}
//           <button
//             type="button"
//             onClick={() => bgColorInputRef.current?.focus()}
//             title="Pick your own colors"
//             className="group flex flex-col items-center gap-1"
//           >
//             <span
//               className={`block h-7 w-7 rounded-full border-2 border-dashed ${isCustomPalette ? "border-neutral-100" : "border-neutral-700 group-hover:border-neutral-500"}`}
//               style={{
//                 background: `linear-gradient(135deg, ${bgColor} 50%, ${inkColor} 50%)`,
//               }}
//             />
//             <span
//               className={`text-[10px] ${isCustomPalette ? "text-neutral-200" : "text-neutral-500 group-hover:text-neutral-300"}`}
//             >
//               Custom
//             </span>
//           </button>
//         </div>

//         <label className="flex flex-col gap-1 text-xs text-neutral-400">
//           Background
//           <input
//             ref={bgColorInputRef}
//             type="color"
//             value={bgColor}
//             onChange={(e) => setBgColor(e.target.value)}
//             className="h-8 w-12 cursor-pointer border border-neutral-700 bg-neutral-950"
//           />
//         </label>

//         <label className="flex flex-col gap-1 text-xs text-neutral-400">
//           Grid / ink color
//           <input
//             type="color"
//             value={inkColor}
//             onChange={(e) => setInkColor(e.target.value)}
//             className="h-8 w-12 cursor-pointer border border-neutral-700 bg-neutral-950"
//           />
//         </label>

//         <label className="flex items-center gap-2 pb-1.5 text-xs text-neutral-400">
//           <input
//             type="checkbox"
//             checked={showArcs}
//             onChange={(e) => setShowArcs(e.target.checked)}
//           />
//           Compass arcs
//         </label>

//         <label className="flex items-center gap-2 pb-1.5 text-xs text-neutral-400">
//           <input
//             type="checkbox"
//             checked={showAngles}
//             onChange={(e) => setShowAngles(e.target.checked)}
//           />
//           Angle guides
//         </label>

//         <div className="ml-auto flex gap-2">
//           <button
//             onClick={handleReset}
//             className="flex items-center gap-1.5 border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
//           >
//             <RotateCcw size={13} /> Reset
//           </button>
//           <button
//             onClick={handleDownload}
//             className="flex items-center gap-1.5 bg-neutral-100 px-3 py-1.5 text-xs text-neutral-900 hover:bg-white"
//           >
//             <Download size={13} /> Download SVG
//           </button>
//         </div>
//       </div>

//       <div
//         className="w-full max-w-5xl overflow-auto border border-neutral-800 p-2"
//         style={{ backgroundColor: bgColor }}
//       >
//         <svg
//           ref={svgRef}
//           viewBox={`0 0 ${svgW} ${svgH}`}
//           width="100%"
//           style={{ display: "block", backgroundColor: bgColor }}
//         >
//           <rect x={0} y={0} width={svgW} height={svgH} fill={bgColor} />

//           {showArcs &&
//             geometry.arcs.map((arc, idx) => (
//               <g key={`arc-${idx}`}>
//                 <path
//                   d={arc.path}
//                   fill="none"
//                   stroke={guideStroke}
//                   strokeWidth={1}
//                 />
//                 {arc.ticks.map((t, ti) => (
//                   <line
//                     key={ti}
//                     x1={t.x1}
//                     y1={t.y1}
//                     x2={t.x2}
//                     y2={t.y2}
//                     stroke={guideStroke}
//                     strokeWidth={0.5}
//                   />
//                 ))}
//                 <rect
//                   x={arc.label.x - 10}
//                   y={arc.label.y - 7}
//                   width={20}
//                   height={14}
//                   fill={bgColor}
//                 />
//                 <text
//                   x={arc.label.x}
//                   y={arc.label.y + 3}
//                   textAnchor="middle"
//                   fontSize={10}
//                   fill={inkColor}
//                 >
//                   {arc.label.text}
//                 </text>
//               </g>
//             ))}

//           {geometry.verticalLines.map((l, idx) => (
//             <line
//               key={`v-${idx}`}
//               x1={l.x}
//               y1={TOP}
//               x2={l.x}
//               y2={BOTTOM}
//               stroke={l.major ? majorStroke : minorStroke}
//               strokeWidth={l.major ? 1 : 0.5}
//             />
//           ))}
//           {geometry.horizontalLines.map((l, idx) => (
//             <line
//               key={`h-${idx}`}
//               x1={LEFT}
//               y1={l.y}
//               x2={RIGHT}
//               y2={l.y}
//               stroke={l.major ? majorStroke : minorStroke}
//               strokeWidth={l.major ? 1 : 0.5}
//             />
//           ))}

//           {showAngles &&
//             geometry.angleGuides.map((g, idx) => (
//               <g key={`ang-${idx}`}>
//                 <line
//                   x1={LEFT}
//                   y1={BOTTOM}
//                   x2={g.end.x}
//                   y2={g.end.y}
//                   stroke={guideStroke}
//                   strokeWidth={1}
//                   strokeDasharray="3,2"
//                 />
//                 <rect
//                   x={g.label.x - 12}
//                   y={g.label.y - 7}
//                   width={24}
//                   height={14}
//                   rx={7}
//                   ry={7}
//                   fill={bgColor}
//                 />
//                 <text
//                   x={g.label.x}
//                   y={g.label.y + 3}
//                   textAnchor="middle"
//                   fontSize={10}
//                   fill={inkColor}
//                 >
//                   {g.label.text}
//                 </text>
//               </g>
//             ))}

//           {geometry.topTicks.map((t, idx) => (
//             <line
//               key={`tt-${idx}`}
//               x1={t.x}
//               y1={TOP - tickOuter}
//               x2={t.x}
//               y2={t.major ? TOP : TOP - tickMinorStop}
//               stroke={majorStroke}
//               strokeWidth={0.5}
//             />
//           ))}
//           {geometry.bottomTicks.map((t, idx) => (
//             <line
//               key={`bt-${idx}`}
//               x1={t.x}
//               y1={t.major ? BOTTOM : BOTTOM + tickMinorStop}
//               x2={t.x}
//               y2={BOTTOM + tickOuter}
//               stroke={majorStroke}
//               strokeWidth={0.5}
//             />
//           ))}
//           {geometry.leftTicks.map((t, idx) => (
//             <line
//               key={`lt-${idx}`}
//               x1={LEFT - tickOuter}
//               y1={t.y}
//               x2={t.major ? LEFT : LEFT - tickMinorStop}
//               y2={t.y}
//               stroke={majorStroke}
//               strokeWidth={0.5}
//             />
//           ))}
//           {geometry.rightTicks.map((t, idx) => (
//             <line
//               key={`rt-${idx}`}
//               x1={t.major ? RIGHT : RIGHT + tickMinorStop}
//               y1={t.y}
//               x2={RIGHT + tickOuter}
//               y2={t.y}
//               stroke={majorStroke}
//               strokeWidth={0.5}
//             />
//           ))}

//           {geometry.topLabels.map((l, idx) => (
//             <text
//               key={`tl-${idx}`}
//               x={l.x}
//               y={TOP - labelOffset}
//               textAnchor="middle"
//               fontSize={10}
//               fill={inkColor}
//             >
//               {l.value}
//             </text>
//           ))}
//           {geometry.bottomLabels.map((l, idx) => (
//             <text
//               key={`bl-${idx}`}
//               x={l.x}
//               y={BOTTOM + labelOffset}
//               textAnchor="middle"
//               fontSize={10}
//               fill={inkColor}
//             >
//               {l.value}
//             </text>
//           ))}
//           {geometry.leftLabels.map((l, idx) => (
//             <text
//               key={`ll-${idx}`}
//               x={LEFT - labelOffset}
//               y={l.y + 3}
//               textAnchor="middle"
//               fontSize={10}
//               fill={inkColor}
//             >
//               {l.value}
//             </text>
//           ))}
//           {geometry.rightLabels.map((l, idx) => (
//             <text
//               key={`rl-${idx}`}
//               x={RIGHT + labelOffset}
//               y={l.y + 3}
//               textAnchor="middle"
//               fontSize={10}
//               fill={inkColor}
//             >
//               {l.value}
//             </text>
//           ))}
//         </svg>
//       </div>
//     </div>
//   )
// }

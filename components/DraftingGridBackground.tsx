import React, { forwardRef, useMemo, CSSProperties } from "react"

// --- Helper: convert hex color to rgba ---
function hexToRgba(hex: string, alpha: number): string {
  let h = (hex || "#000000").replace("#", "")
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("")
  const num = parseInt(h, 16) || 0
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// --- Geometry hook (pure calculation) ---
export function useDraftingGridGeometry(
  xUnits: number,
  yUnits: number,
  majorEvery: number,
  cellSize: number,
  margin = 60
) {
  return useMemo(() => {
    const plotW = xUnits * cellSize
    const plotH = yUnits * cellSize
    const LEFT = margin
    const TOP = margin
    const RIGHT = margin + plotW
    const BOTTOM = margin + plotH
    const svgW = plotW + margin * 2
    const svgH = plotH + margin * 2

    const isEdgeI = (i: number) => i === 0 || i === xUnits
    const isEdgeJ = (j: number) => j === 0 || j === yUnits

    const verticalLines = []
    for (let i = 0; i <= xUnits; i++) {
      verticalLines.push({
        x: LEFT + i * cellSize,
        major: i % majorEvery === 0 || isEdgeI(i),
      })
    }

    const horizontalLines = []
    for (let j = 0; j <= yUnits; j++) {
      horizontalLines.push({
        y: BOTTOM - j * cellSize,
        major: j % majorEvery === 0 || isEdgeJ(j),
      })
    }

    const topTicks = []
    const bottomTicks = []
    for (let i = 0; i <= xUnits; i++) {
      const x = LEFT + i * cellSize
      const major = i % majorEvery === 0 || isEdgeI(i)
      topTicks.push({ x, major })
      bottomTicks.push({ x, major })
    }

    const leftTicks = []
    const rightTicks = []
    for (let j = 0; j <= yUnits; j++) {
      const y = BOTTOM - j * cellSize
      const major = j % majorEvery === 0 || isEdgeJ(j)
      leftTicks.push({ y, major })
      rightTicks.push({ y, major })
    }

    const topLabels = []
    const bottomLabels = []
    for (let i = 0; i <= xUnits; i += majorEvery) {
      const x = LEFT + i * cellSize
      topLabels.push({ x, value: i })
      bottomLabels.push({ x, value: i })
    }
    if (xUnits % majorEvery !== 0) {
      topLabels.push({ x: RIGHT, value: xUnits })
      bottomLabels.push({ x: RIGHT, value: xUnits })
    }

    const leftLabels = []
    const rightLabels = []
    for (let j = 0; j <= yUnits; j += majorEvery) {
      const y = BOTTOM - j * cellSize
      leftLabels.push({ y, value: j })
      rightLabels.push({ y, value: j })
    }
    if (yUnits % majorEvery !== 0) {
      leftLabels.push({ y: TOP, value: yUnits })
      rightLabels.push({ y: TOP, value: yUnits })
    }

    // corner compass arcs
    const minUnits = Math.min(xUnits, yUnits)
    const arcStep = majorEvery * 2
    let arcRadii = []
    for (let r = arcStep; r < minUnits; r += arcStep) arcRadii.push(r)
    if (arcRadii.length > 5) {
      const stride = Math.ceil(arcRadii.length / 5)
      arcRadii = arcRadii.filter((_, idx) => idx % stride === 0)
    }
    const arcs = arcRadii.map((r) => {
      const radiusPx = r * cellSize
      const ticks = []
      for (let deg = 0; deg <= 90; deg += 5) {
        const rad = (deg * Math.PI) / 180
        const dir = { x: Math.cos(rad), y: -Math.sin(rad) }
        const half = Math.min(8, Math.max(2, cellSize * 0.2))
        ticks.push({
          x1: LEFT + (radiusPx - half) * dir.x,
          y1: BOTTOM + (radiusPx - half) * dir.y,
          x2: LEFT + (radiusPx + half) * dir.x,
          y2: BOTTOM + (radiusPx + half) * dir.y,
        })
      }
      const labelRad = (45 * Math.PI) / 180
      const labelDist = radiusPx + Math.max(10, cellSize * 0.6)
      return {
        path: `M ${LEFT} ${BOTTOM - radiusPx} A ${radiusPx} ${radiusPx} 0 0 1 ${LEFT + radiusPx} ${BOTTOM}`,
        ticks,
        label: {
          x: LEFT + labelDist * Math.cos(labelRad),
          y: BOTTOM - labelDist * Math.sin(labelRad),
          text: String(r),
        },
      }
    })

    // angle guides
    const angleGuides = [15, 30, 45, 60].map((angle) => {
      const rad = (angle * Math.PI) / 180
      const dyAtRight = plotW * Math.tan(rad)
      const end =
        dyAtRight <= plotH
          ? { x: RIGHT, y: BOTTOM - dyAtRight }
          : { x: LEFT + plotH / Math.tan(rad), y: TOP }
      const lineLength = Math.hypot(end.x - LEFT, end.y - BOTTOM) || 1
      const targetDist = 0.3 * Math.min(plotW, plotH)
      const t = Math.min(0.85, Math.max(0.12, targetDist / lineLength))
      return {
        angle,
        end,
        label: {
          x: LEFT + t * (end.x - LEFT),
          y: BOTTOM + t * (end.y - BOTTOM),
          text: `${angle}\u00B0`,
        },
      }
    })

    return {
      LEFT,
      TOP,
      RIGHT,
      BOTTOM,
      svgW,
      svgH,
      verticalLines,
      horizontalLines,
      topTicks,
      bottomTicks,
      leftTicks,
      rightTicks,
      topLabels,
      bottomLabels,
      leftLabels,
      rightLabels,
      arcs,
      angleGuides,
    }
  }, [xUnits, yUnits, majorEvery, cellSize, margin])
}

// --- Component ---
interface DraftingGridBackgroundProps {
  xUnits: number
  yUnits: number
  majorEvery: number
  cellSize: number
  bgColor: string
  inkColor: string
  showArcs: boolean
  showAngles: boolean
  margin?: number
  style?: CSSProperties
  svgWidth?: number | string
  svgHeight?: number | string
  className?: string
}

const DraftingGridBackground = forwardRef<
  SVGSVGElement,
  DraftingGridBackgroundProps
>(
  (
    {
      xUnits,
      yUnits,
      majorEvery,
      cellSize,
      bgColor,
      inkColor,
      showArcs,
      showAngles,
      margin = 60,
      style,
      svgWidth = "100%",
      svgHeight = "100%",
      className,
    },
    ref
  ) => {
    const geometry = useDraftingGridGeometry(
      xUnits,
      yUnits,
      majorEvery,
      cellSize,
      margin
    )

    const majorStroke = hexToRgba(inkColor, 0.29)
    const minorStroke = hexToRgba(inkColor, 0.26)
    const guideStroke = hexToRgba(inkColor, 0.26)
    const labelFill = hexToRgba(inkColor, 0.56)
    const tickStroke = hexToRgba(inkColor, 0.42)

    const { LEFT, TOP, RIGHT, BOTTOM, svgW, svgH } = geometry
    const tickOuter = 24
    const tickMinorStop = 12
    const labelOffset = 40

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${svgW} ${svgH}`}
        width={svgWidth}
        height={svgHeight}
        style={{ display: "block", backgroundColor: bgColor, ...style }}
        className={className}
      >
        <rect x={0} y={0} width={svgW} height={svgH} fill={bgColor} />

        {showArcs &&
          geometry.arcs.map((arc, idx) => (
            <g key={`arc-${idx}`}>
              <path
                d={arc.path}
                fill="none"
                stroke={guideStroke}
                strokeWidth={1}
              />
              {arc.ticks.map((t, ti) => (
                <line
                  key={ti}
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={guideStroke}
                  strokeWidth={0.5}
                />
              ))}
              <rect
                x={arc.label.x - 10}
                y={arc.label.y - 7}
                width={20}
                height={14}
                fill={bgColor}
              />
              <text
                x={arc.label.x}
                y={arc.label.y + 3}
                textAnchor="middle"
                fontSize={10}
                fill={labelFill}
              >
                {arc.label.text}
              </text>
            </g>
          ))}

        {geometry.verticalLines.map((l, idx) => (
          <line
            key={`v-${idx}`}
            x1={l.x}
            y1={TOP}
            x2={l.x}
            y2={BOTTOM}
            stroke={l.major ? majorStroke : minorStroke}
            strokeWidth={l.major ? 1 : 0.5}
          />
        ))}
        {geometry.horizontalLines.map((l, idx) => (
          <line
            key={`h-${idx}`}
            x1={LEFT}
            y1={l.y}
            x2={RIGHT}
            y2={l.y}
            stroke={l.major ? majorStroke : minorStroke}
            strokeWidth={l.major ? 1 : 0.5}
          />
        ))}

        {showAngles &&
          geometry.angleGuides.map((g, idx) => (
            <g key={`ang-${idx}`}>
              <line
                x1={LEFT}
                y1={BOTTOM}
                x2={g.end.x}
                y2={g.end.y}
                stroke={guideStroke}
                strokeWidth={1}
                strokeDasharray="3,2"
              />
              <rect
                x={g.label.x - 12}
                y={g.label.y - 7}
                width={24}
                height={14}
                rx={7}
                ry={7}
                fill={bgColor}
              />
              <text
                x={g.label.x}
                y={g.label.y + 3}
                textAnchor="middle"
                fontSize={10}
                fill={labelFill}
              >
                {g.label.text}
              </text>
            </g>
          ))}

        {geometry.topTicks.map((t, idx) => (
          <line
            key={`tt-${idx}`}
            x1={t.x}
            y1={TOP - tickOuter}
            x2={t.x}
            y2={t.major ? TOP : TOP - tickMinorStop}
            stroke={tickStroke}
            strokeWidth={0.5}
          />
        ))}
        {geometry.bottomTicks.map((t, idx) => (
          <line
            key={`bt-${idx}`}
            x1={t.x}
            y1={t.major ? BOTTOM : BOTTOM + tickMinorStop}
            x2={t.x}
            y2={BOTTOM + tickOuter}
            stroke={tickStroke}
            strokeWidth={0.5}
          />
        ))}
        {geometry.leftTicks.map((t, idx) => (
          <line
            key={`lt-${idx}`}
            x1={LEFT - tickOuter}
            y1={t.y}
            x2={t.major ? LEFT : LEFT - tickMinorStop}
            y2={t.y}
            stroke={tickStroke}
            strokeWidth={0.5}
          />
        ))}
        {geometry.rightTicks.map((t, idx) => (
          <line
            key={`rt-${idx}`}
            x1={t.major ? RIGHT : RIGHT + tickMinorStop}
            y1={t.y}
            x2={RIGHT + tickOuter}
            y2={t.y}
            stroke={tickStroke}
            strokeWidth={0.5}
          />
        ))}

        {geometry.topLabels.map((l, idx) => (
          <text
            key={`tl-${idx}`}
            x={l.x}
            y={TOP - labelOffset}
            textAnchor="middle"
            fontSize={10}
            fill={labelFill}
          >
            {l.value}
          </text>
        ))}
        {geometry.bottomLabels.map((l, idx) => (
          <text
            key={`bl-${idx}`}
            x={l.x}
            y={BOTTOM + labelOffset}
            textAnchor="middle"
            fontSize={10}
            fill={labelFill}
          >
            {l.value}
          </text>
        ))}
        {geometry.leftLabels.map((l, idx) => (
          <text
            key={`ll-${idx}`}
            x={LEFT - labelOffset}
            y={l.y + 3}
            textAnchor="middle"
            fontSize={10}
            fill={labelFill}
          >
            {l.value}
          </text>
        ))}
        {geometry.rightLabels.map((l, idx) => (
          <text
            key={`rl-${idx}`}
            x={RIGHT + labelOffset}
            y={l.y + 3}
            textAnchor="middle"
            fontSize={10}
            fill={labelFill}
          >
            {l.value}
          </text>
        ))}
      </svg>
    )
  }
)

DraftingGridBackground.displayName = "DraftingGridBackground"

export default DraftingGridBackground

"use client"
import { useCallback, useEffect, useMemo, useState } from "react"
import { MapPin } from "lucide-react"
import { HomeBox } from "@/components/bento/HomeBox"
import { useThemeColorContext } from "@/components/theme-provider"
import { hexToOklch } from "@/lib/color-utils"
import {
  Map,
  MapMarker,
  MarkerContent,
  type MapStyleOption,
  type MapViewport,
} from "@/components/ui/map"

const CITY = {
  name: "Mangalore",
  country: "India",
  lat: 12.9141,
  lng: 74.856,
  zoom: 12,
}

const POSITRON_URL =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"

// Apple-maps-ish palette (MapLibre style-spec guidelines)
const APPLE = {
  land: "#f2f2f7", // pale neutral off-white
  water: "#aad3df", // pale blue
  park: "#c8e6c9", // soft green
  residential: "#e8e8ed",
  building: "#e4e6ea",
  buildingTop: "#eef0f3",
  extrusion: "#d9e0e8", // very light gray-blue, slight opacity
  highway: "#ffcc00", // warm orange/yellow
  minorRoad: "#ededed", // thin light gray
  boundary: "#d5d5db",
  label: "#3a3a3c", // dark gray typography
  labelHalo: "rgba(255,255,255,0.8)", // restrained halo
}

const GREEN_HINT =
  /(park|landcover|landuse|forest|garden|grass|green|pitch|golf|playground|scrub|meadow|wetland|farmland|orchard)/

// Recolor a Carto Positron style into the Apple-ish theme. Only paint color
// keys are touched — sources, glyphs, sprite and labels stay as-is.
function toAppleStyle(raw: any): MapStyleOption {
  const style = JSON.parse(JSON.stringify(raw))
  const layers = style.layers ?? []
  for (const layer of layers) {
    const id = String(layer.id ?? "").toLowerCase()
    const paint = layer.paint
    if (!paint) continue
    // Labels / typography: dark gray with restrained halo (font stack untouched —
    // glyphs only exist for the bundled fonts, so the family stays as-is)
    if (layer.type === "symbol") {
      if ("text-color" in paint) paint["text-color"] = APPLE.label
      if ("text-halo-color" in paint) paint["text-halo-color"] = APPLE.labelHalo
      if ("icon-color" in paint) paint["icon-color"] = APPLE.label
      continue
    }
    const set = (v: string) => {
      for (const k of [
        "background-color",
        "fill-color",
        "fill-outline-color",
        "line-color",
      ]) {
        if (k in paint) paint[k] = v
      }
    }
    if (id === "background") set(APPLE.land)
    else if (id.includes("water")) set(APPLE.water)
    else if (GREEN_HINT.test(id)) set(APPLE.park)
    else if (id.includes("residential")) set(APPLE.residential)
    else if (id === "building-top") {
      if ("fill-color" in paint) paint["fill-color"] = APPLE.buildingTop
      if ("fill-outline-color" in paint)
        paint["fill-outline-color"] = APPLE.building
    } else if (id.includes("building")) set(APPLE.building)
    else if (/(mot_|trunk_).*fill/.test(id)) set(APPLE.highway)
    else if (id.includes("minor_fill")) set(APPLE.minorRoad)
    else if (id.includes("boundary")) set(APPLE.boundary)
  }
  // Building extrusions: very light gray-blue 3D perspectives at higher zooms
  const topIdx = layers.findIndex((l: any) => l.id === "building-top")
  const extrusion = {
    id: "building-extrusion",
    type: "fill-extrusion",
    source: "carto",
    "source-layer": "building",
    minzoom: 14,
    paint: {
      "fill-extrusion-color": APPLE.extrusion,
      "fill-extrusion-height": [
        "interpolate",
        ["linear"],
        ["zoom"],
        14,
        0,
        15,
        12,
        16,
        30,
      ],
      "fill-extrusion-base": 0,
      "fill-extrusion-opacity": 0.55,
    },
  }
  layers.splice(topIdx === -1 ? layers.length : topIdx + 1, 0, extrusion)
  return style
}

const hideIfBroken = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.display = "none"
}

function hexToRgba(hex: string, a: number) {
  const h = hex.replace("#", "")
  const f =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h
  const n = parseInt(f, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

// Cast shadow, offset down-right so clouds look like they float above the map
const CLOUD_SHADOW = "drop-shadow-[16px_22px_26px_rgba(80,100,120,0.4)]"
// Tilted to sit in the map's perspective plane (map pitch 65°)
const CLOUD_TILT = "rotate-x-[55deg]"

// Small clouds drifting diagonally across the map (box is 488px wide)
const DRIFTERS = [
  {
    src: "/clouds/cloud-2.png",
    top: "4%",
    width: 96,
    duration: "27s",
    delay: "-6s",
    opacity: 0.9,
    variant: "",
  },
  {
    src: "/clouds/cloud-3.png",
    top: "48%",
    width: 64,
    duration: "38s",
    delay: "-18s",
    opacity: 0.85,
    variant: "animate-bento-cloud-b",
  },
  {
    src: "/clouds/cloud-2.png",
    top: "70%",
    width: 48,
    duration: "46s",
    delay: "-30s",
    opacity: 0.7,
    variant: "",
  },
]

export function BentoMapBox() {
  const [appleLight, setAppleLight] = useState<MapStyleOption | null>(null)
  const [styleFailed, setStyleFailed] = useState(false)
  // Globe once fully zoomed out — planar otherwise
  const [globe, setGlobe] = useState(false)
  const handleViewport = useCallback((v: MapViewport) => {
    const want = v.zoom <= 4
    setGlobe((g) => (g === want ? g : want))
  }, [])
  const projection = useMemo<{ type: "globe" | "mercator" }>(
    () => ({ type: globe ? "globe" : "mercator" }),
    [globe]
  )
  const { color, isOverridden } = useThemeColorContext()
  // Theme tone bands from the picked color's OKLCH lightness
  const themeL = hexToOklch(color).l
  const tone = !isOverridden ? "default" : themeL >= 0.72 ? "light" : themeL <= 0.42 ? "dark" : "mid"

  useEffect(() => {
    let cancelled = false
    fetch(POSITRON_URL)
      .then((r) => {
        if (!r.ok) throw new Error("style fetch failed")
        return r.json()
      })
      .then((raw) => {
        if (!cancelled) setAppleLight(toAppleStyle(raw))
      })
      .catch(() => {
        if (!cancelled) setStyleFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <HomeBox
      boxKey="map"
      outerClassName="bento-map h-full w-full"
      className="h-full w-full"
    >
      <div className="relative h-full w-full overflow-hidden" data-tone={tone}>
        {/* Map — full-bleed, Apple-ish light theme (white bed by default) */}
        <div
          className={`absolute inset-0 ${tone === "default" ? "bg-white" : "bg-card"}`}
          style={tone === "dark" ? { filter: "invert(1) hue-rotate(180deg)" } : undefined}
        >
          {appleLight || styleFailed ? (
            <Map
              theme="light"
              attributionControl={false}
              {...(appleLight ? { styles: { light: appleLight } } : {})}
              center={[CITY.lng, CITY.lat]}
              zoom={CITY.zoom}
              pitch={65}
              maxPitch={70}
              projection={projection}
              onViewportChange={handleViewport}
              ref={(m) => {
                // Shift the marker to ~2/3 width: box is 488px, left pad 163px
                m?.setPadding({ left: 163 })
              }}
            >
              <MapMarker longitude={CITY.lng} latitude={CITY.lat}>
                <MarkerContent>
                  <span className="block h-3 w-3 rounded-full bg-accent ring-2 ring-white/80" />
                </MarkerContent>
              </MapMarker>
            </Map>
          ) : (
            <div className="absolute inset-0 bg-muted" />
          )}
        </div>
        {/* Depth blur — horizon blurs, foreground stays sharp */}
        <div className="pointer-events-none absolute inset-0 z-[3] backdrop-blur-[3px] [mask-image:linear-gradient(to_bottom,black_0%,transparent_60%)]" />
        {/* Small clouds drifting diagonally across the map */}
        {DRIFTERS.map((c, i) => (
          <img
            key={i}
            src={c.src}
            alt=""
            draggable={false}
            onError={hideIfBroken}
            className={`animate-bento-cloud pointer-events-none absolute left-0 z-[5] ${c.variant} ${CLOUD_SHADOW}`}
            style={{
              top: c.top,
              width: c.width,
              opacity: c.opacity,
              animationDuration: c.duration,
              animationDelay: c.delay,
            }}
          />
        ))}
        {/* Big soft cloud coming from the top-left corner, behind the city text */}
        <img
          src="/clouds/cloud-3.png"
          alt=""
          draggable={false}
          onError={hideIfBroken}
          className={`pointer-events-none absolute -top-14 -left-22 z-[5] w-[24rem] opacity-100 ${CLOUD_SHADOW} ${CLOUD_TILT}`}
        />
        {/* Theme tone blends — theme base color, mode per lightness (none by default) */}
        {tone === "light" && (
          <div
            className="pointer-events-none absolute inset-0 z-[6] mix-blend-hue"
            style={{ background: hexToRgba(color, 0.3) }}
          />
        )}
        {tone === "mid" && (
          <div
            className="pointer-events-none absolute inset-0 z-[6] mix-blend-hard-light"
            style={{ background: hexToRgba(color, 0.3) }}
          />
        )}
        {tone === "dark" && (
          <div
            className="pointer-events-none absolute inset-0 z-[6] mix-blend-color-dodge"
            style={{ background: hexToRgba(color, 0.35) }}
          />
        )}
        {/* Info — top-left */}
        <div className="relative z-10 flex h-full w-[52%] flex-col justify-start p-5">
          <p className="pt-1 font-mono text-xs text-muted-foreground">
            {CITY.lat.toFixed(4)}° N · {CITY.lng.toFixed(4)}° E
          </p>
          <h3 className="text-4xl font-semibold text-card-foreground">
            {CITY.name}
          </h3>
          <p className="flex items-center gap-1 text-lg font-semibold text-muted-foreground">
            <MapPin size={14} className="shrink-0 text-black" />
            {CITY.country}
          </p>
        </div>
      </div>
    </HomeBox>
  )
}
export default BentoMapBox

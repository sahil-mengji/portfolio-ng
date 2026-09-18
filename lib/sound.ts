import { useSyncExternalStore } from "react"

// Universal sound manager: one on/off switch (persisted), one playback
// path every effect routes through — gauntlet, taps, flips all obey it.
const KEY = "site-sound"

export const SFX = {
  tap: "/clicksoundeffect.mp3",
  flip: "/page-flip-01a.mp3",
  snap: "/thanos/thanos_snap_sound.mp3",
  reverse: "/thanos/thanos_reverse_sound.mp3",
  dust: [
    "/thanos/thanos_dust_1.mp3",
    "/thanos/thanos_dust_2.mp3",
    "/thanos/thanos_dust_3.mp3",
    "/thanos/thanos_dust_4.mp3",
  ],
}

let enabled = true
let loaded = false
const listeners = new Set<() => void>()

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return
  loaded = true
  try {
    const v = window.localStorage.getItem(KEY)
    if (v !== null) enabled = v === "1"
  } catch {}
}

function emit() {
  listeners.forEach((fn) => fn())
}

export function isSoundOn() {
  ensureLoaded()
  return enabled
}

export function setSoundOn(v: boolean) {
  enabled = v
  try {
    window.localStorage.setItem(KEY, v ? "1" : "0")
  } catch {}
  emit()
}

function subscribe(fn: () => void) {
  ensureLoaded()
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function useSoundOn() {
  return useSyncExternalStore(subscribe, isSoundOn, () => true)
}

const cache = new Map<string, HTMLAudioElement>()

export function preloadSfx(srcs: string[]) {
  if (typeof window === "undefined") return
  for (const src of srcs) {
    if (cache.has(src)) continue
    try {
      const a = new Audio(src)
      a.preload = "auto"
      cache.set(src, a)
    } catch {}
  }
}

// Silent no-op when toggled off. overlap=true mints a fresh voice per hit
// so staggered sounds (flips, rapid taps) layer instead of cutting each
// other — bytes come from HTTP cache, unreferenced voices get GC'd.
// overlap=false rewinds a shared instance (thanos one-shots, no pileup).
export function playSfx(src: string, volume = 1, overlap = false) {
  if (!isSoundOn()) return
  try {
    let a: HTMLAudioElement | undefined
    if (overlap) {
      a = new Audio(src)
    } else {
      a = cache.get(src)
      if (!a) {
        a = new Audio(src)
        cache.set(src, a)
      }
      a.currentTime = 0
    }
    a.volume = volume
    const p = a.play()
    if (p) p.catch(() => {})
  } catch {}
}

export function playTap() {
  playSfx(SFX.tap, 0.9, true)
}

export function playFlip(rate = 1) {
  if (!isSoundOn()) return
  try {
    // Fresh voice per hit (see playSfx overlap) + per-card pitch so
    // staggered landings read as distinct turns, not one smeared wash.
    const a = new Audio(SFX.flip)
    a.volume = 0.7
    a.playbackRate = rate
    const p = a.play()
    if (p) p.catch(() => {})
  } catch {}
}

export function playDust() {
  playSfx(SFX.dust[Math.floor(Math.random() * SFX.dust.length)], 0.9)
}

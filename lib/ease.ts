// Shared motion tokens for fluent UI utilities.

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]
export const EASE_DRAWER: [number, number, number, number] = [0.32, 0.72, 0, 1]

export const SPRING_LAYOUT = {
  type: "spring",
  stiffness: 380,
  damping: 34,
} as const

export const SPRING_PRESS = {
  type: "spring",
  stiffness: 500,
  damping: 28,
} as const

export const SPRING_SMOOTH = {
  type: "spring",
  stiffness: 170,
  damping: 26,
} as const

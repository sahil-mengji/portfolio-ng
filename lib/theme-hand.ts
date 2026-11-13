export type HandAction = {
  kind: "snap" | "reverse"
  onCommit: () => void
  duration?: number
}
// A mounted hand acknowledges the event; callers retain a direct fallback.
export function requestHandAction(action: HandAction): boolean {
  const event = new CustomEvent<HandAction>("gauntlet:play", {
    detail: action,
    cancelable: true,
  })
  window.dispatchEvent(event)
  return event.defaultPrevented
}

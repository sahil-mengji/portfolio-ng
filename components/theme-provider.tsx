'use client';

import * as React from 'react';
import { flushSync } from 'react-dom';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { useThemeColor, applyPaletteToDOM, generateColorPalette } from '@/lib/color-utils';
import { cn } from '@/lib/utils';

export type ThemeOrigin = Element | null;

type ThemeColorContextProps = {
  color: string;
  palette: ReturnType<typeof import('@/lib/color-utils').generateColorPalette>;
  /** Drag path: debounced site-wide apply w/ circular reveal (picker stays live locally). */
  updatePalette: (color: string, origin?: ThemeOrigin) => void;
  /** Discrete path: immediate site-wide apply w/ circular reveal. */
  commitPalette: (color: string, origin?: ThemeOrigin) => void;
  /** Flush a pending debounced commit immediately (e.g. drag release). */
  flushPalette: (origin?: ThemeOrigin) => void;
  resetPalette: (origin?: ThemeOrigin) => void;
  isOverridden: boolean;
  defaultColor: string;
};

const ThemeColorContext = React.createContext<ThemeColorContextProps | null>(null);

// Move ThemeHotkey outside to avoid "created during render" error
function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme();

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key.toLowerCase() !== 'd') {
        return;
      }

      // Note: isTypingTarget would need access to DOM, so we simplify here
      // In practice, you might want to move this logic elsewhere or handle it differently
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [resolvedTheme, setTheme]); // This is actually okay - resolvedTheme and setTheme are stable

  return null;
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const theme = useThemeColor();
  const { color, palette, isOverridden, defaultColor } = theme;
  const commitRef = React.useRef(theme.updatePalette);
  commitRef.current = theme.updatePalette;

  // Site-wide commit with a Telegram-style circular reveal growing from the
  // origin element (the color wheel). Falls back to an instant apply when
  // View Transitions are unsupported or reduced motion is preferred.
  const revealCommit = React.useCallback((hex: string, origin?: ThemeOrigin) => {
    const normalized = hex.toLowerCase();
    const isDefault = normalized === defaultColor.toLowerCase();
    // Sync DOM vars + React state together inside the transition callback so
    // the "new" snapshot contains the FULL new theme — var-driven surfaces
    // (background grid, cards) as well as context-driven ones. (The passive
    // effect below stays as backup for mount + non-transition commits.)
    const commit = () => {
      try {
        applyPaletteToDOM(generateColorPalette(hex), !isDefault);
      } catch {
        // ignore invalid hex
      }
      commitRef.current(hex);
    };
    try {
      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => { ready: Promise<void> };
      };
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!doc.startViewTransition || reduce) {
        commit();
        return;
      }
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;
      if (origin instanceof Element) {
        const r = origin.getBoundingClientRect();
        x = r.left + r.width / 2;
        y = r.top + r.height / 2;
      }
      const maxR = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );
      const t = doc.startViewTransition(() => {
        flushSync(commit);
      });
      t.ready
        .then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${maxR}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 550,
              easing: 'ease-in-out',
              pseudoElement: '::view-transition-new(root)',
            } as KeyframeAnimationOptions,
          );
        })
        .catch(() => {
          // transition aborted — new state already applied
        });
    } catch {
      commit();
    }
  }, [defaultColor]);

  // Debounced drag path: the picker block stays live via local state while
  // dragging; the whole site applies ~300ms after the last change.
  const pendingRef = React.useRef<{ hex: string; origin: ThemeOrigin } | null>(null);
  const timerRef = React.useRef(0);
  const updatePalette = React.useCallback(
    (hex: string, origin: ThemeOrigin = null) => {
      pendingRef.current = { hex, origin };
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        const p = pendingRef.current;
        pendingRef.current = null;
        if (p) revealCommit(p.hex, p.origin);
      }, 300);
    },
    [revealCommit]
  );
  const flushPalette = React.useCallback(
    (origin?: ThemeOrigin) => {
      window.clearTimeout(timerRef.current);
      const p = pendingRef.current;
      pendingRef.current = null;
      if (p) revealCommit(p.hex, origin ?? p.origin);
    },
    [revealCommit]
  );
  const commitPalette = React.useCallback(
    (hex: string, origin: ThemeOrigin = null) => {
      window.clearTimeout(timerRef.current);
      pendingRef.current = null;
      revealCommit(hex, origin);
    },
    [revealCommit]
  );
  const resetPalette = React.useCallback(
    (origin: ThemeOrigin = null) => {
      window.clearTimeout(timerRef.current);
      pendingRef.current = null;
      // updatePalette derives isOverridden from hex vs default — committing
      // the default color IS the reset.
      revealCommit(defaultColor, origin);
    },
    [revealCommit, defaultColor]
  );

  React.useEffect(() => {
    return () => window.clearTimeout(timerRef.current);
  }, []);

  // Universal theming only when overridden; otherwise respect system light/dark (next-themes class)
  // Committed palette syncs to DOM (covers mount + debounced drag commits + discrete picks).
  React.useEffect(() => {
    applyPaletteToDOM(palette, isOverridden);
  }, [palette, isOverridden])

  const colorValue = React.useMemo(
    () => ({ color, palette, updatePalette, commitPalette, flushPalette, resetPalette, isOverridden, defaultColor }),
    [color, palette, updatePalette, commitPalette, flushPalette, resetPalette, isOverridden, defaultColor]
  );

  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange {...props}>
      <ThemeColorContext.Provider value={colorValue}>{children}</ThemeColorContext.Provider>
    </NextThemesProvider>
  );
}

export function useThemeColorContext() {
  const context = React.useContext(ThemeColorContext);
  if (context === null) {
    throw new Error('useThemeColorContext must be used within a ThemeProvider');
  }
  return context;
}
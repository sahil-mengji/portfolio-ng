'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { useThemeColor } from '@/lib/color-utils';
import { cn } from '@/lib/utils';

type ThemeColorContextProps = {
  color: string;
  palette: ReturnType<typeof import('@/lib/color-utils').generateColorPalette>;
  updatePalette: (color: string) => void;
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
  const { color, palette, updatePalette } = useThemeColor();

  // Automate: expose tokens as CSS vars – button visibility needs proper contrast vs site bg (primary)
  React.useEffect(() => {
    const r = document.documentElement
    const p: any = palette
    const isLight = p.primaryForeground === "#000000"
    // primary button must contrast site bg (primary) – use brand (darker) on light, secondary (lighter) on dark
    const btnPrimary = isLight ? p.brand : p.secondary
    const btnPrimaryFg = isLight ? p.brandForeground : p.secondaryForeground
    r.style.setProperty("--primary", btnPrimary)
    r.style.setProperty("--primary-foreground", btnPrimaryFg)
    r.style.setProperty("--secondary", p.surface)
    r.style.setProperty("--secondary-foreground", p.cardText ?? p.text)
    r.style.setProperty("--accent", p.brand)
    r.style.setProperty("--accent-foreground", p.brandForeground)
    r.style.setProperty("--muted", p.base)
    r.style.setProperty("--muted-foreground", p.secondaryText)
    r.style.setProperty("--card", p.surface)
    r.style.setProperty("--card-foreground", p.cardText ?? p.text)
    r.style.setProperty("--popover", p.surface)
    r.style.setProperty("--popover-foreground", p.cardText ?? p.text)
    r.style.setProperty("--border", p.brand)
    r.style.setProperty("--input", p.brand)
    r.style.setProperty("--ring", p.brand)
    // keep legacy vars for Text/Navbar
    r.style.setProperty("--surface", p.surface)
    r.style.setProperty("--text", p.text)
    r.style.setProperty("--card-text", p.cardText ?? p.text)
    r.style.setProperty("--card-muted", p.cardSecondaryText ?? p.secondaryText)
    r.style.setProperty("--grid-ink", p.gridInk ?? p.text)
    r.style.setProperty("--background", p.primary)
    r.style.setProperty("--foreground", p.text)
  }, [palette])

  const colorValue = { color, palette, updatePalette };

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange {...props}>
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
"use client"
import { Text, CardContext } from "@/components/ui/text"
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/panel"
import { bentoItems } from "@/lib/dummy-data"
import { useThemeColorContext } from "@/components/theme-provider"

export function BentoGrid() {
  const { palette } = useThemeColorContext()
  return (
    <Panel className="overflow-hidden rounded-2xl">
      <PanelHeader>
        <PanelTitle className="text-xl md:text-2xl">Bento — various things</PanelTitle>
        <span className="text-xs text-muted-foreground hidden sm:inline">grid · {bentoItems.length} items</span>
      </PanelHeader>
      <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[140px] gap-px bg-border">
        {bentoItems.map((b, i) => {
          const span = b.span // e.g. col-span-2
          return (
            <div
              key={b.title}
              className={`bg-card p-4 flex flex-col justify-between ${span}`}
              style={{ background: `color-mix(in oklab, var(--card) 92%, transparent)` } as any}
            >
              <CardContext.Provider value={true}>
                <div>
                  <Text.Label className="text-[11px] tracking-widest uppercase opacity-70">0{i + 1}</Text.Label>
                  <Text.Subheading as="h3" size="sm" className="mt-1 !text-lg leading-tight">
                    {b.title}
                  </Text.Subheading>
                </div>
                <Text.Body size="sm" className="opacity-80 line-clamp-2">
                  {b.desc}
                </Text.Body>
              </CardContext.Provider>
            </div>
          )
        })}
      </div>
      <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/20">
        <span className="text-xs text-muted-foreground">Panel · bento grid replicating p4 overview/panel pattern</span>
        <span className="text-xs font-mono" style={{ color: palette.brand }}>
          {palette.primary.toUpperCase()}
        </span>
      </div>
    </Panel>
  )
}

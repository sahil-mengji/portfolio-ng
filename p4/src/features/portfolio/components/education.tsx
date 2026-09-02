import React from "react"
import { EDUCATION } from "../data/education"
import { Panel, PanelHeader, PanelTitle } from "./panel"
import { GraduationCapIcon } from "lucide-react"

export function Education() {
  return (
    <Panel id="education">
      <PanelHeader>
        <PanelTitle>Education</PanelTitle>
      </PanelHeader>

      <div className="pr-4 pl-4 py-6 space-y-8">
        {EDUCATION.map((item) => (
          <div key={item.id} className="flex gap-4">
             <div className="flex size-6 shrink-0 items-center justify-center text-muted-foreground mt-0.5">
                <GraduationCapIcon size={18} />
             </div>
             <div className="flex-1 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-x-4 gap-y-1">
                    <h3 className="text-[15px] font-semibold leading-tight">{item.degree}</h3>
                    <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                        {item.period.start} — {item.period.end}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground/80">{item.school}</p>
                {item.skills && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                        {item.skills.map(skill => (
                            <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full border border-line bg-muted/30 text-muted-foreground/70">
                                {skill}
                            </span>
                        ))}
                    </div>
                )}
             </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

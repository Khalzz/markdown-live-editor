import { useEffect, useRef } from "react";
import type { SlashBlock, SlashGroup } from "./slashGroups";

// Positioning is handled externally (Suggestion's `props.mount` anchors and
// repositions this component's own root element via floating-ui), so this
// only owns its own box's visual styling, not where it sits on screen.
export function SlashMenu({ groups, highlighted, onHover, onSelect }: {
  groups: SlashGroup[];
  highlighted: number;
  onHover: (flatIndex: number) => void;
  onSelect: (block: SlashBlock) => void;
}) {
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    optionRefs.current[highlighted]?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  return (
    <div className="w-56 max-h-56 overflow-y-auto overflow-x-hidden bg-surface border border-gold-500/15 rounded-sm text-gold-500">
      {groups.map((group, gi) => {
        const startIndex = groups.slice(0, gi).reduce((n, g) => n + g.blocks.length, 0);
        return (
          <div key={group.section}>
            <div className="px-2 text-[10px] font-semibold uppercase text-gold-700">{group.section}</div>
            {group.blocks.map((block, bi) => {
              const flatIndex = startIndex + bi;
              return (
                <div
                  key={block.label}
                  ref={(el) => { optionRefs.current[flatIndex] = el; }}
                  onClick={() => onSelect(block)}
                  onMouseEnter={() => onHover(flatIndex)}
                  className={`flex items-center gap-2 text-sm px-4 py-2 hover:bg-gold-500/10 cursor-pointer transition-colors ${flatIndex === highlighted ? "bg-gold-500/10" : ""}`}
                  style={{ transitionProperty: "none" }}
                >
                  <block.icon className="h-3.5 w-3.5 shrink-0 text-gold-600" />
                  <span className="truncate">{block.label}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

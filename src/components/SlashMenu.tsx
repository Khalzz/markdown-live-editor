import { useEffect, useRef } from "react";
import type { SlashBlock, SlashGroup } from "../extensions/slashGroups";
import type { MarkdownLiveMenuStyles } from "../types";

// Which group a flat (cross-group) index falls in, and whether it's the
// first block of that group — used to decide whether scrolling to the
// highlighted item needs to bring the group's own section title along
// with it (see the scroll effect below).
function locateFlatIndex(groups: SlashGroup[], flatIndex: number): { groupIndex: number; isFirstInGroup: boolean } {
  let cursor = 0;
  for (let gi = 0; gi < groups.length; gi++) {
    const len = groups[gi].blocks.length;
    if (flatIndex < cursor + len) return { groupIndex: gi, isFirstInGroup: flatIndex === cursor };
    cursor += len;
  }
  return { groupIndex: -1, isFirstInGroup: false };
}

// Positioning is handled externally (Suggestion's `props.mount` anchors and
// repositions this component's own root element via floating-ui), so this
// only owns its own box's visual styling, not where it sits on screen.
export function SlashMenu({ groups, highlighted, menu, onHover, onSelect }: {
  groups: SlashGroup[];
  highlighted: number;
  menu: MarkdownLiveMenuStyles;
  onHover: (flatIndex: number) => void;
  onSelect: (block: SlashBlock) => void;
}) {
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // `scrollIntoView` on the option row itself only guarantees *that row*
    // ends up visible — when it's the first item in its group, the section
    // title sitting above it as a sibling can still be scrolled just out of
    // view. Scrolling the group wrapper instead (title + first item) keeps
    // the title on screen too.
    const { groupIndex, isFirstInGroup } = locateFlatIndex(groups, highlighted);
    const target = isFirstInGroup ? groupRefs.current[groupIndex] : optionRefs.current[highlighted];
    target?.scrollIntoView({ block: "nearest" });
  }, [highlighted, groups]);

  return (
    <div className={`w-56 max-h-56 overflow-y-auto overflow-x-hidden border rounded-md ${menu.background} ${menu.border} ${menu.text}`}>
      {groups.map((group, gi) => {
        const startIndex = groups.slice(0, gi).reduce((n, g) => n + g.blocks.length, 0);
        return (
          <div key={group.section} ref={(el) => { groupRefs.current[gi] = el; }}>
            <div className="p-2 text-[10px]  font-semibold uppercase opacity-60">{group.section}</div>
            {group.blocks.map((block, bi) => {
              const flatIndex = startIndex + bi;
              const active = flatIndex === highlighted;
              return (
                <div
                  key={block.label}
                  ref={(el) => { optionRefs.current[flatIndex] = el; }}
                  onClick={() => onSelect(block)}
                  onMouseEnter={() => onHover(flatIndex)}
                  className={`flex items-center gap-2 text-sm px-4 py-2 cursor-pointer transition-colors ${active ? menu.buttonActive : menu.button}`}
                  style={{ transitionProperty: "none" }}
                >
                  <block.icon className="h-3.5 w-3.5 shrink-0" />
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

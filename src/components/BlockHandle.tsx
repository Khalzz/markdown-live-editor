import { GripVertical } from "lucide-react";
import type { HoverBlockState } from "./types";

export function BlockHandle({ hover, visible, dragging, onClick, onDragStart, onMouseEnter, onMouseLeave }: {
  hover: HoverBlockState;
  // Whether the handle should currently be shown. It stays mounted at its
  // last position even when false (see the caller — `clearHover` only
  // flips this, it doesn't reset `hover` itself) purely so opacity has
  // something to transition *from* in place, rather than the button
  // unmounting and a later hover popping a fresh one in with nothing to
  // animate.
  visible: boolean;
  // Whether a drag is currently underway (from this handle or another
  // block's) — just swaps the cursor to "grabbing" for feedback.
  dragging: boolean;
  onClick: () => void;
  // Fired from mousedown with the pointer's starting screen position — the
  // caller only treats it as an actual drag once the mouse has moved past a
  // small threshold from that point, so a plain click doesn't flash drag UI.
  onDragStart: (clientX: number, clientY: number) => void;
  // The button sits right at the edge of the editor's own hit-testing —
  // moving the mouse off the text and onto the handle can, for a frame or
  // two, land on document coordinates `posAtCoords` doesn't resolve to this
  // same block (or resolves to nothing at all), which would otherwise clear
  // the hover state before the click ever lands. The caller uses these to
  // freeze that tracking once the cursor is actually over the handle itself.
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <button
      type="button"
      tabIndex={visible ? 0 : -1}
      className={`absolute -left-8 z-10 flex items-center justify-center h-5 w-5 rounded text-gold-600 bg-transparent border-0 hover:text-gold-400 transition-opacity duration-150 ${visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{ top: hover.top }}
      onMouseDown={(event) => { event.preventDefault(); onDragStart(event.clientX, event.clientY); }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
}

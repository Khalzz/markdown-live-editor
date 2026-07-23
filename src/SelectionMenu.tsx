import { useEffect, useRef } from "react";
import type { Editor } from "@tiptap/react";
import { Bold, Code, Italic, Strikethrough, type LucideIcon } from "lucide-react";

export interface SelectionMenuPos { x: number; y: number }

const MARKS: { mark: string; label: string; icon: LucideIcon }[] = [
  { mark: "bold", label: "Bold", icon: Bold },
  { mark: "italic", label: "Italic", icon: Italic },
  { mark: "strike", label: "Strikethrough", icon: Strikethrough },
  { mark: "code", label: "Code", icon: Code },
];

// A right-click menu offered only while there's an actual text selection
// (see the `contextmenu` handler in MarkdownLiveEditor.tsx, which
// suppresses the browser's native menu just for that case and leaves it
// alone otherwise — e.g. right-clicking with the cursor collapsed still
// gets the normal browser menu for spellcheck suggestions etc). Toggling a
// mark keeps the menu open and the selection intact (`.focus()` doesn't
// collapse it) so several marks can be applied in one go, same as a
// standard editor's selection toolbar.
export function SelectionMenu({ editor, pos, onClose }: {
  editor: Editor;
  pos: SelectionMenuPos | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pos) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [pos, onClose]);

  if (!pos) return null;

  return (
    <div
      ref={ref}
      className="fixed z-50 flex items-center gap-0.5 bg-surface border border-gold-500/30 rounded-md shadow-lg p-1"
      style={{ left: pos.x, top: pos.y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {MARKS.map(({ mark, label, icon: Icon }) => {
        const active = editor.isActive(mark);
        return (
          <button
            key={mark}
            title={label}
            onClick={() => editor.chain().focus().toggleMark(mark).run()}
            className={`w-7! h-7! p-0! flex! items-center! justify-center! border-0! ${active ? "bg-gold-500/20! text-gold-300!" : "bg-transparent! text-gold-500! hover:bg-gold-500/10! hover:text-gold-300!"}`}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import { useEditorState, type Editor } from "@tiptap/react";
import {
  Bold, Italic, Strikethrough, Underline, Code, Baseline, Highlighter, Ban,
  AlignLeft, AlignCenter, AlignRight, type LucideIcon,
} from "lucide-react";
import type { MarkdownLiveMenuStyles } from "../types";

const MARKS: { mark: string; label: string; icon: LucideIcon }[] = [
  { mark: "bold", label: "Bold", icon: Bold },
  { mark: "italic", label: "Italic", icon: Italic },
  { mark: "strike", label: "Strikethrough", icon: Strikethrough },
  { mark: "underline", label: "Underline", icon: Underline },
  { mark: "code", label: "Code", icon: Code },
];

const ALIGNMENTS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "left", label: "Align left", icon: AlignLeft },
  { value: "center", label: "Align center", icon: AlignCenter },
  { value: "right", label: "Align right", icon: AlignRight },
];

const buttonClass = (active: boolean, menu: MarkdownLiveMenuStyles) =>
  `w-7! h-7! p-0! flex! items-center! justify-center! transition! rounded-md border border-transparent ${active ? menu.buttonActive : menu.button}`;

function Separator({ menu }: { menu: MarkdownLiveMenuStyles }) {
  return <div className={`w-px h-5 mx-0.5 ${menu.separator}`} />;
}

// `undefined` = the whole selection uniformly has no color set — the "no
// color" swatch lights up. `null` = mixed: either several different colors,
// or some of the selection has one and some has none — no swatch is a
// truthful answer, so none lights up. A plain string = that one color
// covers the entire selection.
type UniformAttr = string | null | undefined;

// `editor.getAttributes("textStyle")` (what this used to read) only looks
// at a single reference position, so selecting text that mixes colors
// picked whichever one happened to be at the start of the range and lit up
// that swatch as if the whole selection matched it. Walking every text
// node in the range and collecting the distinct values actually seen is
// what "one/none/mixed" requires.
function uniformTextStyleAttr(editor: Editor, attr: "color" | "backgroundColor"): UniformAttr {
  const { state } = editor;
  const { from, to, empty } = state.selection;
  if (empty) {
    return (editor.getAttributes("textStyle")[attr] as string | undefined) ?? undefined;
  }
  const values = new Set<string | undefined>();
  state.doc.nodesBetween(from, to, (node) => {
    if (!node.isText) return;
    const mark = node.marks.find((m) => m.type.name === "textStyle");
    values.add(mark?.attrs[attr] as string | undefined);
  });
  if (values.size !== 1) return null;
  return [...values][0] ?? undefined;
}

function ColorRow({ label, icon: Icon, colors, active, menu, onPick, onClear }: {
  label: string;
  icon: LucideIcon;
  colors: string[];
  active: UniformAttr;
  menu: MarkdownLiveMenuStyles;
  onPick: (color: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-xs text-zinc-400">
        <Icon className="h-3 w-3" /> {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          title="No color"
          onClick={onClear}
          className={`w-5! h-5! p-0! min-w-0! rounded-full! border! flex! items-center! justify-center! transition! hover:scale-110! ${active === undefined ? menu.activeRing : "border-white/20! hover:border-white/40!"}`}
        >
          <Ban className="h-3 w-3 text-zinc-400" />
        </button>
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            title={color}
            onClick={() => onPick(color)}
            style={{ backgroundColor: color }}
            className={`w-5! h-5! p-0! min-w-0! rounded-full! border! transition! hover:scale-110! ${active === color ? menu.activeRing : "border-white/10! hover:border-white/50!"}`}
          />
        ))}
      </div>
    </div>
  );
}

// Text color and background/highlight color — both live on the same
// `textStyle` mark (see @tiptap/extension-text-style's Color and
// BackgroundColor), so setting one never clobbers the other. Fixed
// developer-supplied palettes rather than a free-form picker: the text row
// on top, the highlight row below, each with its own "no color" swatch.
// `textColor`/`backgroundColor` come from the parent's `useEditorState`,
// already reduced to "one/none/mixed" by `uniformTextStyleAttr`.
function ColorPicker({ editor, textColors, highlightColors, textColor, backgroundColor, menu }: {
  editor: Editor;
  textColors: string[];
  highlightColors: string[];
  textColor: UniformAttr;
  backgroundColor: UniformAttr;
  menu: MarkdownLiveMenuStyles;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  const hasTextColor = typeof textColor === "string";
  const hasBackgroundColor = typeof backgroundColor === "string";

  // The trigger itself previews the current selection's colors — icon
  // stroke tinted to the text color, button fill to the background color —
  // rather than just a generic "something's active" tint. `menu.text`
  // carries the idle text color, inherited here rather than set directly,
  // so the inline `color`/`backgroundColor` below (when a color's actually
  // picked) never has to fight a competing `!important` class for it —
  // a plain class always loses to an inline style automatically.
  // `hover:brightness-125` works either way — a filter doesn't compete
  // with `background-color` at all.
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title="Text & background color"
        onClick={() => setOpen(v => !v)}
        style={{
          color: hasTextColor ? textColor : undefined,
          backgroundColor: hasBackgroundColor ? backgroundColor : undefined,
        }}
        className={`w-7! h-7! p-0! flex! items-center! justify-center! border-0! rounded! transition! hover:brightness-125! ${(open || textColor !== undefined || backgroundColor !== undefined) ? menu.activeRing : "hover:bg-white/10!"}`}
      >
        <Baseline className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className={`absolute top-full left-0 mt-1 z-10 flex flex-col gap-3 border rounded-md shadow-lg p-2.5 w-48 ${menu.background} ${menu.border} ${menu.text}`}>
          <ColorRow
            label="Text"
            icon={Baseline}
            colors={textColors}
            active={textColor}
            menu={menu}
            onPick={(color) => editor.chain().focus().setColor(color).run()}
            onClear={() => editor.chain().focus().unsetColor().run()}
          />
          <ColorRow
            label="Background"
            icon={Highlighter}
            colors={highlightColors}
            active={backgroundColor}
            menu={menu}
            onPick={(color) => editor.chain().focus().setBackgroundColor(color).run()}
            onClear={() => editor.chain().focus().unsetBackgroundColor().run()}
          />
        </div>
      )}
    </div>
  );
}

// A floating formatting card that appears above the selection as soon as
// text is selected (Notion/Medium-style bubble menu) — no right-click
// needed, and it tracks the selection's own bounding box instead of a
// fixed cursor position. Tiptap's BubbleMenu (floating-ui under the hood)
// owns visibility/positioning entirely; this just supplies the content and
// the "only for a non-empty text selection" condition.
//
// `strategy: "fixed"` + `appendTo: document.body` keep it out of the
// scrolling editor container's `overflow-x-hidden` — with the default
// "absolute" strategy the menu is still a descendant of that clipped
// container, so flip/shift can compute a fully-visible position and the
// browser still crops it right at the container's edge.
export function SelectionMenu({ editor, menu, textColors, highlightColors }: {
  editor: Editor;
  menu: MarkdownLiveMenuStyles;
  textColors: string[];
  highlightColors: string[];
}) {
  // `MarkdownLiveEditor` doesn't re-render on every transaction (that hook
  // deliberately isn't wired up there — it'd re-render the whole drag/hover
  // machinery on every keystroke), so the active/color state this toolbar
  // shows has to subscribe for itself. `useEditorState`'s default deep-equal
  // check means this only re-renders when one of these derived values
  // actually changes, not on every keystroke either.
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      marks: Object.fromEntries(MARKS.map(({ mark }) => [mark, editor.isActive(mark)])) as Record<string, boolean>,
      align: Object.fromEntries(ALIGNMENTS.map(({ value }) => [value, editor.isActive({ textAlign: value })])) as Record<string, boolean>,
      textColor: uniformTextStyleAttr(editor, "color"),
      backgroundColor: uniformTextStyleAttr(editor, "backgroundColor"),
    }),
  });

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top", offset: 8, strategy: "fixed" }}
      appendTo={() => document.body}
      // `state.selection` is ProseMirror's own internal model — it only
      // changes in response to a transaction dispatched through this
      // editor, not from DOM/browser selection changes elsewhere on the
      // page. Clicking a plain non-editable element outside the editor
      // blurs it (`editor.isFocused` goes false) but never touches
      // `state.selection` at all, so without checking focus too, a text
      // selection made once left this menu stuck open indefinitely — the
      // click "outside" never told ProseMirror anything changed.
      shouldShow={({ editor: ed, state }) => ed.isFocused && !state.selection.empty}
      className={`flex items-center gap-0.5 border rounded-md shadow-lg p-1 z-10 ${menu.background} ${menu.border} ${menu.text}`}
    >
      {MARKS.map(({ mark, label, icon: Icon }) => (
        <button
          key={mark}
          type="button"
          title={label}
          onClick={() => editor.chain().focus().toggleMark(mark).run()}
          className={buttonClass(toolbarState.marks[mark], menu)}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
      <Separator menu={menu} />
      <ColorPicker
        editor={editor}
        textColors={textColors}
        highlightColors={highlightColors}
        textColor={toolbarState.textColor}
        backgroundColor={toolbarState.backgroundColor}
        menu={menu}
      />
      <Separator menu={menu} />
      {ALIGNMENTS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          title={label}
          onClick={() => editor.chain().focus().setTextAlign(value).run()}
          className={buttonClass(toolbarState.align[value], menu)}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </BubbleMenu>
  );
}

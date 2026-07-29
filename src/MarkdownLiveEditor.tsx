import { useEffect, useRef, useState } from "react";
import { useMotionValue, useSpring } from "motion/react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { AnyExtension } from "@tiptap/core";
import type { EditorView } from "@tiptap/pm/view";
import { NodeSelection } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { TableKit } from "@tiptap/extension-table";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { type SlashGroup, DEFAULT_SLASH_GROUPS } from "./extensions/slashGroups";
import { type HoverBlockState, type MarkdownLiveStyles, type MarkdownLiveTheme } from "./types";
import { MARKDOWN_LIVE_THEMES, mergeTheme, type MarkdownLiveThemeName } from "./themes";
import { createHeadingNode } from "./extensions/headingNode";
import { SlashCommand } from "./extensions/slashCommand";
import { BlockSelectionHighlight } from "./extensions/blockSelection";
import { InputRuleRelay } from "./extensions/inputRuleRelay";
import { BlockHandle } from "./components/BlockHandle";
import { DragGhost } from "./components/DragGhost";
import { SelectionMenu } from "./components/SelectionMenu";
import { closestGap, computeGaps, isEmptyTrailingParagraph, moveBlock, realContentEndPos } from "./extensions/dragReorder";

export function MarkdownLiveEditor({
  content, onChange,
  theme = "zinc",
  styles: stylesOverride,
  slashGroups: extraSlashGroups,
  extensions: extraExtensions = [],
  autofocus = true,
}: {
  content: string;
  onChange: (content: string) => void;
  // Custom text/highlight colors go through here too — as a partial theme
  // object, same shape as themes/definitions/zinc.ts — rather than as
  // their own top-level props, so there's exactly one way to customize any
  // piece of the look, not one path for colors and another for everything
  // else.
  theme?: MarkdownLiveThemeName | Partial<MarkdownLiveTheme>;
  styles?: Partial<MarkdownLiveStyles>;
  slashGroups?: SlashGroup[];
  extensions?: AnyExtension[];
  autofocus?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const baseTheme = typeof theme === "string" ? MARKDOWN_LIVE_THEMES[theme] : MARKDOWN_LIVE_THEMES.zinc;
  const themeOverride = typeof theme === "string" ? undefined : theme;
  const resolvedTheme = mergeTheme(baseTheme, themeOverride);
  const mergedStyles: MarkdownLiveStyles = { ...resolvedTheme.markdown, ...stylesOverride };
  const textColors = resolvedTheme.textColors;
  const highlightColors = resolvedTheme.highlightColors;
  const groups: SlashGroup[] = [...DEFAULT_SLASH_GROUPS, ...(extraSlashGroups ?? [])];

  const [hoverBlock, setHoverBlock] = useState<HoverBlockState | null>(null);
  const hoverRef = useRef<HoverBlockState | null>(null);
  const [handleVisible, setHandleVisible] = useState(false);
  const clearHover = () => setHandleVisible(false);
  const overHandleRef = useRef(false);

  const [trackingDrag, setTrackingDrag] = useState(false);
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const dragSourcePosRef = useRef<number | null>(null);
  const dragStartScreenRef = useRef<{ x: number; y: number } | null>(null);
  const [dropY, setDropY] = useState<number | null>(null);
  const dropTargetPosRef = useRef<number | null>(null);
  const DRAG_THRESHOLD = 4;
  const GHOST_OFFSET = { x: 16, y: 12 };

  const ghostX = useMotionValue(0);
  const ghostY = useMotionValue(0);
  const ghostSpringX = useSpring(ghostX, { stiffness: 700, damping: 40, mass: 0.6 });
  const ghostSpringY = useSpring(ghostY, { stiffness: 700, damping: 40, mass: 0.6 });
  const [ghostVisible, setGhostVisible] = useState(false);
  const [ghostWidth, setGhostWidth] = useState(0);

  const ghostSourceRef = useRef<HTMLElement | null>(null);
  const ghostContentElRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ghostVisible && ghostContentElRef.current && ghostSourceRef.current) {
      const clone = ghostSourceRef.current.cloneNode(true) as HTMLElement;
      clone.classList.remove(...resolvedTheme.blockSelection.split(/\s+/).filter(Boolean));
      ghostContentElRef.current.replaceChildren(clone);
    }
  }, [ghostVisible]);

  const beginDrag = (pos: number, clientX: number, clientY: number) => {
    if (!editor) return;
    dragSourcePosRef.current = pos;
    dragStartScreenRef.current = { x: clientX, y: clientY };
    editor.commands.setNodeSelection(pos);
    setTrackingDrag(true);
  };

  const hideGhost = () => {
    setGhostVisible(false);
    ghostSourceRef.current = null;
  };

  const endDrag = () => {
    if (draggingRef.current && dragSourcePosRef.current !== null && dropTargetPosRef.current !== null && editor) {
      moveBlock(editor, dragSourcePosRef.current, dropTargetPosRef.current);
    }
    dragSourcePosRef.current = null;
    dragStartScreenRef.current = null;
    dropTargetPosRef.current = null;
    draggingRef.current = false;
    setDragging(false);
    setDropY(null);
    setTrackingDrag(false);
    hideGhost();
  };

  useEffect(() => {
    if (!trackingDrag) return;
    const onMove = (event: MouseEvent) => {
      const start = dragStartScreenRef.current;
      if (!start) return;
      const startX = event.clientX + GHOST_OFFSET.x;
      const startY = event.clientY + GHOST_OFFSET.y;
      if (!draggingRef.current) {
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        draggingRef.current = true;
        setDragging(true);
        const sourcePos = dragSourcePosRef.current;
        const sourceDom = sourcePos !== null ? editor?.view.nodeDOM(sourcePos) : null;
        if (sourceDom instanceof HTMLElement) {
          ghostSourceRef.current = sourceDom;
          setGhostWidth(sourceDom.getBoundingClientRect().width);
          ghostX.jump(startX);
          ghostY.jump(startY);
          ghostSpringX.jump(startX);
          ghostSpringY.jump(startY);
          setGhostVisible(true);
        }
      } else {
        ghostX.set(startX);
        ghostY.set(startY);
      }
      if (!hostRef.current || !editor) return;
      const hostRect = hostRef.current.getBoundingClientRect();
      const y = event.clientY - hostRect.top;
      const gaps = computeGaps(blocksRef.current, realContentEndPos(editor.state.doc));
      const gap = closestGap(gaps, y);
      dropTargetPosRef.current = gap.pos;
      setDropY(gap.y);
    };
    const onUp = () => endDrag();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      hideGhost();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingDrag]);

  const blocksRef = useRef<{ pos: number; top: number; bottom: number }[]>([]);
  const recomputeBlocks = (view: EditorView) => {
    if (!hostRef.current) return;
    const hostRect = hostRef.current.getBoundingClientRect();
    const bands: { pos: number; top: number; bottom: number }[] = [];

    const doc = view.state.doc;
    doc.forEach((node, offset) => {
      const isTrailingPlaceholder = offset + node.nodeSize === doc.content.size && isEmptyTrailingParagraph(node);
      if (isTrailingPlaceholder) return;
      const dom = view.nodeDOM(offset);
      if (dom instanceof HTMLElement) {
        const rect = dom.getBoundingClientRect();
        bands.push({ pos: offset, top: rect.top - hostRect.top, bottom: rect.bottom - hostRect.top });
      }
    });
    blocksRef.current = bands;
  };

  const blocksRafRef = useRef<number | null>(null);
  const recomputeBlocksSoon = (view: EditorView) => {
    recomputeBlocks(view);
    if (blocksRafRef.current !== null) cancelAnimationFrame(blocksRafRef.current);
    blocksRafRef.current = requestAnimationFrame(() => {
      blocksRafRef.current = null;
      recomputeBlocks(view);
    });
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        paragraph: { HTMLAttributes: { class: mergedStyles.p } },
        blockquote: { HTMLAttributes: { class: mergedStyles.blockquote } },
        horizontalRule: { HTMLAttributes: { class: mergedStyles.hr } },
        bold: { HTMLAttributes: { class: mergedStyles.strong } },
        italic: { HTMLAttributes: { class: mergedStyles.em } },
        code: { HTMLAttributes: { class: mergedStyles.code } },
        bulletList: { HTMLAttributes: { class: mergedStyles.ul } },
        orderedList: { HTMLAttributes: { class: mergedStyles.ol } },
        listItem: { HTMLAttributes: { class: mergedStyles.li } },
      }),
      createHeadingNode(mergedStyles),
      TableKit.configure({
        table: { HTMLAttributes: { class: mergedStyles.table } },
        tableRow: { HTMLAttributes: { class: mergedStyles.tr } },
        tableHeader: { HTMLAttributes: { class: mergedStyles.th } },
        tableCell: { HTMLAttributes: { class: mergedStyles.td } },
      }),
      Underline,
      TextStyleKit.configure({ fontFamily: false, fontSize: false, lineHeight: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ...extraExtensions,
      SlashCommand.configure({ groups, menu: resolvedTheme.menu }),
      BlockSelectionHighlight.configure({ className: resolvedTheme.blockSelection }),
      InputRuleRelay,
      Markdown,
      Placeholder.configure({
        placeholder: ({ editor: ed }) => ed.isEmpty ? "New Page" : "",
        emptyNodeClass: "is-empty",
      }),
    ],
    content: content || "# ",
    contentType: "markdown",
    autofocus: autofocus ? "end" : false,
    editorProps: {
      attributes: {
        class: mergedStyles.content,
      },
    },
    onUpdate: ({ editor: view }) => {
      onChangeRef.current(view.getMarkdown());
      recomputeBlocksSoon(view.view);
    },
  }, [JSON.stringify(mergedStyles)]);

  useEffect(() => {
    if (!editor) return;
    recomputeBlocksSoon(editor.view);
    return () => {
      if (blocksRafRef.current !== null) cancelAnimationFrame(blocksRafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const findBlockElement = (target: EventTarget | null): HTMLElement | null => {
    if (!editor || !(target instanceof HTMLElement)) return null;
    const root = editor.view.dom;
    let el: HTMLElement | null = target;
    while (el && el !== root && el.parentElement !== root) el = el.parentElement;
    return el && el !== root ? el : null;
  };

  const handleBlockHover = (event: React.MouseEvent) => {
    if (overHandleRef.current || trackingDrag || !hostRef.current) return;
    const y = event.clientY - hostRef.current.getBoundingClientRect().top;
    const block = blocksRef.current.find(b => y >= b.top && y <= b.bottom);
    if (!block) { clearHover(); return; }
    if (hoverRef.current?.pos !== block.pos) {
      const next: HoverBlockState = { pos: block.pos, top: block.top, bottom: block.bottom };
      hoverRef.current = next;
      setHoverBlock(next);
    }
    setHandleVisible(true);
  };

  const handleContainerClick = (event: React.MouseEvent) => {
    if (!editor || trackingDrag || findBlockElement(event.target)) return;
    const hostRect = hostRef.current?.getBoundingClientRect();
    if (!hostRect) return;
    const blocks = blocksRef.current;
    const lastBottom = blocks.length > 0 ? blocks[blocks.length - 1].bottom : 0;
    const y = event.clientY - hostRect.top;

    if (y <= lastBottom) {
      if (editor.state.selection instanceof NodeSelection) {
        const block = blocks.find(b => y >= b.top && y <= b.bottom);
        const pos = block ? block.pos + 1 : editor.state.selection.from;
        editor.chain().focus().setTextSelection(pos).run();
      }
      return;
    }

    const lastChild = editor.state.doc.lastChild;
    if (lastChild && isEmptyTrailingParagraph(lastChild)) {
      editor.commands.focus("end");
      return;
    }
    editor.chain().focus().insertContentAt(editor.state.doc.content.size, { type: "paragraph" }).run();
  };

  return (
    <>
      <div
        ref={containerRef}
        className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden flex justify-center relative"
        onMouseMove={handleBlockHover}
        onMouseLeave={clearHover}
        onClick={handleContainerClick}
      >
        <div ref={hostRef} className="w-full relative flex">
          <div className="relative shrink-0 w-5">
            {hoverBlock && editor && (
              <BlockHandle
                hover={hoverBlock}
                visible={handleVisible}
                dragging={dragging}
                handleClass={resolvedTheme.handle}
                onClick={() => editor.commands.setNodeSelection(hoverBlock.pos)}
                onDragStart={(clientX, clientY) => beginDrag(hoverBlock.pos, clientX, clientY)}
                onMouseEnter={() => { overHandleRef.current = true; }}
                onMouseLeave={() => { overHandleRef.current = false; clearHover(); }}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <EditorContent editor={editor} />
          </div>
          {dragging && dropY !== null && (
            // `swatch` (a hex string, not a Tailwind class) is used here for
            // the same reason ThemeSelect.tsx uses it for its color dot: this
            // is a per-theme accent color applied as a raw value at render
            // time, not a literal class Tailwind's JIT scanner could ever
            // pick up statically.
            <div
              className="absolute left-0 right-0 h-0.5 rounded-full opacity-70 pointer-events-none transition-[top] duration-100 ease-out"
              style={{ top: dropY, backgroundColor: resolvedTheme.swatch }}
            />
          )}
        </div>
      </div>
      <DragGhost
        visible={ghostVisible}
        x={ghostSpringX}
        y={ghostSpringY}
        width={ghostWidth}
        ghostClass={resolvedTheme.ghost}
        contentRef={(el) => { ghostContentElRef.current = el; }}
      />
      {editor && (
        <SelectionMenu
          editor={editor}
          menu={resolvedTheme.menu}
          textColors={textColors}
          highlightColors={highlightColors}
        />
      )}
    </>
  );
}

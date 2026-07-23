import { useEffect, useRef, useState } from "react";
import { useMotionValue, useSpring } from "motion/react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { AnyExtension } from "@tiptap/core";
import type { EditorView } from "@tiptap/pm/view";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { TableKit } from "@tiptap/extension-table";
import Placeholder from "@tiptap/extension-placeholder";
import { type SlashGroup, DEFAULT_SLASH_GROUPS } from "./slashGroups";
import { type HoverBlockState, type MarkdownLiveStyles } from "./types";
import { DEFAULT_MARKDOWN_LIVE_STYLES } from "./styles";
import { createHeadingNode } from "./headingNode";
import { SlashCommand } from "./slashCommand";
import { BlockSelectionHighlight, SELECTED_BLOCK_CLASS } from "./blockSelection";
import { InputRuleRelay } from "./inputRuleRelay";
import { BlockHandle } from "./BlockHandle";
import { DragGhost } from "./DragGhost";
import { SelectionMenu, type SelectionMenuPos } from "./SelectionMenu";
import { closestGap, computeGaps, isEmptyTrailingParagraph, moveBlock, realContentEndPos } from "./dragReorder";

// A live, WYSIWYG-style markdown surface built on Tiptap/ProseMirror: real
// block elements (headings, paragraphs, embeds) each get their own DOM node
// and, for the embeds, their own React component — not a plain-text buffer
// with syntax hidden/revealed via decorations the way a CodeMirror-based
// editor would work. The document still round-trips to/from a plain
// markdown string (via the `@tiptap/markdown` extension + this editor's own
// extensions), just via an explicit parse/serialize step instead of being
// the buffer itself at every keystroke.
//
// This file is only the orchestrator: assembling extensions and rendering
// the small bits of floating React UI (the block hover handle — the slash
// menu positions itself via Suggestion's own floating-ui integration, and
// the right-click formatting menu). Everything it assembles from — heading
// styling, the slash command, block-selection highlighting, drag reorder —
// lives alongside it, one concern per file. Embeds (page galleries, images,
// or any other custom block a consumer wants) are deliberately NOT built
// in here — pass your own Tiptap node extensions via the `extensions` prop,
// and your own extra "/" menu entries for them via `slashGroups`. Anything
// those custom nodes need at render time (ids, callbacks, app data) is the
// consumer's own concern — e.g. wrap this component in your own React
// Context provider, since NodeView portals render inside this component's
// own React tree and so can still read from an ancestor's context.
export function MarkdownLiveEditor({
  content, onChange,
  styles: stylesOverride, slashGroups: extraSlashGroups, extensions: extraExtensions = [],
  autofocus = true, trailingNode = true,
}: {
  content: string;
  onChange: (content: string) => void;
  // Per-element markdown styling (h1/h2/h3/p/strong/em/code/blockquote/hr).
  // Defaults to a plain, theme-agnostic set of classes — pass a partial
  // override to match your own design system.
  styles?: Partial<MarkdownLiveStyles>;
  // Extra "/" slash menu groups, appended after the editor's own built-in
  // defaults (headings, lists, quote, code, table, etc.) — this is how a
  // consumer's own custom blocks (a page gallery, an image, anything else)
  // get offered without the editor itself needing to know about them.
  slashGroups?: SlashGroup[];
  // A consumer's own Tiptap node/mark extensions (custom embeds, etc.) —
  // spread directly into the editor's extensions list. The editor itself
  // ships no embeds of its own; this is the only way to add any.
  extensions?: AnyExtension[];
  // Defaults true (a typical top-level use always wants focus on open/
  // creation). A consumer that mounts several of these at once — e.g. a
  // custom "card" embed whose own content is itself a nested
  // MarkdownLiveEditor — needs to opt out for every instance except the one
  // just created, since each instance calling `.focus()` on its own mount
  // would otherwise fight over which one actually ends up focused.
  autofocus?: boolean;
  // Defaults true — StarterKit always keeps an empty paragraph after the
  // last real block so there's somewhere to click/type past it, which
  // dragReorder.ts's `isEmptyTrailingParagraph`/`realContentEndPos` already
  // account for everywhere block positions matter. A compact nested
  // instance (e.g. a card embed) may want none of that, since it's meant to
  // fit tightly to whatever it contains rather than reserve a trailing
  // blank line.
  trailingNode?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const mergedStyles: MarkdownLiveStyles = { ...DEFAULT_MARKDOWN_LIVE_STYLES, ...stylesOverride };
  const groups: SlashGroup[] = [...DEFAULT_SLASH_GROUPS, ...(extraSlashGroups ?? [])];

  // `hoverBlock` (the handle's position) and `handleVisible` (whether it's
  // actually shown right now) are deliberately separate: clearing hover
  // only flips `handleVisible` to false and leaves the last position in
  // place, so the handle fades out via CSS transition where it already
  // was, instead of the position resetting to nothing and the next hover
  // popping it in at a new spot with no animation to actually see.
  const [hoverBlock, setHoverBlock] = useState<HoverBlockState | null>(null);
  const hoverRef = useRef<HoverBlockState | null>(null);
  const [handleVisible, setHandleVisible] = useState(false);
  const clearHover = () => setHandleVisible(false);
  // While the cursor is over the handle itself, its hover state is frozen —
  // `handleMouseMove` below skips both updating and clearing it — so moving
  // off the line and onto the handle can never clear it out from under a
  // click in progress.
  const overHandleRef = useRef(false);

  // Drag-to-reorder state. `trackingDrag` spans mousedown→mouseup (gates
  // whether the window-level listeners below are attached at all);
  // `dragging` only flips true once the mouse has moved past a small
  // threshold from where it went down, so a plain click doesn't flash drag
  // UI. Both have ref mirrors so the window `mousemove` handler always
  // reads the current value without needing to be torn down and
  // re-attached every time either changes.
  const [trackingDrag, setTrackingDrag] = useState(false);
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const dragSourcePosRef = useRef<number | null>(null);
  const dragStartScreenRef = useRef<{ x: number; y: number } | null>(null);
  const [dropY, setDropY] = useState<number | null>(null);
  const dropTargetPosRef = useRef<number | null>(null);
  const DRAG_THRESHOLD = 4;
  const GHOST_OFFSET = { x: 16, y: 12 };

  // Right-click formatting menu — only offered while there's an actual text
  // selection (an empty/collapsed one just gets the normal browser context
  // menu, unsuppressed, so spellcheck suggestions etc. still work).
  const [selectionMenuPos, setSelectionMenuPos] = useState<SelectionMenuPos | null>(null);
  // Spring-smoothed cursor-following position for the drag ghost (see
  // DragGhost.tsx) — `ghostX`/`ghostY` are the raw targets, set directly
  // from `mousemove` on every event; `ghostSpringX/Y` are what the ghost
  // actually renders at, easing toward those targets via real spring
  // physics. Both update the DOM through Motion's own render loop, not
  // React state, so tracking the cursor stays smooth no matter how often
  // this component itself re-renders.
  const ghostX = useMotionValue(0);
  const ghostY = useMotionValue(0);
  const ghostSpringX = useSpring(ghostX, { stiffness: 700, damping: 40, mass: 0.6 });
  const ghostSpringY = useSpring(ghostY, { stiffness: 700, damping: 40, mass: 0.6 });
  const [ghostVisible, setGhostVisible] = useState(false);
  const [ghostWidth, setGhostWidth] = useState(0);
  // The dragged block's real DOM, cloned into the ghost once it mounts (see
  // the effect below) — held in a ref rather than cloned eagerly because
  // the target element `contentRef` resolves to doesn't exist until
  // `ghostVisible` flips true and DragGhost's `AnimatePresence` actually
  // mounts it.
  const ghostSourceRef = useRef<HTMLElement | null>(null);
  const ghostContentElRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ghostVisible && ghostContentElRef.current && ghostSourceRef.current) {
      const clone = ghostSourceRef.current.cloneNode(true) as HTMLElement;
      // The source is already `setNodeSelection`'d by the time it's cloned
      // (see `beginDrag`), so it carries the "selected in the document"
      // ring/tint (blockSelection.ts) — strip exactly that off the clone so
      // the ghost shows the block's own natural look, not that on top of it.
      // `.split(" ")` alone would produce an empty-string token on any
      // double space, which `classList.remove()` throws on outright —
      // `.split(/\s+/).filter(Boolean)` is robust to that regardless of
      // how the class string itself is formatted.
      clone.classList.remove(...SELECTED_BLOCK_CLASS.split(/\s+/).filter(Boolean));
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

  // Global, not scoped to the editor — the cursor can (and while actually
  // dragging, often does) leave `hostRef`'s bounds entirely, and the drag
  // still needs to keep tracking and end cleanly on mouseup wherever that
  // happens.
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
        // The ghost's real preview content — cloning the block's own live
        // DOM (rather than re-rendering it through React) gets an accurate
        // preview for free, embeds included, with no extra render path to
        // keep in sync. It's injected once DragGhost actually mounts the
        // element `contentRef` resolves to (see the effect above).
        const sourcePos = dragSourcePosRef.current;
        const sourceDom = sourcePos !== null ? editor?.view.nodeDOM(sourcePos) : null;
        if (sourceDom instanceof HTMLElement) {
          ghostSourceRef.current = sourceDom;
          setGhostWidth(sourceDom.getBoundingClientRect().width);
          // Jumping both the raw and spring-derived values to the same
          // starting point avoids the spring animating in from (0, 0) —
          // the very first frame should appear exactly under the cursor,
          // with the spring only taking over from the second frame on.
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
      // Covers navigating away (or the section switching, which remounts
      // this whole component) mid-drag, when mouseup never fires to run
      // `endDrag`'s own cleanup.
      hideGhost();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingDrag]);

  // Each top-level block's own vertical band, relative to `hostRef` — the
  // handle's own CSS positioning ancestor (it's the `relative` element
  // `BlockHandle` sits inside), not the outer scrolling container, so these
  // numbers can be used as its `top` style directly with no further
  // conversion. That also means they don't need recomputing on scroll:
  // `hostRef` and the blocks inside it scroll together as one unit, so a
  // block's position relative to hostRef's own top edge is constant
  // regardless of scroll offset — only document *changes* can move it.
  //
  // Hover is resolved purely by which band the mouse's Y falls into —
  // deliberately not `posAtCoords`, which resolves an exact document
  // *position* and is unreliable right at the boundary between a block's
  // text and the gutter to its left (exactly where the mouse has to travel
  // to reach the handle), causing it to flicker to a different block or
  // nothing at all mid-approach.
  const blocksRef = useRef<{ pos: number; top: number; bottom: number }[]>([]);
  const recomputeBlocks = (view: EditorView) => {
    if (!hostRef.current) return;
    const hostRect = hostRef.current.getBoundingClientRect();
    const bands: { pos: number; top: number; bottom: number }[] = [];
    // `nodeDOM(offset)` returns the actual rendered element for the node
    // starting at that position — using its own real bounding box (rather
    // than inferring "bottom" from the next block's top, which pulled in
    // the margin/gap between them and skewed the midpoint down) also
    // correctly handles the embed blocks, which can be far taller than a
    // single text line, something `coordsAtPos` isn't built to measure.
    const doc = view.state.doc;
    doc.forEach((node, offset) => {
      // See isEmptyTrailingParagraph's own comment (dragReorder.ts) — this
      // is the auto-managed placeholder StarterKit's `trailingNode`
      // extension keeps after a trailing atom block, not something the
      // user ever created. Without this exclusion it's just as
      // hoverable/draggable as any real block, so aiming for the block
      // above it can end up grabbing this instead.
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

  // NodeView-backed blocks (a consumer's own embeds) render their real
  // content via a React portal Tiptap mounts on a `queueMicrotask`-deferred
  // subscriber update, not synchronously within the same transaction — so
  // any `recomputeBlocks` call made *synchronously* in response to a doc
  // change can measure a freshly (re)created NodeView's wrapper before
  // anything's actually painted inside it, producing a zero-height band
  // nothing can hover into (this hits not just initial mount, but every
  // move/reorder too, since ProseMirror recreates a NodeView from scratch
  // whenever a node is deleted and reinserted rather than moving its DOM
  // in place). A second pass on the next animation frame, after that
  // portal render and layout have settled, self-corrects it. The RAF ref
  // coalesces rapid-fire calls (e.g. while typing) into one follow-up pass
  // rather than piling up a queued frame per keystroke.
  const blocksRafRef = useRef<number | null>(null);
  const recomputeBlocksSoon = (view: EditorView) => {
    recomputeBlocks(view);
    if (blocksRafRef.current !== null) cancelAnimationFrame(blocksRafRef.current);
    blocksRafRef.current = requestAnimationFrame(() => {
      blocksRafRef.current = null;
      recomputeBlocks(view);
    });
  };

  // `useEditor` without a `deps` array builds the editor once per component
  // instance (a caller typically remounts this whole component via a `key`
  // when switching documents), matching a mount-once lifecycle —
  // `styles`/`slashGroups`/`extensions` changing later without a remount
  // isn't something this needs to support.
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        ...(trailingNode ? {} : { trailingNode: false }),
        paragraph: { HTMLAttributes: { class: mergedStyles.p } },
        blockquote: { HTMLAttributes: { class: mergedStyles.blockquote } },
        horizontalRule: { HTMLAttributes: { class: mergedStyles.hr } },
        bold: { HTMLAttributes: { class: mergedStyles.strong } },
        italic: { HTMLAttributes: { class: mergedStyles.em } },
        code: { HTMLAttributes: { class: mergedStyles.code } },
        bulletList: { HTMLAttributes: { class: "list-disc pl-4 flex flex-col last:pb-0 pb-2 text-sm" } },
        orderedList: { HTMLAttributes: { class: "list-decimal pl-4 flex flex-col mb-2 last:mb-0" } },
        listItem: { HTMLAttributes: { class: "leading-snuglast:mb-0 text-sm text-gold-500/80" } },
      }),
      createHeadingNode(mergedStyles),
      TableKit.configure({
        table: { HTMLAttributes: { class: "w-full border-collapse text-sm" } },
        tableRow: { HTMLAttributes: { class: "border-b border-gold-500/10 last:border-0" } },
        tableHeader: { HTMLAttributes: { class: "text-left px-2 py-1.5 text-gold-400 font-semibold" } },
        tableCell: { HTMLAttributes: { class: "px-2 py-1.5 text-gold-300 align-center" } },
      }),
      ...extraExtensions,
      SlashCommand.configure({ groups }),
      BlockSelectionHighlight,
      InputRuleRelay,
      Markdown,
      // A function, not a static string, so this only fires for a fully
      // blank document — not the "current empty line" placeholder pattern
      // (e.g. pressing Enter mid-document) that `emptyNodeClass`/
      // `emptyEditorClass` would otherwise both apply to.
      Placeholder.configure({
        placeholder: ({ editor: ed }) => ed.isEmpty ? "New Page" : "",
        emptyNodeClass: "is-empty",
      }),
    ],
    // A brand-new document (content === "") starts life as a single empty
    // H1, not a blank paragraph — the first thing typed becomes the title,
    // no separate "add a heading" step. Only used for that empty-seed case;
    // real existing content is never touched by this.
    content: content || "# ",
    contentType: "markdown",
    autofocus: autofocus ? "end" : false,
    editorProps: {
      attributes: {
        // Left padding is wider than the other sides on purpose — the 24px
        // (p-6) the other sides use is only just wide enough to fit the
        // 20px handle itself, leaving no visible gap between it and the
        // text. The extra room here is reserved gutter space, not a
        // uniform inset.
        class: "outline-none text-sm font-light leading-relaxed text-gold-400 caret-[#c8a84b] selection:bg-gold-500/20 py-6 pr-4",
      },
      handleDOMEvents: {
        // Only hijack the native menu when there's actual text selected —
        // a collapsed selection (a plain right-click to place the cursor)
        // still gets the browser's own menu, spellcheck suggestions
        // included.
        contextmenu: (view, event) => {
          if (view.state.selection.empty) return false;
          const mouseEvent = event as MouseEvent;
          mouseEvent.preventDefault();
          setSelectionMenuPos({ x: mouseEvent.clientX, y: mouseEvent.clientY });
          return true;
        },
      },
    },
    onUpdate: ({ editor: view }) => {
      onChangeRef.current(view.getMarkdown());
      recomputeBlocksSoon(view.view);
    },
  });

  // `onCreate` (an editor option) fires synchronously inside the
  // `useEditor()` call itself, during render — before React has committed
  // `containerRef` to the DOM, let alone before `<EditorContent>` has
  // attached the editor's own view.dom into the page for `coordsAtPos` to
  // measure anything real. A `useEffect` here runs after both of those have
  // happened (effects always run after the whole tree's committed), so this
  // is the first point blocks can actually be measured — without it,
  // hovering before ever typing anything found no bands at all and the
  // handle just never appeared.
  useEffect(() => {
    if (!editor) return;
    recomputeBlocksSoon(editor.view);
    return () => {
      if (blocksRafRef.current !== null) cancelAnimationFrame(blocksRafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  // Hovering anywhere within the editor resolves purely against the
  // precomputed per-block Y bands — not the mouse's X position at all —
  // so the whole width of a block's row, gutter included, counts as "over
  // this block" with no boundary to fall through while crossing from the
  // text to the handle.
  const handleMouseMove = (event: React.MouseEvent) => {
    if (overHandleRef.current || trackingDrag) return;
    if (!hostRef.current) return;
    const hostRect = hostRef.current.getBoundingClientRect();
    // Still bounded horizontally, just generously — well past the gutter on
    // the left, and not past the text column's own right edge — so hovering
    // far outside the reading column (empty space on a wide window) doesn't
    // light up a handle that isn't near the cursor at all.
    if (event.clientX < hostRect.left - 40 || event.clientX > hostRect.right) { clearHover(); return; }
    const y = event.clientY - hostRect.top;
    const block = blocksRef.current.find(b => y >= b.top && y < b.bottom);
    if (!block) { clearHover(); return; }
    if (hoverRef.current?.pos !== block.pos) {
      const next: HoverBlockState = { pos: block.pos, top: block.top, bottom: block.bottom };
      hoverRef.current = next;
      setHoverBlock(next);
    }
    setHandleVisible(true);
  };

  return (
    <>
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex justify-center"
        onMouseMove={handleMouseMove}
        onMouseLeave={clearHover}
      >
        <div ref={hostRef} className="w-full max-w-4xl relative">
          <EditorContent editor={editor} />
          {hoverBlock && editor && (
            <BlockHandle
              hover={hoverBlock}
              visible={handleVisible}
              dragging={dragging}
              onClick={() => editor.commands.setNodeSelection(hoverBlock.pos)}
              onDragStart={(clientX, clientY) => beginDrag(hoverBlock.pos, clientX, clientY)}
              onMouseEnter={() => { overHandleRef.current = true; }}
              onMouseLeave={() => { overHandleRef.current = false; clearHover(); }}
            />
          )}
          {dragging && dropY !== null && (
            <div
              className="absolute left-0 right-0 h-0.5 rounded-full bg-gold-500/70 pointer-events-none transition-[top] duration-100 ease-out"
              style={{ top: dropY }}
            />
          )}
        </div>
      </div>
      <DragGhost
        visible={ghostVisible}
        x={ghostSpringX}
        y={ghostSpringY}
        width={ghostWidth}
        contentRef={(el) => { ghostContentElRef.current = el; }}
      />
      {editor && (
        <SelectionMenu
          editor={editor}
          pos={selectionMenuPos}
          onClose={() => setSelectionMenuPos(null)}
        />
      )}
    </>
  );
}

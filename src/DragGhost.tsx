import { AnimatePresence, motion, type MotionValue } from "motion/react";

// The floating preview that follows the cursor while dragging a block.
// Purely presentational — `x`/`y` are spring-smoothed MotionValues the
// caller updates directly (via `.set()`) on every `mousemove`, which
// Motion applies to the DOM as a `transform` without going through React's
// render cycle, so tracking the cursor stays smooth regardless of how
// often the caller's own component re-renders. The actual preview content
// (a clone of the dragged block's real DOM, embeds included) is injected
// imperatively by the caller into the element `contentRef` resolves to,
// rather than re-rendered through React.
export function DragGhost({ visible, x, y, width, contentRef }: {
  visible: boolean;
  x: MotionValue<number>;
  y: MotionValue<number>;
  width: number;
  contentRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={contentRef}
          // `bg-surface` is the same neutral card/dropdown color used
          // elsewhere in the app (e.g. the slash menu) — without any fill
          // at all there was nothing for `shadow-lg` to give shape to
          // against this app's own already-dark background, so the "card"
          // was invisible, just floating text. What's deliberately still
          // absent is the gold selection ring/tint (`ring`/`bg-gold-500/*`
          // from blockSelection.ts's `SELECTED_BLOCK_CLASS`, stripped off
          // the cloned content itself in the orchestrator) — that's "this
          // is selected in the document", which isn't what a drag preview
          // is for.
          // `text-sm font-light leading-relaxed text-gold-400` re-states
          // what the editor's own container normally provides by
          // inheritance — the cloned content is detached from that
          // ancestor now, so without this its text renders in the
          // browser's plain black default instead of the theme's color.
          className="fixed top-0 left-0 z-50 pointer-events-none overflow-hidden rounded-md shadow-lg bg-surface p-2 text-sm font-light leading-relaxed text-gold-400"
          style={{ x, y, width, maxHeight: "10rem" }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 0.9, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.12 }}
        />
      )}
    </AnimatePresence>
  );
}

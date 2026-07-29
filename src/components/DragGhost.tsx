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
export function DragGhost({ visible, x, y, width, ghostClass, contentRef }: {
  visible: boolean;
  x: MotionValue<number>;
  y: MotionValue<number>;
  width: number;
  // The active theme's `ghost` — background + text color. Layout/shadow/
  // animation stay fixed regardless of theme.
  ghostClass: string;
  contentRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={contentRef}
          className={`fixed top-0 left-0 z-50 pointer-events-none overflow-hidden rounded-md shadow-lg p-2 text-sm font-light leading-relaxed ${ghostClass}`}
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

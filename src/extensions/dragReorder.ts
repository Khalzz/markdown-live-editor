import type { Editor } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";
import { NodeSelection } from "@tiptap/pm/state";

export interface BlockBand { pos: number; top: number; bottom: number }
export interface DropGap { pos: number; y: number }

// StarterKit's `trailingNode` extension auto-inserts an empty paragraph
// after a trailing atom block (our embeds) so there's always somewhere to
// click to keep typing below one — it's a managed placeholder, not
// something the user created. `MarkdownLiveEditor.tsx`'s own block-band
// computation uses this same check to exclude it from hover/drag targets;
// `realContentEndPos` below uses it for the mirror case — where "the end
// of the document" should actually mean, as a drop target.
export function isEmptyTrailingParagraph(node: PMNode): boolean {
  return node.type.name === "paragraph" && node.content.size === 0;
}

// `doc.content.size` (the position right after the very last node) is the
// wrong "end of document" for a drop target whenever that last node is the
// placeholder above — dropping there lands the moved block *after* the
// placeholder, stranding it in the middle of the document, with
// `trailingNode` then adding a fresh placeholder after the moved block in
// turn. This returns the position right *before* the placeholder instead,
// so "drop at the end" means "become the new last real block", exactly
// matching what the block-band list (which already excludes the
// placeholder) visually presents as the last drop location.
export function realContentEndPos(doc: PMNode): number {
  const lastChild = doc.lastChild;
  if (lastChild && isEmptyTrailingParagraph(lastChild)) {
    return doc.content.size - lastChild.nodeSize;
  }
  return doc.content.size;
}

// One drop location before each block, plus one after the last — `y` is
// the midpoint between the two blocks it sits between (or flush with the
// very top/bottom edge for the first/last gap), so snapping to "closest
// gap" during a drag reads as snapping to the boundary between blocks, not
// to the blocks themselves.
export function computeGaps(blocks: BlockBand[], docEndPos: number): DropGap[] {
  if (blocks.length === 0) return [{ pos: 0, y: 0 }];
  const gaps: DropGap[] = [{ pos: blocks[0].pos, y: blocks[0].top }];
  for (let i = 1; i < blocks.length; i++) {
    gaps.push({ pos: blocks[i].pos, y: (blocks[i - 1].bottom + blocks[i].top) / 2 });
  }
  gaps.push({ pos: docEndPos, y: blocks[blocks.length - 1].bottom });
  return gaps;
}

export function closestGap(gaps: DropGap[], y: number): DropGap {
  return gaps.reduce((best, gap) => Math.abs(gap.y - y) < Math.abs(best.y - y) ? gap : best);
}

// Moving a node in ProseMirror is delete-then-insert, not a single "move"
// primitive — `targetPos` is a position in the *pre-delete* document (one
// of the gap positions from `computeGaps`, all read from the doc before any
// of this runs), so it has to be re-mapped through the delete step via
// `tr.mapping` before it's still valid to insert at. Re-selecting the node
// at its mapped new position afterward is what makes the existing
// selection ring (blockSelection.ts) appear to follow it to its new spot,
// rather than the selection just silently vanishing.
export function moveBlock(editor: Editor, sourcePos: number, targetPos: number): boolean {
  const { state } = editor;
  const node = state.doc.nodeAt(sourcePos);
  if (!node) return false;
  const sourceEnd = sourcePos + node.nodeSize;
  // Dropping into either gap immediately touching the block's own current
  // position is a no-op — both are "put it back where it already is".
  if (targetPos === sourcePos || targetPos === sourceEnd) return false;

  let tr = state.tr.delete(sourcePos, sourceEnd);
  const mappedTarget = tr.mapping.map(targetPos);
  tr = tr.insert(mappedTarget, node);
  tr = tr.setSelection(NodeSelection.create(tr.doc, mappedTarget));
  editor.view.dispatch(tr);
  return true;
}

import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import type { SlashBlock, SlashGroup } from "./slashGroups";
import { SlashMenu } from "./SlashMenu";

export interface SlashCommandOptions {
  groups: SlashGroup[];
}

// Notion-style "/" menu, built on Tiptap's own Suggestion utility — the same
// mechanism most Tiptap-based editors use for @mentions — instead of
// hand-scanning the raw text for a "/token" the way a plain-textarea editor
// would have to. Suggestion already tracks the trigger range, re-filters as
// the user types, and (via `props.mount`) handles floating-position math
// against the cursor, so none of that needs reimplementing here.
export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",
  addOptions() {
    return { groups: [] as SlashGroup[] };
  },
  addProseMirrorPlugins() {
    const groups = this.options.groups;
    return [
      Suggestion<SlashGroup, SlashBlock>({
        editor: this.editor,
        char: "/",
        items: ({ query }) => {
          const q = query.toLowerCase();
          return groups
            .map(g => ({ ...g, blocks: g.blocks.filter(b => b.label.toLowerCase().includes(q)) }))
            .filter(g => g.blocks.length > 0);
        },
        command: ({ editor, range, props: block }) => {
          const markdownText = typeof block.markdown === "function" ? block.markdown() : block.markdown;
          editor.chain().focus().insertContentAt(range, markdownText, { contentType: "markdown" }).run();
        },
        // Suggestion's own render callbacks are imperative (not a React
        // render cycle), so the "currently highlighted" index and the
        // latest groups/command live as plain closure variables here rather
        // than React state — `render()` just re-pushes them into the
        // mounted SlashMenu instance via `updateProps`.
        render: () => {
          let component: ReactRenderer | null = null;
          let unmount: (() => void) | null = null;
          let highlighted = 0;
          let latestGroups: SlashGroup[] = [];
          let latestCommand: ((block: SlashBlock) => void) | null = null;

          const flatBlocks = () => latestGroups.flatMap(g => g.blocks);

          const push = () => {
            component?.updateProps({
              groups: latestGroups,
              highlighted,
              onHover: (i: number) => { highlighted = i; push(); },
              onSelect: (block: SlashBlock) => latestCommand?.(block),
            });
          };

          return {
            onStart: (startProps) => {
              latestGroups = startProps.items;
              latestCommand = (block) => startProps.command(block);
              highlighted = 0;
              component = new ReactRenderer(SlashMenu, {
                props: {
                  groups: latestGroups,
                  highlighted,
                  onHover: (i: number) => { highlighted = i; push(); },
                  onSelect: (block: SlashBlock) => latestCommand?.(block),
                },
                editor: startProps.editor,
              });
              unmount = startProps.mount(component.element);
            },
            onUpdate: (updateProps) => {
              latestGroups = updateProps.items;
              latestCommand = (block) => updateProps.command(block);
              highlighted = Math.min(highlighted, Math.max(flatBlocks().length - 1, 0));
              push();
            },
            onKeyDown: ({ event }) => {
              const blocks = flatBlocks();
              if (event.key === "ArrowDown") {
                highlighted = Math.min(highlighted + 1, blocks.length - 1);
                push();
                return true;
              }
              if (event.key === "ArrowUp") {
                highlighted = Math.max(highlighted - 1, 0);
                push();
                return true;
              }
              if (event.key === "Enter") {
                const block = blocks[highlighted];
                if (block) latestCommand?.(block);
                return true;
              }
              if (event.key === "Escape") {
                return true;
              }
              return false;
            },
            onExit: () => {
              unmount?.();
              component?.destroy();
              component = null;
            },
          };
        },
      }),
    ];
  },
});

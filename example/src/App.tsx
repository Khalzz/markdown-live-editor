import { useState } from "react";
import { MarkdownLiveEditor, MARKDOWN_LIVE_THEMES, type MarkdownLiveThemeName, type SlashGroup } from "markdown-live-editor";
import { ThemeSelect } from "./components/ThemeSelect";
import { DarkModeToggle } from "./components/DarkModeToggle";
import { Callout } from "./extensions/callout";
import { MessageSquareText } from "lucide-react";

const STARTER_CONTENT = `
# markdown-live-editor

Try it out:

- Hover the left edge of a line for the drag handle, then drag to reorder blocks.
- Type \`/\` for the slash command menu.
- Select some text and right-click for the formatting menu.
- Type \`**bold**\`, \`*italic*\`, \`- a list\`, or \`# a heading\` and watch it format live.

:::callout {text="This callout is a custom extension — not shipped by the library, wired in here via the \`extensions\` and \`slashGroups\` props. See example/src/extensions/callout.ts."} :::

A real app passes its own extensions the same way (a page-gallery block, an
image block, whatever else) plus its own "/" menu entries for them.
`;

const EXTRA_SLASH_GROUPS: SlashGroup[] = [
  {
    section: "Custom",
    blocks: [
      { label: "Callout", markdown: ':::callout {text="Note"} :::', icon: MessageSquareText },
    ],
  },
];



export default function App() {
  const [content, setContent] = useState(STARTER_CONTENT);
  const [themeName, setThemeName] = useState<MarkdownLiveThemeName>("indigo");

  const theme = MARKDOWN_LIVE_THEMES[themeName];

  return (
    <div className={`h-full w-full flex flex-col transition-colors ${theme.menu.background}`}>
      <header className={`shrink-0 px-4 py-3 border-b flex items-center justify-between transition-colors ${theme.menu.border} ${theme.menu.text}`}>
        <h1 className="text-sm font-semibold">markdown-live-editor</h1>
        <div className="flex items-center gap-2">
          <DarkModeToggle theme={theme} />
          <ThemeSelect value={themeName} onChange={setThemeName} />
        </div>
      </header>
      <main className="flex-1 min-h-0 w-full flex flex-col justify-center items-center overflow-y-auto">
        <div className="w-full max-w-4xl h-full flex flex-col justify-center items-center">
          <MarkdownLiveEditor
            content={content}
            onChange={setContent}
            theme={themeName}
            extensions={[Callout]}
            slashGroups={EXTRA_SLASH_GROUPS}
          />
        </div>
      </main>
    </div>
  );
}

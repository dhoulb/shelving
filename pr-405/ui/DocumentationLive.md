# DocumentationLive

- Kind: component
- Import: `import { DocumentationLive } from "shelving/ui";`

Show a code example next to a live preview of it, with a link that opens it in the playground.
- The preview is a `<DocumentationFrame>`, so it runs in the browser with the raw shelving styles.
- The code and preview are side by side on a wide screen, and stacked on a narrow one.

Show a code example next to a live preview of it. The docs site uses it for each fenced code block with a `live` flag.

**Things to know:**

- Add `live` after the language of a fenced code block to make it run: ` ```tsx live `. Put a title in double quotes after it: ` ```tsx live "Card with a link" `. See `parseFencedInfo()` for the full info string format.
- `DOCUMENTATION_LIVE_RULE` finds these blocks. `DOCUMENTATION_MARKUP_RULES` adds it to `TREE_MARKUP_RULES`, and `<DocumentationPage>` renders its content with them.
- The preview is a `<DocumentationFrame>`. It runs in the browser, with the raw shelving styles and none of the docs site styles.
- The code can import from `shelving/*`, `react`, and `react-dom` only. Any other import fails.
- Each top-level expression in the code shows in the preview, so a snippet needs no `return` or export. A default export that is a component or an element shows too.
- "Open in playground" opens the code in `<DocumentationPlaygroundPage>`, where you can change it.

## Usage

### A live example in a Markdown page

````md
```tsx live "A solid button"
import { Button } from "shelving/ui";

<Button solid>Save</Button>
```
````

### A live example with state

````md
```tsx live
import { useState } from "react";
import { Button } from "shelving/ui";

function Counter() {
  const [count, setCount] = useState(0);
  return <Button onClick={() => setCount(count + 1)}>Clicked {count} times</Button>;
}

<Counter />
```
````

## Styling

| Variable | Styles | Default |
|---|---|---|
| `--documentation-live-gap` | Space between the code and the preview (one length) | `var(--space-small)` (8px) |
| `--documentation-live-space` | Outer block margin (top + bottom) | `var(--space-paragraph)` (16px) |

The code and preview are side by side when the screen is 75rem or wider. The code block is a raw `<pre>`, so it takes the `.prose pre` styles of `<Preformatted>`.


## Signatures

```ts
DocumentationLive({ code, title }: DocumentationLiveProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DocumentationLiveProps` |  |
| `.code` | `string` | TSX source to show and run. It can import from `shelving/*`, `react`, and `react-dom` only. |
| `.title` | `string \| undefined` | Title to show above the example. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

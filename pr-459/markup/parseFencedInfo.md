# parseFencedInfo()

- Kind: function
- Import: `import { parseFencedInfo } from "shelving/markup";`

Parse the info string of a fenced code block into its language, flags, and title.
- The first word is the language, e.g. `tsx`.
- A first word with a dot is a file name, e.g. `worker.ts`: it becomes the title, and its extension becomes the language.
- Each other word is a flag, e.g. `live`.
- Text in double quotes is the title, e.g. `"Card with a link"`.

## Signatures

```ts
parseFencedInfo(info: string): FencedInfo
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `info` | `string` | The text after the opening fence, e.g. `tsx live "Card with a link"`. |

## Returns

| Type | Description |
| --- | --- |
| `FencedInfo` | The parsed language, flags, and title. |

## Examples

```ts
parseFencedInfo('tsx live "My card"') // { language: "tsx", flags: ["live"], title: "My card" }
```

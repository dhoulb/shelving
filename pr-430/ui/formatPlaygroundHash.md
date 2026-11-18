# formatPlaygroundHash()

- Kind: function
- Import: `import { formatPlaygroundHash } from "shelving/ui";`

Format code and CSS as a URL hash for the playground page or its frame, e.g. `#code=…&css=…`.
- Each value is UTF-8 then Base64URL encoded, so the same input always gives the same hash (on the server and in the browser).
- Empty values are left out, and an empty input gives `""`.

## Signatures

```ts
formatPlaygroundHash({ code, css }: PlaygroundCode): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `PlaygroundCode` |  |
| `.code` | `string \| undefined` | TSX source to run. It can import from `shelving/*`, `react`, and `react-dom` only. Read only. Optional. |
| `.css` | `string \| undefined` | CSS to add after the shelving styles. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The hash, with its leading `#`, or `""` if there is nothing to put in it. |

## Examples

```ts
formatPlaygroundHash({ code: "<Button>Hi</Button>" }) // "#code=PEJ1dHRvbj5IaTwvQnV0dG9uPg"
```

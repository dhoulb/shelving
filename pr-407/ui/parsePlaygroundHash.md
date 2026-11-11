# parsePlaygroundHash()

- Kind: function
- Import: `import { parsePlaygroundHash } from "shelving/ui";`

Parse a URL hash made by `formatPlaygroundHash()` back into code and CSS.
- Values that are missing or not valid Base64URL are left out.

## Signatures

```ts
parsePlaygroundHash(hash: string): PlaygroundCode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `hash` | `string` | The hash to parse, with or without its leading `#`. |

## Returns

| Type | Description |
| --- | --- |
| `PlaygroundCode` | The code and CSS in the hash. |

## Examples

```ts
parsePlaygroundHash("#code=PEJ1dHRvbj5IaTwvQnV0dG9uPg") // { code: "<Button>Hi</Button>" }
```

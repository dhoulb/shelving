# getURI()

- Kind: function
- Import: `import { getURI } from "shelving/util/uri";`

Convert a possible URI to a URI, or return `undefined` if conversion fails.
- Only inputs that already encode a complete URI succeed — relative inputs return `undefined`. No implicit fallback to the document or window URL.
- To resolve a relative ref against a base, use `getBasedURI()` from `url.ts`.

## Signatures

```ts
getURI(possible: Nullish<PossibleURI>): ImmutableURI | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `possible` | `Nullish<PossibleURI>` | Possible URI value to convert (a nullish value returns `undefined`). |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableURI \| undefined` | Converted `ImmutableURI`, or `undefined` if conversion fails. |

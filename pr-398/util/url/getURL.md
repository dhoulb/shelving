# getURL()

- Kind: function
- Import: `import { getURL } from "shelving/util/url";`

Resolve a possible URL relative to a base URL, or return `undefined` if conversion fails.
- Like `getBasedURI()` but only succeeds for true `scheme://host` URLs — other URIs (e.g. `mailto:`) return `undefined`.

## Signatures

```ts
getURL(target: Nullish<PossibleURL>, base?: PossibleURL): ImmutableURL | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `Nullish<PossibleURL>` | URL string, URL object, or path to resolve — falsy values return `undefined`. |
| `base` | `PossibleURL` | Base URL to resolve a relative `target` against. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableURL \| undefined` | Resolved `ImmutableURL`, or `undefined` if conversion fails or the result is not a true URL. |

# getBasedURI()

- Kind: function
- Import: `import { getBasedURI } from "shelving/util/url";`

Resolve a possible URI relative to a base, or return `undefined` if conversion fails.
- Returns any kind of URI — not just hierarchical `scheme://host` URLs. Use `getURL()` when a true URL is specifically required.
- A `URL` instance is returned as-is (already absolute, base ignored).

Note: the base is normalised with `getBaseURL()`, so it is always treated as if it ends in a slash.
- e.g. if `base` is `http://p.com/a/b/c` the path resolves relative to `c/` as if a trailing slash was present.
- This differs from the default behaviour of `new URL()`, but is the more natural expected result.

## Signatures

```ts
getBasedURI(input: Nullish<PossibleURL>, base?: PossibleURL): ImmutableURI | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `Nullish<PossibleURL>` | URI string, URL object, or path to resolve — falsy values return `undefined`. |
| `base` | `PossibleURL` | Base URL to resolve a relative `input` against. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableURI \| undefined` | Resolved `ImmutableURI`, or `undefined` if conversion fails. |

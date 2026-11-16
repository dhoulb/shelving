# matchURLPrefix()

- Kind: function
- Import: `import { matchURLPrefix } from "shelving/util/url";`

Resolve and match a target URL/path against a base URL and return the remaining path.

- Need to be valid _URLs_ not just _URIs_, i.e. needs to have `protocol://` at the start.
- Origins need to match, i.e. `http://localhost` !== `http://localhost:4020`
- Relative targets are resolved against the normalized base URL.
- The resolved target pathname is normalised with `cleanPath()` — runs of slashes are collapsed and a trailing slash is stripped (the root `/` is preserved) — so `/foo` and `/foo/` resolve to the same path. This mirrors the path-based sibling `matchPathPrefix()`.

## Signatures

```ts
matchURLPrefix(target: PossibleURL | undefined, base: PossibleURL | undefined, caller: AnyCaller = matchURLPrefix): AbsolutePath | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossibleURL \| undefined` | URL to match against `base` — if this is a relative path it will be resolved against `base` |
| `base` | `PossibleURL \| undefined` | Base URL the `target` is matched against. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to — defaults to `matchURLPrefix`. Defaults to `matchURLPrefix`. |

## Returns

| Type | Description |
| --- | --- |
| `AbsolutePath \| undefined` | Absolute path starting with `/`, or `undefined` for origin mismatches or non-matching paths. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | RequiredError If `target` or `base` cannot be resolved to a true URL. |

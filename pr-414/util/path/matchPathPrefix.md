# matchPathPrefix()

- Kind: function
- Import: `import { matchPathPrefix } from "shelving/util/path";`

Match and strip a base path prefix from a path using segment-aware pathname rules.
- Both inputs must be absolute paths that begin with `/`.
- Returns `/` when the paths are an exact match.

## Signatures

```ts
matchPathPrefix(target: PossiblePath, base: PossiblePath, caller: AnyCaller = matchPathPrefix): AbsolutePath | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `target` | `PossiblePath` | Path to match against `base` — relative paths resolve against `base`. |
| `base` | `PossiblePath` | Base path whose prefix is stripped from `target`. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `matchPathPrefix` itself). Defaults to `matchPathPrefix`. |

## Returns

| Type | Description |
| --- | --- |
| `AbsolutePath \| undefined` | The remaining absolute path after stripping `base`, `/` for an exact match, or `undefined` if `target` is not under `base`. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` or `base` is not a valid path. |

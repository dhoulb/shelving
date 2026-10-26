# requirePath()

- Kind: function
- Import: `import { requirePath } from "shelving/util/path";`

Resolve a relative or absolute path and return the path, or throw `RequiredError` if not a valid path.
- Internally uses `new URL` to do path processing but shouldn't ever reveal that fact.
- Returned paths are cleaned with `cleanPath()` so runs of slashes and trailing slashes are removed.

## Signatures

```ts
requirePath(path: PossiblePath, base?: AbsolutePath, caller: AnyCaller = requirePath): AbsolutePath
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `path` | `PossiblePath` | Absolute path e.g. `/a/b/c`, relative path e.g. `./a` or `b` or `../c`, URL string e.g. `http://shax.com/a/b/c`, or `URL` instance. |
| `base` | `AbsolutePath` | Absolute path used for resolving relative paths in `path`. Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requirePath` itself). Defaults to `requirePath`. |

## Returns

| Type | Description |
| --- | --- |
| `AbsolutePath` | Absolute path with a leading slash but no trailing slash, e.g. `/a/c/b`. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `path` is not a valid path. |

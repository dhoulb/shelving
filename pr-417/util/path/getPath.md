# getPath()

- Kind: function
- Import: `import { getPath } from "shelving/util/path";`

Resolve a relative or absolute path and return the absolute path, or `undefined` if not a valid path.
- Normalises runs of `//` more than one slash.
- Normalises `\` windows paths.
- Strips trailing slashes.

## Signatures

```ts
getPath(inputPath: Nullish<PossiblePath>, inputBase: AbsolutePath = "/"): AbsolutePath | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `inputPath` | `Nullish<PossiblePath>` | Absolute path e.g. `/a/b/c`, relative path e.g. `./a` or `b` or `../c`, URL string e.g. `http://shax.com/a/b/c`, or `URL` instance. |
| `inputBase` | `AbsolutePath` | Absolute path used for resolving relative paths in `inputPath`. Defaults to `"/"`. |

## Returns

| Type | Description |
| --- | --- |
| `AbsolutePath \| undefined` | Absolute path with a leading slash but no trailing slash, e.g. `/a/c/b`, or `undefined` if `inputPath` is not a valid path. |

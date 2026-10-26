# isRelativePath()

- Kind: function
- Import: `import { isRelativePath } from "shelving/util/path";`

Is a string path a relative path?

## Signatures

```ts
isRelativePath(path: PossiblePath): path is RelativePath
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `path` | `PossiblePath` | The path to test. |

## Returns

| Type | Description |
| --- | --- |
| `path is RelativePath` | `true` if `path` is a `RelativePath` (`.` or starting with `./`), narrowing its type. |

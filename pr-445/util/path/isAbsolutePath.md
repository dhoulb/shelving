# isAbsolutePath()

- Kind: function
- Import: `import { isAbsolutePath } from "shelving/util/path";`

Is a string path an absolute path?

## Signatures

```ts
isAbsolutePath(path: PossiblePath): path is AbsolutePath
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `path` | `PossiblePath` | The path to test. |

## Returns

| Type | Description |
| --- | --- |
| `path is AbsolutePath` | `true` if `path` is an `AbsolutePath` starting with `/`, narrowing its type. |

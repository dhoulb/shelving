# getRandomKey()

- Kind: function
- Import: `import { getRandomKey } from "shelving/util/random";`

Make a random key, e.g. `xs23r34hhsdx` or `e4m29klrugef`
- Not designed to be cryptographically random!
- Will probably clash — if you're making a random ID, check for existence of the record before saving.
- Designed to be semi-readable, doesn't use capital letters or `i` or `o` or `l` or `u`

## Signatures

```ts
getRandomKey(length = 12): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `length` | `unknown` | Number of characters in the returned key — defaults to `12`. Defaults to `12`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | Random string of `length` lowercase alphanumeric characters. |

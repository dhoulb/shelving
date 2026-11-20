# requireRef()

- Kind: function
- Import: `import { requireRef } from "shelving/util/string";`

Convert a string to a unique ref e.g. `abc123`, or throw `RequiredError` if conversion resulted in an empty string.

## Signatures

```ts
requireRef(str: string, caller: AnyCaller = requireRef): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | The string to convert. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requireRef` itself). Defaults to `requireRef`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The ref. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If conversion resulted in an empty string. |

## Examples

```ts
requireRef("Hello World!") // "helloworld"
```

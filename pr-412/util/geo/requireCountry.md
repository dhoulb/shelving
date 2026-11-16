# requireCountry()

- Kind: function
- Import: `import { requireCountry } from "shelving/util/geo";`

Parse a country string, or detect a browser country from `navigator.language`, or throw `RequiredError`.

## Signatures

```ts
requireCountry(value?: unknown, caller: AnyCaller = requireCountry): Country
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The country code to parse, or `"detect"` to read it from the browser. Optional. |
| `caller` | `AnyCaller` | Identity of the calling function for error attribution. Defaults to `requireCountry`. |

## Returns

| Type | Description |
| --- | --- |
| `Country` | The matching `Country` code. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | RequiredError If a country could not be resolved. |

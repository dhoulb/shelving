# getUUID()

- Kind: function
- Import: `import { getUUID } from "shelving/util/uuid";`

Convert/validate a string value as a UUID, or return `undefined` if it isn't valid.

- Strips any non-hex characters (including existing dashes) and normalises to lowercase.
- Requires exactly 32 hex characters after cleaning, otherwise returns `undefined`.
- The returned string is re-grouped into the canonical `8-4-4-4-12` segment layout.

## Signatures

```ts
getUUID(value: string): string | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `string` | The value to convert/validate as a UUID. |

## Returns

| Type | Description |
| --- | --- |
| `string \| undefined` | The normalised UUID string, or `undefined` if the value is not a valid UUID. |

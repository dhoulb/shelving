# requireUUID()

- Kind: function
- Import: `import { requireUUID } from "shelving/util/uuid";`

Convert/validate a string value as a UUID, or throw `RequiredError` if it isn't valid.

## Signatures

```ts
requireUUID(value: string): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `string` | The value to convert/validate as a UUID. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The normalised UUID string. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if the value is not a valid UUID. |

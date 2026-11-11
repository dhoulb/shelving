# getEnvBoolean()

- Kind: function
- Import: `import { getEnvBoolean } from "shelving/util/env";`

Get a `process.env` variable and resolve it to `true` or `false`, or `undefined` if it isn't a true/false value.
- Truthy values: `1`, `on`, `yes`, `true` (case-insensitive).
- Falsy values: `0`, `off`, `no`, `false` (case-insensitive).

## Signatures

```ts
getEnvBoolean(name: string): boolean | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `name` | `string` | Name of the environment variable to read. |

## Returns

| Type | Description |
| --- | --- |
| `boolean \| undefined` | `true` or `false` if the value is recognised, otherwise `undefined`. |

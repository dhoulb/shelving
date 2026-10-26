# getEnv()

- Kind: function
- Import: `import { getEnv } from "shelving/util/env";`

Get a `process.env` variable safely in all environments, or `undefined` if it doesn't exist or this environment does not support `process.env` (i.e. web environments).

## Signatures

```ts
getEnv(name: string): string | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `name` | `string` | Name of the environment variable to read. |

## Returns

| Type | Description |
| --- | --- |
| `string \| undefined` | The variable's string value, or `undefined` if missing or unsupported. |

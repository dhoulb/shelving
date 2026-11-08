# requireEnv()

- Kind: function
- Import: `import { requireEnv } from "shelving/util/env";`

Get a `process.env` variable safely in all environments, or throw `RequiredError` if it doesn't exist or this environment does not support `process.env` (i.e. web environments).

## Signatures

```ts
requireEnv(name: string, caller: AnyCaller = requireEnv): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `name` | `string` | Name of the environment variable to read. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requireEnv`). Defaults to `requireEnv`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The variable's string value. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if the variable is missing or `process.env` is unsupported. |

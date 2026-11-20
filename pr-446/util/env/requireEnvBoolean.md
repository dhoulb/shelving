# requireEnvBoolean()

- Kind: function
- Import: `import { requireEnvBoolean } from "shelving/util/env";`

Get a `process.env` variable and resolve it to `true` or `false`, or throw `RequiredError` if it isn't a true/false value.

## Signatures

```ts
requireEnvBoolean(name: string, caller: AnyCaller = requireEnvBoolean): boolean
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `name` | `string` | Name of the environment variable to read. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requireEnvBoolean`). Defaults to `requireEnvBoolean`. |

## Returns

| Type | Description |
| --- | --- |
| `boolean` | `false` if the environment variable is `0`, `off`, `no`, `false`; `true` if it is `1`, `on`, `yes`, `true`. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if the env variable is any other value. |

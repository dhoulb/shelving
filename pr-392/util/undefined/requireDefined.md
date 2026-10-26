# requireDefined()

- Kind: function
- Import: `import { requireDefined } from "shelving/util/undefined";`

Get a defined value, or throw if it is `undefined`.

## Signatures

```ts
requireDefined(value: T | undefined, caller: AnyCaller = requireDefined): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `T \| undefined` | The value to require. |
| `caller` | `AnyCaller` | Function to attribute the thrown error to (defaults to `requireDefined`). Defaults to `requireDefined`. |

## Returns

| Type | Description |
| --- | --- |
| `T` | The value, guaranteed not to be `undefined`. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if the value is `undefined`. |

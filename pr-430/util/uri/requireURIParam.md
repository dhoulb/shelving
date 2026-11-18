# requireURIParam()

- Kind: function
- Import: `import { requireURIParam } from "shelving/util/uri";`

Get a single named param from a URI.

## Signatures

```ts
requireURIParam(params: PossibleURIParams, key: string, caller: AnyCaller = requireURIParam): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `params` | `PossibleURIParams` |  |
| `key` | `string` |  |
| `caller` | `AnyCaller` | Defaults to `requireURIParam`. |

## Returns

| Type | Description |
| --- | --- |
| `string` |  |

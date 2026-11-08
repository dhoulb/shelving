# omitURIParams()

- Kind: function
- Import: `import { omitURIParams } from "shelving/util/uri";`

Return a URI without one or more params (or same URI if no changes were made).

## Signatures

```ts
omitURIParams(uri: ImmutableURL | URLString, ...keys: string[]): ImmutableURL
omitURIParams(uri: PossibleURI, ...keys: string[]): ImmutableURI
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `uri` | `ImmutableURL \| URLString` |  |
| `keys` | `string[]` |  |
| `uri` | `PossibleURI` |  |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableURL` |  |
| `ImmutableURI` |  |

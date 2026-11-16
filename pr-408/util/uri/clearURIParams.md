# clearURIParams()

- Kind: function
- Import: `import { clearURIParams } from "shelving/util/uri";`

Return a URI with no search params (or same URI if no changes were made).

## Signatures

```ts
clearURIParams(uri: ImmutableURL | URLString, caller?: AnyCaller): ImmutableURL
clearURIParams(uri: PossibleURI, caller?: AnyCaller): ImmutableURI
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `uri` | `ImmutableURL \| URLString` |  |
| `caller` | `AnyCaller` | Optional. |
| `uri` | `PossibleURI` |  |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableURL` |  |
| `ImmutableURI` |  |

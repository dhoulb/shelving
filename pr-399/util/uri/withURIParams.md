# withURIParams()

- Kind: function
- Import: `import { withURIParams } from "shelving/util/uri";`

Return a URI with several new params set (or same URI if no changes were made).
- Any params with `undefined` value will be ignored.

## Signatures

```ts
withURIParams(uri: ImmutableURL | URLString, params: Nullish<PossibleURIParams>, caller?: AnyCaller): ImmutableURL
withURIParams(uri: PossibleURI, params: Nullish<PossibleURIParams>, caller?: AnyCaller): ImmutableURI
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `uri` | `ImmutableURL \| URLString` |  |
| `params` | `Nullish<PossibleURIParams>` | A set of possible URI params. - If `params` is `null` or `undefined` the same input URL will be returned. |
| `caller` | `AnyCaller` | Optional. |
| `uri` | `PossibleURI` |  |
| `params` | `Nullish<PossibleURIParams>` |  |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableURL` |  |
| `ImmutableURI` |  |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `ValueError` if any of the values could not be converted to strings. |

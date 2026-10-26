# withURIParam()

- Kind: function
- Import: `import { withURIParam } from "shelving/util/uri";`

Return a URI with a new param set (or same URI if no changes were made).
- Any params with `undefined` value will be ignored.

## Signatures

```ts
withURIParam(uri: ImmutableURL | URLString, key: string, value: unknown, caller?: AnyCaller): ImmutableURL
withURIParam(uri: PossibleURI, key: string, value: unknown, caller?: AnyCaller): ImmutableURI
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `uri` | `ImmutableURL \| URLString` |  |
| `key` | `string` |  |
| `value` | `unknown` |  |
| `caller` | `AnyCaller` | Optional. |
| `uri` | `PossibleURI` |  |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableURL` |  |
| `ImmutableURI` |  |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `ValueError` if the value could not be converted to a string. |

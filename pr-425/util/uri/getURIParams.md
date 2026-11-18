# getURIParams()

- Kind: function
- Import: `import { getURIParams } from "shelving/util/uri";`

Get a set of params for a URI as a dictionary.
- Any params with `undefined` value will be ignored.
- Returned dictionary has a `null` prototype, so an untrusted `__proto__` param becomes an inert own entry (instead of being silently dropped by the inherited `__proto__` setter).

## Signatures

```ts
getURIParams(params: PossibleURIParams, caller: AnyCaller = getURIParams): URIParams
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `params` | `PossibleURIParams` | Possible URI params to convert. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `getURIParams` itself). Defaults to `getURIParams`. |

## Returns

| Type | Description |
| --- | --- |
| `URIParams` | Dictionary of string params keyed by name. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `params` is a string or URL that cannot be converted to a valid URI. |
| `ValueError` | If any param value cannot be converted to a string. |

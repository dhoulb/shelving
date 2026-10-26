# requireURI()

- Kind: function
- Import: `import { requireURI } from "shelving/util/uri";`

Convert a possible URI to a URI, or throw `RequiredError` if conversion fails.

## Signatures

```ts
requireURI(possible: PossibleURI, caller: AnyCaller = requireURI): ImmutableURI
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `possible` | `PossibleURI` | Possible URI value to convert. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requireURI` itself). Defaults to `requireURI`. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableURI` | Converted `ImmutableURI`. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `possible` cannot be converted to a valid URI. |

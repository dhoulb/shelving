# requireBaseURL()

- Kind: function
- Import: `import { requireBaseURL } from "shelving/util/url";`

Require a Base URL — a true URL whose `pathname` is normalised to end in a trailing slash.

## Signatures

```ts
requireBaseURL(value: PossibleURL, caller: AnyCaller): BaseURL
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PossibleURL` | URL string, URL object, or path to normalise. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to. |

## Returns

| Type | Description |
| --- | --- |
| `BaseURL` | `BaseURL` with a trailing-slash pathname. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | RequiredError If `value` cannot be resolved to a true URL. |

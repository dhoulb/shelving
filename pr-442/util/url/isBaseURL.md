# isBaseURL()

- Kind: function
- Import: `import { isBaseURL } from "shelving/util/url";`

Is an unknown value a valid Base URL?
- Must be a true URL whose `pathname` ends in a trailing slash.

## Signatures

```ts
isBaseURL(value: PossibleURL): value is BaseURL
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PossibleURL` | Value to test. |

## Returns

| Type | Description |
| --- | --- |
| `value is BaseURL` | `true` if `value` is a `BaseURL` (a URL with a trailing-slash pathname), otherwise `false`. |

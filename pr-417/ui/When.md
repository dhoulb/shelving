# When

- Kind: component
- Import: `import { When } from "shelving/ui";`

Relative time — shows a signed string like `in 6d`, `3w ago` or `just now` wrapped in a `<time>` element carrying the machine-readable date.

## Signatures

```ts
When(props: WhenProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `WhenProps` |  |
| `.target` | `PossibleDate \| undefined` |  |
| `.current` | `PossibleDate \| undefined` | Reference date the relative time is measured against. Defaults to `"now"`. |
| `.full` | `boolean \| undefined` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `target` (or `current`) cannot be coerced to a valid date. |

## Examples

```ts
<When target="2030-01-01" />
```

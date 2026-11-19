# joinTitles()

- Kind: function
- Import: `import { joinTitles } from "shelving/ui";`

Join several page or site titles together with ` - `, skipping empty values.

## Signatures

```ts
joinTitles(...titles: (string | undefined)[]): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `titles` | `(string \| undefined)[]` | Title segments to join, most-specific first. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The joined title string. |

## Examples

```ts
joinTitles("Messages", "Manchester Runners") // "Messages - Manchester Runners"
```

# joinMessage()

- Kind: function
- Import: `import { joinMessage } from "shelving/util/error";`

Join a dictionary of named messages back into a single string.
- The `""` (empty string) key is emitted as unnamed lines.
- Named messages are emitted as `name: message`, one line per message line.
- Empty lines are skipped and each emitted line is trimmed to match `splitMessage()` semantics.

## Signatures

```ts
joinMessage(input: ImmutableDictionary<string>): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `ImmutableDictionary<string>` | Dictionary mapping each name (or `""` for unnamed lines) to its message. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The combined message string, with one line per message line. |

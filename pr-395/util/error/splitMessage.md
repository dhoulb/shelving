# splitMessage()

- Kind: function
- Import: `import { splitMessage } from "shelving/util/error";`

Split a string message into lines, look for prefixes like `name:`, and return a dictionary of those named messages.
- Full messages strings can have multiple lines separated by `\n` newline.
- Named messages are extracted into their own entries in the dictionary.
- Unnamed messages are combined into a single entry with the key `""` (empty string).

## Signatures

```ts
splitMessage(input: PossibleMessage): ImmutableDictionary<string>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `PossibleMessage` | The value to read a message from (a string, or an object with a `message` string). |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableDictionary<string>` | Dictionary mapping each name (or `""` for unnamed lines) to its combined message. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if no message could be found. |

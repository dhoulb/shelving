# getNamedMessage()

- Kind: function
- Import: `import { getNamedMessage } from "shelving/util/error";`

Name a message by applying a `name: ` prefix to it.
- Assumes each line in the message is a separate error, so each line has the same prefix applied.

## Signatures

```ts
getNamedMessage(name: string | number, message: string): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `name` | `string \| number` | The name to prefix each line of the message with. |
| `message` | `string` | The message to prefix (may contain multiple `\n`-separated lines). |

## Returns

| Type | Description |
| --- | --- |
| `string` | The message with `name: ` prefixed to every line. |

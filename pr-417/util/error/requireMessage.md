# requireMessage()

- Kind: function
- Import: `import { requireMessage } from "shelving/util/error";`

Require a message from an unknown value, or throw `RequiredError` if it could not be found.

## Signatures

```ts
requireMessage(input: PossibleMessage, caller: AnyCaller = requireMessage): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `PossibleMessage` | The value to read a message from (a string, or an object with a `message` string). |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requireMessage`). Defaults to `requireMessage`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | The message string. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `RequiredError` if no message could be found. |

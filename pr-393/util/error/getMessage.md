# getMessage()

- Kind: function
- Import: `import { getMessage } from "shelving/util/error";`

Return the string message from an unknown value, or return `undefined` if it could not be found.

## Signatures

```ts
getMessage(input: unknown): string | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `input` | `unknown` | The value to read a message from (a string, or an object with a `message` string). |

## Returns

| Type | Description |
| --- | --- |
| `string \| undefined` | The message string, or `undefined` if none could be found. |

# setBaseErrorOptions()

- Kind: function
- Import: `import { setBaseErrorOptions } from "shelving/error";`

Apply `BaseErrorOptions` to an error instance by copying contextual fields onto it and trimming its stack.
- Copies every option except `cause` and `caller` onto the error as a named property.
- Uses `Error.captureStackTrace()` with the resolved caller so the stack points at the user's call site, not the error plumbing.

## Signatures

```ts
setBaseErrorOptions(defaultCaller: AnyCaller, error: BaseError, options: BaseErrorOptions): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `defaultCaller` | `AnyCaller` | Function to attribute the stack to when `options.caller` is not supplied. |
| `error` | `BaseError` | The error instance to mutate with contextual data and a trimmed stack. |
| `options` | `BaseErrorOptions` |  |
| `.caller` | `AnyCaller \| undefined` | Modify the stack to trim off lines after a certain calling function. Optional. |

## Examples

```ts
const error = new ValueError("Wrong");
	setBaseErrorOptions(ValueError, error, { received: 123, caller: myFunction });
```

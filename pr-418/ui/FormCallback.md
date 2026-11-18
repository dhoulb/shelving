# FormCallback

- Kind: type
- Import: `import { FormCallback } from "shelving/ui";`

Callback invoked when a `Form` is submitted with its validated data.
- Returned value (if defined) is notified to the user using `notifySuccess()`.
- Thrown value is notified to the user using `notifyError()`.

## Signatures

```ts
(
	data: T,
	event: SubmitEvent<HTMLFormElement>,
) => ReactNode | void | PromiseLike<ReactNode | void>
```

## Types

- `SubmitEvent`
- `HTMLFormElement`
- `ReactNode`
- `PromiseLike`

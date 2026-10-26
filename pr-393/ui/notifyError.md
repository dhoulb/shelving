# notifyError()

- Kind: function
- Import: `import { notifyError } from "shelving/ui";`

Notify the user with an error message by dispatching a `notice` event with `"error"` status.

## Signatures

```ts
notifyError(message: ReactNode, el?: EventTarget): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `message` | `ReactNode` | The error message to show, as a React node. |
| `el` | `EventTarget` | Element to dispatch the event on (defaults to `window`). Optional. |

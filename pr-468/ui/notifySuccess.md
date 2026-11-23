# notifySuccess()

- Kind: function
- Import: `import { notifySuccess } from "shelving/ui";`

Notify the user with a success message by dispatching a `notice` event with `"success"` status.

## Signatures

```ts
notifySuccess(message: ReactNode, el?: EventTarget): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `message` | `ReactNode` | The success message to show, as a React node. |
| `el` | `EventTarget` | Element to dispatch the event on (defaults to `window`). Optional. |

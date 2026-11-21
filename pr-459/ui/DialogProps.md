# DialogProps

- Kind: interface
- Import: `import { DialogProps } from "shelving/ui";`
- Extends: `OptionalChildProps`

Props for `<Dialog>` — optional `children` content and an `onClose` callback.

## Signatures

```ts
{
	onClose?: Callback;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `onClose` | `Callback` | Called when the user asks to close the dialog. It must unmount the `<Dialog>`. Unmount it inside `startTransition()` to animate it out (`<Dialogs>` does this for you). Optional. |

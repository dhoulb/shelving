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
| `onClose` | `Callback` | Called when the user closes the dialog. It must unmount the `<Dialog>`, and it runs inside `startTransition()` so the dialog animates out. Optional. |

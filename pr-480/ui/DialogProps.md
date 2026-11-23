# DialogProps

- Kind: interface
- Import: `import { DialogProps } from "shelving/ui";`
- Extends: `OptionalChildProps`

Props for `<Dialog>` — optional `children` content and an `onClose` callback.

## Signatures

```ts
{
	onClose?: Callback<[instant?: boolean]>;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `onClose` | `Callback<[instant?: boolean]>` | Called when the user asks to close the dialog. It must unmount the `<Dialog>`. Unmount it inside `startTransition()` to animate it out (`<Dialogs>` does this for you). - `instant` is `true` for a tap on a link: the page change runs its own view transition, so unmount the dialog at once, outside a transition. Optional. |

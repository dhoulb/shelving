# DialogControl

- Kind: interface
- Import: `import { DialogControl } from "shelving/ui";`

Controls for the nearest `<Dialog>`, so a `<Modal>` inside it can swipe it away.
- Internal: not exported from the `shelving/ui` barrel.

## Signatures

```ts
{
	readonly hide: () => void;
	readonly show: () => Promise<void>;
	readonly close: () => void;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `hide` | `() => void` | Hide the dialog in a `"dialog"` transition, so its exit transition runs. It stays mounted, with its state. Read only. |
| `show` | `() => Promise<void>` | Show the hidden dialog again at once, with no transition. Resolves after React commits it. Read only. |
| `close` | `() => void` | Close the dialog for real (calls its `onClose`). Read only. |

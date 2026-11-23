# Clickable

- Kind: component
- Import: `import { Clickable } from "shelving/ui";`

Render an `<a href="">`, a `<button>`, or a plain `<span>`, from the `href`, `onClick` and `disabled` props.
- `href` renders a `LinkClickable`; `onClick` or `disabled` renders a `ButtonClickable`; neither renders a `SpanClickable`.
- `disabled` with no `onClick` is a disabled `<button>`, e.g. a "Locked" button that can never be pressed.
- Dispatches on defined values (not key presence) so wrappers can always spread `href={href}` through, even when it's `undefined`.

## Signatures

```ts
Clickable(props: StylableClickableProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `StylableClickableProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

## Examples

```ts
<Clickable href="/about">About</Clickable>
```
```ts
<Clickable onClick={save}>Save</Clickable>
```

# Clickable

- Kind: component
- Import: `import { Clickable } from "shelving/ui";`

Render either a `<button>`, an `<a href="">`, or a plain `<span>` based on whether an `onClick` or `href` prop is provided.
- `href` renders a `LinkClickable`; `onClick` renders a `ButtonClickable`; neither renders a `SpanClickable`.
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

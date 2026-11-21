# TransitionClasses

- Kind: type
- Import: `import { TransitionClasses } from "shelving/ui";`

Map of view-transition types to their CSS class names in `{ type: className }` format.

- Each key is a "transition type" set with the React `addTransitionType()` API inside a `startTransition()` callback, e.g. `"forward"`.
- Each value is a "transition class" that React sets on the element as its `view-transition-class: forward;` CSS property — should correspond to a `::view-transition-old(.slideForward)` rule.

## Signatures

```ts
{
	default: string;
	forward?: string;
	back?: string;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `default` | `string` |  |
| `forward` | `string` | Optional. |
| `back` | `string` | Optional. |

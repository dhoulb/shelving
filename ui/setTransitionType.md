# setTransitionType()

- Kind: function
- Import: `import { setTransitionType } from "shelving/ui";`

Type-safe passthrough for React's `addTransitionType()` that checks `type` is one of our known view-transition types.

## Signatures

```ts
setTransitionType(type: TransitionType): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `type` | `TransitionType` | The transition type to activate, constrained to a known `TransitionType`. |

## Examples

```ts
setTransitionType("forward")
```

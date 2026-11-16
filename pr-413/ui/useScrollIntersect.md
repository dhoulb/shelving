# useScrollIntersect()

- Kind: function
- Import: `import { useScrollIntersect } from "shelving/ui";`

Fire callbacks when a referenced element enters or leaves the visible scrolling area.

- Returns a `ref` to attach to the element you want to observe — typically the last item in a scrolling list, for infinite-scroll loading.
- Uses an `IntersectionObserver` with a full-visibility threshold and disconnects it on unmount or when callbacks change.

## Signatures

```ts
useScrollIntersect(onEnter?: Nullish<Callback>, onLeave?: Nullish<Callback>): RefObject<T | null>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `onEnter` | `Nullish<Callback>` | Called when the element becomes fully visible. Optional. |
| `onLeave` | `Nullish<Callback>` | Called when the element stops being fully visible. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `RefObject<T \| null>` | A React `ref` to attach to the element to observe. |

## Examples

```ts
const ref = useScrollIntersect(loadMore); return <div ref={ref} />;
```

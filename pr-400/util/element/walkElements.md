# walkElements()

- Kind: function
- Import: `import { walkElements } from "shelving/util/element";`

Walk an `Elements` value into a flat iterable of `Element` objects.
- Accepts any shape the `Elements` union allows: a single element, a (possibly deeply nested) iterable, `null`, `undefined`, or a string (strings are skipped — there's no element to yield).
- Recurses through *iterable nesting* only (e.g. `[[a, b], c]` flattens to `a, b, c`); it does NOT descend into an element's own `props.children`. Walking deeper is the consumer's job.

The point of this helper is to remove the "is it one element, a list, undefined, or some nested thing" branching from every consumer that needs to dispatch over elements — pass it in, get a clean flat iterable out.

## Signatures

```ts
walkElements(elements: Elements<T>): Iterable<T>
walkElements(elements: Elements): Iterable<Element>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `elements` | `Elements<T>` | An element, a (possibly nested) iterable of elements, `null`, `undefined`, or a string (strings are skipped). |
| `elements` | `Elements` |  |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<T>` | A flat iterable of `Element` objects. |
| `Iterable<Element>` |  |

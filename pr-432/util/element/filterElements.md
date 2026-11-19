# filterElements()

- Kind: function
- Import: `import { filterElements } from "shelving/util/element";`

Filter elements yielded by `walkElements()` using a match function.

## Signatures

```ts
filterElements(elements: Elements, match: (element: Element) => boolean): Iterable<Element>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `elements` | `Elements` | The elements to walk and filter. |
| `match` | `(element: Element) => boolean` | Function called with each element; return `true` to keep the element. |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<Element>` | An iterable of the matching `Element` objects. |

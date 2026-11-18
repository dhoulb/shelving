# queryElements()

- Kind: function
- Import: `import { queryElements } from "shelving/util/element";`

Filter elements yielded by `walkElements()` using a `Query<Element>` object.
- Supports any property query (e.g. `{ type: "tree-element" }`, `{ type: ["tree-element", "tree-documentation"] }`), sorting, limiting — anything `queryItems()` accepts.

## Signatures

```ts
queryElements(elements: Elements, query: Query<Element>): Iterable<Element>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `elements` | `Elements` | The elements to walk and filter. |
| `query` | `Query<Element>` | The `Query<Element>` object describing the filter, sort, and limit to apply. |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<Element>` | An iterable of the matching `Element` objects. |

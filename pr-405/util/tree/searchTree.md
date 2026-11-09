# searchTree()

- Kind: function
- Import: `import { searchTree } from "shelving/util/tree";`

Search the descendants of a tree element and return the best-ranked matches.

- Walks every descendant of `scope` (depth-first; `scope` itself is not a candidate), optionally narrowed by `options.filter`.
- Tokenises `query` with `getWords()` so quoted phrases match literally: `searchTree(root, '"hello world" foo')` matches the phrase `hello world` *and* the word `foo`.
- Requires *every* token to match (AND, not OR): a candidate is only returned when each token matches at least one of its props. So `date util` returns only elements matching both `date` and `util`, not either alone.
- Ranks each candidate (case-insensitive) per token, summing each token's best tier: `name` exact > `name` starts-with > `name` includes > `title` includes > `description` includes > `content` includes. A `name` match always outranks a content-only match.
- An empty `query` returns the (filtered) candidates in tree order — useful for a filter-only or "show everything" listing.

## Signatures

```ts
searchTree(scope: TreeElement, query: string, options?: SearchTreeOptions): TreeElement[]
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `scope` | `TreeElement` | The element whose descendants are searched. |
| `.key` | `string` | Read only. |
| `.type` | `` `tree-${string}` `` | Read only. |
| `query` | `string` | The search string — bare words plus `"quoted phrases"`. |
| `options` | `SearchTreeOptions` | Optional. |
| `.limit` | `number \| undefined` | Maximum number of results to return (defaults to `20`). Read only. Optional. |
| `.filter` | `Query \| undefined` | Optional `Query` narrowing the candidates by *any* prop before ranking — the same shape `queryItems()` takes. - e.g. `{ kind: "method" }` to only rank methods, or `{ source: "…" }` to constrain by source. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `TreeElement[]` | The matching descendants, best first, capped at `limit`. |

## Examples

```ts
searchTree(root, "store", { limit: 10, filter: { kind: "class" } }) // up to 10 classes ranked for "store"
```

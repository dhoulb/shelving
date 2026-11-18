# TreeRouter

- Kind: component
- Import: `import { TreeRouter } from "shelving/ui";`

Resolve a URL path to a tree element and render it as a full page.

- Reads the flattened `path` → element map from the surrounding `<TreeProvider>` (`useTreeMap()`), then resolves the current URL with a single `map.get(path)`.
- `/` renders the root itself; deeper paths render the matching descendant (composite module names like `/util/string` resolve for free — they're whole keys in the map).
- The resolved element is already stamped with its canonical `path`, so the page and its cards link straight to their own paths — nothing needs threading.
- To override the renderer for a specific element type, wrap in `<TreeRouterMapping mapping={…}>`.

## Signatures

```ts
TreeRouter({ fallback, ...meta }: TreeRouterProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `meta` | `TreeRouterProps` |  |
| `.fallback` | `ReactElement \| undefined \| null` | Optional fallback element. - Explicit `null` means fallback to nothing (router will not throw `NotFoundError`). Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `NotFoundError` When no element matches the URL and no `fallback` is given. |

## Examples

```ts
<TreeProvider tree={tree}><TreeRouter /></TreeProvider>
```

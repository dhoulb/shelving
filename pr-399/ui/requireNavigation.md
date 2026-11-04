# requireNavigation()

- Kind: function
- Import: `import { requireNavigation } from "shelving/ui";`

Read the current `NavigationStore` from context, throwing if used outside `<Navigation>`.

## Signatures

```ts
requireNavigation(): NavigationStore
```

## Returns

| Type | Description |
| --- | --- |
| `NavigationStore` | The current `NavigationStore`. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | RequiredError If no `<Navigation>` provider is present above. |

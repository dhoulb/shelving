# requireNavigation()

- Kind: function
- Import: `import { requireNavigation } from "shelving/ui";`

Read the current `NavigationSequence` from context, throwing if used outside `<Navigation>`.

## Signatures

```ts
requireNavigation(): NavigationSequence
```

## Returns

| Type | Description |
| --- | --- |
| `NavigationSequence` | The current `NavigationSequence`. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | RequiredError If no `<Navigation>` provider is present above. |

# useHydrated()

- Kind: function
- Import: `import { useHydrated } from "shelving/ui";`

Whether this render can use browser-only state (such as navigation history).
- `false` in a server render, and in the first client render that hydrates server HTML, so both make the same HTML.
- `true` in every other client render. After hydration, React renders again with `true`.

## Signatures

```ts
useHydrated(): boolean
```

## Returns

| Type | Description |
| --- | --- |
| `boolean` |  |

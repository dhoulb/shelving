# PageLoader

- Kind: component
- Import: `import { PageLoader } from "shelving/ui";`

Load a page.

- Wrapped in `<PageCatcher>` so child components can throw errors.
- Wrapped in `<Suspense>` so child components can throw promises.
- It renders no layout, so its loading state and error page show inside whatever layout is around it.

## Signatures

```ts
PageLoader({ children, fallback = PAGE_LOADING }: LoaderProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `LoaderProps` |  |
| `.fallback` | `ReactNode \| undefined` | Element rendered while `children` suspend (defaults to `LOADING`). Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

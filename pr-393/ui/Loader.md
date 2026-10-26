# Loader

- Kind: component
- Import: `import { Loader } from "shelving/ui";`

Load a component.

- Wrapped in `<Catcher>` so child components can throw errors.
- Wrapped in `<Suspense>` so child components can throw promises.

## Signatures

```ts
Loader({ children, fallback = LOADING }: LoaderProps): ReactElement
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

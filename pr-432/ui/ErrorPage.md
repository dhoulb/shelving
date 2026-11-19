# ErrorPage

- Kind: component
- Import: `import { ErrorPage } from "shelving/ui";`

Render a caught error as a `<Page>` with an `<ErrorNotice>` in a narrow column, centred in the middle of the screen.
- It renders no layout, so it shows inside whatever layout is around it. Outside every layout (an app-level catcher), wrap it in one, for example `<FixedLayout>` with a `<Scroll vertical cover>`.

## Signatures

```ts
ErrorPage({ reason }: ErrorProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ErrorProps` |  |
| `.reason` | `unknown` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` |  |

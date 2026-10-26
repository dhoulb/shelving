# RoutePath

- Kind: component
- Import: `import { RoutePath } from "shelving/ui";`

Tell the surrounding `<Router>` (and `<RouteCache>`) that this page owns every path that matches a template.
- A navigation to a path the page owns keeps the same page mounted, so it keeps its scroll and state,
  and a `<ViewTransition>` around the page does not run an enter or exit. The page updates for the new URL.
- Use it for a page whose tabs each have their own path: `<RoutePath path="/dave/{tab}">`.
- Put the real values in the template. `/{name}/{tab}` would make every person's profile one page.

Tell the surrounding `<Router>` (and `<RouteCache>`, if there is one) that a page owns every path that matches a template. A navigation between paths the page owns keeps the same page mounted: it keeps its scroll and state, and a `<ViewTransition>` around the page does not slide. Use it for a page whose tabs each have their own path.

**Things to know:**

- Without `<RoutePath>`, each path is its own page, so `/challenge/123` and `/challenge/456` stay separate pages.
- Put the real values in the template (`/dave/{tab}`). A template such as `/{name}/{tab}` makes every profile the same page.
- The page still renders for the new URL, so it reads the tab from the URL as usual.
- It works with or without a `<RouteCache>`. In a nested router's page, it tells only that nested router.

## Usage

```tsx
import { Page, RoutePath } from "shelving/ui";

function ProfilePage({ name, tab }: { name: string; tab?: string }) {
  return (
    <RoutePath path={`/${name}/{tab}`}>
      <Page title={name}>
        <ProfileTabs tab={tab} />
      </Page>
    </RoutePath>
  );
}
```


## Signatures

```ts
RoutePath({ path, children }: RoutePathProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `RoutePathProps` |  |
| `.path` | `AbsolutePath` | Path template the page owns, for example `/dave/{tab}`. Every path that matches it shows this same page. Read only. |
| `.children` | `ReactNode` | The page content. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |

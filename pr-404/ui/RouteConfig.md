# RouteConfig

- Kind: component
- Import: `import { RouteConfig } from "shelving/ui";`

Configure the current page for the surrounding `<Router>` (and `<RouteCache>`).
- `path` says the page owns every path that matches a template. A navigation to a path the page owns keeps the same
  page mounted, so it keeps its scroll and state, and a `<ViewTransition>` around the page does not run an enter or
  exit. The page updates for the new URL. Use it for a page whose tabs each have their own path: `path="/dave/{tab}"`.
- Put the real values in the template. `/{name}/{tab}` would make every person's profile one page.
- `cache={false}` makes `<RouteCache>` drop the page when you leave it, so the next visit starts again with no old
  state. Use it for a form that makes or edits something, for example a "New challenge" page.

Configure the current page for the surrounding `<Router>` (and `<RouteCache>`, if there is one). It has one prop for each setting, so a page wraps itself in one `<RouteConfig>` for all its settings.

- `path` says the page owns every path that matches a template. A navigation between paths the page owns keeps the same page mounted: it keeps its scroll and state, and a `<ViewTransition>` around the page does not slide. Use it for a page whose tabs each have their own path.
- `cache={false}` tells `<RouteCache>` to drop the page when you leave it. The next visit starts again, with no old state. Use it for a form that makes or edits something, so it never shows old input.

**Things to know:**

- Without `path`, each path is its own page, so `/challenge/123` and `/challenge/456` stay separate pages.
- Put the real values in the template (`/dave/{tab}`). A template such as `/{name}/{tab}` makes every profile the same page.
- The page still renders for the new URL, so it reads the tab from the URL as usual.
- The cache key is the path only, not the `?query`. A page that reads its `?query` once (for example `/new?from=123`) should use `cache={false}`, so a visit with another `?query` does not show the old page.
- It works with or without a `<RouteCache>`. In a nested router's page, it tells only that nested router.

## Usage

```tsx
import { Page, RouteConfig } from "shelving/ui";

// Each tab has its own path, and all of them are the same page.
function ProfilePage({ name, tab }: { name: string; tab?: string }) {
  return (
    <RouteConfig path={`/${name}/{tab}`}>
      <Page title={name}>
        <ProfileTabs tab={tab} />
      </Page>
    </RouteConfig>
  );
}

// A new form on each visit.
function NewChallengePage({ from }: { from?: string }) {
  return (
    <RouteConfig cache={false}>
      <Page title="New challenge">
        <ChallengeForm from={from} />
      </Page>
    </RouteConfig>
  );
}
```


## Signatures

```ts
RouteConfig({ path, cache, children }: RouteConfigProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `RouteConfigProps` |  |
| `.path` | `AbsolutePath \| undefined` | Path template the page owns, for example `/dave/{tab}`. Every path that matches it shows this same page. Read only. Optional. |
| `.cache` | `boolean \| undefined` | Set to `false` so `<RouteCache>` drops the page when you leave it, and the next visit shows a new page. Defaults to `true`. Read only. Optional. |
| `.children` | `ReactNode` | The page content. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |

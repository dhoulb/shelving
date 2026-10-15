# RoutePath

Tell the surrounding `<RouteCache>` that a page owns every path that matches a template. A navigation between paths the page owns keeps the same page mounted: it keeps its scroll and state, and a `<ViewTransition>` around the page does not slide. Use it for a page whose tabs each have their own path.

**Things to know:**

- Without `<RoutePath>`, each path is its own cached page, so `/challenge/123` and `/challenge/456` stay separate pages.
- Put the real values in the template (`/dave/{tab}`). A template such as `/{name}/{tab}` makes every profile the same page.
- The page still renders for the new URL, so it reads the tab from the URL as usual.
- It does nothing outside a `<RouteCache>`.

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

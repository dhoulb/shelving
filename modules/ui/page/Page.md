# Page

Wraps one page (or screen) inside an app, applying its per-page metadata. It merges `PossibleMeta` props into context and emits hoistable head tags (title, description, meta, links, stylesheets, scripts) that React 19 lifts into the document `<head>`. It also updates `window.history` to match the page URL.

**Things to know:**

- Accepts `PossibleMeta` props (`app`, `root`, `url`, `title`, `description`, `language`, `tags`, `links`, `stylesheets`, `modules`, `scripts`) and merges them with the surrounding `Meta` context.
- The page title is composed with the app name from context — `title="User profile"` under `app="My App"` renders `"User profile - My App"`.
- It renders `<Head>` inline; React 19 hoists each `<title>`, `<meta>`, `<link>`, and `<script>` into `<head>`, so no portal is needed. `<base>` is the exception — that lives in `<HTML>`.

## Usage

```tsx
import { Page, Section } from "shelving/ui";

function UserPage({ id }: { id: string }) {
  return (
    <Page title="User profile" url={`/users/${id}`} description="View user details.">
      <Section>…</Section>
    </Page>
  );
}
```

A page renders no layout. The layout goes outside the page, above the router, so every page in it shares one frame. See "Composing an app" on `<App>`.

```tsx
import { Block, FixedLayout, Page, Scroll } from "shelving/ui";

<FixedLayout>
  <Scroll vertical cover>
    <Page title="Sign in">
      <Block middle width="narrow">
        <LoginForm/>
      </Block>
    </Page>
  </Scroll>
</FixedLayout>
```

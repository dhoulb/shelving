# Catcher

A React error boundary that catches errors thrown anywhere in its subtree and replaces the failed region with a fallback component. Pass `as` to supply a custom error renderer; it defaults to `ErrorNotice` (an inline error notice with a retry button).

**Things to know:**

- `PageCatcher` is a convenience wrapper that renders `ErrorPage` instead — a full-page error display inside a [`<CenteredLayout>`](/ui/CenteredLayout).
- `RetryButton` reads the retry callback from the nearest `Catcher` via context and renders a [`<Button>`](/ui/Button). It returns `null` when there is no parent catcher to retry.
- `ErrorNotice` and `ErrorPage` can be used standalone when you need to display a known error without a boundary. Both use [`getMessage()`](/util/error/getMessage) to extract a human-readable message, falling back to `"Unknown error"`.

## Usage

```tsx
import { PageCatcher, Catcher, ErrorNotice } from "shelving/ui";

// Catch and display errors for a whole page.
<PageCatcher>
  <MyPage />
</PageCatcher>

// Localised error boundary inside a panel.
<Catcher as={ErrorNotice}>
  <LiveFeed />
</Catcher>
```

```tsx
import { Catcher, ErrorPage, RetryButton } from "shelving/ui";

// Custom error renderer plus a retry button anywhere in the subtree.
<Catcher as={ErrorPage}>
  <RiskyComponent />
  <RetryButton small />
</Catcher>
```

# Loading

An animated SVG spinner used as a loading indicator. Self-contained inline SVG with a rotating indicator arc that inherits its colour and size from the surrounding text.

**Things to know:**

- Takes no props.
- `LOADING` is a pre-keyed `<Loading />` element with a stable `key` — drop it straight into `Suspense` fallbacks and lists to avoid unnecessary reconciliation overhead.

## Usage

```tsx
import { Loading, LOADING } from "shelving/ui";

<Loading />

// Pre-keyed constant for fallbacks and lists.
<Suspense fallback={LOADING}>
  <SlowComponent />
</Suspense>

{busy ? LOADING : children}
```

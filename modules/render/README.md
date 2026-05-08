# render

Static-site rendering primitive for shelving — turn a React tree into an HTML string for a given URL.

## Concepts

`renderRoute` wraps a React tree in `<Meta url={url} base={base}>` and runs `renderToStaticMarkup`. Descendants — `<Router>`, `<Head>`, `<HTMLPage>`, anything that calls `requireMeta()` — pick up the URL/base from the Meta context and render accordingly. The result is a complete HTML string for that one URL.

`renderRoutes` is the same thing in bulk: pass a list of URLs and get back a `{ url → html }` record. Used by static-site builds to render every page in a single pass.

The output is ready to write to disk. If the rendered tree is rooted at `<html>` (which `<HTMLPage>` does), the helper prepends `<!DOCTYPE html>` automatically.

## Usage

```ts
import { renderRoute, renderRoutes } from "shelving/render";
import { HTMLPage, Router } from "shelving/ui";

function App() {
    return (
        <HTMLPage app="My App" stylesheet="style.css">
            <Router routes={MY_ROUTES} />
        </HTMLPage>
    );
}

// Single route — typical for live SSR.
const html = renderRoute(<App />, "/users/123");

// Bulk — typical for static-site generation.
const pages = renderRoutes(<App />, ["/", "/users/123", "/about"]);
for (const [url, body] of Object.entries(pages)) {
    // ... write `body` to disk at the URL's path.
}
```

### Synthetic origins for static deploys

Static sites are typically deployed at an unknown base path (e.g. `https://example.github.io/repo/` or under a custom domain). Pass URLs against any synthetic origin you like:

```ts
const urls = paths.map(p => new URL(`/${p}`, "http://localhost/"));
renderRoutes(<App />, urls);
```

The actual deployed origin doesn't need to match — `Router` and the rendered links use relative `href`s that resolve against whatever URL the browser is visiting.

## Server-vs-client detection

If a component needs to behave differently when server-rendered vs. mounted in a browser, use the standard idiom — there's no `shelving/render` helper for this:

```ts
if (typeof window === "undefined") return; // server: skip the browser-only branch
```

`useEffect` callbacks already do not run during server rendering, so listeners attached inside them are SSR-safe. Only `useState` / `useRef` / `useMemo` initializers, top-level component-body code, and module-scope side effects can hit a missing `window` / `document`.

## Forward paths

`renderToStaticMarkup` is intentionally chosen as the v1 backbone. Three forward paths leave from this point:

- **Hydration** — swap one line to `renderToString`, ship a small client bundle that calls `hydrateRoot(document, <App />)`. The same `<HTMLPage>` works both server-side and client-side.
- **Streaming SSR** — `renderToReadableStream` for per-request render under Cloudflare Workers / Node; expose a `streamRoute()` sibling helper.
- **React Server Components** — adds a serialiser layer and a different bundling model. Out of scope for this module.

The `<Meta url={…} base={…}>` wrap stays identical across all three, so callers don't have to rewrite their app to migrate.

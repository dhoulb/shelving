# Link helpers

Resolve any link-shaped value — a site path, relative reference, or full URI — into an absolute URI string. Useful when building components or routing logic that must handle all three forms uniformly.

**Things to know:**

- A single leading `/` is treated as a **site-absolute path** and resolved under `root` (not the host root), so `/schema` against `https://x.com/app/` becomes `https://x.com/app/schema`.
- `//host/path` (protocol-relative) and all other strings are resolved against `url`.
- `root` defaults to `url`; omitting both means all resolution attempts return `undefined`.
- `URL` instances pass through directly without any transformation.

## Usage

```ts
import { getLink, requireLink } from "shelving/util";

const siteRoot = new URL("https://x.com/app/");
const pageURL  = new URL("https://x.com/app/docs/");

// Site-absolute path.
getLink("/schema", pageURL, siteRoot);  // "https://x.com/app/schema"

// Relative reference.
getLink("./db", pageURL);               // "https://x.com/app/docs/db"

// Full URI — base is ignored.
getLink("mailto:hello@example.com");    // "mailto:hello@example.com"

// Missing or unresolvable — returns undefined.
getLink(null);                          // undefined

// requireLink throws RequiredError instead of returning undefined.
requireLink("/schema", pageURL, siteRoot); // "https://x.com/app/schema"
```

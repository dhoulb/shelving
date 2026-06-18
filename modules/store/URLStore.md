# URLStore

A [`Store`](/store/Store) for a URL such as `https://example.com/a/b/c`. `URLStore` coerces any assigned URL or URL string (resolved against an optional `base`), exposes the URL's parts as accessors, and adds query-param and route-matching helpers.

## Usage

```ts
import { URLStore } from "shelving/store";

const url = new URLStore("https://example.com/search?q=hats");

console.log(url.hostname);        // "example.com"
console.log(url.getParam("q"));   // "hats"

url.setParam("page", "2");        // updates the stored URL's query
url.value = "/search?q=shoes";    // assign a relative path — resolved against the current URL

url.isActive("https://example.com/search?q=shoes"); // true
url.isProud("https://example.com/search");          // true — current URL sits below this one
```

Param helpers come in mutating (`setParam`, `updateParams`, `deleteParam`, `clearParams`) and non-mutating (`withParam`, `withParams`, `omitParam`) forms — the latter return a new URL without changing the store.

## See also

- [`Store`](/store/Store) — the base class.
- [`PathStore`](/store/PathStore) — the equivalent for absolute paths.
- [`shelving/store`](/store) — overview of all store classes.

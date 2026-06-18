# String templates

Match placeholders out of a string, or render values into one. Useful when a full regular expression is overkill and you just want to extract named segments from a path or pattern.

**Things to know:**

- Placeholders are recognised in any of these formats: `:name`, `{name}`, `{{name}}`, `${name}`, `[name]`, and `*` (anonymous, zero-indexed).
- Catchall variants (`**`, `:name*`, `{...name}`) allow empty values and, in path mode, can span `/` separators.
- Adjacent placeholders are not allowed — there must be at least one character between them.
- Parsed templates are cached, so repeated calls with the same template string are cheap.
- [`matchPathTemplate()`](/util/template/matchPathTemplate) and [`renderPathTemplate()`](/util/template/renderPathTemplate) are path-aware siblings of [`matchTemplate()`](/util/template/matchTemplate) and [`renderTemplate()`](/util/template/renderTemplate). Non-catchall placeholders in path templates cannot span `/` segments.

## Usage

### Match — extract values from a string

```ts
import { matchTemplate, matchPathTemplate, matchTemplates } from "shelving/util";

matchTemplate("places/{country}/{city}", "places/france/paris");
// { country: "france", city: "paris" }

matchTemplate(":year-:month", "2024-03");
// { year: "2024", month: "03" }

matchTemplate("*-*-*", "A-B-C");
// { "0": "A", "1": "B", "2": "C" }

matchTemplate("no-match/:x", "something-else"); // undefined

// Try several templates, return first match:
matchTemplates([":id@:domain", "places/:country/:city"], "places/france/paris");
// { country: "france", city: "paris" }

// Path-aware matching — non-catchall placeholder can't span `/`:
matchPathTemplate("/files/:name", "/files/report.pdf");
// { name: "report.pdf" }
matchPathTemplate("/files/:name", "/files/a/b"); // undefined
```

### Render — insert values into a template

```ts
import { renderTemplate, renderPathTemplate } from "shelving/util";

renderTemplate("blogs-:category-:slug", { category: "cheeses", slug: "stilton" });
// "blogs-cheeses-stilton"

renderTemplate("blogs-:category-:slug", "placeholder");
// "blogs-placeholder-placeholder"

renderTemplate("blogs-:category-:slug", p => p.toUpperCase());
// "blogs-CATEGORY-SLUG"

renderTemplate("*-*-*", ["A", "B", "C"]);
// "A-B-C"
```

Missing values throw a [`RequiredError`](/error/RequiredError):

```ts
renderTemplate("{name}-{date}", { name: "Dave" });
// throws RequiredError — "date" placeholder not found
```

### Extract placeholder names

```ts
import { getPlaceholders } from "shelving/util";

getPlaceholders("{username}@{domain}");        // ["username", "domain"]
getPlaceholders(":country/:city");             // ["country", "city"]
getPlaceholders("*-*");                        // ["0", "1"]
```

## See also

- [`shelving/util/string`](/util/string) — String sanitisation, slugs, and word splitting.
- [util](/util) — Overview of all util helpers.

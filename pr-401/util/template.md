# shelving/util/template

- Kind: module
- Import: `import { … } from "shelving/util/template";`

Match placeholders out of a string, or render values into one. Useful when a full regular expression is overkill and you just want to extract named segments from a path or pattern.

**Things to know:**

- Placeholders are recognised in any of these formats: `:name`, `{name}`, `{{name}}`, `${name}`, `[name]`, and `*` (anonymous, zero-indexed).
- Catchall variants (`**`, `:name*`, `{...name}`) allow empty values and, in path mode, can span `/` separators.
- Adjacent placeholders are not allowed — there must be at least one character between them.
- Parsed templates are cached, so repeated calls with the same template string are cheap.
- `matchPathTemplate()` and `renderPathTemplate()` are path-aware siblings of `matchTemplate()` and `renderTemplate()`. Non-catchall placeholders in path templates cannot span `/` segments.

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

Missing values throw a `RequiredError`:

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


## Functions

- [getPlaceholders()](template/getPlaceholders.md): Get list of placeholders named in a template string.
- [matchTemplate()](template/matchTemplate.md): Match a template against a target string with no separator semantics.
- [matchPathTemplate()](template/matchPathTemplate.md): Match a path-shaped template against a target path.
- [matchTemplates()](template/matchTemplates.md): Match multiple templates against a target string and return the first match (no separator semantics).
- [matchPathTemplates()](template/matchPathTemplates.md): Match multiple path-shaped templates against a target path and return the first match.
- [renderTemplate()](template/renderTemplate.md): Turn ":year-:month" and { year: "2016"... } etc into "2016-06..." etc.
- [renderPathTemplate()](template/renderPathTemplate.md): Render a path-shaped template, percent-encoding each substituted value so it stays within its path segment.

## Types

- [TemplateValues](template/TemplateValues.md): Things that can be converted to the value for a named placeholder.
- [TemplateMatches](template/TemplateMatches.md): The output of matching a template is a dictionary in { myPlaceholder: "value" } format.
- [TemplatePlaceholders](template/TemplatePlaceholders.md): List of {placeholders} found in a template string.

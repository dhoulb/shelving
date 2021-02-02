# shelving/template: Simple string template rendering and matching

**shelving/template** is a quick tool for matching placeholders from, and inserting placeholders into, template strings. Useful for cases where RegExps are too fussy and you want something chunky and robust without having to worry about edge cases.

**Match:** Match a target string against a template and return a list of found values
e.g. `places/:country/{city}` + `places/france/paris` = `{ country: "france", city: "paris" }`

**Render:** Take a template string, merge in some values, and return the rendered string.
e.g. `places/${country}/:city` + `{ country: "france", city: "paris" }` = `places/france/paris`

**Things to know:**

- Works with named placeholders in multiple formats: `:express`, `{jsx}`, `{{handlebars}}` or `${es6}`
- Named placeholders must match the format `[a-zA-Z][a-zA-Z0-9]`
- Works with `*` placeholder (matched values are zero-indexed)
- Doesn't do anything complicated like RegExp patterns or optional placeholders
- Template parsing is cached for performance
- Fully unit-tested, 100% covered, all inputs are validated, throws friendly error messages

## Usage

### `matchTemplate(templates: string|string[], target: string)`

Matches a template string against a target string and return an object containing values corresponding to the placeholders.

- `templates` can be...
  - String containing one or more placeholders in any allowed format
  - Array (or any iterable object) with multiple template strings to attempt to match
  - Function that returns a template string (called with `target`)
  - Generator function that yields multiple template strings (called with `target`)
- `target` must be the string to match against `templates`
- Returns an object in `placeholder: value` format, or `false` if the template doesn't match

```js
import { matchTemplate } from "shelving/template";

// Match named placeholders in template.
matchTemplate("places/{country}/{city}", "places/france/paris"); // { country: "france", city: "paris" }
matchTemplate("places/:country/:city", "places/france/paris"); // { country: "france", city: "paris" }

// Match numbered placeholders in template.
matchTemplate("*-*-*", "A-B-C"); // { "0": "A", "1": "B", "2": "C }

// Match several possible templates.
const templates = ["${dog}===${cat}", "{name}@{domain}", "places/:country/:city"];
matchTemplate(templates, "places/france/paris"); // { country: "france", city: "paris" }
```

Template must have one character between each placeholder or an error will be thrown:

```js
matchTemplate("{placeholders}{with}{no}{gap}", "abcd"); // throws SyntaxError "shelving/template: Placeholders must be separated by at least one character"
```

### `render(template: string, values: Object|Function|string)`

Render a set of values into a template string.

- `template` must be a string containing one or more placeholders in any allowed format
- `values` can be:
  - Object containing string or function keys
  - Function called for each placeholder (receives the placeholder name)
  - String used for all placeholders
- Returns the rendered string

```js
import { renderTemplate } from "shelving/template";

// Render named values into template.
renderTemplate("blogs-:category-:slug", { category: "cheeses", slug: "stilton" }); // blogs-cheeses-stilton
renderTemplate("blogs-:category-:slug", "Arrrrgh"); // blogs-Arrrrgh-Arrrrgh
renderTemplate("blogs-:category-:slug", p => p.toUpperCase()); // blogs-CATEGORY-SLUG

// Render numbered values into template (using an array works!)
renderTemplate("*-*-*", ["A", "B", "C"]); // A-B-C
```

If using an object with values the keys _must_ correspond to placeholders in the template or render will fail:

```js
renderTemplate("{name}-{date}", { name: "Dave" }); // Throws ReferenceError "shelving/template: values.date: Must be defined"
renderTemplate("*-*", { 0: "Dave" }); // Throws ReferenceError "shelving/template: values.1: Must be defined"
```

### `placeholders(template: string)`

Parse a template string and return an array of found placeholders.

- `template` must be a string containing one or more placeholders in any allowed format
- Returns an array of string placeholder names that were found in the template

```js
import { getPlaceholders } from "shelving/template";

// Extract the placeholder names.
getPlaceholders("{username}@{domain}"); // ["username", "domain"]
getPlaceholders(":name // ${age}"); // ["name", "age"]
```

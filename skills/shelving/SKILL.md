---
name: shelving
description: Use when you write or change code that imports from the `shelving` npm package — schemas, database or API providers, stores, React hooks, UI components, or `shelving/util/*` helpers.
---

# Shelving

Shelving is a TypeScript data toolkit. Its API changes often and does not follow semver yet. Do not guess the API from memory. Read the docs for the installed version first.

## Find the docs

The docs for the installed version are in `node_modules/shelving/docs/`. All files are Markdown.

- `llms.txt` — the index of modules. Start here.
- `<module>.md` — one page for each module, for example `schema.md` or `util/array.md`. It lists every token in the module, with a one-line description.
- `<module>/<Token>.md` — one page for each token, for example `schema/StringSchema.md`. It gives the import line, signatures, parameters, return values, errors, and examples. Class members are at `<module>/<Class>/<member>.md`.
- `llms-full.txt` — every page in one file. It is large, so search it (for example `grep -n "formatDate" node_modules/shelving/docs/llms-full.txt`). Do not read all of it.

If the package is not installed, the same files are online: start at <https://shelving.cc/llms.txt>.

## Rules

- Import from the module subpath: `shelving/schema`, `shelving/db`, `shelving/util/array`. The root `shelving` import does not include `shelving/react`, `shelving/ui`, `shelving/markup`, `shelving/firebase`, `shelving/bun`, `shelving/cloudflare`, `shelving/extract`, or `shelving/test`.
- Use the existing helpers. Before you write a helper, read the module page to find one that does the job.
- A function name prefix is a contract:
  - `is*` is a type guard. `assert*` throws when the value is not valid.
  - `get*` returns the value or `undefined`. `require*` returns the value or throws.
  - `validate*` returns the valid value or throws.
  - `with*`, `omit*`, `add*`, `update*`, and `merge*` return a new copy. They return the same reference when nothing changed.
  - `create*` always returns a new instance.
- A schema validates with `Schema.validate()`. It returns the typed value, or throws a `string` with a message for the user. Use the ready-made schemas (`STRING`, `REQUIRED_STRING`, `NUMBER`, `DATA()`) when they fit.
- Errors for users are thrown as plain strings. Errors from the system are typed error classes from `shelving/error`. Use `getMessage()` to read a message from a thrown value.

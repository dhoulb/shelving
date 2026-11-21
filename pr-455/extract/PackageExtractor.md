# PackageExtractor

- Kind: class
- Import: `import { PackageExtractor } from "shelving/extract";`
- Extends: `Extractor<Path, TreeElement>`

Extractor that reads a `package.json` and produces a flat tree of modules — one `kind: "module"`
`DocumentationElement` per export entry, in declaration order.
- Static export keys (e.g. `"./api"`, `"./firebase"`) become one module each.
- Wildcard export keys (e.g. `"./util/*"`) expand against the source tree — one module per matching child file or subdirectory.
- Each export's *target* extension (e.g. the `.js` in `"./util/*.js"`) is mapped to source extensions via `extensions`, so built `.js` paths resolve to their `.ts` sources.
- Each module's `title` is prefixed with the package `name` (e.g. `ui` → `shelving/ui`) so listings read as package subpaths.
- The `"."` root export is skipped — its content is the root tree element itself.
- Throws if a static export key has no matching source element in the tree.

## Signatures

```ts
new PackageExtractor({ tree, extensions = DEFAULT_EXTENSIONS, module = new ModuleExtractor(), base }: PackageExtractorOptions)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `PackageExtractorOptions` |  |
| `.tree` | `TreeElement` | Pre-extracted source tree the `package.json` exports resolve against — typically the result of `IndexExtractor(MergingExtractor(DirectoryExtractor()))` over the source root. Read only. |
| `.extensions` | `ImmutableDictionary<readonly string[]>` | Maps an export *target* file extension (the right-hand side of an `exports` entry) to the *source* extensions to look for, in order. - Bridges built output and source: `package.json` targets a `.js` file but the tree holds the `.ts` source. - The first source extension that exists in the tree wins; a target extension with no mapping falls back to itself. - Defaults to `{ js: ["ts", "tsx", "js", "jsx"] }`. Read only. Optional. |
| `.module` | `ModuleExtractor` | `ModuleExtractor` used to build each module element. Defaults to a fresh `new ModuleExtractor()`. Read only. Optional. |
| `.base` | `AbsolutePath` | Absolute base path used to resolve a relative `package.json` path passed to `extract()`. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `PackageExtractor` |  |

## Examples

```ts
const tree = await new PackageExtractor({ tree: sourceTree }).extract("package.json");
```

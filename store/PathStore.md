# PathStore

- Kind: class
- Import: `import { PathStore } from "shelving/store";`
- Extends: `BusyStore<AbsolutePath, AbsolutePath | RelativePath>`

Store an absolute path, e.g. `/a/b/c`
- Accepts absolute or relative paths as input and normalises them to an absolute path against `this.base`.
- Provides helpers to test whether other paths are active or proud relative to the current path.

A `Store` for an absolute path such as `/a/b/c`. `PathStore` resolves any relative path assigned to it against a fixed `base`, and adds route-matching helpers useful for navigation state.

## Usage

```ts
import { PathStore } from "shelving/store";

const route = new PathStore("/products/42");

route.value = "../43";              // resolved against the current path → "/products/43"

route.isActive("/products/43");     // true — exact match of the current path
route.isProud("/products");         // true — current path is at or below "/products"
route.getPath("./reviews");         // "/products/43/reviews" — resolve a relative path
```

The constructor takes an optional second `base` argument (default `/`) used to resolve relative paths assigned to the store.


## Signatures

```ts
new PathStore(path: AbsolutePath | RelativePath = ".", base: AbsolutePath = "/")
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `path` | `AbsolutePath \| RelativePath` | Defaults to `"."`. |
| `base` | `AbsolutePath` | Defaults to `"/"`. |

## Returns

| Type | Description |
| --- | --- |
| `PathStore` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `base` | `AbsolutePath` | Base path that relative inputs are resolved against. Read only. |

## Methods

- [PathStore.isActive()](PathStore/isActive.md): Based on the current store path, is a path active (i.e. equal to the current path)?
- [PathStore.isProud()](PathStore/isProud.md): Based on the current store path, is a path proud (i.e. an ancestor of the current store path)?
- [PathStore.getPath()](PathStore/getPath.md): Get an absolute path from a path relative to the current store path.

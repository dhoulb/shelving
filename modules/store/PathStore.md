# PathStore

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

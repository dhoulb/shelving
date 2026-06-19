# RequiredError

Thrown when something required was absent — a missing argument, an empty lookup result, or an unset value. The `require*()` helpers — e.g. `requireString()` — throw this class.

## Usage

```ts
import { RequiredError } from "shelving/error";

function getUser(id: string | undefined): User {
  if (!id) throw new RequiredError("User ID is required");
  // ...
}
```

See `shelving/error` for shared behaviour — attaching context fields, `caller` trimming, and catching by type.

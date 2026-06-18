# RequiredError

Thrown when something required was absent — a missing argument, an empty lookup result, or an unset value. The `require*()` helpers in [util](/util) throw this class.

## Usage

```ts
import { RequiredError } from "shelving/error";

function getUser(id: string | undefined): User {
  if (!id) throw new RequiredError("User ID is required");
  // ...
}
```

See [`shelving/error`](/error) for shared behaviour — attaching context fields, `caller` trimming, and catching by type.

## See also

- [`shelving/error`](/error) — module overview and shared error behaviour.
- [util](/util) — `require*()` functions that throw `RequiredError`.

# UnexpectedError

Thrown when something that should never happen did — an invariant was violated or an unreachable code path was reached. Reaching an `UnexpectedError` means there is a bug, not a bad input.

## Usage

```ts
import { UnexpectedError } from "shelving/error";

function assertNever(x: never): never {
  throw new UnexpectedError("Unhandled case", { received: x });
}
```

See `shelving/error` for shared behaviour — attaching context fields, `caller` trimming, and catching by type.

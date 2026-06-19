# UnimplementedError

Thrown when a method or feature is not implemented — for example an abstract method left for a subclass to override, or a provider stub that has not been filled in yet.

## Usage

```ts
import { UnimplementedError } from "shelving/error";

class BaseProvider {
  save(): Promise<void> {
    throw new UnimplementedError("save() is not implemented");
  }
}
```

See `shelving/error` for shared behaviour — attaching context fields, `caller` trimming, and catching by type.

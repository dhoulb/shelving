# NetworkError

Thrown on a network-level failure — a connection refused, a server unreachable, a request that never completed. Use it for transport problems, as distinct from a response that arrived but indicated an error ([`ResponseError`](/error/ResponseError)).

## Usage

```ts
import { NetworkError } from "shelving/error";

async function fetchData(url: string): Promise<Response> {
  try {
    return await fetch(url);
  } catch {
    throw new NetworkError("Could not reach server");
  }
}
```

See [error](/error) for shared behaviour — attaching context fields, `caller` trimming, and catching by type.

## See also

- [`ResponseError`](/error/ResponseError) — for a response that arrived but indicated an error.
- [error](/error) — module overview and shared error behaviour.

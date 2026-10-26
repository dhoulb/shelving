# NetworkError

- Kind: class
- Import: `import { NetworkError } from "shelving/error";`
- Extends: `Error`
- Implements: `BaseError`

Thrown in the event of network issues e.g. the user's internet connection is down, or the server is down.

Thrown on a network-level failure — a connection refused, a server unreachable, a request that never completed. Use it for transport problems, as distinct from a response that arrived but indicated an error (`ResponseError`).

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

See `shelving/error` for shared behaviour — attaching context fields, `caller` trimming, and catching by type.


## Signatures

```ts
new NetworkError(message?: string, options: BaseErrorOptions = {})
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `message` | `string` | Optional human-readable description of the network problem. Optional. |
| `options` | `BaseErrorOptions` | Defaults to `{}`. |
| `.caller` | `AnyCaller \| undefined` | Modify the stack to trim off lines after a certain calling function. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `NetworkError` |  |

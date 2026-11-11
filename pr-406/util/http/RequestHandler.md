# RequestHandler

- Kind: type
- Import: `import { RequestHandler } from "shelving/util/http";`

A handler function takes a `Request` and optional extra arguments and returns a `Response` (possibly asynchronously).

## Signatures

```ts
(request: Request, ...args: A) => Response | Promise<Response>
```

## Types

- `Request`
- `Response`
- `Promise`

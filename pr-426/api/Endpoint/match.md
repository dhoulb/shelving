# Endpoint.match()

- Kind: method
- Member of: `Endpoint`

Match a method/path pair against this endpoint and return any matched `{placeholder}` params.

## Signatures

```ts
match(method: RequestMethod, path: AbsolutePath, caller: AnyCaller = this.match): RequestParams | undefined
```

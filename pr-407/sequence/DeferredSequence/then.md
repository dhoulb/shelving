# DeferredSequence.then()

- Kind: method
- Member of: `DeferredSequence`

## Signatures

```ts
then(onNext?: Nullable<(v: T) => X | PromiseLike<X>>, onError?: Nullable<(r: unknown) => Y | PromiseLike<Y>>): Promise<X | Y>
```

# Store.subscribe()

- Kind: method
- Member of: `Store`

Subscribe to this store with handlers.
- Returns a `StopCallback` to stop the subscription.

## Signatures

```ts
subscribe(onNext?: ValueCallback<T>, onError?: ErrorCallback, onReturn?: Callback): StopCallback
```

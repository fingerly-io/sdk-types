# Changelog

## 0.1.1

- Types are declared from the built `dist/index.d.ts` (and `index.d.cts` for require) instead of `src/index.ts`, and only `dist` is published.
- `IdentifyResult.reason` and `NativeIdentifyResult.reason` are optional and deprecated. The server no longer tells a browser or an app why a submission went unscored, so they are `undefined`; your backend reads `reason` on the server-side event read. Code written against 0.1.0 that reads them still compiles.

## 0.1.0

- First public release.

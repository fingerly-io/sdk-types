# Changelog

## 0.1.1

- Types are declared from the built `dist/index.d.ts` (and `index.d.cts` for require) instead of `src/index.ts`, and only `dist` is published.
- `IdentifyResult.reason` and `NativeIdentifyResult.reason` are optional and deprecated. The server no longer tells a browser or an app why a submission went unscored, so they are `undefined`; your backend reads `reason` on the server-side event read. Code written against 0.1.0 that reads them still compiles.
- `NativeIdentifyResult.triggers` is removed. An app is never told signal names; your backend reads them on the server-side event read. `suspectScore` and `suspectLevel` are `null` when the check was not scored or the SDK key hides the score.

## 0.1.0

- First public release.

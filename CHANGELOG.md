# Changelog

## 0.2.0

- `Verdict.value` is `boolean | null`, and `null` is not a clean result. `Verdicts` and `IdentifyResult.verdicts` are deprecated and hold nothing; read `suspectLevel` in the page and signals on your backend.
- `IdentifyResult.triggers` is optional and deprecated, empty from a public key; `IdentifyTrigger` is deprecated. `NativeIdentifyResult` no longer has `triggers`. `suspectScore` and `suspectLevel` are `null` when unscored or hidden by the SDK key.
- `IdentifyTrigger.weight` is optional and deprecated: customers' weights do not reach the browser.
- `EngineIdentity.agrees` is deprecated and no longer sent.

## 0.1.1

- Types are declared from the built `dist/index.d.ts` (and `index.d.cts` for require) instead of `src/index.ts`, and only `dist` is published.
- `IdentifyResult.reason` and `NativeIdentifyResult.reason` are optional and deprecated. The server no longer tells a browser or an app why a submission went unscored, so they are `undefined`; your backend reads `reason` on the server-side event read. Code written against 0.1.0 that reads them still compiles.
- `NativeIdentifyResult.triggers` is removed. An app is never told signal names; your backend reads them on the server-side event read. `suspectScore` and `suspectLevel` are `null` when the check was not scored or the SDK key hides the score.

## 0.1.0

- First public release.

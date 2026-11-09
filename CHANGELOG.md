# Changelog

## 0.2.0

- `Verdict.value` is `boolean | null`: `null` means no server answered, which is not a clean result. `Verdicts` and `IdentifyResult.verdicts` are deprecated; read `suspectLevel` and `triggers`.
- `IdentifyTrigger.weight` is optional and deprecated: customers' weights do not reach the browser.
- `EngineIdentity.agrees` is deprecated and no longer sent.

## 0.1.1

- Types are declared from the built `dist/index.d.ts` (and `index.d.cts` for require) instead of `src/index.ts`, and only `dist` is published.
- `IdentifyResult.reason` and `NativeIdentifyResult.reason` are optional and deprecated. The server no longer tells a browser or an app why a submission went unscored, so they are `undefined`; your backend reads `reason` on the server-side event read. Code written against 0.1.0 that reads them still compiles.

## 0.1.0

- First public release.

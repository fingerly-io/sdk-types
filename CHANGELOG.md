# Changelog

## 0.4.0

- Runtime constants, each an `as const` object with a same-named type:
  `Signal`, `SuspectLevel`, `Confidence`, `EventState`, `ConsentState`,
  `IncognitoDetection` and `SdkPlatform`. Members are the value in
  PascalCase, such as `SuspectLevel.High` and
  `Signal.FingerprintSuppressed`.
- `Signal` lists every signal group and raw signal the server reports, the
  same list as `@fingerly/node`. `RiskSignal` is its type, and `SignalName`
  (`Signal | (string & {})`) is the open form `IdentifyTrigger.signal` and
  `IdentifyTrigger.group` use.
- Added `repeated_reinstall`, `device_activity_high` and
  `device_activity_very_high`, and removed `app_attest_key_churn`, which the
  server no longer reports.
- `IdentifyResult.state` and `NativeIdentifyResult.state` are
  `EventState | (string & {})`.

## 0.3.0

- The submission types follow the single `v: 3` wire envelope.
  `IdentifySubmission` carries the optional `ticket` and `ticket_pow`;
  `TicketRequest` is the `{ v: 3, op: 'ticket', sdk }` body and
  `FreshnessTicket` its answer (`ticket`, `expires_at`, optional `pow_bits`).
- `IdentifyResult` describes the device and carries no signal report;
  `collect()` returns the report.
- `RiskSignal` lists `web_ticket_missing`, `web_ticket_invalid`,
  `attestation_downgrade`, `probe_errors` and `fetch_metadata_missing`, with
  `report_incomplete` and `fingerprint_suppressed` among the cross-platform
  signals.
- No event types: no client SDK reads events, and the server SDKs type the
  server's event read.

## 0.1.2

- `IdentifyResult` and `NativeIdentifyResult` have no `reason`, and `EngineIdentity` has no `agrees`: the types hold only what the server sends a browser or an app.

## 0.1.1

- Removed: `Verdict`, `Verdicts`, `IdentifyTrigger`, `IdentifyResult.verdicts`, `IdentifyResult.triggers` and `verdicts` on `DeferredIdentifyResult`. Read `suspectLevel` in the page and signals on your backend.
- `suspectScore` and `suspectLevel` are `null` when unscored or hidden by the SDK key.
- `EngineIdentity.agrees` is deprecated and no longer sent.
- Types are declared from the built `dist/index.d.ts` (and `index.d.cts` for require) instead of `src/index.ts`, and only `dist` is published.
- `IdentifyResult.reason` and `NativeIdentifyResult.reason` are optional and deprecated. The server no longer tells a browser or an app why a submission went unscored, so they are `undefined`; your backend reads `reason` on the server-side event read. Code written against 0.1.0 that reads them still compiles.
- `NativeIdentifyResult.triggers` is removed. An app is never told signal names; your backend reads them on the server-side event read. `suspectScore` and `suspectLevel` are `null` when the check was not scored or the SDK key hides the score.

## 0.1.0

- First public release.

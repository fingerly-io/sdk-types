# @fingerly/types

Canonical TypeScript `v: 3` wire contracts (`0.3.0`) shared by Fingerly's
browser SDKs (`@fingerly/core`, `@fingerly/web-js`, and framework bindings) and
TypeScript mobile bridges (`@fingerly/react-native`, `@fingerly/lynx`).

```sh
pnpm add -D @fingerly/types@^0.3.0
```

## What lives here

- **Single-pass `v: 3` ingest envelope (`IdentifySubmission`):** `v: 3`, `sdk`,
  `consent`, `signals` (`SignalReport` carrying `schema`, `budget_ms`,
  `elapsed_ms`, `sources`, and `integrity`), and optional `tag`.
- **Collection options (`CollectOptions`, `IdentifyOptions`):** `signal`
  (`AbortSignalLike`), `incognitoDetection: 'standard' | 'extended'`, and `tag`.
- **1-RTT server answer (`IdentifyResult`, `NativeIdentifyResult`):** `requestId`,
  `visitorId` (`""` with `visitorIsNew: false` whenever `identifiable === false`,
  inside an embedded WebView, or on high-risk unmatched Web traffic under
  **Option B**), `visitorConfidence`, `identifiable`, `duplicate`, `state`,
  `suspectScore`, `suspectLevel`, and `report`.
- **Canonical v3 risk signal union (`RiskSignal`) and stored event shapes
  (`FingerlyEvent`, `FingerlyWebEvent`, `FingerlyMobileEvent`).**

This package contains TypeScript declarations only (`ES2020`, zero DOM globals,
zero runtime code). Collection, transport, hardware attestation, and scoring
belong to the platform SDKs and the Fingerly server.

## Development

```sh
pnpm install
pnpm lint
pnpm build
```

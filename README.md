<p align="center">
  <a href="https://fingerly.io">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/fingerly-io/.github/main/assets/logo-dark.svg">
      <img src="https://raw.githubusercontent.com/fingerly-io/.github/main/assets/logo-light.svg" alt="Fingerly" height="44">
    </picture>
  </a>
</p>

<p align="center"><b>Fingerly shared TypeScript types</b><br>The canonical TypeScript contracts shared by Fingerly's browser and mobile SDKs.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@fingerly/types"><img src="https://img.shields.io/npm/v/@fingerly/types?style=flat-square" alt="npm version"></a>
  <a href="https://github.com/fingerly-io/sdk-types/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/fingerly-io/sdk-types/ci.yml?branch=main&style=flat-square&label=ci" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/fingerly-io/sdk-types?style=flat-square" alt="License"></a>
  <a href="https://docs.fingerly.io/docs/sdks"><img src="https://img.shields.io/badge/docs-docs.fingerly.io-blue?style=flat-square" alt="Documentation"></a>
</p>

<p align="center"><img src="https://raw.githubusercontent.com/fingerly-io/.github/main/assets/banner.webp" alt="Fingerly" width="100%"></p>

## What is this

`@fingerly/types` holds the canonical TypeScript `v: 3` wire contracts that every Fingerly client
SDK agrees on: what a browser or an app submits and what the Fingerly API answers. It is shared by
the browser SDKs (`@fingerly/core`, `@fingerly/web-js`, and the framework bindings) and the
TypeScript mobile bridges (`@fingerly/react-native`, `@fingerly/lynx`).
[Fingerly](https://fingerly.io) is device intelligence for fraud prevention.

This package contains TypeScript declarations and a few plain string constants
(`ES2020`, zero DOM globals, no side effects, so a bundler drops what you do not import).
Collection, transport, hardware attestation, and scoring belong to the platform SDKs and
the Fingerly server. Stored events are read server-side with a secret key, so their types live in
the server SDKs. You do not need this package to use Fingerly: the browser and framework packages
already depend on it. Install it when you want to type your own code against the same shapes.

## Getting started

1. Prerequisites: a Fingerly account and a project key. See
   [API keys](https://docs.fingerly.io/docs/api-keys).
2. Install:

   ```sh
   npm install -D @fingerly/types@^0.5.0
   ```

3. Import the types and constants you need:

   ```ts
   import { SuspectLevel, type IdentifyResult } from '@fingerly/types'

   function describe(result: IdentifyResult): string {
     if (result.suspectLevel === SuspectLevel.High) return `${result.visitorId}: review`
     return `${result.visitorId}: ${result.suspectLevel ?? 'not scored'}`
   }
   ```

The package ships ESM and CommonJS entry points with declarations (`dist` only).

## What lives here

- **Single-pass `v: 3` ingest envelope (`IdentifySubmission`):** `v: 3`, `sdk`,
  `consent`, `signals` (`SignalReport` carrying `schema`, `budget_ms`,
  `elapsed_ms`, `sources`, and `integrity`), and optional `tag`, `ticket`,
  `ticket_pow`, `continuity` and `seal`.
- **Web freshness ticket (`TicketRequest`, `FreshnessTicket`):** the
  `op: 'ticket'` request body and the `{ ticket, expires_at, pow_bits? }`
  answer, also returned as `next_ticket` on a web identification answer.
- **Web session seal (`Continuity`, `SessionSeal`):** the `continuity` mode a
  browser client is built with (`'none'` by default, or `'session'`), and the
  `{ seal, expires_at }` a web identification answer carries as `next_seal`
  when the report asked for `continuity: 'session'`.
- **Collection options (`CollectOptions`, `IdentifyOptions`):** `signal`
  (`AbortSignalLike`), `incognitoDetection: 'standard' | 'extended'`, and `tag`.
- **1-RTT server answer (`IdentifyResult`, `NativeIdentifyResult`):** `requestId`,
  `visitorId` (`""` with `visitorIsNew: false` whenever `identifiable === false`,
  inside an embedded WebView, or on high-risk unmatched Web traffic),
  `visitorConfidence`, `identifiable`, `duplicate`, `state`, `suspectScore`
  and `suspectLevel`. The signal report is what `collect()` returns.
- **Canonical v3 risk signal catalogue (`Signal`, with `RiskSignal` as its type and the open
  `SignalName`).** A trigger's `signal` is a raw detector, such as `Signal.VpnPublic`; its
  `group` is the group it is reported under, such as `Signal.Vpn`.
- **Runtime constants.** Every closed set of values is an `as const` object with a same-named
  type: `Signal`, `SuspectLevel`, `Confidence`, `EventState`, `ConsentState`,
  `Continuity`, `IncognitoDetection` and `SdkPlatform`. A member is its value in PascalCase, word by word
  (`Signal.FingerprintSuppressed` is `'fingerprint_suppressed'`, `SdkPlatform.ReactNativeIos`
  is `'react-native-ios'`). Comparing with the constant or with the string both compile, and
  server-filled fields such as `state` and `IdentifyTrigger.signal` are typed open
  (`EventState | (string & {})`), so a value a newer server adds still type-checks.

## Development

This repository is mounted in the [`sdks`](https://github.com/fingerly-io/sdks) monorepo at
`client/web/types`, where the package is built and published.

```sh
pnpm install
pnpm lint
pnpm build
pnpm test
```

`pnpm lint` also type-checks `tests/`, which needs `@types/node`; that package only comes from the
`sdks` workspace, so run lint there.

## Documentation

See the [SDK overview](https://docs.fingerly.io/docs/sdks) on docs.fingerly.io and the
[API reference](https://docs.fingerly.io/reference/overview).

## Help

Open an issue on this repository, or write to [support@fingerly.io](mailto:support@fingerly.io).
Security issues: [security@fingerly.io](mailto:security@fingerly.io).

## Licence

Apache-2.0, see [LICENSE](LICENSE).

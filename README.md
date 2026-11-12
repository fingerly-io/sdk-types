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

`@fingerly/types` holds the TypeScript types that every Fingerly SDK agrees on: what a browser or an
app submits and what the Fingerly API answers. [Fingerly](https://fingerly.io) is device
intelligence for fraud prevention.

This package contains types only. Runtime collection, transport, and scoring belong to the
platform SDKs. You do not need it to use Fingerly: the browser and framework packages already
depend on it. Install it when you want to type your own code against the same shapes.

## Getting started

1. Prerequisites: a Fingerly account and a project key. See
   [API keys](https://docs.fingerly.io/docs/api-keys).
2. Install:

   ```sh
   npm install @fingerly/types
   ```

3. Import the types you need:

   ```ts
   import type { IdentifyResult, FingerlyEvent } from '@fingerly/types'

   function describe(result: IdentifyResult): string {
     return `${result.visitorId}: ${result.suspectLevel ?? 'not scored'}`
   }
   ```

The package ships ESM and CommonJS builds with declarations (`dist` only).

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

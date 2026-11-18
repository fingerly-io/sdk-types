import { describe, expectTypeOf, it } from 'vitest'

import type {
  CollectOptions,
  ConsentState,
  Continuity,
  FreshnessTicket,
  IdentifyOptions,
  IdentifyResult,
  IdentifySubmission,
  IdentifyTrigger,
  IncognitoDetection,
  NativeIdentifyResult,
  RiskSignal,
  SessionSeal,
  SignalReport,
  SuspectLevel,
  TicketRequest,
} from '../src/index.js'

describe('the v3 identify result', () => {
  it('does not tell a browser or an app why a submission went unscored', () => {
    // Only a secret key reads `reason`, on the server-side event read.
    expectTypeOf<IdentifyResult>().not.toHaveProperty('reason')
    expectTypeOf<NativeIdentifyResult>().not.toHaveProperty('reason')
  })

  it('aligns IdentifyResult with v3 Option B and verdict replay', () => {
    expectTypeOf<IdentifyResult['visitorId']>().toEqualTypeOf<string>()
    expectTypeOf<IdentifyResult['visitorIsNew']>().toEqualTypeOf<boolean>()
    expectTypeOf<IdentifyResult['identifiable']>().toEqualTypeOf<boolean>()
    expectTypeOf<IdentifyResult['visitorConfidence']>().toEqualTypeOf<number>()
    expectTypeOf<IdentifyResult['suspectScore']>().toEqualTypeOf<number | null>()
    expectTypeOf<IdentifyResult['suspectLevel']>().toEqualTypeOf<SuspectLevel | null>()
    expectTypeOf<IdentifyResult['triggers']>().toEqualTypeOf<IdentifyTrigger[] | undefined>()
    expectTypeOf<IdentifyResult['duplicate']>().toEqualTypeOf<boolean | undefined>()
  })

  it('removes legacy two-tier deferred and supplement fields', () => {
    expectTypeOf<IdentifyResult>().not.toHaveProperty('deferred')
    expectTypeOf<IdentifyResult>().not.toHaveProperty('deferredToken')
    expectTypeOf<IdentifyResult>().not.toHaveProperty('verdicts')
    expectTypeOf<SignalReport>().not.toHaveProperty('tiers')
    expectTypeOf<NativeIdentifyResult['suspectScore']>().toEqualTypeOf<number | null>()
    expectTypeOf<NativeIdentifyResult['suspectLevel']>().toEqualTypeOf<SuspectLevel | null>()
    expectTypeOf<NativeIdentifyResult>().not.toHaveProperty('triggers')
  })
})

describe('v3 public options', () => {
  it('removes tiers and submit while exposing incognitoDetection', () => {
    expectTypeOf<IdentifyOptions>().not.toHaveProperty('tiers')
    expectTypeOf<IdentifyOptions>().not.toHaveProperty('submit')
    expectTypeOf<CollectOptions>().not.toHaveProperty('tiers')
    expectTypeOf<CollectOptions>().not.toHaveProperty('submit')
    expectTypeOf<IdentifyOptions['incognitoDetection']>().toEqualTypeOf<IncognitoDetection | undefined>()
    expectTypeOf<CollectOptions['incognitoDetection']>().toEqualTypeOf<IncognitoDetection | undefined>()
    expectTypeOf<IncognitoDetection>().toEqualTypeOf<'standard' | 'extended'>()
  })
})

describe('v3 submission envelope and risk signal catalogue', () => {
  it('requires v: 3 and consent beside sdk and signals', () => {
    expectTypeOf<IdentifySubmission['v']>().toEqualTypeOf<3>()
    expectTypeOf<IdentifySubmission['consent']>().toEqualTypeOf<ConsentState>()
    expectTypeOf<IdentifySubmission>().not.toHaveProperty('token')
    expectTypeOf<IdentifySubmission>().not.toHaveProperty('attest')

    // @ts-expect-error consent and v are required
    const invalid: IdentifySubmission = {
      sdk: { platform: 'web', version: '0.3.0' },
      signals: {} as IdentifySubmission['signals'],
    }
    void invalid
  })

  it('includes all orthogonal v3 risk signals from v3-manifest.json and openapi.json', () => {
    const v3Signals = [
      'attestation_failed',
      'attestation_downgrade',
      'device_inconsistent',
      'report_incomplete',
      'probe_errors',
      'tampering',
      'custom_root_ca',
      'secondary_user_profile',
      'frida',
      'mitm_attack',
      'root_apps',
      'jailbreak',
      'app_cloner',
      'emulator',
      'simulator',
      'incognito',
      'automation',
      'fetch_metadata_missing',
      'web_ticket_missing',
      'web_ticket_invalid',
      'antidetect_browser',
      'fingerprint_suppressed',
      'embedded_web_view',
    ] as const satisfies readonly RiskSignal[]

    expectTypeOf<(typeof v3Signals)[number]>().toMatchTypeOf<RiskSignal>()
  })
})

describe('web freshness ticket', () => {
  it('carries an optional ticket on the submission', () => {
    expectTypeOf<IdentifySubmission['ticket']>().toEqualTypeOf<string | undefined>()
  })

  it('posts op ticket with the web sdk block', () => {
    expectTypeOf<TicketRequest['op']>().toEqualTypeOf<'ticket'>()
    expectTypeOf<TicketRequest['v']>().toEqualTypeOf<3>()
    expectTypeOf<TicketRequest['sdk']['platform']>().toEqualTypeOf<'web'>()
    expectTypeOf<FreshnessTicket>().toEqualTypeOf<{
      ticket: string
      expires_at: string
      pow_bits?: number
    }>()
  })

  it('carries an optional proof of work next to the ticket', () => {
    expectTypeOf<IdentifySubmission['ticket_pow']>().toEqualTypeOf<string | undefined>()
  })
})

describe('web session seal', () => {
  it('names the two continuity modes', () => {
    expectTypeOf<Continuity>().toEqualTypeOf<'none' | 'session'>()
  })

  it('carries only the session mode and an optional seal on the submission', () => {
    expectTypeOf<IdentifySubmission['continuity']>().toEqualTypeOf<'session' | undefined>()
    expectTypeOf<IdentifySubmission['seal']>().toEqualTypeOf<string | undefined>()
  })

  it('never puts a seal or a continuity mode on a ticket request', () => {
    expectTypeOf<TicketRequest>().not.toHaveProperty('seal')
    expectTypeOf<TicketRequest>().not.toHaveProperty('continuity')
  })

  it('reads next_seal as a seal and its expiry', () => {
    expectTypeOf<SessionSeal>().toEqualTypeOf<{ seal: string; expires_at: string }>()
  })
})

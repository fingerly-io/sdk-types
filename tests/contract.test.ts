import { describe, expectTypeOf, it } from 'vitest'

import type {
  ConsentState,
  DeferredSubmission,
  IdentifyResult,
  IdentifySubmission,
  DeferredIdentifyResult,
  NativeIdentifyResult,
} from '../src/index.js'

describe('the identify result', () => {
  it('does not tell a browser or an app why a submission went unscored', () => {
    // Only a secret key reads `reason`, on the server-side event read.
    expectTypeOf<IdentifyResult>().not.toHaveProperty('reason')
    expectTypeOf<NativeIdentifyResult>().not.toHaveProperty('reason')
  })

  it('tells an app a nullable score and never a signal', () => {
    expectTypeOf<NativeIdentifyResult['suspectScore']>().toEqualTypeOf<number | null>()
    expectTypeOf<NativeIdentifyResult['suspectLevel']>().toEqualTypeOf<string | null>()
    expectTypeOf<NativeIdentifyResult>().not.toHaveProperty('triggers')
  })
})

describe('what a public caller can be missing', () => {
  it('has no signal names or verdicts on any result', () => {
    expectTypeOf<IdentifyResult>().not.toHaveProperty('triggers')
    expectTypeOf<IdentifyResult>().not.toHaveProperty('verdicts')
    expectTypeOf<NativeIdentifyResult>().not.toHaveProperty('triggers')
    expectTypeOf<Extract<DeferredIdentifyResult, { status: 'submitted' }>>().not.toHaveProperty('verdicts')
    expectTypeOf<Extract<DeferredIdentifyResult, { status: 'failed' }>>().not.toHaveProperty('verdicts')
  })

  it('keeps score and level nullable, because absent is not zero', () => {
    expectTypeOf<IdentifyResult['suspectScore']>().toEqualTypeOf<number | null>()
    expectTypeOf<IdentifyResult['suspectLevel']>().toEqualTypeOf<string | null>()
    expectTypeOf<NativeIdentifyResult['suspectScore']>().toEqualTypeOf<number | null>()
    expectTypeOf<NativeIdentifyResult['suspectLevel']>().toEqualTypeOf<string | null>()
  })
})

describe('the submission bodies', () => {
  it('carry the consent state beside sdk and signals', () => {
    expectTypeOf<IdentifySubmission['consent']>().toEqualTypeOf<ConsentState>()
    expectTypeOf<DeferredSubmission['consent']>().toEqualTypeOf<ConsentState>()
  })

  it('require it, because the server refuses a body without it', () => {
    // @ts-expect-error consent is required
    const identification: IdentifySubmission = {
      sdk: { platform: 'web', version: 'test' },
      signals: {} as IdentifySubmission['signals'],
    }
    // @ts-expect-error consent is required
    const deferred: DeferredSubmission = {
      sdk: { platform: 'web', version: 'test' },
      signals: {} as DeferredSubmission['signals'],
      token: 'continuation',
    }
    void identification
    void deferred
  })
})

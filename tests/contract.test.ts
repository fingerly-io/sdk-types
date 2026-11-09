import { describe, expectTypeOf, it } from 'vitest'

import type {
  ConsentState,
  DeferredSubmission,
  IdentifyResult,
  IdentifySubmission,
  IdentifyTrigger,
  NativeIdentifyResult,
} from '../src/index.js'

describe('the identify result', () => {
  it('keeps reason optional, so 0.1.0 code reading it still compiles and gets undefined', () => {
    // A browser or an app is no longer told why a submission went unscored.
    expectTypeOf<IdentifyResult['reason']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<NativeIdentifyResult['reason']>().toEqualTypeOf<string | undefined>()
    const result = {} as Omit<IdentifyResult, 'reason'>
    // Assignable without it: nothing that builds a result has to invent one.
    const built: IdentifyResult = result
    void built
  })
})

describe('what a public caller can be missing', () => {
  it('keeps triggers optional and deprecated-compatible on the web result', () => {
    expectTypeOf<IdentifyResult['triggers']>().toEqualTypeOf<IdentifyTrigger[] | undefined>()
  })

  it('removes triggers from the native result outright', () => {
    expectTypeOf<NativeIdentifyResult>().not.toHaveProperty('triggers')
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

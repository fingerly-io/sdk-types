import { describe, expectTypeOf, it } from 'vitest'

import type { ConsentState, DeferredSubmission, IdentifySubmission } from '../src/index.js'

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

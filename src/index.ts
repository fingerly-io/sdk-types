/**
 * The shapes every Fingerly SDK speaks in.
 *
 * Nothing here touches the DOM. A type that only a browser can populate still
 * belongs in this file, because the server and the mobile SDKs both need to
 * name it; what does not belong here is the code that reads a `window`.
 */

/** Which SDK collected a report. Mirrors `schemas.SDKInfo` on the server. */
/**
 * The cross-platform values name the host as well as the toolkit, because the
 * server maps an SDK platform onto one of three scoring profiles by looking for
 * `ios` or `android` in the string — see `models.RiskPlatformFor`. A React
 * Native app reporting only `react-native` falls through to the browser
 * profile, where `jailbreak` is not a signal at all and everything the native
 * SDK went to the trouble of collecting is worth nothing.
 */
export type SdkPlatform =
  | 'web'
  | 'android'
  | 'ios'
  | 'react-native-ios'
  | 'react-native-android'
  | 'flutter-ios'
  | 'flutter-android'
  | 'lynx-ios'
  | 'lynx-android'

/** Configuration shared by JavaScript-based native SDK facades. */
export interface MobileFingerlyOptions {
  /** The SDK key, from the dashboard. */
  apiKey: string
  /** Origin of the API. Defaults to production. Submissions go to `/api/v1/ingest` under it. */
  endpoint?: string
}

/** Identification options shared by JavaScript-based native SDK facades. */
export interface MobileIdentifyOptions {
  /** Echoed back on the finished event, for the caller's own correlation. */
  tag?: string
  /** Collect and score without submitting when false. Defaults to true. */
  submit?: boolean
}

/**
 * Whether the visitor has agreed to be identified.
 *
 * `pending` is the default: an SDK identifies nobody until it is told
 * `granted`. `pending` and `denied` mean the same thing to the SDK - run no
 * source, touch no storage, send nothing, and fail `identify()` with a consent
 * error - and
 * are kept apart only because a consent tool reports them apart, and a page
 * deciding whether to show its banner wants to know which one it has.
 */
export type ConsentState = 'granted' | 'pending' | 'denied'

/**
 * How a source finished.
 *
 * Collapsing every failure into one `error` token would make a browser that
 * lacks an API, a privacy extension that blocked it, and a throttled tab that
 * ran out of time all hash identically. They are three different facts about a visitor:
 *
 * - `ok`          the source produced a value.
 * - `unsupported` the API is not present. A property of the device/browser.
 * - `blocked`     the API is present and refused, or returned deliberate noise.
 *                 A property of the visitor's privacy posture, and most of what
 *                 Tor and hardened-browser detection is made of.
 * - `timeout`     the source overran its slice of the budget. Says something
 *                 about load and throttling, and nothing about the device.
 * - `error`       the source threw for a reason we did not anticipate.
 */
export type SignalStatus = 'ok' | 'unsupported' | 'blocked' | 'timeout' | 'error'

/**
 * What one source reported.
 *
 * `ms` is recorded for every status, failures included. A source that took
 * 3ms to be unsupported and one that took 300ms to be blocked are telling
 * different stories, and the duration is frequently the more stable of the two
 * numbers - timing is itself an entropy source, which is why it is kept rather
 * than discarded on the failure path.
 */
export interface SignalOutcome<T = unknown> {
  status: SignalStatus
  /** Wall-clock milliseconds the source occupied, rounded to avoid a clock oracle. */
  ms: number
  /** Present when `status` is `ok`. */
  value?: T
  /**
   * Why, for the statuses that have a why. A short stable token such as
   * `SecurityError` or `audio-suspended` - never a stack trace, which is
   * unstable across versions and would poison any matching built on it.
   */
  reason?: string
}

/**
 * When a source runs.
 *
 * `fast` sources are cheap and synchronous-ish, and every one of them must fit
 * inside the fast budget because a page is waiting on the submission. `deferred`
 * sources are the expensive ones - font measurement, audio rendering, WebGL
 * shader precision - which are worth having but not worth blocking a checkout
 * button for.
 */
export type SourceTier = 'fast' | 'deferred'

/** A native function, descriptor or prototype that is not what it should be. */
export interface Lie {
  /** Stable identifier, such as `navigator.hardwareConcurrency.getter`. */
  id: string
  /** What kind of tampering was observed. */
  kind: 'not-native' | 'descriptor' | 'prototype' | 'contradiction' | 'missing'
  /** Optional short detail. Kept stable across versions or left off. */
  detail?: string
}

/**
 * What the browser is, as opposed to what it says it is.
 *
 * `claimed` comes from the user-agent and the UA-CH headers - a string anyone
 * can set. `observed` is derived from engine behaviour that a spoofer has to
 * patch a JS builtin to change, at which point `lies` catches them instead.
 * A disagreement between the two is worth more than either one alone.
 */
export interface EngineIdentity {
  claimed?: string
  observed?: string
}

/** The tamper layer's findings. Raw; the server decides what they are worth. */
export interface IntegrityReport {
  /** Natives whose `toString()` is no longer `[native code]`. */
  patched_natives: string[]
  /** Everything else that did not add up. */
  lies: Lie[]
  engine: EngineIdentity
}

/**
 * The whole client-side observation, as submitted.
 *
 * This is what lands in `signals` on the wire. The server types that field as
 * `map[string]any` and deliberately does not interpret it (see
 * `server/services/identify.go`), so this interface is the only place the
 * shape is written down until the event store exists.
 */
export interface SignalReport {
  /** Bumped when a field changes meaning, never when one is added. */
  schema: number
  /** The budget that was asked for, so a truncated report is legible as one. */
  budget_ms: number
  /** What collection actually cost. */
  elapsed_ms: number
  /** Which tiers ran. A fast-only report is not a degraded full one. */
  tiers: SourceTier[]
  sources: Record<string, SignalOutcome>
  integrity: IntegrityReport
}

/** How sure the server is of a finding. Matches its `*_confidence` fields. */
export type Confidence = 'low' | 'medium' | 'high'

/** What a native `identify()` resolves with. See [[IdentifyResult]]. */
export interface NativeIdentifyResult {
  requestId: string

  /** Who this visitor is. See [[IdentifyResult.visitorId]]. */
  visitorId: string
  /** `null` when the server did not say, which is not the same as `false`. */
  visitorIsNew: boolean | null
  /**
   * How sure the server is, 0 to 100. `null` when it did not say, which is not
   * the same as zero. See [[IdentifyResult.visitorConfidence]].
   */
  visitorConfidence: number | null
  /** `null` when the server did not say. */
  identifiable: boolean | null
  /**
   * True when this submission was answered before; the fields above are empty.
   * `null` when the server did not say.
   */
  duplicate: boolean | null

  /** As [[IdentifyResult.state]]. */
  state: string

  /** `null` when absent: unscored, or hidden by the SDK key. Not the same as zero. */
  suspectScore: number | null
  /** `null` when absent, for the same reasons as [[suspectScore]]. */
  suspectLevel: string | null

  report: SignalReport
}

/** A submission, as the body of `POST /api/v1/ingest`. */
export interface IdentifySubmission {
  sdk: { platform: SdkPlatform; version: string }
  /**
   * The SDK's consent state when it sent this. Always `granted`, since an SDK
   * sends nothing otherwise; the server refuses any other value with a 422
   * `consent_required`.
   */
  consent: ConsentState
  signals: SignalReport
  tag?: string
}

/** A deferred source report attached to an already completed identification. */
export interface DeferredSubmission {
  sdk: { platform: SdkPlatform; version: string }
  /** As on [[IdentifySubmission.consent]]. */
  consent: ConsentState
  signals: SignalReport
  token: string
}

export type DeferredIdentifyResult =
  | {
      status: 'submitted'
      report: SignalReport
      combinedReport: SignalReport
    }
  | {
      status: 'skipped'
      /**
       * `consent-withdrawn` when consent stopped being `granted` after the
       * first response and before the supplement was sent.
       */
      reason: 'not-submitted' | 'explicit-tiers' | 'duplicate' | 'unsupported-transport' | 'consent-withdrawn'
    }
  | {
      status: 'failed'
      error: Error
      report?: SignalReport
      combinedReport?: SignalReport
    }

/**
 * The answer.
 *
 * Note what is absent: there is no visitor identifier computed here, because
 * the client does not compute one. Hashing components in the page would make
 * the identity forgeable by the visitor and freeze the matching algorithm
 * into whatever SDK version a customer deployed. Fingerly
 * submits the raw report and lets the server decide who this is - and then
 * tells you, in the same response.
 */
export interface IdentifyResult {
  requestId: string

  /**
   * Who this visitor is, stable across their visits.
   *
   * Empty only when nothing was submitted (`submit: false`) or when the
   * submission was a [[duplicate]]. Otherwise always present: a report too thin
   * to match anyone still gets an identifier, minted rather than matched, so
   * that every event has a key.
   */
  visitorId: string
  /** Whether this is the first time the server has seen this visitor. */
  visitorIsNew: boolean

  /**
   * How sure the server is about [[visitorId]], from 0 to 100.
   *
   * 100 when this exact device has been seen before, 85-99 when it drifted -
   * a browser update, a new monitor - and was recognised by similarity, and 0
   * when the identifier was minted because nothing matched.
   *
   * Read this rather than inferring trust from [[identifiable]], which only
   * says whether the report was rich enough to attempt a match.
   */
  visitorConfidence: number

  /**
   * False when the report carried too little to identify anyone.
   *
   * A hardened browser produces this honestly; so does a client that would
   * rather not be recognised. Either way the submission is still answered and
   * still scored - more highly, because suppressing a fingerprint is itself
   * evidence - and it is charged at a lower rate, because the address lookup
   * happened and the identification did not.
   */
  identifiable: boolean

  /**
   * True when this submission was answered before under the same idempotency
   * key.
   *
   * The verdict belongs to that first submission and is not repeated, so the
   * fields above are empty. Keep the first response, or fetch the event by
   * [[requestId]]. Without this flag an empty visitor would read as "nobody
   * could be identified", which is the opposite of what happened.
   */
  duplicate: boolean

  /**
   * `enriched`, or `unavailable` when the address could not be looked up.
   *
   * Why an `unavailable` submission went unscored describes the service's own
   * infrastructure, which is nothing a visitor's page should be able to read,
   * so it is not on this result. Your backend reads it as `reason` on the
   * server-side event read (`GET /api/v1/events/{request_id}` with a secret
   * key), by [[requestId]].
   */
  state: string

  /**
   * The weighted sum of the signals that fired, under the weights in force when
   * this submission was scored.
   *
   * `null` when the submission was not scored, or when the SDK key hides the
   * score from public callers: the page is not told which, and your backend
   * still reads the score on the event. Either is a different answer from
   * zero: an ordinary visitor scores zero. Anything computed as a share of your
   * traffic divides by one of those populations, so collapsing them makes the
   * number plausible and wrong.
   *
   * Not a percentage and not capped. Normalising it to 0-100 would discard the
   * difference between "over the line" and "far over the line".
   */
  suspectScore: number | null
  /** `low`, `medium` or `high`. `null` when absent, as [[suspectScore]]. */
  suspectLevel: string | null

  /** The report that was sent, for debugging and for offline callers. */
  report: SignalReport

  /** Completion of the non-authoritative second-tier collection and upload. */
  deferred: Promise<DeferredIdentifyResult>
}

// ---------------------------------------------------------------------------
// The stored event.
//
// The same submission as the server keeps it, fetched by `requestId` when
// somebody wants it again later - a support question, a backend double-checking
// what the browser was told. The verdict itself does not wait for this: it
// comes back with the submission.
//
// The types live here because every SDK has to name them.
// ---------------------------------------------------------------------------

export interface IdentificationConfidence {
  score: number
  version: string
}

export interface Identification {
  visitor_id: string
  confidence: IdentificationConfidence
  visitor_found: boolean
  first_seen_at: number
  last_seen_at: number
}

export interface IpGeolocation {
  accuracy_radius: number
  latitude: number
  longitude: number
  postal_code: string
  timezone: string
  city_name: string
  country_code: string
  country_name: string
  continent_code: string
  continent_name: string
  subdivisions: { iso_code: string; name: string }[]
}

export interface IpInfoV4 {
  address: string
  geolocation: IpGeolocation
  asn: string
  asn_name: string
  asn_network: string
  asn_type: string
  datacenter_result: boolean
}

export interface VelocityWindow {
  '5_minutes': number
  '1_hour': number
  '24_hours': number
}

export interface Velocity {
  distinct_ip: VelocityWindow
  distinct_country: VelocityWindow
  events: VelocityWindow
  ip_events: VelocityWindow
}

/** Fields every platform reports. */
export interface FingerlyEventBase {
  event_id: string
  timestamp: number
  source: 'device'
  sdk: { platform: SdkPlatform; version: string }
  replayed: boolean
  identification: Identification
  ip_address: string
  ip_info: { v4: IpInfoV4 }
  proxy: boolean
  proxy_confidence: Confidence
  vpn: boolean
  vpn_confidence: Confidence
  tampering: boolean
  tampering_confidence: Confidence
  suspect_score: number
  velocity: Velocity
}

/**
 * Signals only a native app can observe.
 *
 * Absent on web rather than `false`, because a browser cannot look for a root
 * app and reporting "no" would be a claim nobody made.
 */
export interface FingerlyMobileEvent extends FingerlyEventBase {
  sdk: { platform: 'android' | 'ios'; version: string }
  package_name: string
  emulator: boolean
  root_apps: boolean
  cloned_app: boolean
  frida: boolean
  developer_tools: boolean
  factory_reset_timestamp?: number
  active_call: boolean
}

export interface FingerlyWebEvent extends FingerlyEventBase {
  sdk: { platform: 'web'; version: string }
  browser_name: string
  browser_version: string
  incognito: boolean
  ad_blocker: boolean
}

export type FingerlyEvent = FingerlyMobileEvent | FingerlyWebEvent

/**
 * The shapes every Fingerly SDK speaks in.
 *
 * Nothing here touches the DOM. A type that only a browser can populate still
 * belongs in this file, because the server and the mobile SDKs both need to
 * name it; what does not belong here is the code that reads a `window`.
 */

/** Which SDK collected a report. Mirrors `schemas.SDKInfo` on the server. */
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

/**
 * Whether opt-in extended incognito probes (such as Chromium IndexedDB
 * durability timing) execute alongside zero-write standard probes.
 */
export type IncognitoDetection = 'standard' | 'extended'

/** Minimal runtime-agnostic `AbortSignal` contract (compiles under pure ES2020 without DOM). */
export interface AbortSignalLike {
  readonly aborted: boolean
  readonly reason?: unknown
  addEventListener(type: 'abort', listener: () => void, options?: { once?: boolean }): void
  removeEventListener(type: 'abort', listener: () => void): void
}

/** Options for offline signal collection (`collect()`). */
export interface CollectOptions {
  /** Cancels collection (`AbortSignal`). */
  signal?: AbortSignalLike
  /**
   * Controls whether opt-in extended incognito probes run (`'extended'`) or
   * only standard zero-write probes run (`'standard'`). Defaults to `'standard'`.
   */
  incognitoDetection?: IncognitoDetection
}

/** Options for single-pass identification (`identify()`). */
export interface IdentifyOptions extends CollectOptions {
  /** Echoed back on the finished event, for the caller's own correlation. */
  tag?: string
}

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
  /** Collect without submitting when false (native mobile bridges). Defaults to true. */
  submit?: boolean
}

/**
 * Whether the visitor has agreed to be identified.
 *
 * `pending` is the default: an SDK identifies nobody until it is told
 * `granted`. `pending` and `denied` mean the same thing to the SDK - run no
 * source, touch no storage, send nothing, and fail `identify()` with a consent
 * error - and are kept apart only because a consent tool reports them apart.
 */
export type ConsentState = 'granted' | 'pending' | 'denied'

/**
 * How a source finished.
 *
 * - `ok`          the source produced a value.
 * - `unsupported` the API is not present. A property of the device/browser.
 * - `blocked`     the API is present and refused, or returned deliberate noise.
 * - `timeout`     the source overran its slice of the budget.
 * - `error`       the source threw for an unexpected reason.
 */
export type SignalStatus = 'ok' | 'unsupported' | 'blocked' | 'timeout' | 'error'

/**
 * What one source reported.
 */
export interface SignalOutcome<T = unknown> {
  status: SignalStatus
  /** Wall-clock milliseconds the source occupied, rounded to avoid a clock oracle. */
  ms: number
  /** Present when `status` is `ok`. */
  value?: T
  /**
   * Why, for the statuses that have a why. A short stable token such as
   * `SecurityError` or `rfp-canvas-prompt-avoided`.
   */
  reason?: string
}

/**
 * Internal two-stage browser scheduler barrier:
 * - `prerequisite` runs first (`engine` + Gecko RFP timer gate).
 * - `collect` runs second with access to completed prerequisite outcomes.
 */
export type SourceStage = 'prerequisite' | 'collect'

/** Kinds of runtime prototype, descriptor, brand, or native-code tampering. */
export type LieKind =
  | 'not-native'
  | 'descriptor'
  | 'prototype'
  | 'contradiction'
  | 'missing'
  | 'brand'
  | 'to-string-threw'
  | 'unverified_realm'

/** A native function, descriptor, brand, or prototype that is not what it should be. */
export interface Lie {
  /** Stable identifier, such as `navigator.hardwareConcurrency.getter`. */
  id: string
  /** What kind of tampering was observed. */
  kind: LieKind
  /** Optional short detail. Kept stable across versions or left off. */
  detail?: string
}

/**
 * What the browser is, as opposed to what it says it is.
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
 * The whole client-side observation, as submitted inside `signals`.
 */
export interface SignalReport {
  /** Bumped when a field changes meaning, never when one is added. */
  schema: number
  /** The budget that was asked for, so a truncated report is legible as one. */
  budget_ms: number
  /** What collection actually cost. */
  elapsed_ms: number
  sources: Record<string, SignalOutcome>
  integrity: IntegrityReport
}

/** How sure the server is of a finding. Matches its `*_confidence` fields. */
export type Confidence = 'low' | 'medium' | 'high'

/** Categorical risk band returned by the server. */
export type SuspectLevel = 'low' | 'medium' | 'high'

/**
 * Canonical v3 risk signal catalogue (`sdks/contract/openapi.json` &
 * `sdks/contract/v3-manifest.json`).
 */
export type RiskSignal =
  // Cross-platform signals
  | 'high_activity'
  | 'tampering'
  | 'device_farm'
  | 'developer_tools'
  | 'geo_mismatch'
  | 'device_inconsistent'
  | 'report_incomplete'
  | 'fingerprint_suppressed'
  // Network & IP intelligence signals
  | 'tor'
  | 'proxy'
  | 'residential_proxy'
  | 'residential_proxy_low_confidence'
  | 'residential_proxy_medium_confidence'
  | 'residential_proxy_high_confidence'
  | 'vpn_public'
  | 'vpn_timezone'
  | 'vpn_relay'
  | 'vpn_mobile'
  | 'vpn_os_mismatch'
  | 'vpn_low_confidence'
  | 'vpn_medium_confidence'
  | 'vpn_high_confidence'
  | 'ip_blocklist_email_spam'
  | 'ip_blocklist_attack_source'
  | 'ip_abuser'
  | 'datacenter_ip'
  | 'bogon_ip'
  | 'anycast_ip'
  // Browser-only signals
  | 'incognito'
  | 'bad_bot'
  | 'automation'
  | 'fetch_metadata_missing'
  | 'web_ticket_missing'
  | 'web_ticket_invalid'
  | 'antidetect_browser'
  | 'virtual_machine'
  | 'privacy_settings'
  | 'embedded_web_view'
  | 'remote_control'
  // Native-only signals
  | 'emulator'
  | 'root_apps'
  | 'app_cloner'
  | 'jailbreak'
  | 'simulator'
  | 'frida'
  | 'mitm_attack'
  | 'active_call'
  | 'attestation_missing'
  | 'attestation_downgrade'
  | 'app_attest_key_churn'
  | 'play_device_integrity_failed'
  | 'play_app_unrecognized'
  | 'attestation_failed'
  | 'probe_errors'
  | 'custom_root_ca'
  | 'secondary_user_profile'

/** One active risk trigger (`IdentifyTriggerOut` in OpenAPI). */
export interface IdentifyTrigger {
  signal: RiskSignal | (string & {})
  group?: string
  weight?: number | null
  confidence?: Confidence | (string & {})
}

/** What a native `identify()` resolves with. See [[IdentifyResult]]. */
export interface NativeIdentifyResult {
  requestId: string

  /** Who this visitor is (`""` when `identifiable === false`). */
  visitorId: string
  /** `null` when the server did not say, which is not the same as `false`. */
  visitorIsNew: boolean | null
  /**
   * How sure the server is, 0 to 100 (`0` when `visitorId === ""`). `null`
   * when it did not say.
   */
  visitorConfidence: number | null
  /** `null` when the server did not say. */
  identifiable: boolean | null
  /**
   * True when this submission was answered before under the same idempotency
   * key and the stored verdict was replayed. `null` when the server did not say.
   */
  duplicate: boolean | null

  /** As [[IdentifyResult.state]]. */
  state: string

  /** `null` when absent: unscored, or hidden by the SDK key. Not the same as zero. */
  suspectScore: number | null
  /** `null` when absent, for the same reasons as [[suspectScore]]. */
  suspectLevel: SuspectLevel | null

  report: SignalReport
}

/** A v3 submission, as the body of `POST /api/v1/ingest`. */
export interface IdentifySubmission {
  /** Wire envelope version. Must equal `3`. */
  v: 3
  sdk: { platform: SdkPlatform; version: string }
  /**
   * The SDK's consent state when it sent this. Always `granted`, since an SDK
   * sends nothing otherwise; the server refuses any other value with `consent_required`.
   */
  consent: ConsentState
  signals: SignalReport
  tag?: string
  /**
   * A single-use freshness ticket the server issued to this page (web only).
   * Omitted when none could be fetched; the server then scores
   * `web_ticket_missing` and still answers.
   */
  ticket?: string
  /**
   * The proof of work for `ticket`, as a decimal nonce, when the ticket asked
   * for one (`pow_bits` above 0) and it was solved within the budget.
   */
  ticket_pow?: string
}

/**
 * The body of a web ticket request, posted to the same path as a report.
 */
export interface TicketRequest {
  v: 3
  op: 'ticket'
  sdk: { platform: 'web'; version: string }
}

/**
 * A single-use web freshness ticket: the answer to a ticket request, and the
 * `next_ticket` of a web identification answer.
 */
export interface FreshnessTicket {
  /** Unpadded base64url. Opaque to the SDK. */
  ticket: string
  /** RFC 3339 UTC. */
  expires_at: string
  /**
   * Leading zero bits the ticket's proof of work needs (1 to 22). Absent or 0
   * when the SDK key does not ask for one.
   */
  pow_bits?: number
}

/**
 * The server's v3 identification answer (`IdentifyOut`).
 */
export interface IdentifyResult {
  requestId: string

  /**
   * Stable project-scoped visitor identifier, or `""` whenever
   * `identifiable === false`, the report came from a genuine embedded WebView,
   * or an unmatched Web report is high-risk (Option B).
   */
  visitorId: string
  /**
   * `true` only when a new visitor row was minted; always `false` when
   * `visitorId === ""`.
   */
  visitorIsNew: boolean

  /**
   * Match confidence from 0 to 100 (`0` when `visitorId === ""` or freshly minted).
   */
  visitorConfidence: number

  /**
   * `false` when the report carried too little independent entropy to identify
   * a device.
   */
  identifiable: boolean

  /**
   * `true` when this submission replayed a cached verdict under the same
   * `Idempotency-Key`.
   */
  duplicate?: boolean

  /**
   * `enriched`, or `unavailable` when the address could not be looked up.
   */
  state: string

  /**
   * Weighted sum of the signals that fired, or `null` when unscored or hidden
   * by `hide_client_score` on public keys.
   */
  suspectScore: number | null
  /** `low`, `medium`, or `high`; `null` whenever [[suspectScore]] is `null`. */
  suspectLevel: SuspectLevel | null

  /**
   * Active risk signals and weights (populated only for direct secret-key
   * callers; omitted on public browser keys).
   */
  triggers?: IdentifyTrigger[]
}

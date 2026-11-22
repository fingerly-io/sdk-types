/**
 * The shapes every Fingerly SDK speaks in.
 *
 * Nothing here touches the DOM. A type that only a browser can populate still
 * belongs in this file, because the server and the mobile SDKs both need to
 * name it; what does not belong here is the code that reads a `window`.
 *
 * Every closed set of values is an `as const` object with a same-named type,
 * so `result.suspectLevel === SuspectLevel.High` and
 * `result.suspectLevel === 'high'` both type-check. A member is its value in
 * PascalCase, word by word: `fingerprint_suppressed` is
 * `Signal.FingerprintSuppressed`, `react-native-ios` is
 * `SdkPlatform.ReactNativeIos`.
 */

/** Which SDK collected a report. Mirrors `schemas.SDKInfo` on the server. */
export const SdkPlatform = {
  Web: 'web',
  Android: 'android',
  Ios: 'ios',
  ReactNativeIos: 'react-native-ios',
  ReactNativeAndroid: 'react-native-android',
  FlutterIos: 'flutter-ios',
  FlutterAndroid: 'flutter-android',
  LynxIos: 'lynx-ios',
  LynxAndroid: 'lynx-android',
} as const
/** One of the platforms in {@link SdkPlatform}. */
export type SdkPlatform = (typeof SdkPlatform)[keyof typeof SdkPlatform]

/**
 * Whether opt-in extended incognito probes (such as Chromium IndexedDB
 * durability timing) execute alongside zero-write standard probes.
 */
export const IncognitoDetection = {
  Standard: 'standard',
  Extended: 'extended',
} as const
/** One of the modes in {@link IncognitoDetection}. */
export type IncognitoDetection = (typeof IncognitoDetection)[keyof typeof IncognitoDetection]

/**
 * What a browser SDK observes about how the page is being operated, for
 * recognising an assistant that drives the visitor's own browser. Off unless
 * the page asks for it, and only after consent.
 *
 * `interaction` keeps integer counts of input events (clicks by pointer type,
 * pointer moves, key presses, input events by kind, pastes, wheel and scroll
 * events, untrusted events, viewport steps and overlays), each capped at
 * 10,000, and the length of the span they cover. Never a coordinate, a key, a
 * field value, page text, an element identifier, a URL or a per-event time.
 */
export const AgentDetection = {
  Interaction: 'interaction',
} as const
/** One of the modes in {@link AgentDetection}. */
export type AgentDetection = (typeof AgentDetection)[keyof typeof AgentDetection]

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
 * source, read or write no storage, send nothing, and fail `identify()` with a
 * consent error - and are kept apart only because a consent tool reports them
 * apart. The one difference: with `continuity: 'session'`, a browser SDK
 * removes the session seal it holds in `sessionStorage` when consent is set to
 * `denied`, and leaves it unread while consent is `pending`.
 */
export const ConsentState = {
  Granted: 'granted',
  Pending: 'pending',
  Denied: 'denied',
} as const
/** One of the states in {@link ConsentState}. */
export type ConsentState = (typeof ConsentState)[keyof typeof ConsentState]

/**
 * Whether a browser SDK asks the server to carry an identified private window
 * across the reports of one tab.
 *
 * `none` is the default: the SDK keeps nothing in the browser. With `session`
 * each report asks for a session seal, and the SDK keeps the one the answer
 * carries in `sessionStorage` for the life of the tab and sends it back on
 * the next report. The seal is read and written only while consent is
 * `granted`, and removed when consent is denied.
 */
export const Continuity = {
  None: 'none',
  Session: 'session',
} as const
/** One of the modes in {@link Continuity}. */
export type Continuity = (typeof Continuity)[keyof typeof Continuity]

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
export const Confidence = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
} as const
/** One of the grades in {@link Confidence}. */
export type Confidence = (typeof Confidence)[keyof typeof Confidence]

/** Categorical risk band returned by the server. */
export const SuspectLevel = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
} as const
/** One of the levels in {@link SuspectLevel}. */
export type SuspectLevel = (typeof SuspectLevel)[keyof typeof SuspectLevel]

/**
 * Every signal group and raw detector identifier the server reports, the same
 * list as `Signal` in `@fingerly/node`. A trigger's `signal` is a raw
 * detector, such as `vpn_public`; its `group` is the group it is reported
 * under, such as `vpn`.
 */
export const Signal = {
  Tor: 'tor',
  DatacenterProxy: 'datacenter_proxy',
  Proxy: 'proxy',
  DatacenterIp: 'datacenter_ip',
  ResidentialProxy: 'residential_proxy',
  ResidentialProxyLowConfidence: 'residential_proxy_low_confidence',
  ResidentialProxyMediumConfidence: 'residential_proxy_medium_confidence',
  ResidentialProxyHighConfidence: 'residential_proxy_high_confidence',
  Vpn: 'vpn',
  VpnPublic: 'vpn_public',
  VpnRelay: 'vpn_relay',
  VpnMobile: 'vpn_mobile',
  VpnOsMismatch: 'vpn_os_mismatch',
  VpnLowConfidence: 'vpn_low_confidence',
  VpnMediumConfidence: 'vpn_medium_confidence',
  VpnHighConfidence: 'vpn_high_confidence',
  IpBlocklist: 'ip_blocklist',
  IpBlocklistEmailSpam: 'ip_blocklist_email_spam',
  IpBlocklistAttackSource: 'ip_blocklist_attack_source',
  IpReputation: 'ip_reputation',
  IpAbuser: 'ip_abuser',
  NetworkAnomaly: 'network_anomaly',
  BogonIp: 'bogon_ip',
  AnycastIp: 'anycast_ip',
  LocationSpoofing: 'location_spoofing',
  GeoMismatch: 'geo_mismatch',
  IosSimulator: 'ios_simulator',
  Simulator: 'simulator',
  AndroidEmulator: 'android_emulator',
  Emulator: 'emulator',
  VirtualMachine: 'virtual_machine',
  JailbrokenDevice: 'jailbroken_device',
  Jailbreak: 'jailbreak',
  RootedDevice: 'rooted_device',
  RootApps: 'root_apps',
  PlayDeviceIntegrityFailed: 'play_device_integrity_failed',
  ClonedApp: 'cloned_app',
  AppCloner: 'app_cloner',
  PlayAppUnrecognized: 'play_app_unrecognized',
  DeviceFarm: 'device_farm',
  RepeatedReinstall: 'repeated_reinstall',
  DeviceActivityHigh: 'device_activity_high',
  DeviceActivityVeryHigh: 'device_activity_very_high',
  MitmAttack: 'mitm_attack',
  FridaDetected: 'frida_detected',
  Frida: 'frida',
  BrowserTampering: 'browser_tampering',
  Tampering: 'tampering',
  AntidetectBrowser: 'antidetect_browser',
  FingerprintSuppressed: 'fingerprint_suppressed',
  IdentityObfuscated: 'identity_obfuscated',
  DeveloperTools: 'developer_tools',
  RemoteControl: 'remote_control',
  Bot: 'bot',
  Automation: 'automation',
  BadBot: 'bad_bot',
  AiSpoofed: 'ai_spoofed',
  FetchMetadataMissing: 'fetch_metadata_missing',
  WebTicketMissing: 'web_ticket_missing',
  WebTicketInvalid: 'web_ticket_invalid',
  HighActivity: 'high_activity',
  IncognitoMode: 'incognito_mode',
  Incognito: 'incognito',
  PrivacySettings: 'privacy_settings',
  EmbeddedWebView: 'embedded_web_view',
  ActiveCall: 'active_call',
  AttestationMissing: 'attestation_missing',
  AttestationFailed: 'attestation_failed',
  AttestationDowngrade: 'attestation_downgrade',
  DeviceInconsistent: 'device_inconsistent',
  ReportIncomplete: 'report_incomplete',
  ProbeErrors: 'probe_errors',
  CustomRootCa: 'custom_root_ca',
  SecondaryUserProfile: 'secondary_user_profile',
} as const
/** One of the signals in {@link Signal}. */
export type Signal = (typeof Signal)[keyof typeof Signal]

/**
 * One of the signals in {@link Signal}, or a value a newer server added, so
 * code built today still compiles against it.
 */
export type SignalName = Signal | (string & {})

/** The canonical v3 risk signal catalogue: the closed {@link Signal} list. */
export type RiskSignal = Signal

/**
 * An identification's `state`, the same list as `EventState` in
 * `@fingerly/node`: `Enriched` when it was fully processed, `Unavailable`
 * when the network lookup could not run, so it was not scored. `Pending` is
 * a server read's "not recorded yet"; an identify answer is never pending.
 */
export const EventState = {
  Pending: 'pending',
  Enriched: 'enriched',
  Unavailable: 'unavailable',
} as const
/** One of the states in {@link EventState}. */
export type EventState = (typeof EventState)[keyof typeof EventState]

/** One active risk trigger (`IdentifyTriggerOut` in OpenAPI). */
export interface IdentifyTrigger {
  signal: SignalName
  group?: SignalName
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
  state: EventState | (string & {})

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
  /**
   * Asks for a session seal with the answer (web only). Sent on every report
   * while the client's `continuity` option is `session`, and omitted
   * otherwise; the server then issues no seal.
   */
  continuity?: typeof Continuity.Session
  /**
   * The session seal the previous answer in this tab carried as `next_seal`
   * (web only, with `continuity`). Omitted when none is held or the held one
   * has expired. One the server cannot verify is ignored, never refused.
   */
  seal?: string
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
 * A web session seal: the `next_seal` of a web identification answer to a
 * report that asked for `continuity: 'session'`. A signed statement of the
 * visitor the server already answered with, bound to the project, the page
 * origin and the browser's profile.
 */
export interface SessionSeal {
  /** Unpadded base64url, at most 256 characters. Opaque to the SDK. */
  seal: string
  /** RFC 3339 UTC. */
  expires_at: string
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
  state: EventState | (string & {})

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

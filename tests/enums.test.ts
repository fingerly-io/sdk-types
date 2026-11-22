import { describe, expect, expectTypeOf, it } from 'vitest'

import {
  AgentDetection,
  Confidence,
  ConsentState,
  Continuity,
  EventState,
  IncognitoDetection,
  SdkPlatform,
  Signal,
  SuspectLevel,
  type IdentifyResult,
  type IdentifyTrigger,
  type NativeIdentifyResult,
  type RiskSignal,
  type SignalName,
} from '../src/index.js'

// Snapshots of the server's own lists, which the constants must match exactly.
// Signal groups: server domain/risk/groups.go. Raw signals: domain/risk/signals.go.
const SERVER_GROUPS = [
  'active_call',
  'android_emulator',
  'attestation_failed',
  'attestation_missing',
  'bootloader_unlocked',
  'bot',
  'browser_tampering',
  'cloned_app',
  'custom_root_ca',
  'datacenter_proxy',
  'developer_tools',
  'device_farm',
  'device_inconsistent',
  'embedded_web_view',
  'fingerprint_suppressed',
  'frida_detected',
  'high_activity',
  'identity_obfuscated',
  'incognito_mode',
  'ios_simulator',
  'ip_blocklist',
  'ip_reputation',
  'jailbroken_device',
  'location_spoofing',
  'mitm_attack',
  'network_anomaly',
  'privacy_settings',
  'remote_control',
  'report_incomplete',
  'residential_proxy',
  'rooted_device',
  'secondary_user_profile',
  'tor',
  'virtual_machine',
  'vpn',
]
const SERVER_SIGNALS = [
  'active_call',
  'ai_spoofed',
  'antidetect_browser',
  'anycast_ip',
  'app_cloner',
  'attestation_downgrade',
  'attestation_failed',
  'attestation_missing',
  'automation',
  'bad_bot',
  'bogon_ip',
  'bootloader_unlocked',
  'custom_root_ca',
  'datacenter_ip',
  'developer_tools',
  'device_activity_high',
  'device_activity_very_high',
  'device_farm',
  'device_inconsistent',
  'embedded_web_view',
  'emulator',
  'fetch_metadata_missing',
  'fingerprint_suppressed',
  'frida',
  'geo_mismatch',
  'high_activity',
  'identity_obfuscated',
  'incognito',
  'ip_abuser',
  'ip_blocklist_attack_source',
  'ip_blocklist_email_spam',
  'jailbreak',
  'mitm_attack',
  'play_app_unrecognized',
  'play_device_integrity_failed',
  'privacy_settings',
  'probe_errors',
  'proxy',
  'remote_control',
  'repeated_reinstall',
  'report_incomplete',
  'residential_proxy',
  'residential_proxy_high_confidence',
  'residential_proxy_low_confidence',
  'residential_proxy_medium_confidence',
  'root_apps',
  'secondary_user_profile',
  'simulator',
  'tampering',
  'tor',
  'virtual_machine',
  'vpn_high_confidence',
  'vpn_low_confidence',
  'vpn_medium_confidence',
  'vpn_mobile',
  'vpn_os_mismatch',
  'vpn_public',
  'vpn_relay',
  'web_ticket_invalid',
  'web_ticket_missing',
]

/** The member name a value gets: PascalCase, word by word. */
const memberName = (value: string) =>
  value
    .split(/[._-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

const sorted = (values: Iterable<string>) => [...new Set(values)].sort()

const constants: Record<string, Record<string, string>> = {
  AgentDetection,
  Confidence,
  ConsentState,
  Continuity,
  EventState,
  IncognitoDetection,
  SdkPlatform,
  Signal,
  SuspectLevel,
}

describe('enum constants', () => {
  for (const [name, constant] of Object.entries(constants))
    it(`${name} names every value after itself, once`, () => {
      const values = Object.values(constant)
      expect(new Set(values).size).toBe(values.length)
      for (const [key, value] of Object.entries(constant)) expect(key).toBe(memberName(value))
    })

  it('Signal lists every server signal group and raw signal', () => {
    expect(sorted(Object.values(Signal))).toEqual(sorted([...SERVER_GROUPS, ...SERVER_SIGNALS]))
  })

  it('matches the server and SDK value lists', () => {
    expect(Object.values(SuspectLevel)).toEqual(['low', 'medium', 'high'])
    expect(Object.values(Confidence)).toEqual(['low', 'medium', 'high'])
    expect(Object.values(EventState)).toEqual(['pending', 'enriched', 'unavailable'])
    expect(Object.values(ConsentState)).toEqual(['granted', 'pending', 'denied'])
    expect(Object.values(Continuity)).toEqual(['none', 'session'])
    expect(Object.values(IncognitoDetection)).toEqual(['standard', 'extended'])
    expect(Object.values(AgentDetection)).toEqual(['interaction'])
    expect(Object.values(SdkPlatform)).toEqual([
      'web',
      'android',
      'ios',
      'react-native-ios',
      'react-native-android',
      'flutter-ios',
      'flutter-android',
      'lynx-ios',
      'lynx-android',
    ])
  })
})

describe('enum types', () => {
  it('derives each type from its constant', () => {
    expectTypeOf<SuspectLevel>().toEqualTypeOf<'low' | 'medium' | 'high'>()
    expectTypeOf<ConsentState>().toEqualTypeOf<'granted' | 'pending' | 'denied'>()
    expectTypeOf<AgentDetection>().toEqualTypeOf<'interaction'>()
    expectTypeOf<RiskSignal>().toEqualTypeOf<Signal>()
    expectTypeOf<SignalName>().toEqualTypeOf<Signal | (string & {})>()
    expectTypeOf(Signal.FingerprintSuppressed).toEqualTypeOf<'fingerprint_suppressed'>()
  })

  it('keeps suspectLevel closed, since the SDK drops values it does not know', () => {
    expectTypeOf<IdentifyResult['suspectLevel']>().toEqualTypeOf<SuspectLevel | null>()
    expectTypeOf<NativeIdentifyResult['suspectLevel']>().toEqualTypeOf<SuspectLevel | null>()
  })

  it('types server values open, accepting constants, literals and new values', () => {
    expectTypeOf<IdentifyResult['state']>().toEqualTypeOf<EventState | (string & {})>()
    expectTypeOf<IdentifyTrigger['signal']>().toEqualTypeOf<SignalName>()
    expectTypeOf<IdentifyTrigger['group']>().toEqualTypeOf<SignalName | undefined>()

    const result = { suspectLevel: 'high', state: 'enriched', triggers: [] } as unknown as IdentifyResult
    const trigger: IdentifyTrigger = { signal: 'not_yet_a_signal', group: Signal.Vpn }
    expect([
      result.suspectLevel === SuspectLevel.High,
      result.suspectLevel === 'high',
      result.state === EventState.Enriched,
      trigger.signal === Signal.FingerprintSuppressed,
    ]).toEqual([true, true, true, false])
  })
})

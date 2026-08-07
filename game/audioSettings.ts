/**
 * Lightweight, device-only audio preferences for the Music/Sound toggles on
 * the Settings page. Kept as its own tiny storage key — separate from
 * game/progress.ts — because these are a UI preference, not save-data that
 * should round-trip through a parent's backup/restore code.
 */

const STORAGE_KEY = 'kna-audio-settings-v1';

export interface AudioSettings {
  music: boolean;
  sound: boolean;
}

function defaults(): AudioSettings {
  return { music: true, sound: true };
}

export function getAudioSettings(): AudioSettings {
  if (typeof window === 'undefined') return defaults();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();
    return { ...defaults(), ...JSON.parse(raw) };
  } catch {
    return defaults();
  }
}

/** Persists a change and lets any mounted component (e.g. Settings) know. */
export function setAudioSettings(patch: Partial<AudioSettings>) {
  if (typeof window === 'undefined') return;
  const next = { ...getAudioSettings(), ...patch };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('audio-settings-updated'));
}

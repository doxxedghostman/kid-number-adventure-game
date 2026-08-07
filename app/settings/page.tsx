'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import { exportProgressCode, importProgressCode } from '@/game/progress';
import { getAudioSettings, setAudioSettings } from '@/game/audioSettings';

export default function SettingsPage() {
  const router = useRouter();
  // Read the real persisted preference on first render (not a hardcoded
  // `true`) so this screen accurately reflects whatever was chosen last —
  // useState(false) initializer arg only runs once, on mount.
  const [music, setMusic] = useState(() => getAudioSettings().music);
  const [sound, setSound] = useState(() => getAudioSettings().sound);

  const [backupCode, setBackupCode] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const [showRestore, setShowRestore] = useState(false);
  const [restoreInput, setRestoreInput] = useState('');
  const [restoreStatus, setRestoreStatus] = useState<{ type: 'idle' | 'error' | 'success'; message?: string }>({
    type: 'idle',
  });

  const handleBackup = () => {
    setBackupCode(exportProgressCode());
    setCopyStatus('idle');
  };

  const handleCopy = async () => {
    if (!backupCode) return;
    try {
      await navigator.clipboard.writeText(backupCode);
      setCopyStatus('copied');
    } catch {
      // Clipboard API can fail in some WebViews — the code is still shown
      // on screen for a manual copy either way.
    }
  };

  const handleRestore = () => {
    const result = importProgressCode(restoreInput);
    if (result.ok) {
      setRestoreStatus({ type: 'success' });
    } else {
      setRestoreStatus({ type: 'error', message: result.error });
    }
  };

  const toggleMusic = () => {
    setMusic((m) => {
      setAudioSettings({ music: !m });
      return !m;
    });
  };

  const toggleSound = () => {
    setSound((s) => {
      setAudioSettings({ sound: !s });
      return !s;
    });
  };

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.2rem',
        padding: '2rem',
      }}
    >
      <h1 style={{ color: 'white', textShadow: '0 3px 0 rgba(0,0,0,0.15)' }}>Settings</h1>

      <Button color="purple" onClick={toggleMusic}>
        {music ? '🎵 Music: On' : '🔇 Music: Off'}
      </Button>
      <Button color="blue" onClick={toggleSound}>
        {sound ? '🔊 Sound: On' : '🔈 Sound: Off'}
      </Button>

      {/*
        Persisted via game/audioSettings.ts (localStorage). BootScene reads
        this once at game boot to decide whether to autoplay bgm-main and
        playSfx() checks it on every call, so a change here takes effect
        the next time the Phaser game (re)starts — i.e. immediately if
        you're navigating here from, or back to, the Play screen.
      */}

      <div
        style={{
          background: 'white',
          borderRadius: 20,
          padding: '1.2rem 1.4rem',
          width: '100%',
          maxWidth: 380,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem',
        }}
      >
        <strong>Save your progress</strong>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#4a3728aa' }}>
          For a parent: get a code to save progress, so it can be brought back on a new phone.
        </p>

        <Button color="green" onClick={handleBackup}>
          💾 Get Backup Code
        </Button>

        {backupCode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <textarea
              readOnly
              value={backupCode}
              rows={4}
              style={{
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                padding: '0.6rem',
                borderRadius: 12,
                border: '2px solid #eee',
                resize: 'none',
              }}
              onFocus={(e) => e.currentTarget.select()}
            />
            <Button color="orange" onClick={handleCopy}>
              {copyStatus === 'copied' ? '✅ Copied!' : '📋 Copy Code'}
            </Button>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#4a3728aa' }}>
              Save this somewhere safe — a note, a text to yourself, a screenshot.
            </p>
          </div>
        )}

        <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #eee' }} />

        {!showRestore ? (
          <Button color="pink" onClick={() => setShowRestore(true)}>
            ♻️ Restore From Code
          </Button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <textarea
              placeholder="Paste your backup code here"
              value={restoreInput}
              onChange={(e) => {
                setRestoreInput(e.target.value);
                setRestoreStatus({ type: 'idle' });
              }}
              rows={4}
              style={{
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                padding: '0.6rem',
                borderRadius: 12,
                border: '2px solid #eee',
                resize: 'none',
              }}
            />
            <Button color="pink" onClick={handleRestore}>
              Restore
            </Button>
            {restoreStatus.type === 'error' && (
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#c0392b' }}>{restoreStatus.message}</p>
            )}
            {restoreStatus.type === 'success' && (
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#2e7d32' }}>
                Restored! Coins/stars/levels are back. Go to Play to check.
              </p>
            )}
          </div>
        )}
      </div>

      <Button color="pink" onClick={() => router.push('/')}>
        ⬅️ Back to Menu
      </Button>
    </main>
  );
}

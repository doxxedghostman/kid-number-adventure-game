'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/Button';
import { exportProgressCode, importProgressCode } from '@/game/progress';

export default function SettingsPage() {
  const router = useRouter();
  const [music, setMusic] = useState(true);
  const [sound, setSound] = useState(true);

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

      <Button color="purple" onClick={() => setMusic((m) => !m)}>
        {music ? '🎵 Music: On' : '🔇 Music: Off'}
      </Button>
      <Button color="blue" onClick={() => setSound((s) => !s)}>
        {sound ? '🔊 Sound: On' : '🔈 Sound: Off'}
      </Button>

      {/*
        TODO: these toggles aren't wired to the Phaser audio system yet —
        that needs sound.mute / sound.volume set from a shared settings
        module once real audio assets are loaded in BootScene.
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

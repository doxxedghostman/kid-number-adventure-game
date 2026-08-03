'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/Button';

export default function SettingsPage() {
  const router = useRouter();
  const [music, setMusic] = useState(true);
  const [sound, setSound] = useState(true);

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.4rem',
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

      <Button color="pink" onClick={() => router.push('/')}>
        ⬅️ Back to Menu
      </Button>
    </main>
  );
}

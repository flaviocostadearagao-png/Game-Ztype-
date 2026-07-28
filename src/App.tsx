/**
 * Minecraft Typing Defense (ZType Voxel) - Main Application Component
 */

import React, { useState, useCallback, useRef } from 'react';
import { CanvasGame } from './components/CanvasGame';
import { MinecraftHUD } from './components/MinecraftHUD';
import { GameOverlay } from './components/GameOverlay';
import { WordListModal } from './components/WordListModal';
import { useGameEngine } from './hooks/useGameEngine';
import { GameSettings, PowerUpInventory } from './types';
import { soundEngine } from './utils/audio';

export default function App() {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isWordListOpen, setIsWordListOpen] = useState<boolean>(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<GameSettings>({
    difficulty: 'normal',
    forgiveAccents: true,
    crtFilter: false,
    particleDensity: 'medium',
    customWordsOnly: false,
  });

  // Game Engine State & Handlers
  const {
    status,
    setStatus,
    hearts,
    maxHearts,
    stats,
    powerups,
    biome,
    enemyBlocks,
    currentTargetId,
    lasers,
    particles,
    floatingTexts,
    stevePos,
    isFrozen,
    sendVirtualKey,
    selectTargetBlock,
    startGame,
    togglePause,
    triggerPowerup,
  } = useGameEngine(dimensions.width, dimensions.height, settings);

  const currentTargetBlock = enemyBlocks.find((b) => b.id === currentTargetId);

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      soundEngine.soundEnabled = next;
      soundEngine.musicEnabled = next;
      if (!next) {
        soundEngine.stopAmbientMusic();
      } else if (status === 'PLAYING') {
        soundEngine.startAmbientMusic();
      }
      return next;
    });
  };

  const handleDimensionsChange = useCallback((w: number, h: number) => {
    setDimensions({ width: w, height: h });
  }, []);

  const focusNativeInput = useCallback(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, []);

  const handleStartGameWithInput = useCallback(() => {
    startGame();
    setTimeout(() => {
      focusNativeInput();
    }, 100);
  }, [startGame, focusNativeInput]);

  const handleHiddenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 0) {
      const lastChar = value[value.length - 1];
      sendVirtualKey(lastChar);
      e.target.value = '';
    }
  };

  return (
    <div
      onClick={focusNativeInput}
      className="w-screen h-screen relative bg-slate-950 overflow-hidden flex flex-col font-pixel text-white select-none"
    >
      {/* Hidden input element for native mobile/desktop device keyboard support */}
      <input
        ref={hiddenInputRef}
        type="text"
        className="opacity-0 absolute -top-96 left-0 w-1 h-1 pointer-events-none"
        onChange={handleHiddenInputChange}
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
      />

      {/* Optional Retro CRT Scanline Overlay */}
      {settings.crtFilter && <div className="absolute inset-0 crt-overlay z-20 pointer-events-none" />}

      {/* Top Flex Item: Game Area (Canvas & HUD) */}
      <div className="relative w-full flex-1 min-h-0 overflow-hidden">
        {/* Main 2D Pixel Art Game Canvas */}
        <CanvasGame
          enemyBlocks={enemyBlocks}
          currentTargetId={currentTargetId}
          lasers={lasers}
          particles={particles}
          floatingTexts={floatingTexts}
          stevePos={stevePos}
          biome={biome}
          onDimensionsChange={handleDimensionsChange}
          onSelectBlock={selectTargetBlock}
          onCanvasClick={focusNativeInput}
        />

        {/* Minecraft Pixel Art HUD overlay during gameplay */}
        {status === 'PLAYING' && (
          <MinecraftHUD
            hearts={hearts}
            maxHearts={maxHearts}
            stats={stats}
            currentTargetBlock={currentTargetBlock}
            isFrozen={isFrozen}
            onTogglePause={togglePause}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
          />
        )}
      </div>

      {/* Overlays for Main Menu, Pause, Game Over */}
      <GameOverlay
        status={status}
        stats={stats}
        settings={settings}
        onStartGame={handleStartGameWithInput}
        onResumeGame={togglePause}
        onGoToMenu={() => setStatus('MENU')}
        onUpdateSettings={handleUpdateSettings}
        onOpenWordListModal={() => setIsWordListOpen(true)}
      />

      {/* Portuguese Word Dictionary Explorer Modal */}
      <WordListModal
        isOpen={isWordListOpen}
        onClose={() => setIsWordListOpen(false)}
      />
    </div>
  );
}

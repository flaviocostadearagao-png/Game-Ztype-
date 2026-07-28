/**
 * Minecraft Typing Defense (ZType Voxel) - Main Application Component
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CanvasGame } from './components/CanvasGame';
import { MinecraftHUD } from './components/MinecraftHUD';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { GameOverlay } from './components/GameOverlay';
import { WordListModal } from './components/WordListModal';
import { useGameEngine } from './hooks/useGameEngine';
import { GameSettings, PowerUpInventory, Difficulty } from './types';
import { soundEngine } from './utils/audio';

export default function App() {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState<boolean>(true);
  const [isWordListOpen, setIsWordListOpen] = useState<boolean>(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Dynamic visualViewport listener for mobile keyboard adaptability
  useEffect(() => {
    const updateViewportHeight = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      } else {
        setViewportHeight(window.innerHeight);
      }
    };

    updateViewportHeight();
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportHeight);
      window.visualViewport.addEventListener('scroll', updateViewportHeight);
    }
    window.addEventListener('resize', updateViewportHeight);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewportHeight);
        window.visualViewport.removeEventListener('scroll', updateViewportHeight);
      }
      window.removeEventListener('resize', updateViewportHeight);
    };
  }, []);

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
    goToMenu,
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
    if (status === 'PLAYING' && hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, [status]);

  const handleStartGameWithInput = useCallback((difficulty?: Difficulty) => {
    startGame(difficulty);
    setTimeout(() => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus();
      }
    }, 100);
  }, [startGame]);

  const handleContainerClick = () => {
    if (status === 'PLAYING') {
      focusNativeInput();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      sendVirtualKey('BACKSPACE');
    } else if (e.key === ' ') {
      sendVirtualKey(' ');
      e.preventDefault();
    } else if (e.key.length === 1) {
      sendVirtualKey(e.key);
      e.currentTarget.value = '';
    }
  };

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
      onClick={handleContainerClick}
      style={{ height: viewportHeight ? `${viewportHeight}px` : '100dvh' }}
      className="w-screen relative bg-slate-950 overflow-hidden flex flex-col font-pixel text-white select-none"
    >
      {/* Invisible input element for native mobile/desktop device keyboard focus & IME support */}
      <input
        ref={hiddenInputRef}
        type="text"
        inputMode="text"
        enterKeyHint="go"
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className="opacity-0 absolute top-0 left-0 w-1 h-1 pointer-events-none"
        onKeyDown={handleInputKeyDown}
        onChange={handleHiddenInputChange}
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
            showVirtualKeyboard={showVirtualKeyboard}
            onToggleVirtualKeyboard={() => setShowVirtualKeyboard((prev) => !prev)}
            onTogglePause={togglePause}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
          />
        )}
      </div>

      {/* Bottom Flex Item: On-Screen Native Controls & Hotbar split cleanly below game canvas */}
      {status === 'PLAYING' && showVirtualKeyboard && (
        <VirtualKeyboard
          currentTargetBlock={currentTargetBlock}
          activeBlocks={enemyBlocks}
          powerups={powerups}
          forgiveAccents={settings.forgiveAccents}
          onKeyPress={(key) => {
            sendVirtualKey(key);
            focusNativeInput();
          }}
          onTriggerPowerup={triggerPowerup}
          onFocusNativeInput={focusNativeInput}
        />
      )}

      {/* Overlays for Main Menu, Pause, Game Over */}
      <GameOverlay
        status={status}
        stats={stats}
        settings={settings}
        onStartGame={handleStartGameWithInput}
        onResumeGame={togglePause}
        onGoToMenu={goToMenu}
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

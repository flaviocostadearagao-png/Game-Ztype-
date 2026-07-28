/**
 * Minecraft Style Pixel Art HUD Component
 */

import React from 'react';
import { GameStats, EnemyBlock } from '../types';
import { Heart, Clock, Pause, Volume2, VolumeX, Keyboard } from 'lucide-react';

interface MinecraftHUDProps {
  hearts: number;
  maxHearts: number;
  stats: GameStats;
  currentTargetBlock: EnemyBlock | undefined;
  isFrozen: boolean;
  showVirtualKeyboard: boolean;
  onToggleVirtualKeyboard: () => void;
  onTogglePause: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const MinecraftHUD: React.FC<MinecraftHUDProps> = ({
  hearts,
  maxHearts,
  stats,
  currentTargetBlock,
  isFrozen,
  showVirtualKeyboard,
  onToggleVirtualKeyboard,
  onTogglePause,
  soundEnabled,
  onToggleSound,
}) => {
  // Render Pixel Hearts Array
  const renderHearts = () => {
    const heartElements = [];
    for (let i = 0; i < maxHearts; i++) {
      const isFull = i < hearts;
      heartElements.push(
        <div
          key={`heart_${i}`}
          className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center transition-transform ${
            isFull ? 'text-red-600 scale-100' : 'text-slate-700 scale-90 opacity-40'
          }`}
          style={{
            filter: isFull ? 'drop-shadow(0px 2px 0px #000)' : 'none',
          }}
        >
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current stroke-[2px] stroke-black" />
        </div>
      );
    }
    return heartElements;
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-3 font-pixel select-none z-10">
      {/* Top Header Row */}
      <div className="flex items-start justify-between w-full gap-2">
        {/* Left: Health Hearts */}
        <div className="flex items-center gap-1 pointer-events-auto bg-black/60 backdrop-blur-xs px-2.5 py-1.5 border border-slate-700/80 rounded-none">
          {renderHearts()}
        </div>

        {/* Center: Current Target Word Banner (Only when actively typing a target) */}
        {currentTargetBlock && (
          <div className="flex flex-col items-center bg-black/85 border border-cyan-400 px-3 py-1 sm:px-5 sm:py-1.5 animate-pulse-glow shadow-md mx-auto">
            <div className="flex items-center text-sm sm:text-base tracking-wider">
              {currentTargetBlock.word.split('').map((char, idx) => {
                const isTyped = idx < currentTargetBlock.typedIndex;
                const isNext = idx === currentTargetBlock.typedIndex;
                return (
                  <span
                    key={`char_${idx}`}
                    className={`font-pixel font-bold px-0.5 ${
                      isTyped
                        ? 'text-emerald-400 text-glow-diamond'
                        : isNext
                        ? 'text-yellow-300 underline'
                        : 'text-white'
                    }`}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Right: Essential Control Buttons Only */}
        <div className="flex items-center gap-1 pointer-events-auto bg-black/60 backdrop-blur-xs p-1 border border-slate-700/80">
          <button
            type="button"
            onClick={onToggleVirtualKeyboard}
            className={`mc-btn p-1 sm:p-1.5 ${
              showVirtualKeyboard ? 'text-yellow-300 border-yellow-400 bg-yellow-950/80' : 'text-slate-300 hover:text-white'
            }`}
            title="Alternar Teclado Virtual na Tela"
          >
            <Keyboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={onToggleSound}
            className="mc-btn p-1 sm:p-1.5 text-white hover:text-yellow-300"
            title="Alternar Som"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />}
          </button>
          <button
            type="button"
            onClick={onTogglePause}
            className="mc-btn p-1 sm:p-1.5 text-white hover:text-yellow-300"
            title="Pausar Jogo"
          >
            <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Freeze Timer Active Banner */}
      {isFrozen && (
        <div className="self-center bg-cyan-900/90 border-2 border-cyan-400 text-cyan-200 px-4 py-1.5 text-[10px] sm:text-xs flex items-center gap-2 animate-bounce">
          <Clock className="w-3.5 h-3.5 animate-spin" />
          <span>TEMPO CONGELADO!</span>
        </div>
      )}
    </div>
  );
};

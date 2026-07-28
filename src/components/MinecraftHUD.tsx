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
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-4 font-pixel select-none z-10">
      {/* Top Header Row */}
      <div className="flex flex-wrap sm:flex-nowrap items-start justify-between w-full gap-2">
        {/* Left: Health Hearts & XP Bar */}
        <div className="flex flex-col gap-1.5 pointer-events-auto bg-black/75 backdrop-blur-xs p-2 sm:p-3 border-2 border-slate-700">
          {/* Hearts Row */}
          <div className="flex items-center gap-0.5 flex-wrap max-w-[160px] sm:max-w-none">{renderHearts()}</div>

          {/* Level & XP Progress Bar */}
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-emerald-700 border-2 border-black flex items-center justify-center text-white text-[10px] sm:text-xs font-bold text-shadow">
              {stats.level}
            </div>
            <div className="w-24 sm:w-40 h-2.5 sm:h-3 bg-slate-900 border border-slate-600 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-lime-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${(stats.blocksDestroyed % 8) * 12.5}%` }}
              />
            </div>
            <span className="text-[9px] text-emerald-400">XP</span>
          </div>
        </div>

        {/* Center: Current Target Banner */}
        {currentTargetBlock ? (
          <div className="flex flex-col items-center bg-black/90 border-2 border-cyan-400 px-3 py-1.5 sm:px-6 sm:py-2 animate-pulse-glow shadow-lg mx-auto">
            <span className="text-[8px] sm:text-[10px] text-cyan-400 uppercase tracking-widest mb-0.5">
              ALVO ATUAL
            </span>
            <div className="flex items-center text-sm sm:text-lg tracking-wider">
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
        ) : (
          <div className="hidden md:flex items-center gap-2 bg-black/60 border border-slate-700 px-4 py-2 text-[10px] text-slate-300">
            <span>DIGITE A PRIMEIRA LETRA DE QUALQUER PALAVRA NA TELA!</span>
          </div>
        )}

        {/* Right: Score, WPM, Audio & Pause Controls */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="bg-black/75 border-2 border-slate-700 p-2 sm:p-3 text-right text-[10px] sm:text-xs space-y-0.5">
            <div className="text-yellow-400 font-bold tracking-wider">
              PONTOS: <span className="text-white">{stats.score}</span>
            </div>
            <div className="flex items-center justify-end gap-2 text-[9px] sm:text-[10px] text-slate-300">
              <span>WPM: <strong className="text-cyan-400">{stats.wpm}</strong></span>
              <span>COMBO: <strong className="text-orange-400">x{stats.combo}</strong></span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={onToggleVirtualKeyboard}
              className={`mc-btn p-1.5 sm:p-2 ${
                showVirtualKeyboard ? 'text-yellow-300 border-yellow-400 bg-yellow-950/80' : 'text-slate-300 hover:text-white'
              }`}
              title="Alternar Teclado Virtual na Tela"
            >
              <Keyboard className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onToggleSound}
              className="mc-btn p-1.5 sm:p-2 text-white hover:text-yellow-300"
              title="Alternar Som"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
            <button
              type="button"
              onClick={onTogglePause}
              className="mc-btn p-1.5 sm:p-2 text-white hover:text-yellow-300"
              title="Pausar Jogo"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
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

/**
 * Minecraft Style Pixel Art HUD Component
 */

import React from 'react';
import { GameStats, PowerUpInventory, EnemyBlock } from '../types';
import { Heart, Zap, Bomb, Clock, Sparkles, Pause, Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface MinecraftHUDProps {
  hearts: number;
  maxHearts: number;
  stats: GameStats;
  powerups: PowerUpInventory;
  currentTargetBlock: EnemyBlock | undefined;
  isFrozen: boolean;
  onTriggerPowerup: (type: keyof PowerUpInventory) => void;
  onTogglePause: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const MinecraftHUD: React.FC<MinecraftHUDProps> = ({
  hearts,
  maxHearts,
  stats,
  powerups,
  currentTargetBlock,
  isFrozen,
  onTriggerPowerup,
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
          className={`w-6 h-6 flex items-center justify-center transition-transform ${
            isFull ? 'text-red-600 scale-100' : 'text-slate-700 scale-90 opacity-40'
          }`}
          style={{
            filter: isFull ? 'drop-shadow(0px 2px 0px #000)' : 'none',
          }}
        >
          <Heart className="w-5 h-5 fill-current stroke-[2px] stroke-black" />
        </div>
      );
    }
    return heartElements;
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 font-pixel select-none z-10">
      {/* Top Header Row */}
      <div className="flex items-center justify-between w-full">
        {/* Left: Health Hearts & XP Bar */}
        <div className="flex flex-col gap-2 pointer-events-auto bg-black/60 backdrop-blur-xs p-3 rounded-none border-2 border-slate-700">
          {/* Hearts Row */}
          <div className="flex items-center gap-1">{renderHearts()}</div>

          {/* Level & XP Progress Bar */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-700 border-2 border-black flex items-center justify-center text-white text-xs font-bold text-shadow">
              {stats.level}
            </div>
            <div className="w-40 h-3 bg-slate-900 border border-slate-600 rounded-none overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-lime-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${(stats.blocksDestroyed % 8) * 12.5}%` }}
              />
            </div>
            <span className="text-[10px] text-emerald-400">XP</span>
          </div>
        </div>

        {/* Center: Current Target Banner */}
        {currentTargetBlock ? (
          <div className="flex flex-col items-center bg-black/85 border-2 border-cyan-400 px-6 py-2 animate-pulse-glow shadow-lg">
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest mb-1">
              ALVO BLOQUEADO
            </span>
            <div className="flex items-center text-lg tracking-wider">
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
          <div className="hidden sm:flex items-center gap-2 bg-black/50 border border-slate-700 px-4 py-2 text-[10px] text-slate-300">
            <span>DIGITE A PRIMEIRA LETRA DE UM BLOCO PARA MIRA!</span>
          </div>
        )}

        {/* Right: Score, WPM, Audio & Pause Controls */}
        <div className="flex flex-col items-end gap-2">
          <div className="bg-black/60 border-2 border-slate-700 p-3 text-right text-xs space-y-1">
            <div className="text-yellow-400 font-bold tracking-wider">
              PONTOS: <span className="text-white">{stats.score}</span>
            </div>
            <div className="flex items-center justify-end gap-3 text-[10px] text-slate-300">
              <span>WPM: <strong className="text-cyan-400">{stats.wpm}</strong></span>
              <span>COMBO: <strong className="text-orange-400">x{stats.combo}</strong></span>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex gap-2 pointer-events-auto">
            <button
              onClick={onToggleSound}
              className="mc-btn p-2 text-white hover:text-yellow-300"
              title="Alternar Som"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
            <button
              onClick={onTogglePause}
              className="mc-btn p-2 text-white hover:text-yellow-300"
              title="Pausar Jogo"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Freeze Timer Active Banner */}
      {isFrozen && (
        <div className="self-center bg-cyan-900/90 border-2 border-cyan-400 text-cyan-200 px-6 py-2 text-xs flex items-center gap-2 animate-bounce">
          <Clock className="w-4 h-4 animate-spin" />
          <span>TEMPO CONGELADO!</span>
        </div>
      )}

      {/* Bottom Minecraft Hotbar for Power-ups */}
      <div className="self-center pointer-events-auto flex items-center gap-2 bg-black/80 p-2 border-4 border-slate-700 shadow-2xl">
        {/* Hotbar Slot 1: TNT Nuke */}
        <button
          onClick={() => onTriggerPowerup('tnt_nuke')}
          disabled={powerups.tnt_nuke <= 0}
          className={`w-14 h-14 mc-btn flex flex-col items-center justify-center relative ${
            powerups.tnt_nuke > 0 ? 'hover:border-red-500' : 'opacity-40'
          }`}
          title="Nuke TNT (Tecla 1): Destrói todos os blocos na tela!"
        >
          <span className="absolute top-1 left-1 text-[9px] text-yellow-300 font-bold">1</span>
          <Bomb className="w-6 h-6 text-red-500" />
          <span className="text-[10px] text-white font-bold">{powerups.tnt_nuke}</span>
        </button>

        {/* Hotbar Slot 2: Freeze Clock */}
        <button
          onClick={() => onTriggerPowerup('freeze_clock')}
          disabled={powerups.freeze_clock <= 0}
          className={`w-14 h-14 mc-btn flex flex-col items-center justify-center relative ${
            powerups.freeze_clock > 0 ? 'hover:border-cyan-400' : 'opacity-40'
          }`}
          title="Congelar Tempo (Tecla 2): Paralisa a queda de blocos por 5s!"
        >
          <span className="absolute top-1 left-1 text-[9px] text-yellow-300 font-bold">2</span>
          <Clock className="w-6 h-6 text-cyan-400" />
          <span className="text-[10px] text-white font-bold">{powerups.freeze_clock}</span>
        </button>

        {/* Hotbar Slot 3: Golden Apple */}
        <button
          onClick={() => onTriggerPowerup('golden_apple')}
          disabled={powerups.golden_apple <= 0}
          className={`w-14 h-14 mc-btn flex flex-col items-center justify-center relative ${
            powerups.golden_apple > 0 ? 'hover:border-yellow-400' : 'opacity-40'
          }`}
          title="Maçã Dourada (Tecla 3): Restaura 3 corações de vida!"
        >
          <span className="absolute top-1 left-1 text-[9px] text-yellow-300 font-bold">3</span>
          <Sparkles className="w-6 h-6 text-yellow-400" />
          <span className="text-[10px] text-white font-bold">{powerups.golden_apple}</span>
        </button>

        {/* Hotbar Slot 4: Redstone Super Laser */}
        <button
          onClick={() => onTriggerPowerup('redstone_laser')}
          disabled={powerups.redstone_laser <= 0}
          className={`w-14 h-14 mc-btn flex flex-col items-center justify-center relative ${
            powerups.redstone_laser > 0 ? 'hover:border-red-600' : 'opacity-40'
          }`}
          title="Raio Redstone (Tecla 4): Destrói instantaneamente a palavra alvo!"
        >
          <span className="absolute top-1 left-1 text-[9px] text-yellow-300 font-bold">4</span>
          <Zap className="w-6 h-6 text-red-500" />
          <span className="text-[10px] text-white font-bold">{powerups.redstone_laser}</span>
        </button>
      </div>
    </div>
  );
};

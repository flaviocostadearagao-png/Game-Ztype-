/**
 * Native Keyboard Hotbar & Controls Component
 * Adapts screen height cleanly when device native keyboard is open.
 */

import React, { useState } from 'react';
import { PowerUpInventory, EnemyBlock } from '../types';
import { Bomb, Clock, Sparkles, Zap, Keyboard, ChevronUp, ChevronDown } from 'lucide-react';

interface VirtualKeyboardProps {
  currentTargetBlock: EnemyBlock | undefined;
  activeBlocks: EnemyBlock[];
  powerups: PowerUpInventory;
  forgiveAccents: boolean;
  onKeyPress: (key: string) => void;
  onTriggerPowerup: (type: keyof PowerUpInventory) => void;
  onFocusNativeInput: () => void;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  currentTargetBlock,
  powerups,
  onKeyPress,
  onTriggerPowerup,
  onFocusNativeInput,
}) => {
  const [showOnScreenKeys, setShowOnScreenKeys] = useState<boolean>(false);

  // Determine next expected letter to highlight on the virtual keyboard
  let highlightChar = '';
  if (currentTargetBlock) {
    const nextIdx = currentTargetBlock.typedIndex || 0;
    if (nextIdx < currentTargetBlock.word.length) {
      highlightChar = currentTargetBlock.word[nextIdx].toUpperCase();
    }
  }

  const handleKeyClick = (key: string) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch (e) {
        // ignore
      }
    }
    onKeyPress(key);
  };

  return (
    <div className="w-full bg-slate-950/95 border-t-2 border-slate-700 p-1.5 sm:p-2 flex flex-col items-center gap-1.5 z-20 pointer-events-auto shadow-2xl select-none">
      {/* Power-ups & Native Keyboard Controls Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between gap-1 sm:gap-2 px-1">
        {/* Powerups slot row */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* TNT Nuke */}
          <button
            type="button"
            onClick={() => onTriggerPowerup('tnt_nuke')}
            disabled={powerups.tnt_nuke <= 0}
            className={`mc-btn px-2 py-1 flex items-center gap-1 text-[10px] sm:text-xs text-white ${
              powerups.tnt_nuke > 0 ? 'hover:border-red-500 bg-red-950/80' : 'opacity-40'
            }`}
            title="Nuke TNT: Destrói todos os blocos na tela"
          >
            <Bomb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
            <span className="font-bold">{powerups.tnt_nuke}</span>
          </button>

          {/* Freeze Clock */}
          <button
            type="button"
            onClick={() => onTriggerPowerup('freeze_clock')}
            disabled={powerups.freeze_clock <= 0}
            className={`mc-btn px-2 py-1 flex items-center gap-1 text-[10px] sm:text-xs text-white ${
              powerups.freeze_clock > 0 ? 'hover:border-cyan-400 bg-cyan-950/80' : 'opacity-40'
            }`}
            title="Congelar Tempo: Paralisa blocos por 5s"
          >
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            <span className="font-bold">{powerups.freeze_clock}</span>
          </button>

          {/* Golden Apple */}
          <button
            type="button"
            onClick={() => onTriggerPowerup('golden_apple')}
            disabled={powerups.golden_apple <= 0}
            className={`mc-btn px-2 py-1 flex items-center gap-1 text-[10px] sm:text-xs text-white ${
              powerups.golden_apple > 0 ? 'hover:border-yellow-400 bg-yellow-950/80' : 'opacity-40'
            }`}
            title="Maçã Dourada: Restaura vida"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
            <span className="font-bold">{powerups.golden_apple}</span>
          </button>

          {/* Redstone Laser */}
          <button
            type="button"
            onClick={() => onTriggerPowerup('redstone_laser')}
            disabled={powerups.redstone_laser <= 0}
            className={`mc-btn px-2 py-1 flex items-center gap-1 text-[10px] sm:text-xs text-white ${
              powerups.redstone_laser > 0 ? 'hover:border-red-600 bg-red-950/80' : 'opacity-40'
            }`}
            title="Raio Redstone: Destrói palavra alvo"
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
            <span className="font-bold">{powerups.redstone_laser}</span>
          </button>
        </div>

        {/* Center: Open Native Device Keyboard button */}
        <button
          type="button"
          onClick={onFocusNativeInput}
          className="mc-btn px-2.5 py-1 text-[10px] sm:text-xs text-yellow-300 hover:text-yellow-200 font-bold flex items-center gap-1 bg-yellow-950/60 border-yellow-600"
        >
          <Keyboard className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
          <span className="hidden xs:inline">ABRIR TECLADO</span>
        </button>

        {/* Optional On-screen Keys Toggle */}
        <button
          type="button"
          onClick={() => setShowOnScreenKeys((prev) => !prev)}
          className="mc-btn px-2 py-1 text-[10px] text-slate-300 hover:text-white flex items-center gap-1"
          title="Alternar botões de teclas na tela"
        >
          <span>TECLAS</span>
          {showOnScreenKeys ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>
      </div>

      {/* Optional QWERTY On-Screen Keys (only shown if player toggles it) */}
      {showOnScreenKeys && (
        <div className="w-full max-w-2xl flex flex-col items-center gap-1 pt-1 border-t border-slate-800">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center items-center gap-0.5 sm:gap-1 w-full">
              {row.map((char) => {
                const isTargeting = highlightChar === char;
                return (
                  <button
                    key={char}
                    type="button"
                    onClick={() => handleKeyClick(char)}
                    className={`mc-btn flex-1 max-w-[36px] sm:max-w-[44px] h-8 sm:h-10 flex items-center justify-center text-xs font-bold active:scale-95 transition-transform ${
                      isTargeting
                        ? 'bg-cyan-900 border-cyan-400 text-cyan-200 shadow-[0_0_8px_#00ffff] animate-pulse'
                        : 'text-slate-100 hover:text-yellow-300'
                    }`}
                  >
                    {char}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


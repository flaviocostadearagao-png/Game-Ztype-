/**
 * Minecraft Style Virtual Pixel Keyboard for Mobile Touch Screen Typing
 */

import React from 'react';
import { Delete, Space, Smartphone, X, Bomb, Clock, Sparkles, Zap } from 'lucide-react';
import { PowerUpInventory } from '../types';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onClose: () => void;
  onFocusNativeInput: () => void;
  powerups: PowerUpInventory;
  onTriggerPowerup: (type: keyof PowerUpInventory) => void;
}

const ROW_1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const ROW_2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'];
const ROW_3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];
const ROW_ACCENTS = ['Á', 'É', 'Í', 'Ó', 'Ú', 'Ã', 'Õ', 'Â', 'Ê'];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  onClose,
  onFocusNativeInput,
  powerups,
  onTriggerPowerup,
}) => {
  const handleKeyClick = (key: string) => {
    // Vibrate briefly on touch devices if supported
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(12);
      } catch (e) {
        // Ignore unsupported
      }
    }
    onKeyPress(key);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-slate-950/95 border-t-4 border-slate-700 p-1.5 sm:p-3 shadow-2xl font-pixel select-none backdrop-blur-md animate-slideUp">
      <div className="max-w-3xl mx-auto flex flex-col gap-1 sm:gap-2">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-1 mb-0.5">
          <div className="flex items-center gap-1">
            <span className="text-[9px] sm:text-[11px] text-yellow-400 font-bold tracking-wide">
              TECLADO VIRTUAL MINECRAFT
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Focus Native Keyboard Button */}
            <button
              type="button"
              onClick={onFocusNativeInput}
              className="mc-btn px-2 py-1 text-[9px] sm:text-xs text-emerald-300 flex items-center gap-1 hover:border-emerald-400"
              title="Abrir teclado do celular"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">CELULAR</span>
            </button>

            {/* Close Keyboard Button */}
            <button
              type="button"
              onClick={onClose}
              className="mc-btn p-1 text-slate-300 hover:text-red-400"
              title="Fechar teclado"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Powerups Bar above Keyboard */}
        <div className="grid grid-cols-4 gap-1 sm:gap-2 mb-1 bg-black/60 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => onTriggerPowerup('tnt_nuke')}
            disabled={powerups.tnt_nuke <= 0}
            className={`mc-btn py-1 text-[9px] sm:text-xs flex items-center justify-center gap-1 ${
              powerups.tnt_nuke > 0 ? 'text-red-400 border-red-900' : 'opacity-40'
            }`}
          >
            <Bomb className="w-3 h-3 text-red-500" />
            <span>TNT ({powerups.tnt_nuke})</span>
          </button>

          <button
            type="button"
            onClick={() => onTriggerPowerup('freeze_clock')}
            disabled={powerups.freeze_clock <= 0}
            className={`mc-btn py-1 text-[9px] sm:text-xs flex items-center justify-center gap-1 ${
              powerups.freeze_clock > 0 ? 'text-cyan-300 border-cyan-900' : 'opacity-40'
            }`}
          >
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>GELO ({powerups.freeze_clock})</span>
          </button>

          <button
            type="button"
            onClick={() => onTriggerPowerup('golden_apple')}
            disabled={powerups.golden_apple <= 0}
            className={`mc-btn py-1 text-[9px] sm:text-xs flex items-center justify-center gap-1 ${
              powerups.golden_apple > 0 ? 'text-yellow-300 border-yellow-900' : 'opacity-40'
            }`}
          >
            <Sparkles className="w-3 h-3 text-yellow-400" />
            <span>MAÇÃ ({powerups.golden_apple})</span>
          </button>

          <button
            type="button"
            onClick={() => onTriggerPowerup('redstone_laser')}
            disabled={powerups.redstone_laser <= 0}
            className={`mc-btn py-1 text-[9px] sm:text-xs flex items-center justify-center gap-1 ${
              powerups.redstone_laser > 0 ? 'text-red-400 border-red-900' : 'opacity-40'
            }`}
          >
            <Zap className="w-3 h-3 text-red-500" />
            <span>RAIO ({powerups.redstone_laser})</span>
          </button>
        </div>

        {/* Row 1: QWERTY... */}
        <div className="flex justify-center gap-0.5 sm:gap-1.5 w-full">
          {ROW_1.map((char) => (
            <button
              key={`key_${char}`}
              type="button"
              onClick={() => handleKeyClick(char)}
              className="mc-btn flex-1 h-9 sm:h-11 text-xs sm:text-sm font-bold text-white hover:text-yellow-300 active:scale-95 transition-transform flex items-center justify-center min-w-[26px] max-w-[48px]"
            >
              {char}
            </button>
          ))}
        </div>

        {/* Row 2: ASDF... */}
        <div className="flex justify-center gap-0.5 sm:gap-1.5 w-full">
          {ROW_2.map((char) => (
            <button
              key={`key_${char}`}
              type="button"
              onClick={() => handleKeyClick(char)}
              className="mc-btn flex-1 h-9 sm:h-11 text-xs sm:text-sm font-bold text-white hover:text-yellow-300 active:scale-95 transition-transform flex items-center justify-center min-w-[26px] max-w-[48px]"
            >
              {char}
            </button>
          ))}
        </div>

        {/* Row 3: ZXCV... + Backspace */}
        <div className="flex justify-center gap-0.5 sm:gap-1.5 w-full">
          {ROW_3.map((char) => (
            <button
              key={`key_${char}`}
              type="button"
              onClick={() => handleKeyClick(char)}
              className="mc-btn flex-1 h-9 sm:h-11 text-xs sm:text-sm font-bold text-white hover:text-yellow-300 active:scale-95 transition-transform flex items-center justify-center min-w-[26px] max-w-[48px]"
            >
              {char}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleKeyClick('Backspace')}
            className="mc-btn flex-[1.5] h-9 sm:h-11 text-xs text-red-300 hover:text-red-200 active:scale-95 transition-transform flex items-center justify-center gap-1 min-w-[42px]"
            title="Apagar / Cancelar Miras"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        {/* Accents Row: Á É Í Ó Ú Ã Õ Â Ê */}
        <div className="flex justify-center gap-0.5 sm:gap-1.5 w-full overflow-x-auto">
          {ROW_ACCENTS.map((char) => (
            <button
              key={`key_${char}`}
              type="button"
              onClick={() => handleKeyClick(char)}
              className="mc-btn px-1.5 sm:px-2.5 h-8 sm:h-9 text-[11px] sm:text-xs font-bold text-emerald-300 hover:text-yellow-300 active:scale-95 transition-transform flex items-center justify-center"
            >
              {char}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleKeyClick(' ')}
            className="mc-btn px-3 h-8 sm:h-9 text-[11px] sm:text-xs text-slate-200 flex items-center justify-center gap-1"
          >
            <Space className="w-3.5 h-3.5" />
            <span>ESPAÇO</span>
          </button>
        </div>
      </div>
    </div>
  );
};

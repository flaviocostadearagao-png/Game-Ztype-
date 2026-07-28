/**
 * Game Overlays: Start Menu, Game Over, Pause Screen, and Stats Summary
 */

import React, { useState, useEffect } from 'react';
import { GameStatus, Difficulty, GameStats, GameSettings } from '../types';
import { Play, RotateCcw, Settings, Trophy, Shield, HelpCircle, BookOpen, Volume2 } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface GameOverlayProps {
  status: GameStatus;
  stats: GameStats;
  settings: GameSettings;
  onStartGame: (difficulty?: Difficulty) => void;
  onResumeGame: () => void;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onOpenWordListModal: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  status,
  stats,
  settings,
  onStartGame,
  onResumeGame,
  onUpdateSettings,
  onOpenWordListModal,
}) => {
  const [highScore, setHighScore] = useState<number>(0);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mine_type_high_score');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  // Update high score on game over
  useEffect(() => {
    if (status === 'GAMEOVER') {
      if (stats.score > highScore) {
        setHighScore(stats.score);
        localStorage.setItem('mine_type_high_score', stats.score.toString());
      }
    }
  }, [status, stats.score, highScore]);

  // Rank badge title based on WPM & Score
  const getRankBadge = () => {
    if (stats.wpm >= 60 || stats.score >= 5000) return 'Mestre do Diamante 💎';
    if (stats.wpm >= 40 || stats.score >= 2500) return 'Engenheiro de Redstone ⚡';
    if (stats.wpm >= 25 || stats.score >= 1000) return 'Minerador Experiente ⛏️';
    return 'Sobrevivente Novato 🌿';
  };

  if (status === 'PLAYING') return null;

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex items-center justify-center p-4 font-pixel select-none">
      {/* 1. START MENU OVERLAY */}
      {status === 'MENU' && (
        <div className="mc-panel-dark max-w-xl w-full p-6 sm:p-8 flex flex-col items-center text-center space-y-6">
          {/* Logo Title */}
          <div className="space-y-2">
            <div className="inline-block bg-emerald-800 text-emerald-200 text-[10px] px-3 py-1 border border-emerald-500 uppercase tracking-widest font-bold">
              ESTILO ZTYPE 2D VOXEL
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-300 text-pixel-shadow tracking-wider">
              MINECRAFT TYPING DEFENSE
            </h1>
            <p className="text-xs text-slate-300 font-silkscreen">
              Digite as palavras em português antes que os blocos atinjam o solo!
            </p>
          </div>

          {/* Difficulty Selector Buttons */}
          <div className="w-full space-y-2">
            <label className="text-xs text-slate-400 block font-bold">DIFICULDADE DO JOGO:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['easy', 'normal', 'hard', 'hardcore'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => onUpdateSettings({ difficulty: d })}
                  className={`mc-btn py-2 text-[10px] uppercase font-bold transition-all ${
                    settings.difficulty === d ? 'mc-btn-primary text-white ring-2 ring-yellow-400' : 'text-slate-200'
                  }`}
                >
                  {d === 'easy' ? 'Pacífico' : d === 'normal' ? 'Normal' : d === 'hard' ? 'Difícil' : 'Hardcore'}
                </button>
              ))}
            </div>
          </div>

          {/* Settings Options Checkboxes */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300 bg-black/40 p-3 border border-slate-700 w-full">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.forgiveAccents}
                onChange={(e) => onUpdateSettings({ forgiveAccents: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
              <span>Perdoar Acentos (ex: 'C' para 'Ç')</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.crtFilter}
                onChange={(e) => onUpdateSettings({ crtFilter: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
              <span>Filtro CRT Retro</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => onStartGame()}
              className="mc-btn mc-btn-primary flex-1 py-4 text-sm text-yellow-200 font-bold flex items-center justify-center gap-2 tracking-wider"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>JOGAR AGORA</span>
            </button>
            <button
              onClick={onOpenWordListModal}
              className="mc-btn py-4 px-4 text-xs text-slate-200 flex items-center justify-center gap-2"
              title="Ver Dicionário de Palavras em Português"
            >
              <BookOpen className="w-4 h-4" />
              <span>DICIONÁRIO</span>
            </button>
          </div>

          {/* High Score Banner */}
          <div className="flex items-center gap-2 text-xs text-yellow-400">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>RECORDE: <strong className="text-white">{highScore} PONTOS</strong></span>
          </div>
        </div>
      )}

      {/* 2. GAME OVER OVERLAY */}
      {status === 'GAMEOVER' && (
        <div className="mc-panel-dark max-w-lg w-full p-6 sm:p-8 flex flex-col items-center text-center space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-red-500 text-pixel-shadow tracking-wider">
              FIM DE JOGO!
            </h2>
            <p className="text-xs text-slate-400">SEU MUNDO FOI ATINGIDO PELOS BLOCOS!</p>
          </div>

          {/* Rank Badge */}
          <div className="bg-emerald-950/80 border-2 border-emerald-500 px-4 py-2 text-xs text-emerald-300 font-bold tracking-wide">
            CLASSIFICAÇÃO: {getRankBadge()}
          </div>

          {/* End-Game Stats Grid */}
          <div className="grid grid-cols-2 gap-3 w-full text-left text-xs bg-black/60 p-4 border-2 border-slate-800">
            <div className="space-y-1">
              <span className="text-slate-400 block text-[10px]">PONTUAÇÃO FINAL</span>
              <span className="text-yellow-400 text-lg font-bold">{stats.score}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 block text-[10px]">PALAVRAS / MINUTO (WPM)</span>
              <span className="text-cyan-400 text-lg font-bold">{stats.wpm} WPM</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 block text-[10px]">PRECISÃO DE DIGITAÇÃO</span>
              <span className="text-emerald-400 text-lg font-bold">{stats.accuracy}%</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 block text-[10px]">MAIOR COMBO</span>
              <span className="text-orange-400 text-lg font-bold">x{stats.maxCombo}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 block text-[10px]">PALAVRAS COMPLETAS</span>
              <span className="text-white text-sm font-bold">{stats.wordsTyped}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 block text-[10px]">NÍVEL ALCANÇADO</span>
              <span className="text-yellow-300 text-sm font-bold">Nível {stats.level}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={() => onStartGame()}
              className="mc-btn mc-btn-primary flex-1 py-3 text-xs text-yellow-200 font-bold flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>JOGAR NOVAMENTE</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. PAUSE OVERLAY */}
      {status === 'PAUSED' && (
        <div className="mc-panel-dark max-w-md w-full p-6 flex flex-col items-center text-center space-y-6">
          <h2 className="text-2xl font-bold text-yellow-300 text-pixel-shadow">
            JOGO PAUSADO
          </h2>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={onResumeGame}
              className="mc-btn mc-btn-primary py-3 text-xs text-yellow-200 font-bold flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>CONTINUAR JOGO</span>
            </button>
            <button
              onClick={() => onStartGame()}
              className="mc-btn py-3 text-xs text-slate-200 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>REINICIAR</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

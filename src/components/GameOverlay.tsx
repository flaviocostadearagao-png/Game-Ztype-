/**
 * Game Overlays: Start Menu, Firebase Global Leaderboard, Game Over, and Pause Screen
 */

import React, { useState, useEffect } from 'react';
import { GameStatus, Difficulty, GameStats, GameSettings } from '../types';
import { Play, RotateCcw, Trophy, BookOpen, User, RefreshCw, Crown, Send, CheckCircle2, Flame, Award, Sparkles, Home } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { getGlobalLeaderboard, saveScoreToFirebase, LeaderboardEntry } from '../lib/firebase';

interface GameOverlayProps {
  status: GameStatus;
  stats: GameStats;
  settings: GameSettings;
  onStartGame: (difficulty?: Difficulty) => void;
  onResumeGame: () => void;
  onGoToMenu: () => void;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onOpenWordListModal: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  status,
  stats,
  settings,
  onStartGame,
  onResumeGame,
  onGoToMenu,
  onUpdateSettings,
  onOpenWordListModal,
}) => {
  const [activeTab, setActiveTab] = useState<'PLAY' | 'LEADERBOARD'>('PLAY');
  const [playerName, setPlayerName] = useState<string>('Steve');
  const [highScore, setHighScore] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(false);
  const [hasSubmittedScore, setHasSubmittedScore] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load saved player name and local high score
  useEffect(() => {
    const savedName = localStorage.getItem('mine_type_player_name');
    if (savedName) setPlayerName(savedName);

    const savedScore = localStorage.getItem('mine_type_high_score');
    if (savedScore) setHighScore(parseInt(savedScore, 10));
  }, []);

  // Save player name when changed
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, 16); // max 16 chars
    setPlayerName(val);
    localStorage.setItem('mine_type_player_name', val);
  };

  // Fetch Firebase leaderboard when switching tabs or loading
  const fetchLeaderboard = async () => {
    setIsLoadingLeaderboard(true);
    try {
      const data = await getGlobalLeaderboard(10);
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to load firebase leaderboard:', err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    if (status === 'MENU' && activeTab === 'LEADERBOARD') {
      fetchLeaderboard();
    }
  }, [status, activeTab]);

  // Reset submit state on new game
  useEffect(() => {
    if (status === 'GAMEOVER') {
      setHasSubmittedScore(false);
      // Auto-update local high score
      if (stats.score > highScore) {
        setHighScore(stats.score);
        localStorage.setItem('mine_type_high_score', stats.score.toString());
      }
    }
  }, [status, stats.score, highScore]);

  // Submit score to Firebase
  const handleSubmitScore = async () => {
    if (hasSubmittedScore || isSubmitting || stats.score <= 0) return;
    setIsSubmitting(true);
    soundEngine.playExpOrb();

    const success = await saveScoreToFirebase({
      playerName: playerName.trim() || 'Steve',
      score: stats.score,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      difficulty: settings.difficulty,
      levelReached: stats.level,
    });

    setIsSubmitting(false);
    if (success) {
      setHasSubmittedScore(true);
      soundEngine.playLevelUp();
    }
  };

  // Rank badge title based on WPM & Score
  const getRankBadge = () => {
    if (stats.wpm >= 60 || stats.score >= 5000) return 'Mestre do Diamante 💎';
    if (stats.wpm >= 40 || stats.score >= 2500) return 'Engenheiro de Redstone ⚡';
    if (stats.wpm >= 25 || stats.score >= 1000) return 'Minerador Experiente ⛏️';
    return 'Sobrevivente Novato 🌿';
  };

  if (status === 'PLAYING') return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex items-center justify-center p-3 sm:p-4 font-pixel select-none overflow-y-auto"
    >
      {/* 1. START MENU OVERLAY */}
      {status === 'MENU' && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mc-panel-dark max-w-xl w-full p-4 sm:p-7 flex flex-col items-center text-center space-y-5 animate-fadeIn"
        >
          {/* Logo Title */}
          <div className="space-y-1.5 w-full">
            <div className="inline-flex items-center gap-1.5 bg-emerald-900/80 text-emerald-300 text-[10px] px-3 py-1 border border-emerald-500 uppercase tracking-widest font-bold rounded-none">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              ESTILO ZTYPE 2D VOXEL
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-300 text-pixel-shadow tracking-wider">
              MINECRAFT TYPING DEFENSE
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300 font-silkscreen">
              Digite as palavras em português antes que os blocos atinjam o solo!
            </p>
          </div>

          {/* Navigation Tabs (JOGAR vs RANKING GERAL) */}
          <div className="flex border-b-2 border-slate-700 w-full">
            <button
              type="button"
              onClick={() => {
                setActiveTab('PLAY');
                soundEngine.playClick();
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase transition-all border-b-4 flex items-center justify-center gap-1.5 ${
                activeTab === 'PLAY'
                  ? 'border-yellow-400 text-yellow-300 bg-yellow-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>JOGAR</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('LEADERBOARD');
                soundEngine.playClick();
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase transition-all border-b-4 flex items-center justify-center gap-1.5 ${
                activeTab === 'LEADERBOARD'
                  ? 'border-yellow-400 text-yellow-300 bg-yellow-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>RANKING GERAL (FIREBASE)</span>
            </button>
          </div>

          {/* TAB 1: PLAY & SETTINGS */}
          {activeTab === 'PLAY' && (
            <div className="w-full space-y-4">
              {/* Player Nickname Input */}
              <div className="bg-black/60 p-3 border-2 border-slate-700 text-left space-y-1.5">
                <label className="text-[10px] sm:text-xs text-yellow-300 font-bold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-yellow-400" />
                  <span>SEU NICKNAME MINECRAFT:</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={playerName}
                    onChange={handleNameChange}
                    placeholder="Steve"
                    maxLength={16}
                    className="w-full bg-slate-900 border-2 border-slate-600 px-3 py-1.5 text-sm text-emerald-300 font-bold focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              {/* Difficulty Selector Buttons */}
              <div className="w-full space-y-1.5 text-left">
                <label className="text-[10px] sm:text-xs text-slate-300 font-bold block">
                  DIFICULDADE DO JOGO:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['easy', 'normal', 'hard', 'hardcore'] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        onUpdateSettings({ difficulty: d });
                        soundEngine.playClick();
                      }}
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
              <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-1">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playLevelUp();
                    onStartGame(settings.difficulty);
                  }}
                  className="mc-btn mc-btn-primary flex-1 py-3.5 text-sm text-yellow-200 font-bold flex items-center justify-center gap-2 tracking-wider"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>JOGAR AGORA</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenWordListModal();
                  }}
                  className="mc-btn py-3.5 px-4 text-xs text-slate-200 flex items-center justify-center gap-2"
                  title="Ver Dicionário de Palavras em Português"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>DICIONÁRIO</span>
                </button>
              </div>

              {/* Local High Score Banner */}
              <div className="flex items-center justify-center gap-2 text-xs text-yellow-400 pt-1">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>SEU RECORDE PESSOAL: <strong className="text-white">{highScore} PONTOS</strong></span>
              </div>
            </div>
          )}

          {/* TAB 2: FIREBASE GLOBAL LEADERBOARD */}
          {activeTab === 'LEADERBOARD' && (
            <div className="w-full space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div className="text-xs text-yellow-300 font-bold flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span>TOP 10 SOBREVIVENTES GLOBAIS</span>
                </div>
                <button
                  type="button"
                  onClick={fetchLeaderboard}
                  disabled={isLoadingLeaderboard}
                  className="mc-btn p-1.5 text-slate-300 hover:text-yellow-300 flex items-center gap-1 text-[10px]"
                  title="Atualizar Ranking"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLeaderboard ? 'animate-spin text-yellow-400' : ''}`} />
                  <span className="hidden sm:inline">ATUALIZAR</span>
                </button>
              </div>

              {/* Leaderboard Table */}
              <div className="bg-black/70 border-2 border-slate-700 overflow-hidden">
                {isLoadingLeaderboard ? (
                  <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                    <span>Carregando dados do Firebase Firestore...</span>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                    <Flame className="w-6 h-6 text-orange-400 mx-auto" />
                    <p>Nenhuma pontuação registrada ainda!</p>
                    <p className="text-[10px] text-slate-500">Seja o primeiro a jogar e registrar seu recorde no Firebase.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800 text-xs">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-slate-900 text-[10px] text-slate-400 font-bold uppercase">
                      <span className="col-span-2 text-center">#</span>
                      <span className="col-span-4">JOGADOR</span>
                      <span className="col-span-3 text-right">PONTOS</span>
                      <span className="col-span-3 text-right">WPM</span>
                    </div>

                    {/* Score Rows */}
                    {leaderboard.map((entry, index) => {
                      const isTop1 = index === 0;
                      const isTop2 = index === 1;
                      const isTop3 = index === 2;

                      let rankBadgeClass = 'text-slate-400';
                      let rankIcon = `#${index + 1}`;

                      if (isTop1) {
                        rankBadgeClass = 'text-yellow-300 font-bold';
                        rankIcon = '👑 #1';
                      } else if (isTop2) {
                        rankBadgeClass = 'text-slate-200 font-bold';
                        rankIcon = '🥈 #2';
                      } else if (isTop3) {
                        rankBadgeClass = 'text-amber-600 font-bold';
                        rankIcon = '🥉 #3';
                      }

                      return (
                        <div
                          key={entry.id || index}
                          className={`grid grid-cols-12 gap-1 px-3 py-2 items-center hover:bg-slate-800/60 transition-colors ${
                            isTop1 ? 'bg-yellow-950/20' : ''
                          }`}
                        >
                          <span className={`col-span-2 text-center text-[10px] ${rankBadgeClass}`}>
                            {rankIcon}
                          </span>
                          <span className="col-span-4 font-bold text-white truncate text-[11px]">
                            {entry.playerName}
                          </span>
                          <span className="col-span-3 text-right font-bold text-yellow-400">
                            {entry.score}
                          </span>
                          <span className="col-span-3 text-right text-cyan-300 font-mono text-[10px]">
                            {entry.wpm} WPM
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. GAME OVER OVERLAY */}
      {status === 'GAMEOVER' && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mc-panel-dark max-w-lg w-full p-6 sm:p-8 flex flex-col items-center text-center space-y-5 animate-fadeIn"
        >
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-red-500 text-pixel-shadow tracking-wider">
              FIM DE JOGO!
            </h2>
            <p className="text-xs text-slate-400">SEU MUNDO FOI ATINGIDO PELOS BLOCOS!</p>
          </div>

          {/* Rank Badge */}
          <div className="bg-emerald-950/80 border-2 border-emerald-500 px-4 py-2 text-xs text-emerald-300 font-bold tracking-wide flex items-center justify-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>CLASSIFICAÇÃO: {getRankBadge()}</span>
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

          {/* Firebase Score Submission Section */}
          <div className="w-full bg-black/60 p-3 border-2 border-slate-700 flex flex-col items-center gap-2">
            {!hasSubmittedScore && (
              <div className="w-full text-left space-y-1">
                <label className="text-[10px] text-yellow-300 font-bold flex items-center gap-1">
                  <User className="w-3 h-3 text-yellow-400" />
                  <span>SEU NICKNAME NO RANKING:</span>
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={handleNameChange}
                  placeholder="Steve"
                  maxLength={16}
                  className="w-full bg-slate-900 border border-slate-600 px-2.5 py-1 text-xs text-emerald-300 font-bold focus:outline-none focus:border-yellow-400"
                />
              </div>
            )}

            {hasSubmittedScore ? (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold py-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>PONTUAÇÃO ENVIADA PARA O RANKING FIREBASE! 🎉</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSubmitScore}
                disabled={isSubmitting || stats.score <= 0}
                className="mc-btn w-full py-2.5 text-xs text-yellow-300 border-yellow-500 hover:border-yellow-300 font-bold flex items-center justify-center gap-2 mt-1"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-yellow-400" />
                ) : (
                  <Send className="w-4 h-4 text-yellow-400" />
                )}
                <span>ENVIAR PARA O RANKING GERAL ({playerName || 'Steve'})</span>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 w-full">
            <button
              type="button"
              onClick={() => {
                soundEngine.playLevelUp();
                onStartGame();
              }}
              className="mc-btn mc-btn-primary flex-1 py-3 text-xs text-yellow-200 font-bold flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>INICIAR NOVA PARTIDA</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onGoToMenu();
              }}
              className="mc-btn flex-1 py-3 text-xs text-slate-200 font-bold flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-yellow-400" />
              <span>MENU INICIAL</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. PAUSE OVERLAY */}
      {status === 'PAUSED' && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mc-panel-dark max-w-md w-full p-6 flex flex-col items-center text-center space-y-6"
        >
          <h2 className="text-2xl font-bold text-yellow-300 text-pixel-shadow">
            JOGO PAUSADO
          </h2>
          <div className="flex flex-col gap-3 w-full">
            <button
              type="button"
              onClick={onResumeGame}
              className="mc-btn mc-btn-primary py-3 text-xs text-yellow-200 font-bold flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>CONTINUAR JOGO</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playLevelUp();
                onStartGame();
              }}
              className="mc-btn py-3 text-xs text-slate-200 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>REINICIAR PARTIDA</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onGoToMenu();
              }}
              className="mc-btn py-3 text-xs text-slate-200 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-yellow-400" />
              <span>VOLTAR AO MENU INICIAL</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


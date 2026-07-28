/**
 * Modal to view and explore Portuguese vocabulary words used in game
 */

import React, { useState } from 'react';
import {
  PORTUGUESE_WORDS_EASY,
  PORTUGUESE_WORDS_MEDIUM,
  PORTUGUESE_WORDS_HARD,
  MINECRAFT_BOSS_WORDS
} from '../data/words';
import { X, Search, BookOpen, Layers } from 'lucide-react';

interface WordListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WordListModal: React.FC<WordListModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'easy' | 'medium' | 'hard' | 'boss'>('easy');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const wordMap = {
    easy: PORTUGUESE_WORDS_EASY,
    medium: PORTUGUESE_WORDS_MEDIUM,
    hard: PORTUGUESE_WORDS_HARD,
    boss: MINECRAFT_BOSS_WORDS,
  };

  const currentWords = wordMap[activeTab].filter((w) =>
    w.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-pixel select-none">
      <div className="mc-panel-dark max-w-2xl w-full p-6 relative flex flex-col max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 mc-btn p-2 text-slate-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-yellow-400" />
          <h2 className="text-lg font-bold text-yellow-300 text-pixel-shadow">
            DICIONÁRIO DE PALAVRAS DO JOGO
          </h2>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-slate-700 mb-4 text-xs">
          <button
            onClick={() => setActiveTab('easy')}
            className={`px-4 py-2 font-bold ${
              activeTab === 'easy'
                ? 'border-b-2 border-emerald-400 text-emerald-400 bg-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            FÁCIL (3-5 LETRAS)
          </button>
          <button
            onClick={() => setActiveTab('medium')}
            className={`px-4 py-2 font-bold ${
              activeTab === 'medium'
                ? 'border-b-2 border-yellow-400 text-yellow-400 bg-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            MÉDIO (6-8 LETRAS)
          </button>
          <button
            onClick={() => setActiveTab('hard')}
            className={`px-4 py-2 font-bold ${
              activeTab === 'hard'
                ? 'border-b-2 border-orange-400 text-orange-400 bg-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DIFÍCIL (9+ LETRAS)
          </button>
          <button
            onClick={() => setActiveTab('boss')}
            className={`px-4 py-2 font-bold ${
              activeTab === 'boss'
                ? 'border-b-2 border-red-500 text-red-500 bg-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CHEFÕES / ESPACIAIS
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar palavra..."
            className="w-full bg-black/60 border border-slate-700 pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
          />
        </div>

        {/* Word Grid Container */}
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {currentWords.map((word, idx) => (
            <div
              key={`${word}_${idx}`}
              className="bg-black/50 border border-slate-800 px-3 py-2 text-xs text-slate-200 flex items-center justify-between hover:border-slate-600"
            >
              <span className="font-pixel text-yellow-200">{word}</span>
              <span className="text-[9px] text-slate-500">{word.length}L</span>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 text-center">
          Total de palavras nesta categoria: {currentWords.length}
        </div>
      </div>
    </div>
  );
};

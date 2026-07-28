/**
 * Game Types for Minecraft Typing Defense (ZType Voxel Edition)
 */

export type BlockType = 
  | 'dirt'
  | 'stone'
  | 'coal'
  | 'iron'
  | 'gold'
  | 'redstone'
  | 'lapis'
  | 'diamond'
  | 'emerald'
  | 'obsidian'
  | 'tnt'
  | 'creeper'
  | 'netherrack'
  | 'ender_dragon';

export interface EnemyBlock {
  id: string;
  word: string;             // Original word (e.g., 'MINERAÇÃO' or 'DIAMANTE')
  normalizedWord: string;   // Normalized version without accents for flexible typing (e.g. 'MINERACAO')
  typedIndex: number;       // How many characters have been typed so far
  x: number;                // Center X coordinate
  y: number;                // Center Y coordinate
  speed: number;            // Falling speed in px/frame
  type: BlockType;          // Visual block texture type
  hp: number;               // Remaining characters/hits required
  maxHp: number;            // Total length/hits
  points: number;           // XP/Score awarded on destruction
  width: number;            // Visual box width
  height: number;           // Visual box height
  shakeAmount: number;      // Hit impact shake animation
  targetLock: boolean;      // True if player is currently targeting this block
  isBoss?: boolean;         // Boss block flag
}

export interface LaserBeam {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number;        // 0 to 1
  color: string;           // Cyan (#00ffff), Red (#ff2200), Gold (#ffaa00), Green (#00ff44)
  width: number;
  duration: number;        // Total frames to show laser
  charTyped: string;       // Character typed to fire this shot
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  gravity: number;
  shape: 'cube' | 'pixel' | 'spark';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
  scale: number;
  isCritical?: boolean;
}

export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';

export type Difficulty = 'easy' | 'normal' | 'hard' | 'hardcore';

export type Biome = 'overworld_night' | 'nether' | 'the_end' | 'deep_dark';

export type PowerUpType = 'tnt_nuke' | 'freeze_clock' | 'golden_apple' | 'redstone_laser';

export interface PowerUpInventory {
  tnt_nuke: number;         // Destroys all currently active blocks
  freeze_clock: number;     // Freezes falling blocks for 5 seconds
  golden_apple: number;     // Restores 3 full hearts
  redstone_laser: number;   // Auto-types current target word
}

export interface GameStats {
  score: number;
  level: number;
  wave: number;
  wordsTyped: number;
  lettersTyped: number;
  mistakes: number;
  wpm: number;
  accuracy: number;
  combo: number;
  maxCombo: number;
  blocksDestroyed: number;
  startTime: number;
  elapsedSeconds: number;
}

export interface HighScoreRecord {
  id: string;
  date: string;
  score: number;
  wpm: number;
  accuracy: number;
  difficulty: Difficulty;
  levelReached: number;
}

export interface AudioSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number;        // 0 to 1
  musicVolume: number;      // 0 to 1
}

export interface GameSettings {
  difficulty: Difficulty;
  forgiveAccents: boolean;  // If true, typing 'C' matches 'Ç', 'A' matches 'Ã', etc.
  crtFilter: boolean;       // CRT scanline shader toggle
  particleDensity: 'low' | 'medium' | 'high';
  customWordsOnly: boolean;
}

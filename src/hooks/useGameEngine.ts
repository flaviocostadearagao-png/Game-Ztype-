/**
 * Main Game Engine Hook for Minecraft Typing Defense
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  EnemyBlock,
  LaserBeam,
  Particle,
  FloatingText,
  GameStatus,
  Difficulty,
  Biome,
  GameStats,
  PowerUpInventory,
  GameSettings,
  BlockType
} from '../types';
import { getRandomWord, isCharMatch } from '../data/words';
import { soundEngine } from '../utils/audio';

const INITIAL_STATS: GameStats = {
  score: 0,
  level: 1,
  wave: 1,
  wordsTyped: 0,
  lettersTyped: 0,
  mistakes: 0,
  wpm: 0,
  accuracy: 100,
  combo: 0,
  maxCombo: 0,
  blocksDestroyed: 0,
  startTime: 0,
  elapsedSeconds: 0,
};

const INITIAL_POWERUPS: PowerUpInventory = {
  tnt_nuke: 1,
  freeze_clock: 1,
  golden_apple: 1,
  redstone_laser: 1,
};

const BLOCK_TYPES: BlockType[] = [
  'dirt', 'stone', 'coal', 'iron', 'gold', 
  'redstone', 'lapis', 'diamond', 'emerald', 'obsidian', 'tnt', 'creeper'
];

export function useGameEngine(
  canvasWidth: number = 800,
  canvasHeight: number = 600,
  settings: GameSettings = {
    difficulty: 'normal',
    forgiveAccents: true,
    crtFilter: false,
    particleDensity: 'medium',
    customWordsOnly: false,
  }
) {
  const [status, setStatus] = useState<GameStatus>('MENU');
  const [hearts, setHearts] = useState<number>(10);
  const maxHearts = settings.difficulty === 'hardcore' ? 1 : 10;

  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [powerups, setPowerups] = useState<PowerUpInventory>(INITIAL_POWERUPS);
  const [biome, setBiome] = useState<Biome>('overworld_night');

  const [enemyBlocks, setEnemyBlocks] = useState<EnemyBlock[]>([]);
  const [currentTargetId, setCurrentTargetId] = useState<string | null>(null);
  const [isVirtualKeyboardOpen, setIsVirtualKeyboardOpen] = useState<boolean>(true);

  const [lasers, setLasers] = useState<LaserBeam[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  const isFrozenRef = useRef<boolean>(false);
  const freezeTimerRef = useRef<number | null>(null);

  // Refs for animation frame loop to avoid stale closure state
  const blocksRef = useRef<EnemyBlock[]>(enemyBlocks);
  blocksRef.current = enemyBlocks;

  const targetIdRef = useRef<string | null>(currentTargetId);
  targetIdRef.current = currentTargetId;

  const statsRef = useRef<GameStats>(stats);
  statsRef.current = stats;

  const statusRef = useRef<GameStatus>(status);
  statusRef.current = status;

  const heartsRef = useRef<number>(hearts);
  heartsRef.current = hearts;

  const powerupsRef = useRef<PowerUpInventory>(powerups);
  powerupsRef.current = powerups;

  // Wave Manager Spawner Timer
  const lastSpawnTimeRef = useRef<number>(0);
  const waveBlocksSpawnedRef = useRef<number>(0);
  const waveTotalBlocksRef = useRef<number>(6);

  // Calculate Steve position at bottom center of the active canvas area
  const stevePos = {
    x: canvasWidth / 2,
    y: Math.max(80, canvasHeight - 45),
  };

  /**
   * Start New Game
   */
  const startGame = useCallback((selectedDifficulty?: Difficulty) => {
    const diff = selectedDifficulty || settings.difficulty;
    const initialHp = diff === 'hardcore' ? 1 : 10;

    setHearts(initialHp);
    setStats({
      ...INITIAL_STATS,
      startTime: Date.now(),
    });
    setPowerups({ ...INITIAL_POWERUPS });
    setEnemyBlocks([]);
    setCurrentTargetId(null);
    setLasers([]);
    setParticles([]);
    setFloatingTexts([]);
    setBiome('overworld_night');
    setStatus('PLAYING');
    setIsVirtualKeyboardOpen(true);

    lastSpawnTimeRef.current = Date.now();
    waveBlocksSpawnedRef.current = 0;
    waveTotalBlocksRef.current = 6;
    isFrozenRef.current = false;

    soundEngine.playLevelUp();
    soundEngine.startAmbientMusic();
  }, [settings.difficulty]);

  /**
   * Pause / Resume Game
   */
  const togglePause = useCallback(() => {
    setStatus((prev) => {
      if (prev === 'PLAYING') {
        soundEngine.stopAmbientMusic();
        return 'PAUSED';
      } else if (prev === 'PAUSED') {
        soundEngine.startAmbientMusic();
        return 'PLAYING';
      }
      return prev;
    });
  }, []);

  /**
   * Spawn a new falling Minecraft block
   */
  const spawnBlock = useCallback(() => {
    const level = statsRef.current.level;
    const word = getRandomWord(level);

    // Pick block type based on level
    let type: BlockType = 'dirt';
    if (level === 1) {
      type = Math.random() > 0.5 ? 'dirt' : 'stone';
    } else if (level <= 3) {
      type = BLOCK_TYPES[Math.floor(Math.random() * 5)]; // dirt, stone, coal, iron, gold
    } else if (level <= 6) {
      type = BLOCK_TYPES[Math.floor(Math.random() * 9)]; // + redstone, lapis, diamond, emerald
    } else {
      type = BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)];
    }

    // Speeds scale with level & difficulty
    let baseSpeed = 0.4 + level * 0.12;
    if (settings.difficulty === 'easy') baseSpeed *= 0.75;
    if (settings.difficulty === 'hard' || settings.difficulty === 'hardcore') baseSpeed *= 1.35;

    const blockWidth = 56;
    const blockHeight = 56;

    // Ensure safe margin away from canvas edges
    const minX = 60;
    const maxX = Math.max(minX + 50, canvasWidth - 60);
    const spawnX = minX + Math.random() * (maxX - minX);

    const newBlock: EnemyBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      word: word,
      normalizedWord: word,
      typedIndex: 0,
      x: spawnX,
      y: -50,
      speed: baseSpeed,
      type: type,
      hp: word.length,
      maxHp: word.length,
      points: word.length * 20 + level * 10,
      width: blockWidth,
      height: blockHeight,
      shakeAmount: 0,
      targetLock: false,
    };

    setEnemyBlocks((prev) => [...prev, newBlock]);
    waveBlocksSpawnedRef.current += 1;
  }, [canvasWidth, settings.difficulty]);

  /**
   * Handle Player Hurt when block reaches ground
   */
  const handleBlockReachBottom = useCallback((block: EnemyBlock) => {
    soundEngine.playHurt();
    soundEngine.playExplosion();

    // Damage based on block type
    const damage = block.type === 'creeper' || block.type === 'tnt' ? 2 : 1;
    setHearts((prev) => {
      const nextHp = Math.max(0, prev - damage);
      if (nextHp === 0) {
        setStatus('GAMEOVER');
        soundEngine.stopAmbientMusic();
      }
      return nextHp;
    });

    // Reset combo
    setStats((prev) => ({
      ...prev,
      combo: 0,
      mistakes: prev.mistakes + 1,
    }));

    // Spawn explosion particles
    spawnBlockExplosion(block.x, canvasHeight - 40, '#d92b2b', 24);

    // If this was targeted, unlock target
    if (targetIdRef.current === block.id) {
      setCurrentTargetId(null);
    }
  }, [canvasHeight]);

  /**
   * Spawn Particle Explosion
   */
  const spawnBlockExplosion = (x: number, y: number, color: string, count: number = 16) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color,
        size: 3 + Math.floor(Math.random() * 5),
        life: 25 + Math.random() * 20,
        maxLife: 45,
        gravity: 0.25,
        shape: Math.random() > 0.5 ? 'cube' : 'pixel',
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  /**
   * Power-up Trigger Handlers
   */
  const triggerPowerup = useCallback((type: keyof PowerUpInventory) => {
    if (powerupsRef.current[type] <= 0 || statusRef.current !== 'PLAYING') return;

    // Deduct powerup charge
    setPowerups((prev) => ({ ...prev, [type]: prev[type] - 1 }));

    if (type === 'tnt_nuke') {
      soundEngine.playExplosion();
      // Explode all blocks!
      blocksRef.current.forEach((b) => {
        spawnBlockExplosion(b.x, b.y, '#d92b2b', 20);
      });
      setEnemyBlocks([]);
      setCurrentTargetId(null);
      setStats((prev) => ({ ...prev, score: prev.score + 300 }));
    } else if (type === 'freeze_clock') {
      soundEngine.playExpOrb();
      isFrozenRef.current = true;
      if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);
      freezeTimerRef.current = window.setTimeout(() => {
        isFrozenRef.current = false;
      }, 5000);
    } else if (type === 'golden_apple') {
      soundEngine.playLevelUp();
      setHearts((prev) => Math.min(maxHearts, prev + 3));
    } else if (type === 'redstone_laser') {
      // Auto-type current target or first block
      const currentTarget = blocksRef.current.find((b) => b.id === targetIdRef.current) || blocksRef.current[0];
      if (currentTarget) {
        soundEngine.playBlockBreak('redstone');
        spawnBlockExplosion(currentTarget.x, currentTarget.y, '#ff2200', 25);
        setEnemyBlocks((prev) => prev.filter((b) => b.id !== currentTarget.id));
        setCurrentTargetId(null);
        setStats((prev) => ({ ...prev, score: prev.score + 250, blocksDestroyed: prev.blocksDestroyed + 1 }));
      }
    }
  }, [maxHearts]);

  /**
   * Core Character Input Processor (Processes physical keys, virtual keys, and touch input)
   */
  const processInputKey = useCallback((key: string) => {
    if (statusRef.current !== 'PLAYING') return;

    // Hotkeys 1-4 for powerups
    if (key === '1') { triggerPowerup('tnt_nuke'); return; }
    if (key === '2') { triggerPowerup('freeze_clock'); return; }
    if (key === '3') { triggerPowerup('golden_apple'); return; }
    if (key === '4') { triggerPowerup('redstone_laser'); return; }

    // Backspace: clear current target lock
    if (key === 'Backspace') {
      if (targetIdRef.current) {
        soundEngine.playError();
        setCurrentTargetId(null);
        setEnemyBlocks((prev) => prev.map((b) => ({ ...b, targetLock: false, typedIndex: 0 })));
      }
      return;
    }

    if (key.length !== 1) return;

    const activeBlocks = blocksRef.current;
    if (activeBlocks.length === 0) return;

    // 1. Check current target first
    let targetToHit = activeBlocks.find((b) => b.id === targetIdRef.current);

    // Is current target matching key at current typedIndex?
    if (targetToHit && !isCharMatch(key, targetToHit.word[targetToHit.typedIndex || 0], settings.forgiveAccents)) {
      // Key doesn't match current target -> FREE TARGETING ("deixe livre")
      // Reset previous target's typed progress when switching away
      targetToHit = undefined;
    }

    // 2. If no current target or key didn't match current target, find ANY block matching key at its typedIndex
    if (!targetToHit) {
      // Find blocks matching key at b.typedIndex, sorted by Y descending (closest to ground first)
      const matchingBlocks = activeBlocks
        .filter((b) => isCharMatch(key, b.word[b.typedIndex || 0], settings.forgiveAccents))
        .sort((a, b) => b.y - a.y);

      if (matchingBlocks.length > 0) {
        targetToHit = matchingBlocks[0];
        setCurrentTargetId(targetToHit.id);
      }
    }

    if (targetToHit) {
      // MATCH FOUND!
      soundEngine.playTypeLaser();

      const currentTypedIdx = targetToHit.typedIndex || 0;
      const nextTypedIndex = currentTypedIdx + 1;
      const isComplete = nextTypedIndex >= targetToHit.word.length;

      // Fire Laser Beam
      const newLaser: LaserBeam = {
        id: `laser_${Date.now()}_${Math.random()}`,
        startX: stevePos.x,
        startY: stevePos.y - 30,
        endX: targetToHit.x,
        endY: targetToHit.y,
        progress: 0,
        color: '#00ffff',
        width: 4,
        duration: 6,
        charTyped: key.toUpperCase(),
      };
      setLasers((prev) => [...prev, newLaser]);

      // Hit particles at block
      spawnBlockExplosion(targetToHit.x, targetToHit.y, '#00ffff', 5);

      const activeTargetId = targetToHit.id;

      // Update Block state
      setEnemyBlocks((prev) =>
        prev.map((b) => {
          if (b.id === activeTargetId) {
            return {
              ...b,
              typedIndex: nextTypedIndex,
              shakeAmount: 6,
              targetLock: true,
            };
          }
          // Reset other blocks' targetLock when switching targets
          return { ...b, targetLock: false };
        })
      );

      // Update Stats & WPM
      setStats((prev) => {
        const nextLetters = prev.lettersTyped + 1;
        const nextCombo = prev.combo + 1;
        const nextMaxCombo = Math.max(prev.maxCombo, nextCombo);
        const elapsedMin = Math.max(0.1, (Date.now() - prev.startTime) / 60000);
        const calculatedWpm = Math.round((nextLetters / 5) / elapsedMin);
        const accuracy = Math.round((nextLetters / Math.max(1, nextLetters + prev.mistakes)) * 100);

        return {
          ...prev,
          lettersTyped: nextLetters,
          combo: nextCombo,
          maxCombo: nextMaxCombo,
          wpm: calculatedWpm,
          accuracy,
        };
      });

      // Block Destroyed Complete!
      if (isComplete) {
        soundEngine.playBlockBreak(targetToHit.type);

        // Calculate Combo Multiplier
        const currentCombo = statsRef.current.combo + 1;
        const comboMult = 1 + Math.floor(currentCombo / 5) * 0.5;
        const earnedXP = Math.round(targetToHit.points * comboMult);

        // Spawn large particle blast
        const blockColor = targetToHit.type === 'dirt' ? '#866043' :
                           targetToHit.type === 'diamond' ? '#00ffff' :
                           targetToHit.type === 'gold' ? '#fcee4b' :
                           targetToHit.type === 'redstone' ? '#ff2200' : '#737373';

        spawnBlockExplosion(targetToHit.x, targetToHit.y, blockColor, 22);

        // Spawn Floating XP/Score Text
        const newFloatingText: FloatingText = {
          id: `ft_${Date.now()}`,
          text: `+${earnedXP} XP!`,
          x: targetToHit.x,
          y: targetToHit.y - 15,
          color: '#00ff44',
          life: 35,
          maxLife: 35,
          scale: 1,
          isCritical: currentCombo >= 5,
        };
        setFloatingTexts((prev) => [...prev, newFloatingText]);

        // Remove block & Unlock Target
        setEnemyBlocks((prev) => prev.filter((b) => b.id !== activeTargetId));
        setCurrentTargetId(null);

        // Random chance for Powerup drop (12%)
        if (Math.random() < 0.12) {
          const types: (keyof PowerUpInventory)[] = ['tnt_nuke', 'freeze_clock', 'golden_apple', 'redstone_laser'];
          const drop = types[Math.floor(Math.random() * types.length)];
          setPowerups((prev) => ({ ...prev, [drop]: prev[drop] + 1 }));
          soundEngine.playExpOrb();
        }

        // Update Score & Check Level Up
        setStats((prev) => {
          const nextScore = prev.score + earnedXP;
          const nextWords = prev.wordsTyped + 1;
          const nextDestroyed = prev.blocksDestroyed + 1;

          // Check level transition (every 8 blocks destroyed)
          let nextLevel = prev.level;
          let nextWave = prev.wave;
          if (nextDestroyed % 8 === 0) {
            nextLevel += 1;
            nextWave += 1;
            soundEngine.playLevelUp();

            // Transition Biome as levels progress
            if (nextLevel === 4) setBiome('nether');
            if (nextLevel === 8) setBiome('the_end');
            if (nextLevel === 12) setBiome('deep_dark');
          }

          return {
            ...prev,
            score: nextScore,
            wordsTyped: nextWords,
            blocksDestroyed: nextDestroyed,
            level: nextLevel,
            wave: nextWave,
          };
        });
      }
    } else {
      // MISMATCH Key on all active blocks
      soundEngine.playError();
      setStats((prev) => ({
        ...prev,
        mistakes: prev.mistakes + 1,
        combo: 0,
      }));
    }
  }, [settings.forgiveAccents, stevePos.x, stevePos.y, triggerPowerup]);

  /**
   * Keyboard Input Handler
   */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (statusRef.current !== 'PLAYING') return;

    // Ignore modifier keys, system keys
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key;

    // Prevent default scrolling spacebar
    if (key === ' ') e.preventDefault();

    processInputKey(key);
  }, [processInputKey]);

  /**
   * Direct Touch / Tap Selection on Block
   */
  const selectTargetBlock = useCallback((blockId: string) => {
    if (statusRef.current !== 'PLAYING') return;
    const targetBlock = blocksRef.current.find((b) => b.id === blockId);
    if (!targetBlock) return;

    setCurrentTargetId(targetBlock.id);
    setEnemyBlocks((prev) =>
      prev.map((b) => ({
        ...b,
        targetLock: b.id === blockId,
      }))
    );

    // Feed first char or next char
    const nextChar = targetBlock.word[targetBlock.typedIndex || 0];
    if (nextChar) {
      processInputKey(nextChar);
    }
  }, [processInputKey]);

  /**
   * Main 60 FPS Game Loop
   */
  useEffect(() => {
    let animId: number;

    const gameLoop = () => {
      if (statusRef.current === 'PLAYING') {
        const now = Date.now();

        // 1. Spawner Logic
        const spawnInterval = Math.max(1200, 3200 - statsRef.current.level * 220);
        if (now - lastSpawnTimeRef.current > spawnInterval) {
          spawnBlock();
          lastSpawnTimeRef.current = now;
        }

        // 2. Update Falling Enemy Blocks
        if (!isFrozenRef.current) {
          setEnemyBlocks((prevBlocks) => {
            const nextBlocks: EnemyBlock[] = [];

            prevBlocks.forEach((block) => {
              const nextY = block.y + block.speed;
              const nextShake = Math.max(0, block.shakeAmount - 0.5);

              // Check ground collision
              if (nextY >= canvasHeight - 65) {
                handleBlockReachBottom(block);
              } else {
                nextBlocks.push({
                  ...block,
                  y: nextY,
                  shakeAmount: nextShake,
                  targetLock: block.id === targetIdRef.current,
                });
              }
            });

            return nextBlocks;
          });
        }

        // 3. Update Lasers
        setLasers((prevLasers) =>
          prevLasers
            .map((l) => ({ ...l, duration: l.duration - 1 }))
            .filter((l) => l.duration > 0)
        );

        // 4. Update Particles
        setParticles((prevParticles) =>
          prevParticles
            .map((p) => ({
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              vy: p.vy + p.gravity,
              life: p.life - 1,
            }))
            .filter((p) => p.life > 0)
        );

        // 5. Update Floating Texts
        setFloatingTexts((prevTexts) =>
          prevTexts
            .map((ft) => ({
              ...ft,
              y: ft.y - 0.8,
              life: ft.life - 1,
            }))
            .filter((ft) => ft.life > 0)
        );

        // 6. Update Elapsed Seconds in Stats
        setStats((prev) => ({
          ...prev,
          elapsedSeconds: Math.floor((now - prev.startTime) / 1000),
        }));
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [canvasHeight, handleBlockReachBottom, spawnBlock]);

  /**
   * Keyboard Listener Binding
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
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
    isFrozen: isFrozenRef.current,
    isVirtualKeyboardOpen,
    setIsVirtualKeyboardOpen,
    sendVirtualKey: processInputKey,
    selectTargetBlock,
    startGame,
    togglePause,
    triggerPowerup,
  };
}

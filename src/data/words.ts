/**
 * Portuguese word lists and accent normalization for Minecraft Typing Defense
 */

export const PORTUGUESE_WORDS_EASY = [
  'AÇO', 'AURA', 'BAÚ', 'BOLA', 'BOLO', 'BOM', 'CAMA', 'CASA', 'CAVE', 'COLA', 
  'DADO', 'DOCE', 'ERVA', 'FOGO', 'GATO', 'GELO', 'LAVA', 'LOBO', 'LUA', 'LUTA', 
  'MAÇÃ', 'MAPA', 'MINA', 'NEVE', 'OURO', 'PÁ', 'PAU', 'PENA', 'PEIXE', 'POÇO', 
  'PORTA', 'POTE', 'ROCHA', 'SAPO', 'SETA', 'SOPA', 'TAÇA', 'TEIA', 'TERRA', 'URSO', 
  'VACA', 'VELA', 'VIDRO', 'VILA', 'VOCA'
];

export const PORTUGUESE_WORDS_MEDIUM = [
  'ARMADURA', 'ARQUEIRO', 'AVENTURA', 'BIGORNA', 'BISCUTE', 'CAVERNA', 'CARRINHO', 
  'CIMENTO', 'CORRENTE', 'CREEPER', 'CRISTAL', 'DIAMANTE', 'ENXADA', 'ESCUDO', 
  'ESPADIM', 'ESQUELETO', 'FLORESTA', 'FORNALHA', 'GALEÃO', 'GERADOR', 'GOLENS', 
  'GRANITO', 'GUERRA', 'INVENTO', 'LAGARES', 'LÂMPADA', 'LANTERNA', 'MACHADO', 
  'MADEIRA', 'MAGMA', 'MARMELO', 'MINERAÇÃO', 'MOINHO', 'MOSTRADOR', 'NETHER', 
  'OBSIDIANA', 'OVELHA', 'PICARETA', 'PULSAR', 'POÇÃO', 'PÓRTICO', 'PORTAL', 
  'PÓDIO', 'REDSTONE', 'SABEDORIA', 'SEMENTE', 'SERPENTE', 'SUBTERRÂNEO', 
  'TESOURO', 'TORTA', 'TRIDENTE', 'VENDEDOR', 'ZOMBIE'
];

export const PORTUGUESE_WORDS_HARD = [
  'ALQUIMISTA', 'ARQUITETURA', 'ARQUIPÉLAGO', 'BATALHADORA', 'BIBLIOTECA', 
  'BIOMEDICINA', 'CAVALEIRO', 'COMPARAÇÃO', 'CONSTRUÇÃO', 'DESAFIO', 
  'ENCANTAMENTO', 'ESMERALDAS', 'EXPERIÊNCIA', 'EXPLORAÇÃO', 'FORTALEZA', 
  'INVENTÁRIO', 'LABIRINTO', 'LUMINOSIDADE', 'METALURGIA', 'MONSTRUOSO', 
  'NAVEGAÇÃO', 'PROTEÇÃO', 'RESISTÊNCIA', 'SOBREVIVÊNCIA', 'SUBTERRÂNEAS', 
  'SUPERFÍCIE', 'TELETRANSPORTE', 'TEMPLO', 'TRANSFORMAÇÃO', 'VALIOSO'
];

export const MINECRAFT_BOSS_WORDS = [
  'DRAGÃO_DO_END',
  'WITHER_BOSS',
  'GUARDIÃO_ANCESTRAL',
  'HABITANTE_DAS_SOMBRAS',
  'CATACLISMO_REDSTONE',
  'DEVORADOR_DE_MUNDOS'
];

/**
 * Remove Portuguese diacritics / accents for flexible keyboard matching
 */
export function normalizeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

/**
 * Helper to test if a typed char matches an target char with accent forgiveness
 */
export function isCharMatch(typedChar: string, targetChar: string, forgiveAccents: boolean = true): boolean {
  if (!typedChar || !targetChar) return false;
  const tUpper = typedChar.toUpperCase();
  const targetUpper = targetChar.toUpperCase();
  
  if (tUpper === targetUpper) return true;
  
  if (forgiveAccents) {
    return normalizeAccents(tUpper) === normalizeAccents(targetUpper);
  }
  
  return false;
}

/**
 * Picks a random Portuguese word suitable for a given level and block difficulty
 */
export function getRandomWord(level: number, isBoss: boolean = false): string {
  if (isBoss) {
    const idx = Math.floor(Math.random() * MINECRAFT_BOSS_WORDS.length);
    return MINECRAFT_BOSS_WORDS[idx];
  }
  
  // Mix ratios based on level
  let list: string[] = [];
  if (level <= 2) {
    list = [...PORTUGUESE_WORDS_EASY, ...PORTUGUESE_WORDS_MEDIUM.slice(0, 10)];
  } else if (level <= 5) {
    list = [...PORTUGUESE_WORDS_EASY.slice(10), ...PORTUGUESE_WORDS_MEDIUM];
  } else {
    list = [...PORTUGUESE_WORDS_MEDIUM, ...PORTUGUESE_WORDS_HARD];
  }
  
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

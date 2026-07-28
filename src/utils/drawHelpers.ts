/**
 * Canvas Pixel Art Drawing Helpers for Minecraft Typing Game
 */

import { EnemyBlock, LaserBeam, Particle, FloatingText, Biome } from '../types';

// Pre-calculated star positions for crisp rendering
const STARS: { x: number; y: number; size: number; alpha: number; speed: number }[] = Array.from({ length: 60 }, () => ({
  x: Math.random(),
  y: Math.random() * 0.7,
  size: Math.random() > 0.8 ? 3 : 2,
  alpha: 0.3 + Math.random() * 0.7,
  speed: 0.005 + Math.random() * 0.02,
}));

// Pre-calculated cloud positions
const CLOUDS: { x: number; y: number; width: number; height: number; speed: number }[] = Array.from({ length: 5 }, (_, i) => ({
  x: i * 0.25,
  y: 0.08 + Math.random() * 0.15,
  width: 100 + Math.random() * 80,
  height: 24 + Math.random() * 12,
  speed: 0.0002 + Math.random() * 0.0003,
}));

/**
 * Draw Minecraft Night Sky, Square Moon, Stars, Clouds, and Horizon
 */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  biome: Biome = 'overworld_night'
) {
  // Biome gradient
  if (biome === 'nether') {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#2d080a');
    bgGrad.addColorStop(0.6, '#4a0e12');
    bgGrad.addColorStop(1, '#1a0405');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  } else if (biome === 'the_end') {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0d0b18');
    bgGrad.addColorStop(0.6, '#1a162b');
    bgGrad.addColorStop(1, '#05040a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Overworld Night Sky
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#060a17');
    bgGrad.addColorStop(0.5, '#0b1329');
    bgGrad.addColorStop(0.85, '#121c38');
    bgGrad.addColorStop(1, '#1b2a4a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  }

  // Draw Stars (Square pixel stars)
  STARS.forEach((star) => {
    const sx = star.x * width;
    const sy = star.y * height;
    const twinkle = Math.abs(Math.sin(time * star.speed + star.x * 100));
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + twinkle * 0.7})`;
    ctx.fillRect(Math.floor(sx), Math.floor(sy), star.size, star.size);
  });

  if (biome === 'overworld_night') {
    // Square Minecraft Moon (top-right)
    const moonSize = 56;
    const moonX = width - 110;
    const moonY = 40;

    // Moon Glow
    ctx.fillStyle = 'rgba(230, 240, 255, 0.12)';
    ctx.fillRect(moonX - 12, moonY - 12, moonSize + 24, moonSize + 24);
    ctx.fillStyle = 'rgba(230, 240, 255, 0.2)';
    ctx.fillRect(moonX - 6, moonY - 6, moonSize + 12, moonSize + 12);

    // Moon Base
    ctx.fillStyle = '#f0f4f8';
    ctx.fillRect(moonX, moonY, moonSize, moonSize);

    // Moon Craters
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(moonX + 8, moonY + 8, 12, 12);
    ctx.fillRect(moonX + 28, moonY + 12, 16, 16);
    ctx.fillRect(moonX + 12, moonY + 32, 18, 12);
    ctx.fillRect(moonX + 36, moonY + 36, 10, 10);

    // Moon bevel
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(moonX, moonY, moonSize, 3);
    ctx.fillRect(moonX, moonY, 3, moonSize);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(moonX, moonY + moonSize - 3, moonSize, 3);
    ctx.fillRect(moonX + moonSize - 3, moonY, 3, moonSize);

    // Drifting Square Pixel Clouds
    CLOUDS.forEach((cloud) => {
      const cx = ((cloud.x + time * cloud.speed) % 1.4 - 0.2) * width;
      const cy = cloud.y * height;

      ctx.fillStyle = 'rgba(180, 200, 230, 0.18)';
      // Cloud main block
      ctx.fillRect(Math.floor(cx), Math.floor(cy), cloud.width, cloud.height);
      // Cloud top bump
      ctx.fillRect(Math.floor(cx + 20), Math.floor(cy - 8), cloud.width - 40, 8);
    });
  }

  // Bottom Horizon Silhouette (Oak Trees and Terrain)
  const groundY = height - 30;
  ctx.fillStyle = '#0a1208';
  ctx.fillRect(0, groundY, width, 30);

  // Grass top border line
  ctx.fillStyle = '#1e3d14';
  ctx.fillRect(0, groundY, width, 4);

  // Tree silhouettes
  for (let x = 20; x < width; x += 90) {
    // Tree trunk
    ctx.fillStyle = '#0f0802';
    ctx.fillRect(x + 12, groundY - 25, 8, 25);
    // Tree leaves (cubic block)
    ctx.fillStyle = '#0b1d0a';
    ctx.fillRect(x, groundY - 55, 32, 32);
    ctx.fillRect(x + 4, groundY - 63, 24, 8);
  }
}

/**
 * Draw Minecraft Player (Steve) with Diamond Sword at bottom center
 */
export function drawStevePlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  targetX?: number,
  targetY?: number,
  time: number = 0
) {
  ctx.save();
  ctx.translate(x, y);

  // Calculate rotation angle towards target if available
  let angle = -Math.PI / 2; // Upwards
  if (targetX !== undefined && targetY !== undefined) {
    angle = Math.atan2(targetY - y, targetX - x);
  }

  // Idle breath wobble
  const wobble = Math.sin(time * 0.004) * 2;

  // Draw Steve (Top-down perspective view)
  // Shadow underneath
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 10, 22, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Steve Shoulders/Body
  ctx.fillStyle = '#008080'; // Cyan/Teal shirt
  ctx.fillRect(-18, -12 + wobble, 36, 24);

  // Shoulder highlights & dark borders
  ctx.fillStyle = '#00aaaa';
  ctx.fillRect(-18, -12 + wobble, 36, 4);
  ctx.fillStyle = '#005555';
  ctx.fillRect(-18, 8 + wobble, 36, 4);

  // Steve Head (Top view)
  ctx.fillStyle = '#c68b59'; // Skin tone
  ctx.fillRect(-12, -18 + wobble, 24, 20);

  // Brown Hair (Top-down)
  ctx.fillStyle = '#4a2e12';
  ctx.fillRect(-12, -18 + wobble, 24, 10);
  ctx.fillRect(-12, -18 + wobble, 6, 16);
  ctx.fillRect(6, -18 + wobble, 6, 16);

  // Arms extending outward towards sword
  ctx.save();
  ctx.rotate(angle + Math.PI / 2);

  // Right Arm holding Diamond Sword
  ctx.fillStyle = '#008080';
  ctx.fillRect(14, -6, 10, 16);
  ctx.fillStyle = '#c68b59'; // Hand
  ctx.fillRect(14, -12, 10, 6);

  // Diamond Sword Sprite (Pixelated)
  const swordX = 16;
  const swordY = -34;

  // Sword Blade (Diamond Cyan)
  ctx.fillStyle = '#55ffff';
  ctx.fillRect(swordX + 2, swordY, 6, 20);
  ctx.fillStyle = '#ffffff'; // Blade highlight center
  ctx.fillRect(swordX + 4, swordY, 2, 18);

  // Sword Guard (Gold/Dark cyan)
  ctx.fillStyle = '#ffaa00';
  ctx.fillRect(swordX - 2, swordY + 20, 14, 4);

  // Sword Handle & Hilt
  ctx.fillStyle = '#553311';
  ctx.fillRect(swordX + 3, swordY + 24, 4, 8);
  ctx.fillStyle = '#aa0000'; // Hilt gem
  ctx.fillRect(swordX + 2, swordY + 32, 6, 3);

  // Laser emitter gem tip glowing effect
  ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
  ctx.fillRect(swordX + 1, swordY - 4, 8, 4);

  ctx.restore();
  ctx.restore();
}

/**
 * Draw Floating Word Enemy with ZType target reticle & letter highlights
 */
export function drawEnemyBlock(
  ctx: CanvasRenderingContext2D,
  block: EnemyBlock,
  time: number
) {
  const { x, y, type, word, typedIndex, targetLock, shakeAmount } = block;

  // Apply hit shake offset
  let renderX = x;
  let renderY = y;
  if (shakeAmount > 0) {
    renderX += (Math.random() - 0.5) * shakeAmount;
    renderY += (Math.random() - 0.5) * shakeAmount;
  }

  ctx.save();

  // Set font for measuring
  ctx.font = '15px "Press Start 2P", monospace';
  const textMetrics = ctx.measureText(word);
  const textWidth = textMetrics.width;
  const halfTextW = textWidth / 2;

  // Target lock indicator reticle around the word
  if (targetLock) {
    const padX = 10;
    const padY = 6;
    const boxX = renderX - halfTextW - padX;
    const boxY = renderY - 14 - padY;
    const boxW = textWidth + padX * 2;
    const boxH = 22 + padY * 2;

    // Glowing target box
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.shadowBlur = 0;

    // Corner crosshairs (Red/Cyan accents)
    const cSize = 6;
    ctx.fillStyle = '#ff3300';
    // Top-Left
    ctx.fillRect(boxX - 4, boxY - 4, cSize, 2);
    ctx.fillRect(boxX - 4, boxY - 4, 2, cSize);
    // Top-Right
    ctx.fillRect(boxX + boxW + 4 - cSize, boxY - 4, cSize, 2);
    ctx.fillRect(boxX + boxW + 2, boxY - 4, 2, cSize);
    // Bottom-Left
    ctx.fillRect(boxX - 4, boxY + boxH + 2, cSize, 2);
    ctx.fillRect(boxX - 4, boxY + boxH + 4 - cSize, 2, cSize);
    // Bottom-Right
    ctx.fillRect(boxX + boxW + 4 - cSize, boxY + boxH + 2, cSize, 2);
    ctx.fillRect(boxX + boxW + 2, boxY + boxH + 4 - cSize, 2, cSize);
  }

  // Draw word text with crisp dark outline for high contrast
  const startTextX = renderX - halfTextW;
  const textY = renderY;

  // Base untyped color
  let defaultUntypedColor = '#ffffff';
  if (type === 'tnt') defaultUntypedColor = '#ff6666';
  else if (type === 'creeper') defaultUntypedColor = '#66ff88';
  else if (type === 'diamond') defaultUntypedColor = '#88ffff';
  else if (type === 'gold') defaultUntypedColor = '#ffff77';

  // 1. Black stroke outline behind text for 100% legibility against sky
  ctx.fillStyle = '#000000';
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const cx = startTextX + i * 15;
    ctx.fillText(char, cx - 2, textY);
    ctx.fillText(char, cx + 2, textY);
    ctx.fillText(char, cx, textY - 2);
    ctx.fillText(char, cx, textY + 2);
    ctx.fillText(char, cx + 2, textY + 2);
  }

  // 2. Main Character Fill with Typing Progress Effects
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const isTyped = i < typedIndex;
    const isNext = i === typedIndex && targetLock;
    const cx = startTextX + i * 15;

    if (isTyped) {
      // Completed character -> Bright glowing Lime Green
      ctx.fillStyle = '#00ff44';
      ctx.shadowColor = '#00ff44';
      ctx.shadowBlur = 8;
    } else if (isNext) {
      // Next character to type -> Bright Gold/Yellow
      ctx.fillStyle = '#ffea00';
      ctx.shadowColor = '#ffea00';
      ctx.shadowBlur = 10;
    } else {
      ctx.fillStyle = defaultUntypedColor;
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    ctx.fillText(char, cx, textY);
    ctx.shadowBlur = 0; // Reset
  }

  ctx.restore();
}

/**
 * Draw procedural textures for Minecraft block types
 */
function drawBlockTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  type: string,
  time: number
) {
  let baseColor = '#777777';
  let specksColor = '#555555';

  switch (type) {
    case 'dirt':
      baseColor = '#866043';
      specksColor = '#573d26';
      break;
    case 'stone':
      baseColor = '#737373';
      specksColor = '#525252';
      break;
    case 'coal':
      baseColor = '#666666';
      specksColor = '#111111';
      break;
    case 'iron':
      baseColor = '#777777';
      specksColor = '#d8af93';
      break;
    case 'gold':
      baseColor = '#777777';
      specksColor = '#fcee4b';
      break;
    case 'redstone':
      baseColor = '#666666';
      specksColor = '#ff2200';
      break;
    case 'lapis':
      baseColor = '#666666';
      specksColor = '#1e40af';
      break;
    case 'diamond':
      baseColor = '#666666';
      specksColor = '#00ffff';
      break;
    case 'emerald':
      baseColor = '#666666';
      specksColor = '#00ff44';
      break;
    case 'obsidian':
      baseColor = '#1a1024';
      specksColor = '#3b1c5a';
      break;
    case 'tnt':
      baseColor = '#d92b2b';
      specksColor = '#ffffff';
      break;
    case 'creeper':
      baseColor = '#2e8b57';
      specksColor = '#000000';
      break;
    case 'netherrack':
      baseColor = '#6e2323';
      specksColor = '#3b0d0d';
      break;
    default:
      baseColor = '#666666';
  }

  // Base Fill
  ctx.fillStyle = baseColor;
  ctx.fillRect(x, y, w, h);

  // Dirt block top grass layer
  if (type === 'dirt') {
    ctx.fillStyle = '#4f9429';
    ctx.fillRect(x, y, w, 8);
    // Draining grass pixels
    ctx.fillRect(x + 4, y + 8, 4, 4);
    ctx.fillRect(x + 16, y + 8, 6, 6);
    ctx.fillRect(x + 28, y + 8, 4, 3);
  } else if (type === 'tnt') {
    // TNT White band with text
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y + 12, w, 16);
    ctx.fillStyle = '#000000';
    ctx.font = '10px "Press Start 2P"';
    ctx.fillText('TNT', x + w / 2 - 12, y + 24);
  } else if (type === 'creeper') {
    // Creeper Face
    ctx.fillStyle = '#000000';
    const unit = w / 8;
    // Eyes
    ctx.fillRect(x + unit * 1.5, y + unit * 2, unit * 2, unit * 2);
    ctx.fillRect(x + unit * 4.5, y + unit * 2, unit * 2, unit * 2);
    // Nose & Mouth
    ctx.fillRect(x + unit * 3, y + unit * 4, unit * 2, unit * 3);
    ctx.fillRect(x + unit * 2, y + unit * 5, unit * 1, unit * 3);
    ctx.fillRect(x + unit * 5, y + unit * 5, unit * 1, unit * 3);
  } else {
    // Ore Specks Pattern
    ctx.fillStyle = specksColor;

    // Glowing redstone / diamond / emerald pulse animation
    if (type === 'redstone' || type === 'diamond' || type === 'emerald') {
      const pulse = (Math.sin(time * 0.008) + 1) * 0.5;
      ctx.shadowColor = specksColor;
      ctx.shadowBlur = 4 + pulse * 6;
    }

    const grid = 6;
    for (let gx = 4; gx < w - 6; gx += grid) {
      for (let gy = 4; gy < h - 6; gy += grid) {
        if ((gx * 7 + gy * 13) % 5 === 0) {
          ctx.fillRect(x + gx, y + gy, 5, 5);
        }
      }
    }
    ctx.shadowBlur = 0;
  }
}

/**
 * Draw ZType Laser Beams from Steve to Target Block
 */
export function drawLasers(ctx: CanvasRenderingContext2D, lasers: LaserBeam[]) {
  lasers.forEach((laser) => {
    ctx.save();

    const { startX, startY, endX, endY, color, width } = laser;

    // Laser Beam Outer Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = color;
    ctx.lineWidth = width + 4;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Laser Beam Core (White)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(2, width - 2);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Square Energy Pulses along beam
    const dist = Math.hypot(endX - startX, endY - startY);
    const steps = Math.floor(dist / 20);
    ctx.fillStyle = color;

    for (let i = 0; i <= steps; i++) {
      const t = i / Math.max(1, steps);
      const px = startX + (endX - startX) * t;
      const py = startY + (endY - startY) * t;
      ctx.fillRect(px - 4, py - 4, 8, 8);
    }

    ctx.restore();
  });
}

/**
 * Draw Particle Explosion Effects
 */
export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach((p) => {
    ctx.save();
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = alpha;

    if (p.shape === 'cube') {
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, 2);
    } else {
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }

    ctx.restore();
  });
}

/**
 * Draw Floating Score / Combo Texts
 */
export function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
  texts.forEach((ft) => {
    ctx.save();
    const alpha = Math.max(0, ft.life / ft.maxLife);
    ctx.globalAlpha = alpha;
    ctx.font = `${ft.isCritical ? '18px' : '14px'} "Press Start 2P", monospace`;

    // Black stroke text shadow
    ctx.fillStyle = '#000000';
    ctx.fillText(ft.text, ft.x + 2, ft.y + 2);

    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);

    ctx.restore();
  });
}

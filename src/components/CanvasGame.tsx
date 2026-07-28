/**
 * 2D Top-Down Pixel Art Game Canvas Component
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  EnemyBlock,
  LaserBeam,
  Particle,
  FloatingText,
  Biome
} from '../types';
import {
  drawBackground,
  drawStevePlayer,
  drawEnemyBlock,
  drawLasers,
  drawParticles,
  drawFloatingTexts
} from '../utils/drawHelpers';

interface CanvasGameProps {
  enemyBlocks: EnemyBlock[];
  currentTargetId: string | null;
  lasers: LaserBeam[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  stevePos: { x: number; y: number };
  biome: Biome;
  onDimensionsChange?: (w: number, h: number) => void;
  onSelectBlock?: (id: string) => void;
  onCanvasClick?: () => void;
}

export const CanvasGame: React.FC<CanvasGameProps> = ({
  enemyBlocks,
  currentTargetId,
  lasers,
  particles,
  floatingTexts,
  stevePos,
  biome,
  onDimensionsChange,
  onSelectBlock,
  onCanvasClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Handle Touch/Click on Canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = dimensions.width / rect.width;
    const scaleY = dimensions.height / rect.height;

    const touchX = (e.clientX - rect.left) * scaleX;
    const touchY = (e.clientY - rect.top) * scaleY;

    // Check if clicked/tapped on any block
    let hitBlockId: string | null = null;
    for (const block of enemyBlocks) {
      const halfW = block.width / 2 + 15;
      const halfH = block.height / 2 + 25; // Include word label height
      if (
        Math.abs(block.x - touchX) <= halfW &&
        Math.abs(block.y - touchY) <= halfH
      ) {
        hitBlockId = block.id;
        break;
      }
    }

    if (hitBlockId && onSelectBlock) {
      onSelectBlock(hitBlockId);
    }

    if (onCanvasClick) {
      onCanvasClick();
    }
  };

  // Responsive Container ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
          if (onDimensionsChange) {
            onDimensionsChange(width, height);
          }
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [onDimensionsChange]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();

    const render = (time: number) => {
      const elapsed = time - startTime;

      // Clear Canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // 1. Draw Background (Night Sky, Stars, Square Moon, Clouds, Horizon)
      drawBackground(ctx, dimensions.width, dimensions.height, elapsed, biome);

      // 2. Draw Enemy Falling Minecraft Blocks
      enemyBlocks.forEach((block) => {
        drawEnemyBlock(ctx, block, elapsed);
      });

      // 3. Draw ZType Laser Beams
      drawLasers(ctx, lasers);

      // 4. Find current target block X,Y for Steve's weapon swivel
      const currentTargetBlock = enemyBlocks.find((b) => b.id === currentTargetId);
      const targetX = currentTargetBlock ? currentTargetBlock.x : undefined;
      const targetY = currentTargetBlock ? currentTargetBlock.y : undefined;

      // 5. Draw Player Character (Steve) at Bottom
      drawStevePlayer(ctx, stevePos.x, stevePos.y, targetX, targetY, elapsed);

      // 6. Draw Particle Explosions
      drawParticles(ctx, particles);

      // 7. Draw Floating Score/Combo Popups
      drawFloatingTexts(ctx, floatingTexts);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    dimensions,
    enemyBlocks,
    currentTargetId,
    lasers,
    particles,
    floatingTexts,
    stevePos,
    biome,
  ]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-slate-950 flex items-center justify-center pixelated"
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onPointerDown={handlePointerDown}
        className="block w-full h-full pixelated cursor-crosshair touch-none"
      />
    </div>
  );
};

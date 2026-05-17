import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Mouse as MouseIcon, DoorOpen, Trophy, RefreshCw, ChevronRight, Play } from 'lucide-react';
import { Joystick } from './Joystick';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GRAVITY, JUMP_FORCE, MOVE_SPEED, FRICTION } from '../constants';
import { GameState, Player, Entity, MouseCustomization } from '../types';

const INITIAL_PLAYER_BASE = {
  id: 'player',
  pos: { x: 50, y: 300 },
  size: { x: 40, y: 30 },
  vel: { x: 0, y: 0 },
  type: 'mouse' as const,
  onGround: false,
  facingRight: true,
};

const createLevel = (level: number): Entity[] => {
  const entities: Entity[] = [
    // Floor
    { id: 'floor', pos: { x: 0, y: CANVAS_HEIGHT - 40 }, size: { x: CANVAS_WIDTH * 10, y: 40 }, type: 'platform' },
    // Hole (End goal)
    { id: 'hole', pos: { x: 800 + (level * 600), y: CANVAS_HEIGHT - 90 }, size: { x: 50, y: 50 }, type: 'hole' },
  ];

  // Obstacles based on level
  for (let i = 0; i < level + 3; i++) {
    entities.push({
      id: `obs-${i}`,
      pos: { x: 400 + i * 350, y: CANVAS_HEIGHT - 40 - (Math.random() * 80 + 20) },
      size: { x: 80, y: 20 },
      type: 'platform',
    });
  }

  // Floating platforms
  if (level > 1) {
    for (let i = 0; i < level; i++) {
        entities.push({
            id: `float-${i}`,
            pos: { x: 600 + i * 400, y: CANVAS_HEIGHT - 180 - (Math.random() * 40) },
            size: { x: 120, y: 20 },
            type: 'platform'
        });
    }
  }

  return entities;
};

interface GameProps {
  customization: MouseCustomization;
}

export const Game: React.FC<GameProps> = ({ customization }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uiState, setUiState] = useState({
    level: 1,
    gameOver: false,
    gameWon: false,
    startTime: Date.now(),
  });
  const [time, setTime] = useState('00:00');

  useEffect(() => {
    const timer = setInterval(() => {
        if (uiState.gameOver || uiState.gameWon) return;
        const elapsed = Math.floor((Date.now() - uiState.startTime) / 1000);
        const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const secs = (elapsed % 60).toString().padStart(2, '0');
        setTime(`${mins}:${secs}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [uiState.startTime, uiState.gameOver, uiState.gameWon]);
  
  const stateRef = useRef<GameState>({
    player: { ...INITIAL_PLAYER_BASE, customization } as Player,
    entities: createLevel(1),
    level: 1,
    gameOver: false,
    gameWon: false,
  });

  const cameraXRef = useRef(0);
  const joystickValue = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const resetGame = useCallback((level: number = 1) => {
    stateRef.current = {
      player: { ...INITIAL_PLAYER_BASE, customization } as Player,
      entities: createLevel(level),
      level,
      gameOver: false,
      gameWon: false,
    };
    cameraXRef.current = 0;
    setUiState({ level, gameOver: false, gameWon: false, startTime: Date.now() });
  }, [customization]);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (!s.player.onGround || s.gameOver || s.gameWon) return;
    s.player.vel.y = JUMP_FORCE;
    s.player.onGround = false;
  }, []);

  const update = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    const s = stateRef.current;
    
    if (!s.gameOver && !s.gameWon) {
      const player = s.player;
      
      // Horizontal movement
      player.vel.x += joystickValue.current.x * MOVE_SPEED * 0.15;
      player.vel.x *= FRICTION;
      
      if (Math.abs(player.vel.x) > 0.1) {
        player.facingRight = player.vel.x > 0;
      }

      // Vertical movement
      player.vel.y += GRAVITY;
      
      player.pos.x += player.vel.x;
      player.pos.y += player.vel.y;

      // Collision Detection
      let onGround = false;
      s.entities.forEach(entity => {
        if (entity.type === 'platform') {
          const px = player.pos.x;
          const py = player.pos.y;
          const pw = player.size.x;
          const ph = player.size.y;
          
          const ex = entity.pos.x;
          const ey = entity.pos.y;
          const ew = entity.size.x;
          const eh = entity.size.y;

          if (px < ex + ew && px + pw > ex && py < ey + eh && py + ph > ey) {
            const overlapX = Math.min(px + pw - ex, ex + ew - px);
            const overlapY = Math.min(py + ph - ey, ey + eh - py);

            if (overlapX > overlapY) {
              if (py < ey) { // Falling onto top
                player.pos.y = ey - ph;
                player.vel.y = 0;
                onGround = true;
              } else { // Hitting bottom
                player.pos.y = ey + eh;
                player.vel.y = 0;
              }
            } else {
              if (px < ex) { // Hitting left side
                player.pos.x = ex - pw;
                player.vel.x = 0;
              } else { // Hitting right side
                player.pos.x = ex + ew;
                player.vel.x = 0;
              }
            }
          }
        } else if (entity.type === 'hole') {
          const dist = Math.sqrt(
            Math.pow((player.pos.x + player.size.x/2) - (entity.pos.x + entity.size.x/2), 2) +
            Math.pow((player.pos.y + player.size.y/2) - (entity.pos.y + entity.size.y/2), 2)
          );
          if (dist < 40) {
            s.gameWon = true;
            setUiState(prev => ({ ...prev, gameWon: true }));
          }
        }
      });

      player.onGround = onGround;

      // Boundary checks
      if (player.pos.y > CANVAS_HEIGHT) {
        s.gameOver = true;
        setUiState(prev => ({ ...prev, gameOver: true }));
      }
      if (player.pos.x < 0) {
        player.pos.x = 0;
        player.vel.x = 0;
      }

      // Update camera
      cameraXRef.current += (Math.max(0, player.pos.x - CANVAS_WIDTH / 3) - cameraXRef.current) * 0.1;
    }

    // Render 
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Background
        ctx.fillStyle = '#e8e8df';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        const cameraX = cameraXRef.current;
        
        // Background Details (blurs)
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(100 - cameraX * 0.2, 100, 80, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH - 200 - cameraX * 0.1, 400, 150, 0, Math.PI * 2);
        ctx.fill();

        // Grid (subtle)
        ctx.strokeStyle = 'rgba(90, 90, 64, 0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = -cameraX % 100; x < CANVAS_WIDTH; x += 100) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, CANVAS_HEIGHT);
        }
        for (let y = 0; y < CANVAS_HEIGHT; y += 100) {
          ctx.moveTo(0, y);
          ctx.lineTo(CANVAS_WIDTH, y);
        }
        ctx.stroke();

        ctx.save();
        ctx.translate(-cameraX, 0);

        // Draw Entities
        s.entities.forEach(entity => {
          if (entity.type === 'platform') {
            ctx.fillStyle = '#7c9070';
            ctx.beginPath();
            ctx.roundRect(entity.pos.x, entity.pos.y, entity.size.x, entity.size.y, 20);
            ctx.fill();
            
            // Platform Shadow
            ctx.fillStyle = '#5a6a50';
            ctx.fillRect(entity.pos.x, entity.pos.y + entity.size.y - 4, entity.size.x, 8);
          } else if (entity.type === 'hole') {
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(entity.pos.x + entity.size.x/2, entity.pos.y + entity.size.y, 30, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.beginPath();
            ctx.ellipse(entity.pos.x + entity.size.x/2, entity.pos.y + entity.size.y/2, entity.size.x/2, entity.size.y/4, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#5a5a40';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        });

        // Draw Player
        const p = s.player;
        ctx.save();
        ctx.translate(p.pos.x + p.size.x / 2, p.pos.y + p.size.y / 2);
        if (!p.facingRight) ctx.scale(-1, 1);
        
        // Body
        ctx.fillStyle = customization.bodyColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size.x / 2, p.size.y / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears
        ctx.fillStyle = customization.bodyColor;
        ctx.strokeStyle = customization.earColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-p.size.x / 4, -p.size.y / 2, p.size.y / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(p.size.x / 4, -p.size.y / 6, 2, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = customization.noseColor;
        ctx.beginPath();
        ctx.arc(p.size.x / 2, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.strokeStyle = '#d6d3d1'; // stone-300
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-p.size.x / 2, 0);
        ctx.quadraticCurveTo(-p.size.x, 10, -p.size.x - 10, 0);
        ctx.stroke();

        ctx.restore();
        ctx.restore();
      }
    }

    requestRef.current = requestAnimationFrame(update);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        jump();
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        joystickValue.current.x = -1;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        joystickValue.current.x = 1;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA', 'ArrowRight', 'KeyD'].includes(e.code)) {
        joystickValue.current.x = 0;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [jump]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f5f0] font-serif touch-none overflow-hidden select-none">
      <div className="w-full max-w-[1024px] bg-[#f5f5f0] flex flex-col overflow-hidden shadow-2xl border-x border-slate-200">
        {/* Header HUD */}
        <header className="flex justify-between items-center px-12 py-8 bg-[#5a5a40] text-[#f5f5f0]">
          <div className="flex gap-10">
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Level</p>
              <p className="text-2xl font-bold italic">0{uiState.level}: {uiState.level === 1 ? 'The Garden Path' : uiState.level === 2 ? 'The Wild Woods' : 'The Final Stretch'}</p>
            </div>
            <div className="w-px h-10 bg-[#f5f5f0] opacity-20"></div>
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">World</p>
              <p className="text-2xl font-bold">Natural Scurry</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Time Elapsed</p>
            <p className="text-3xl font-mono tabular-nums">{time}</p>
          </div>
        </header>

        {/* Main Stage */}
        <main className="relative bg-[#e8e8df] overflow-hidden aspect-[16/9]">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block w-full h-full"
          />

          {/* UI Overlays */}
          {(uiState.gameOver || uiState.gameWon) && (
            <div className="absolute inset-0 bg-[#5a5a40]/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center text-[#f5f5f0] z-20">
              {uiState.gameWon ? (
                <>
                  <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-5xl font-bold italic mb-2 tracking-tight">Level Complete!</h2>
                  <p className="text-[#f5f5f0]/70 mb-8 max-w-md text-lg">The mouse has successfully navigated the hazards of nature and reached the safety of the nest.</p>
                  <div className="flex gap-6">
                    <button
                      onClick={() => resetGame(1)}
                      className="flex items-center gap-2 bg-[#f5f5f0]/10 hover:bg-[#f5f5f0]/20 text-[#f5f5f0] px-8 py-3 rounded-full font-bold border border-[#f5f5f0]/30 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" /> Restart
                    </button>
                    <button
                      onClick={() => resetGame(uiState.level + 1)}
                      className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-10 py-4 rounded-full font-bold shadow-xl transition-all transform hover:scale-105 active:scale-95"
                    >
                      Next Chapter <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-[#b3a492] rounded-full flex items-center justify-center mb-6 shadow-xl opacity-80 backdrop-blur-sm">
                    <RefreshCw className="w-12 h-12 text-[#5a5a40]" />
                  </div>
                  <h2 className="text-5xl font-bold italic mb-2 tracking-tight">Nature is Harsh</h2>
                  <p className="text-[#f5f5f0]/70 mb-8 max-w-md text-lg">The mouse fell prey to the vast expanse. Try once more with caution.</p>
                  <button
                    onClick={() => resetGame(uiState.level)}
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-10 py-4 rounded-full font-bold shadow-xl transition-all transform hover:scale-105 active:scale-95"
                  >
                    <RefreshCw className="w-5 h-5" /> Try Again
                  </button>
                </>
              )}
            </div>
          )}

          {/* Controls Overlay (Always visible on main stage for UI styling) */}
          <div className="absolute bottom-0 left-0 w-full h-full px-12 py-8 flex justify-between items-end pointer-events-none">
            <div className="pointer-events-auto">
              <Joystick 
                  onMove={(x, y) => {
                      joystickValue.current = { x, y: 0 };
                  }} 
                  size={160}
              />
            </div>
            
            <button
              onTouchStart={(e) => { e.preventDefault(); jump(); }}
              onMouseDown={(e) => { e.preventDefault(); jump(); }}
              className="pointer-events-auto w-32 h-32 bg-amber-600/80 backdrop-blur-sm rounded-full border-4 border-amber-200/50 flex flex-col items-center justify-center shadow-xl active:scale-95 transition-transform touch-none cursor-pointer group"
              aria-label="Jump"
            >
              <span className="text-white font-bold text-xl uppercase tracking-widest leading-none">Jump</span>
              <div className="w-8 h-1 bg-white/40 rounded-full mt-2 group-active:w-10 transition-all" />
            </button>
          </div>
        </main>

        {/* Footer Rail */}
        <footer className="h-14 bg-[#b3a492] flex items-center px-12 text-[11px] text-[#5a5a40] font-bold uppercase tracking-[0.2em] border-t border-black/5">
          <span className="opacity-60">Success Rate:</span>
          <div className="mx-4 w-48 h-1.5 bg-black/10 rounded-full overflow-hidden">
            <div className="w-3/4 h-full bg-[#5a5a40]"></div>
          </div>
          <span>Chapter {uiState.level} Progress</span>
          <div className="ml-auto italic opacity-60">Natural Scurry v1.0.4</div>
        </footer>
      </div>
    </div>
  );
};

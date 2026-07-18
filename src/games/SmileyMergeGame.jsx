import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Smile } from 'lucide-react';

const TIERS = [
  { radius: 12, emoji: '😴', name: 'Sleepy', score: 10, color: '#ef8b77' },
  { radius: 18, emoji: '😐', name: 'Meh', score: 20, color: '#91bbc0' },
  { radius: 25, emoji: '🙂', name: 'Smile', score: 30, color: '#efd477' },
  { radius: 33, emoji: '😊', name: 'Happy', score: 40, color: '#b9d7c8' },
  { radius: 42, emoji: '😁', name: 'Grin', score: 50, color: '#c7b7ce' },
  { radius: 52, emoji: '🤩', name: 'Star Eyes', score: 60, color: '#edb27c' },
  { radius: 64, emoji: '👑', name: 'Giga Smile', score: 100, color: '#eb6d54' }
];

export default function SmileyMergeGame({ round, updateRound, feedback }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [score, setScore] = useState(0);
  const [currentTier, setCurrentTier] = useState(0);
  const [nextTier, setNextTier] = useState(() => Math.floor(Math.random() * 3));
  const [dropperX, setDropperX] = useState(150);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  // Physics state stored in refs to run smoothly inside canvas loop
  const circlesRef = useRef([]);
  const particlesRef = useRef([]);
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);

  const WIDTH = 300;
  const HEIGHT = 380;
  const DROP_LINE = 55;

  const startNewGame = () => {
    circlesRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    gameOverRef.current = false;
    setScore(0);
    setIsGameOver(false);
    setHasWon(false);
    setCurrentTier(Math.floor(Math.random() * 3));
    setNextTier(Math.floor(Math.random() * 3));
    updateRound({ count: 0 });
    feedback('tap');
  };

  useEffect(() => {
    startNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const gravity = 0.35;
    const friction = 0.98;
    const elasticity = 0.4;
    const positionCorrectionStrength = 0.25;

    const updatePhysics = () => {
      const circles = circlesRef.current;

      // 1. Apply gravity and move circles
      for (let i = 0; i < circles.length; i++) {
        const c = circles[i];
        c.vy += gravity;
        c.x += c.vx;
        c.y += c.vy;

        // 2. Wall Collisions
        // Bottom wall
        if (c.y + c.radius > HEIGHT) {
          c.y = HEIGHT - c.radius;
          c.vy = -c.vy * elasticity;
          c.vx *= friction;
        }
        // Left wall
        if (c.x - c.radius < 0) {
          c.x = c.radius;
          c.vx = -c.vx * elasticity;
        }
        // Right wall
        if (c.x + c.radius > WIDTH) {
          c.x = WIDTH - c.radius;
          c.vx = -c.vx * elasticity;
        }
      }

      // 3. Circle-to-Circle Collisions and Merging
      const toMerge = [];
      const destroyedIndices = new Set();

      for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
          if (destroyedIndices.has(i) || destroyedIndices.has(j)) continue;

          const c1 = circles[i];
          const c2 = circles[j];

          const dx = c2.x - c1.x;
          const dy = c2.y - c1.y;
          const distance = Math.hypot(dx, dy);
          const minDist = c1.radius + c2.radius;

          if (distance < minDist) {
            // Collision detected!
            // Check if they merge
            if (c1.tier === c2.tier && c1.tier < TIERS.length - 1) {
              toMerge.push({ i, j, x: (c1.x + c2.x) / 2, y: (c1.y + c2.y) / 2, tier: c1.tier });
              destroyedIndices.add(i);
              destroyedIndices.add(j);
              continue;
            }

            // Normal collision response
            const nx = dx / (distance || 1);
            const ny = dy / (distance || 1);

            // Positional correction (resolving overlap)
            const overlap = minDist - distance;
            const correctionX = nx * overlap * positionCorrectionStrength * 0.5;
            const correctionY = ny * overlap * positionCorrectionStrength * 0.5;
            c1.x -= correctionX;
            c1.y -= correctionY;
            c2.x += correctionX;
            c2.y += correctionY;

            // Elastic collision velocities
            const kx = c1.vx - c2.vx;
            const ky = c1.vy - c2.vy;
            const p = 2 * (nx * kx + ny * ky) / (c1.radius + c2.radius);

            c1.vx -= p * c2.radius * nx;
            c1.vy -= p * c2.radius * ny;
            c2.vx += p * c1.radius * nx;
            c2.vy += p * c1.radius * ny;
          }
        }
      }

      // Handle Merges
      if (toMerge.length > 0) {
        let mergedScoreGained = 0;
        let highestTierReached = 0;

        // Filter out destroyed circles
        circlesRef.current = circles.filter((_, idx) => !destroyedIndices.has(idx));

        toMerge.forEach(m => {
          const nextGrade = m.tier + 1;
          const nextInfo = TIERS[nextGrade];
          highestTierReached = Math.max(highestTierReached, nextGrade);
          mergedScoreGained += nextInfo.score;

          // Spawn upgraded circle
          circlesRef.current.push({
            id: Math.random().toString(),
            x: m.x,
            y: Math.max(m.y, DROP_LINE + nextInfo.radius + 5), // Keep below line if possible
            vx: (Math.random() - 0.5) * 1.5,
            vy: -1.5, // Slight pop upwards on merge
            radius: nextInfo.radius,
            tier: nextGrade
          });

          // Add merge particles
          for (let p = 0; p < 8; p++) {
            const angle = (p / 8) * Math.PI * 2;
            particlesRef.current.push({
              x: m.x,
              y: m.y,
              vx: Math.cos(angle) * (2 + Math.random() * 2),
              vy: Math.sin(angle) * (2 + Math.random() * 2),
              radius: 2 + Math.random() * 2,
              life: 1.0,
              decay: 0.04 + Math.random() * 0.04,
              color: nextInfo.color
            });
          }
        });

        scoreRef.current += mergedScoreGained;
        setScore(scoreRef.current);
        updateRound({ count: scoreRef.current });

        // Trigger phone feedback (vibrate/audio)
        if (highestTierReached >= 5) {
          feedback('success');
        } else {
          feedback('tap');
        }

        if (highestTierReached === TIERS.length - 1) {
          setHasWon(true);
        }
      }

      // 4. Update particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        return p.life > 0;
      });

      // 5. Game Over / Overflow check
      // A circle overflows if it settles above the drop line
      let hasOverflow = false;
      for (const c of circlesRef.current) {
        // Only trigger overflow after circles have had time to settle
        if (c.y - c.radius < DROP_LINE && c.vy < 0.2 && Math.abs(c.vx) < 0.2) {
          // Track time above drop line
          if (!c.settledAboveTime) {
            c.settledAboveTime = Date.now();
          } else if (Date.now() - c.settledAboveTime > 1800) {
            // Settled for more than 1.8 seconds above line
            hasOverflow = true;
          }
        } else {
          c.settledAboveTime = null;
        }
      }

      if (hasOverflow && !gameOverRef.current) {
        gameOverRef.current = true;
        setIsGameOver(true);
        feedback('tap');
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Draw drop line
      ctx.strokeStyle = 'rgba(32, 50, 51, 0.25)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, DROP_LINE);
      ctx.lineTo(WIDTH, DROP_LINE);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw container bottom boundary
      ctx.fillStyle = 'rgba(32, 50, 51, 0.05)';
      ctx.fillRect(0, DROP_LINE, WIDTH, HEIGHT - DROP_LINE);

      // Draw active circles
      const circles = circlesRef.current;
      for (let i = 0; i < circles.length; i++) {
        const c = circles[i];
        const info = TIERS[c.tier];

        // Draw shadow/highlight
        ctx.fillStyle = info.color;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#203233';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw Emoji
        ctx.font = `${c.radius * 1.2}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(info.emoji, c.x, c.y + (c.radius * 0.05));

        // Highlight warning if about to overflow
        if (c.settledAboveTime) {
          const ratio = Math.min(1, (Date.now() - c.settledAboveTime) / 1800);
          ctx.strokeStyle = `rgba(235, 109, 84, ${ratio})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.radius + 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Draw particles
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0; // Reset alpha
    };

    const loop = () => {
      updatePhysics();
      draw();
      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(animationId);
  }, [feedback, updateRound]);

  // Handle dropper horizontal position
  const handlePointerMove = (e) => {
    if (isGameOver || cooldown || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const relativeX = ((clientX - rect.left) / rect.width) * WIDTH;
    // Constrain within walls considering current circle radius
    const currentRadius = TIERS[currentTier].radius;
    setDropperX(Math.max(currentRadius + 4, Math.min(WIDTH - currentRadius - 4, relativeX)));
  };

  const handlePointerDown = (e) => {
    handlePointerMove(e);
  };

  const dropSmile = () => {
    if (isGameOver || cooldown) return;

    const info = TIERS[currentTier];
    circlesRef.current.push({
      id: Math.random().toString(),
      x: dropperX,
      y: DROP_LINE - info.radius + 15,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 2.0,
      radius: info.radius,
      tier: currentTier,
      settledAboveTime: null
    });

    feedback('tap');
    setCooldown(true);

    // Visual drop confirmation & queue next
    setTimeout(() => {
      setCurrentTier(nextTier);
      setNextTier(Math.floor(Math.random() * Math.min(4, TIERS.length)));
      setCooldown(false);
    }, 450);
  };

  return (
    <div className="round-widget smiley-merge-widget">
      <div className="progress-label">
        <b>Score: {score}</b>
        <span>Goal: 1000 pts or 👑 Giga Smile</span>
      </div>

      <div className="merge-game-container">
        {/* Next up preview */}
        <div className="next-preview">
          <span>Next:</span>
          <span className="next-emoji-badge" style={{ backgroundColor: TIERS[nextTier].color }}>
            {TIERS[nextTier].emoji}
          </span>
        </div>

        {/* Physics Container */}
        <div
          ref={containerRef}
          className="merge-board"
          style={{ width: `${WIDTH}px`, height: `${HEIGHT}px` }}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onClick={dropSmile}
        >
          {/* Active dropper display */}
          {!isGameOver && !cooldown && (
            <div
              className="dropper"
              style={{
                left: `${dropperX}px`,
                backgroundColor: TIERS[currentTier].color,
                width: `${TIERS[currentTier].radius * 2}px`,
                height: `${TIERS[currentTier].radius * 2}px`,
                fontSize: `${TIERS[currentTier].radius * 1.2}px`
              }}
            >
              {TIERS[currentTier].emoji}
            </div>
          )}

          {/* Dropper laser guide line */}
          {!isGameOver && !cooldown && (
            <div
              className="dropper-guide"
              style={{
                left: `${dropperX}px`,
                height: `${HEIGHT - DROP_LINE}px`
              }}
            />
          )}

          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className="merge-canvas"
          />

          {isGameOver && (
            <div className="merge-overlay gameover">
              <h3>Overflow!</h3>
              <p>The container spilled over.</p>
              <button className="primary" onClick={startNewGame}>
                <RotateCcw size={18} /> Retry
              </button>
            </div>
          )}

          {hasWon && (
            <div className="merge-overlay win">
              <h3>👑 Giga Smile!</h3>
              <p>You merged the ultimate smile!</p>
              <button className="primary" onClick={startNewGame}>
                <Play size={18} /> Play Again
              </button>
            </div>
          )}
        </div>
      </div>

      <small>
        Drag your finger to position, tap anywhere to drop. Merge matching faces to make bigger ones!
      </small>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { Briefcase, Music, RotateCw, Sparkles, Star, Sun, Trophy, Umbrella } from 'lucide-react';

const LEVELS = [
  {
    name: 'Weekend Getaway',
    cols: 4,
    rows: 4,
    items: [
      { id: 'coolbox', name: 'Cooler', w: 2, h: 2, color: 'coral', icon: 'Sun' },
      { id: 'suitcase', name: 'Suitcase', w: 2, h: 1, color: 'blue', icon: 'Briefcase' },
      { id: 'sleepingbag', name: 'Sleeping Bag', w: 2, h: 1, color: 'yellow', icon: 'Umbrella' },
      { id: 'guitar', name: 'Guitar', w: 3, h: 1, color: 'purple', icon: 'Music' }
    ]
  },
  {
    name: 'Beach Trip',
    cols: 5,
    rows: 5,
    items: [
      { id: 'surfboard', name: 'Surfboard', w: 4, h: 1, color: 'orange', icon: 'Sun' },
      { id: 'cooler', name: 'Big Cooler', w: 2, h: 2, color: 'coral', icon: 'Sun' },
      { id: 'duffel', name: 'Duffel Bag', w: 2, h: 1, color: 'blue', icon: 'Briefcase' },
      { id: 'backpack', name: 'Backpack', w: 1, h: 2, color: 'yellow', icon: 'Briefcase' },
      { id: 'umbrella', name: 'Umbrella', w: 3, h: 1, color: 'mint', icon: 'Umbrella' },
      { id: 'guitar', name: 'Guitar', w: 2, h: 1, color: 'purple', icon: 'Music' }
    ]
  },
  {
    name: 'Family Camping',
    cols: 6,
    rows: 5,
    items: [
      { id: 'surfboard', name: 'Surfboard', w: 5, h: 1, color: 'orange', icon: 'Sun' },
      { id: 'cooler', name: 'Coolbox', w: 2, h: 2, color: 'coral', icon: 'Sun' },
      { id: 'largebag', name: 'Big Trunk', w: 3, h: 2, color: 'blue', icon: 'Briefcase' },
      { id: 'smallbag', name: 'Backpack', w: 2, h: 1, color: 'yellow', icon: 'Briefcase' },
      { id: 'tent', name: 'Camp Tent', w: 3, h: 1, color: 'mint', icon: 'Umbrella' },
      { id: 'guitar', name: 'Guitar Case', w: 2, h: 1, color: 'purple', icon: 'Music' },
      { id: 'lantern', name: 'Flask', w: 1, h: 1, color: 'coral', icon: 'Sun' }
    ]
  }
];

const ICONS = {
  Sun: Sun,
  Briefcase: Briefcase,
  Umbrella: Umbrella,
  Music: Music
};

export default function PackTheTrunkGame({ round, updateRound, feedback }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [items, setItems] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [isWon, setIsWon] = useState(false);

  const boardRef = useRef(null);
  const currentLevel = LEVELS[levelIndex];
  const CELL_SIZE = 40; // Size of grid cell in pixels

  // Initialize level
  useEffect(() => {
    const initialized = currentLevel.items.map(item => ({
      ...item,
      x: null, // grid column
      y: null, // grid row
      w: item.w,
      h: item.h,
      rotated: false,
      // Tray default offsets for smooth return transition
      trayX: 0,
      trayY: 0
    }));
    setItems(initialized);
    setIsWon(false);
    updateRound({ count: 0 });
  }, [levelIndex, currentLevel, updateRound]);

  const rotateItem = (itemId) => {
    if (isWon) return;

    setItems(prevItems => {
      const updated = prevItems.map(item => {
        if (item.id !== itemId) return item;

        // Swap width and height for 90 degree rotation
        const newW = item.h;
        const newH = item.w;
        const newRotated = !item.rotated;

        // If it was placed in the trunk, check if it still fits after rotation.
        // If it overlaps or goes out of bounds, pop it back to the tray.
        if (item.x !== null) {
          const outOfBounds = item.x + newW > currentLevel.cols || item.y + newH > currentLevel.rows;
          const overlaps = prevItems.some(other => {
            if (other.id === itemId || other.x === null) return false;
            return (
              item.x < other.x + other.w &&
              item.x + newW > other.x &&
              item.y < other.y + other.h &&
              item.y + newH > other.y
            );
          });

          if (outOfBounds || overlaps) {
            feedback('tap');
            return { ...item, w: newW, h: newH, rotated: newRotated, x: null, y: null };
          }
        }

        feedback('tap');
        return { ...item, w: newW, h: newH, rotated: newRotated };
      });

      checkWinCondition(updated);
      return updated;
    });
  };

  const handlePointerDown = (e, item) => {
    if (isWon) return;
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    setDraggingId(item.id);
    // Remember grab offset relative to item top-left
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top
    });
    setDragPos({
      x: clientX,
      y: clientY
    });

    // Remove from grid temporarily when picked up
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, x: null, y: null } : i));
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!draggingId) return;
      const clientX = e.clientX;
      const clientY = e.clientY;
      setDragPos({ x: clientX, y: clientY });
    };

    const handlePointerUp = (e) => {
      if (!draggingId) return;

      const board = boardRef.current;
      if (!board) {
        setDraggingId(null);
        return;
      }

      const boardRect = board.getBoundingClientRect();
      const clientX = dragPos.x;
      const clientY = dragPos.y;

      // Item top-left position on screen
      const itemLeft = clientX - dragOffset.x;
      const itemTop = clientY - dragOffset.y;

      // Calculate grid coordinate
      const gridX = Math.round((itemLeft - boardRect.left) / CELL_SIZE);
      const gridY = Math.round((itemTop - boardRect.top) / CELL_SIZE);

      const targetItem = items.find(i => i.id === draggingId);
      const w = targetItem.w;
      const h = targetItem.h;

      // Validate bounds
      const inBounds = gridX >= 0 && gridX + w <= currentLevel.cols && gridY >= 0 && gridY + h <= currentLevel.rows;

      // Validate overlap with other placed items
      const overlaps = items.some(other => {
        if (other.id === draggingId || other.x === null) return false;
        return (
          gridX < other.x + other.w &&
          gridX + w > other.x &&
          gridY < other.y + other.h &&
          gridY + h > other.y
        );
      });

      setItems(prevItems => {
        const nextItems = prevItems.map(item => {
          if (item.id !== draggingId) return item;

          if (inBounds && !overlaps) {
            feedback('tap');
            return { ...item, x: gridX, y: gridY };
          } else {
            // Failed placement - snap back to tray
            feedback('tap');
            return { ...item, x: null, y: null };
          }
        });

        checkWinCondition(nextItems);
        return nextItems;
      });

      setDraggingId(null);
    };

    if (draggingId) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingId, dragOffset, dragPos, items, currentLevel, feedback]);

  const checkWinCondition = (currentItems) => {
    const allPlaced = currentItems.every(item => item.x !== null);
    if (allPlaced) {
      setIsWon(true);
      updateRound({ count: 1 });
      feedback('success');
    }
  };

  const nextLevel = () => {
    setLevelIndex(prev => (prev + 1) % LEVELS.length);
  };

  // Get active dragging item details for absolute positioning
  const activeItem = items.find(i => i.id === draggingId);

  return (
    <div className="round-widget pack-trunk-widget">
      <div className="progress-label">
        <b>Level: {currentLevel.name}</b>
        <span>{items.filter(i => i.x !== null).length}/{items.length} packed</span>
      </div>

      <div className="trunk-game-area">
        {/* Grid Board */}
        <div
          ref={boardRef}
          className="trunk-grid"
          style={{
            width: `${currentLevel.cols * CELL_SIZE}px`,
            height: `${currentLevel.rows * CELL_SIZE}px`,
            gridTemplateColumns: `repeat(${currentLevel.cols}, 1fr)`,
            gridTemplateRows: `repeat(${currentLevel.rows}, 1fr)`
          }}
        >
          {/* Background grid markings */}
          {Array.from({ length: currentLevel.cols * currentLevel.rows }).map((_, index) => (
            <div key={index} className="grid-cell" />
          ))}

          {/* Placed Items */}
          {items.map(item => {
            if (item.x === null || item.id === draggingId) return null;
            const Icon = ICONS[item.icon];
            return (
              <div
                key={item.id}
                className={`trunk-item ${item.color} placed`}
                style={{
                  left: `${item.x * CELL_SIZE}px`,
                  top: `${item.y * CELL_SIZE}px`,
                  width: `${item.w * CELL_SIZE}px`,
                  height: `${item.h * CELL_SIZE}px`
                }}
                onPointerDown={(e) => handlePointerDown(e, item)}
              >
                <div className="item-inner">
                  {Icon && <Icon size={18} className="item-icon" />}
                  <span className="item-label">{item.name}</span>
                </div>
                <button
                  className="rotate-btn"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => rotateItem(item.id)}
                  aria-label="Rotate"
                >
                  <RotateCw size={12} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Shelf Tray of Unplaced Items */}
        <div className="trunk-shelf">
          <p className="shelf-hint">Drag into trunk. Tap item to rotate.</p>
          <div className="shelf-items">
            {items.map(item => {
              if (item.x !== null || item.id === draggingId) return null;
              const Icon = ICONS[item.icon];
              return (
                <div
                  key={item.id}
                  className={`trunk-item ${item.color} shelf`}
                  style={{
                    width: `${item.w * CELL_SIZE}px`,
                    height: `${item.h * CELL_SIZE}px`
                  }}
                  onPointerDown={(e) => handlePointerDown(e, item)}
                >
                  <div className="item-inner">
                    {Icon && <Icon size={18} className="item-icon" />}
                    <span className="item-label">{item.name}</span>
                  </div>
                  <button
                    className="rotate-btn"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => rotateItem(item.id)}
                    aria-label="Rotate"
                  >
                    <RotateCw size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Drag Overlay */}
      {draggingId && activeItem && (
        <div
          className={`trunk-item ${activeItem.color} dragging`}
          style={{
            position: 'fixed',
            left: `${dragPos.x - dragOffset.x}px`,
            top: `${dragPos.y - dragOffset.y}px`,
            width: `${activeItem.w * CELL_SIZE}px`,
            height: `${activeItem.h * CELL_SIZE}px`,
            pointerEvents: 'none',
            zIndex: 999
          }}
        >
          <div className="item-inner">
            {ICONS[activeItem.icon] && React.createElement(ICONS[activeItem.icon], { size: 18, className: 'item-icon' })}
            <span className="item-label">{activeItem.name}</span>
          </div>
        </div>
      )}

      {isWon && (
        <div className="trunk-overlay win">
          <div className="overlay-content">
            <Trophy size={48} className="win-trophy" />
            <h3>Trunk Packed!</h3>
            <p>Everything fits perfectly. Ready for departure!</p>
            <div className="overlay-buttons">
              <button className="primary" onClick={nextLevel}>
                Next Trip <Sparkles size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

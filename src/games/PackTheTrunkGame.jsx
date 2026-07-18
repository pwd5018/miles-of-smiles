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
      rotated: false
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
    e.currentTarget.setPointerCapture(e.pointerId);

    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    setDraggingId(item.id);
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top
    });
    setDragPos({
      x: clientX,
      y: clientY
    });
  };

  const handlePointerMove = (e, item) => {
    if (draggingId !== item.id) return;
    e.preventDefault();
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e, item) => {
    if (draggingId !== item.id) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDraggingId(null);

    const board = boardRef.current;
    if (!board) return;

    const boardRect = board.getBoundingClientRect();
    const itemLeft = e.clientX - dragOffset.x;
    const itemTop = e.clientY - dragOffset.y;

    // Calculate grid coordinate
    const gridX = Math.round((itemLeft - boardRect.left) / CELL_SIZE);
    const gridY = Math.round((itemTop - boardRect.top) / CELL_SIZE);

    const w = item.w;
    const h = item.h;

    // Validate bounds
    const inBounds = gridX >= 0 && gridX + w <= currentLevel.cols && gridY >= 0 && gridY + h <= currentLevel.rows;

    // Validate overlap with other placed items
    const overlaps = items.some(other => {
      if (other.id === item.id || other.x === null) return false;
      return (
        gridX < other.x + other.w &&
        gridX + w > other.x &&
        gridY < other.y + other.h &&
        gridY + h > other.y
      );
    });

    setItems(prevItems => {
      const nextItems = prevItems.map(i => {
        if (i.id !== item.id) return i;

        if (inBounds && !overlaps) {
          feedback('tap');
          return { ...i, x: gridX, y: gridY };
        } else {
          // Failed placement - snap back to tray
          feedback('tap');
          return { ...i, x: null, y: null };
        }
      });

      checkWinCondition(nextItems);
      return nextItems;
    });
  };

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
            if (item.x === null) return null;
            const Icon = ICONS[item.icon];
            const isDragging = item.id === draggingId;

            return (
              <React.Fragment key={item.id}>
                {/* Dotted ghost behind dragging element */}
                {isDragging && (
                  <div
                    className="trunk-item-ghost"
                    style={{
                      position: 'absolute',
                      left: `${item.x * CELL_SIZE}px`,
                      top: `${item.y * CELL_SIZE}px`,
                      width: `${item.w * CELL_SIZE}px`,
                      height: `${item.h * CELL_SIZE}px`,
                      border: '2.5px dashed rgba(32,50,51,0.2)',
                      borderRadius: '10px',
                      pointerEvents: 'none'
                    }}
                  />
                )}

                {/* The actual suitcase item */}
                <div
                  className={`trunk-item ${item.color} placed ${isDragging ? 'dragging' : ''}`}
                  style={isDragging ? {
                    position: 'fixed',
                    left: `${dragPos.x - dragOffset.x}px`,
                    top: `${dragPos.y - dragOffset.y}px`,
                    width: `${item.w * CELL_SIZE}px`,
                    height: `${item.h * CELL_SIZE}px`,
                    zIndex: 999
                  } : {
                    left: `${item.x * CELL_SIZE}px`,
                    top: `${item.y * CELL_SIZE}px`,
                    width: `${item.w * CELL_SIZE}px`,
                    height: `${item.h * CELL_SIZE}px`
                  }}
                  onPointerDown={(e) => handlePointerDown(e, item)}
                  onPointerMove={(e) => handlePointerMove(e, item)}
                  onPointerUp={(e) => handlePointerUp(e, item)}
                >
                  <div className="item-inner">
                    {Icon && <Icon size={18} className="item-icon" />}
                    <span className="item-label">{item.name}</span>
                  </div>
                  {!isDragging && (
                    <button
                      className="rotate-btn"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => rotateItem(item.id)}
                      aria-label="Rotate"
                    >
                      <RotateCw size={12} />
                    </button>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Shelf Tray of Unplaced Items */}
        <div className="trunk-shelf">
          <p className="shelf-hint">Drag into trunk. Tap item to rotate.</p>
          <div className="shelf-items">
            {items.map(item => {
              if (item.x !== null) return null;
              const Icon = ICONS[item.icon];
              const isDragging = item.id === draggingId;

              return (
                <React.Fragment key={item.id}>
                  {/* Shelf item, absolute-fixed when dragged, normal relative flow on shelf */}
                  <div
                    className={`trunk-item ${item.color} shelf ${isDragging ? 'dragging' : ''}`}
                    style={isDragging ? {
                      position: 'fixed',
                      left: `${dragPos.x - dragOffset.x}px`,
                      top: `${dragPos.y - dragOffset.y}px`,
                      width: `${item.w * CELL_SIZE}px`,
                      height: `${item.h * CELL_SIZE}px`,
                      zIndex: 999
                    } : {
                      width: `${item.w * CELL_SIZE}px`,
                      height: `${item.h * CELL_SIZE}px`
                    }}
                    onPointerDown={(e) => handlePointerDown(e, item)}
                    onPointerMove={(e) => handlePointerMove(e, item)}
                    onPointerUp={(e) => handlePointerUp(e, item)}
                  >
                    <div className="item-inner">
                      {Icon && <Icon size={18} className="item-icon" />}
                      <span className="item-label">{item.name}</span>
                    </div>
                    {!isDragging && (
                      <button
                        className="rotate-btn"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => rotateItem(item.id)}
                        aria-label="Rotate"
                      >
                        <RotateCw size={12} />
                      </button>
                    )}
                  </div>

                  {/* Placeholder box in flex layout during drag to keep other cards from shifting */}
                  {isDragging && (
                    <div
                      style={{
                        width: `${item.w * CELL_SIZE}px`,
                        height: `${item.h * CELL_SIZE}px`,
                        border: '2.5px dashed rgba(32,50,51,0.15)',
                        borderRadius: '10px'
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

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

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Car, RotateCcw, Trophy } from 'lucide-react';

const VEHICLE_LEVELS = [
  {
    name: 'Morning Commute',
    vehicles: [
      { id: 'player', name: 'SUV', row: 2, col: 1, size: 2, orientation: 'h', color: 'coral', isTarget: true },
      { id: 'truck1', name: 'Truck', row: 0, col: 3, size: 3, orientation: 'v', color: 'blue' },
      { id: 'car1', name: 'Car', row: 3, col: 4, size: 2, orientation: 'h', color: 'orange' },
      { id: 'car2', name: 'Car', row: 4, col: 0, size: 2, orientation: 'v', color: 'purple' },
      { id: 'truck2', name: 'Bus', row: 5, col: 2, size: 3, orientation: 'h', color: 'yellow' }
    ]
  },
  {
    name: 'Rush Hour',
    vehicles: [
      { id: 'player', name: 'SUV', row: 2, col: 1, size: 2, orientation: 'h', color: 'coral', isTarget: true },
      { id: 'car1', name: 'Car', row: 0, col: 2, size: 2, orientation: 'v', color: 'blue' },
      { id: 'truck1', name: 'Truck', row: 0, col: 4, size: 3, orientation: 'v', color: 'orange' },
      { id: 'car2', name: 'Car', row: 3, col: 0, size: 2, orientation: 'h', color: 'purple' },
      { id: 'car3', name: 'Car', row: 3, col: 2, size: 2, orientation: 'v', color: 'mint' },
      { id: 'car4', name: 'Car', row: 4, col: 3, size: 2, orientation: 'h', color: 'yellow' },
      { id: 'car5', name: 'Car', row: 1, col: 0, size: 2, orientation: 'v', color: 'blue' }
    ]
  },
  {
    name: 'Gridlock Grid',
    vehicles: [
      { id: 'player', name: 'SUV', row: 2, col: 0, size: 2, orientation: 'h', color: 'coral', isTarget: true },
      { id: 'truck1', name: 'Truck', row: 0, col: 2, size: 3, orientation: 'v', color: 'blue' },
      { id: 'car1', name: 'Car', row: 0, col: 3, size: 2, orientation: 'h', color: 'purple' },
      { id: 'car2', name: 'Car', row: 1, col: 5, size: 2, orientation: 'v', color: 'orange' },
      { id: 'truck2', name: 'Bus', row: 3, col: 0, size: 3, orientation: 'v', color: 'mint' },
      { id: 'car3', name: 'Car', row: 3, col: 3, size: 2, orientation: 'h', color: 'yellow' },
      { id: 'car4', name: 'Car', row: 4, col: 3, size: 2, orientation: 'v', color: 'blue' },
      { id: 'car5', name: 'Car', row: 5, col: 1, size: 2, orientation: 'h', color: 'purple' },
      { id: 'car6', name: 'Car', row: 4, col: 5, size: 2, orientation: 'v', color: 'orange' }
    ]
  }
];

export default function TrafficJamGame({ round, updateRound, feedback }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [vehicles, setVehicles] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  // Drag coordinates
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartVal = useRef(0); // Col or row when dragging started
  const cellPixSize = 42; // Grid cell size in pixels

  const currentLevel = VEHICLE_LEVELS[levelIndex];

  // Initialize Level
  useEffect(() => {
    setVehicles(JSON.parse(JSON.stringify(currentLevel.vehicles)));
    setMoves(0);
    setIsWon(false);
    updateRound({ count: 0 });
  }, [levelIndex, currentLevel, updateRound]);

  const handleReset = () => {
    setVehicles(JSON.parse(JSON.stringify(currentLevel.vehicles)));
    setMoves(0);
    setIsWon(false);
    updateRound({ count: 0 });
    feedback('tap');
  };

  // Helper to build 6x6 occupancy grid
  const getOccupancyGrid = (excludeId) => {
    const grid = Array(6).fill(null).map(() => Array(6).fill(null));
    vehicles.forEach(v => {
      if (v.id === excludeId) return;
      if (v.orientation === 'h') {
        for (let c = 0; c < v.size; c++) {
          if (v.row >= 0 && v.row < 6 && v.col + c >= 0 && v.col + c < 6) {
            grid[v.row][v.col + c] = v.id;
          }
        }
      } else {
        for (let r = 0; r < v.size; r++) {
          if (v.row + r >= 0 && v.row + r < 6 && v.col >= 0 && v.col < 6) {
            grid[v.row + r][v.col] = v.id;
          }
        }
      }
    });
    return grid;
  };

  // Calculate sliding boundaries for a vehicle
  const getLimits = (vehicle, occupancy) => {
    let minVal = 0;
    let maxVal = 6 - vehicle.size;

    if (vehicle.orientation === 'h') {
      const r = vehicle.row;
      // Scan left to find the first blocked cell
      for (let c = vehicle.col - 1; c >= 0; c--) {
        if (occupancy[r][c] !== null) {
          minVal = c + 1;
          break;
        }
      }
      // Scan right to find the first blocked cell
      for (let c = vehicle.col + vehicle.size; c < 6; c++) {
        if (occupancy[r][c] !== null) {
          maxVal = c - vehicle.size;
          break;
        }
      }
    } else {
      const c = vehicle.col;
      // Scan up to find first blocked cell
      for (let r = vehicle.row - 1; r >= 0; r--) {
        if (occupancy[r][c] !== null) {
          minVal = r + 1;
          break;
        }
      }
      // Scan down to find first blocked cell
      for (let r = vehicle.row + vehicle.size; r < 6; r++) {
        if (occupancy[r][c] !== null) {
          maxVal = r - vehicle.size;
          break;
        }
      }
    }

    return { minVal, maxVal };
  };

  const handlePointerDown = (e, vehicle) => {
    if (isWon) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    setDraggingId(vehicle.id);
    dragStartPos.current = { x: e.clientX, y: e.clientY };

    // Get current position from state
    const currentVeh = vehicles.find(v => v.id === vehicle.id);
    dragStartVal.current = currentVeh.orientation === 'h' ? currentVeh.col : currentVeh.row;
  };

  const handlePointerMove = (e, vehicle) => {
    if (draggingId !== vehicle.id) return;
    e.preventDefault();

    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;

    const occupancy = getOccupancyGrid(vehicle.id);
    const { minVal, maxVal } = getLimits(vehicle, occupancy);

    setVehicles(prev => prev.map(v => {
      if (v.id !== vehicle.id) return v;

      if (v.orientation === 'h') {
        const cellDelta = deltaX / cellPixSize;
        let targetCol = dragStartVal.current + cellDelta;
        const limitRight = v.isTarget ? 6 : maxVal;
        targetCol = Math.max(minVal, Math.min(limitRight, targetCol));
        return { ...v, col: targetCol };
      } else {
        const cellDelta = deltaY / cellPixSize;
        let targetRow = dragStartVal.current + cellDelta;
        targetRow = Math.max(minVal, Math.min(maxVal, targetRow));
        return { ...v, row: targetRow };
      }
    }));
  };

  const handlePointerUp = (e, vehicle) => {
    if (draggingId !== vehicle.id) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDraggingId(null);

    setVehicles(prev => {
      const latestVehicle = prev.find(v => v.id === vehicle.id);
      if (!latestVehicle) return prev;

      const finalCol = Math.round(latestVehicle.col);
      const finalRow = Math.round(latestVehicle.row);

      const moved = latestVehicle.orientation === 'h'
        ? finalCol !== dragStartVal.current
        : finalRow !== dragStartVal.current;

      const nextVehicles = prev.map(v => {
        if (v.id !== vehicle.id) return v;
        return { ...v, col: finalCol, row: finalRow };
      });

      if (moved) {
        setMoves(m => m + 1);
        feedback('tap');
      }

      // Check win condition
      if (latestVehicle.isTarget && finalCol + latestVehicle.size >= 6) {
        setIsWon(true);
        updateRound({ count: 1 });
        feedback('success');
      }

      return nextVehicles;
    });
  };

  const handleNextLevel = () => {
    setLevelIndex(prev => (prev + 1) % VEHICLE_LEVELS.length);
  };

  return (
    <div className="round-widget traffic-jam-widget">
      <div className="progress-label">
        <b>Gridlock: {currentLevel.name}</b>
        <span>Moves: {moves}</span>
      </div>

      <div className="traffic-board-wrapper">
        <div className="traffic-exit-arrow">
          <ArrowRight size={18} />
        </div>

        <div className="traffic-grid" style={{ width: `${6 * cellPixSize}px`, height: `${6 * cellPixSize}px` }}>
          {/* Base Grid cells */}
          {Array.from({ length: 36 }).map((_, index) => {
            const r = Math.floor(index / 6);
            const isExitRow = r === 2;
            return (
              <div
                key={index}
                className={`traffic-cell ${isExitRow ? 'exit-row' : ''}`}
              />
            );
          })}

          {/* Vehicles layer */}
          {vehicles.map(v => {
            const isHoriz = v.orientation === 'h';
            return (
              <div
                key={v.id}
                className={`traffic-vehicle ${v.color} ${v.isTarget ? 'target-car' : ''}`}
                style={{
                  left: `${v.col * cellPixSize + 2}px`,
                  top: `${v.row * cellPixSize + 2}px`,
                  width: `${(isHoriz ? v.size * cellPixSize : cellPixSize) - 4}px`,
                  height: `${(!isHoriz ? v.size * cellPixSize : cellPixSize) - 4}px`
                }}
                onPointerDown={(e) => handlePointerDown(e, v)}
                onPointerMove={(e) => handlePointerMove(e, v)}
                onPointerUp={(e) => handlePointerUp(e, v)}
              >
                <div className="vehicle-body">
                  <Car size={16} className="car-icon" />
                  <span className="vehicle-tag">{v.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="traffic-actions">
        <button className="text-button" onClick={handleReset}>
          <RotateCcw size={13} /> Reset Layout
        </button>
      </div>

      <small>
        Slide cars back and forth. Get the red SUV out of the exit on the right!
      </small>

      {isWon && (
        <div className="traffic-overlay win">
          <div className="overlay-content">
            <Trophy size={48} className="win-trophy" />
            <h3>Traffic Cleared!</h3>
            <p>You escaped in {moves} moves.</p>
            <div className="overlay-buttons">
              <button className="primary" onClick={handleNextLevel}>
                Next Jam <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

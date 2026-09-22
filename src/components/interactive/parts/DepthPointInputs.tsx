import React from 'react';

interface DepthPointInputsProps {
  depth: number | '';
  points: number | '';
  onDepthChange: (value: number | '') => void;
  onPointsChange: (value: number | '') => void;
  maxDepth?: number;
}

export default function DepthPointInputs({ depth, points, onDepthChange, onPointsChange, maxDepth = 30 }: DepthPointInputsProps) {
  // Ensure we have a valid number for the slider fallback
  const sliderDepth = depth === '' ? 1 : depth;
  const sliderPoints = points === '' ? 1 : points;

  return (
    <div className="input-row">
      <div className="input-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ margin: 0 }}>Kedalaman (m)</label>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#800000' }}>{depth === '' ? 0 : depth} m</span>
        </div>
        <input
          type="range"
          className="range-slider"
          value={sliderDepth}
          onChange={(e) => onDepthChange(Number(e.target.value))}
          min="1"
          max={maxDepth}
          step="1"
        />
        <input
          type="number"
          placeholder="cth: 12"
          className="text-input"
          style={{ display: 'none' }} // Hidden, relying on slider for cleaner UI
          value={depth}
          onChange={(e) => onDepthChange(e.target.value === '' ? '' : Number(e.target.value))}
          min="1"
        />
      </div>
      <div className="input-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ margin: 0 }}>Jumlah Titik</label>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#800000' }}>{points === '' ? 0 : points} titik</span>
        </div>
        <input
          type="range"
          className="range-slider"
          value={sliderPoints}
          onChange={(e) => onPointsChange(Number(e.target.value))}
          min="1"
          max="200"
          step="1"
        />
        <input
          type="number"
          placeholder="cth: 45"
          className="text-input"
          style={{ display: 'none' }}
          value={points}
          onChange={(e) => onPointsChange(e.target.value === '' ? '' : Number(e.target.value))}
          min="1"
        />
      </div>
    </div>
  );
}

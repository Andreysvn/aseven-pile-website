import React from 'react';

interface DiameterSelectorProps {
  diameters: number[];
  value: number;
  onChange: (value: number) => void;
}

export default function DiameterSelector({ diameters, value, onChange }: DiameterSelectorProps) {
  return (
    <div className="input-group">
      <label>Diameter Pengeboran</label>
      <div className="radio-group" style={{ gridTemplateColumns: `repeat(${diameters.length}, 1fr)` }}>
        {diameters.map((d) => (
          <label key={d} className="radio-card">
            <input type="radio" name="diameter" value={d} checked={value === d} onChange={() => onChange(d)} />
            <span>{d} cm</span>
          </label>
        ))}
      </div>
    </div>
  );
}

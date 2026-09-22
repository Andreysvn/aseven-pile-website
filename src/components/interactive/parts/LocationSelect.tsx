import React from 'react';
import type { LocationOption } from '../calculator.config';

interface LocationSelectProps {
  locations: LocationOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function LocationSelect({ locations, value, onChange }: LocationSelectProps) {
  return (
    <div className="input-group">
      <label>Lokasi Proyek</label>
      <select className="select-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {locations.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

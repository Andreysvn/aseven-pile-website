import React from 'react';

interface ToolOption {
  value: string;
  label: string;
}

interface ToolSelectorProps {
  options: ToolOption[];
  value: string;
  onChange: (value: string) => void;
  tooltip: string;
}

export default function ToolSelector({ options, value, onChange, tooltip }: ToolSelectorProps) {
  return (
    <div className="input-group">
      <label>Jenis Alat <span className="tooltip-icon" data-tip={tooltip}>?</span></label>
      {options.length > 1 ? (
        <div className="radio-group">
          {options.map((t) => (
            <label key={t.value} className="radio-card">
              <input type="radio" name="tool" value={t.value} checked={value === t.value} onChange={() => onChange(t.value)} />
              <span>{t.label}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="tool-static">{options[0].label}</div>
      )}
    </div>
  );
}

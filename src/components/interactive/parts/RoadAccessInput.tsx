import React from 'react';

interface RoadAccessInputProps {
  value: 'wide' | 'narrow';
  onChange: (value: 'wide' | 'narrow') => void;
  tool: string;
  showWarning: boolean;
}

export default function RoadAccessInput({ value, onChange, tool, showWarning }: RoadAccessInputProps) {
  return (
    <div className="input-group">
      <label>Akses Jalan <span className="tooltip-icon" data-tip="Menentukan jenis alat berat yang bisa masuk lokasi">?</span></label>
      <div className="radio-group" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <label className="radio-card">
          <input type="radio" name="road" value="wide" checked={value === 'wide'} onChange={() => onChange('wide')} />
          <span>Masuk Truk (&gt; 3m)</span>
        </label>
        <label className="radio-card">
          <input type="radio" name="road" value="narrow" checked={value === 'narrow'} onChange={() => onChange('narrow')} />
          <span>Gang Sempit (&lt; 3m)</span>
        </label>
      </div>
      {value === 'narrow' && (
        <div className="warning-box" style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fffbeb', borderLeft: '4px solid #b45309', borderRadius: '4px', fontSize: '13.5px', color: '#78350f', lineHeight: 1.5 }}>
          <strong style={{ color: '#b45309', display: 'block', marginBottom: '4px' }}>Perhatian:</strong>
          Karena akses jalan sempit/gang, mobilisasi alat mesin (Mini Crane / Gawangan) kemungkinan tidak muat. Disarankan menggunakan metode <strong>Strauss Pile (Manual)</strong>. Kekurangannya: kedalaman maksimal hanya ~6 meter tergantung karakteristik tanah.
        </div>
      )}
    </div>
  );
}

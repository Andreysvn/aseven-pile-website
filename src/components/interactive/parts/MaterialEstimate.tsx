import React from 'react';
import type { MaterialResult } from '../useCalculator';

interface MaterialEstimateProps {
  materials: MaterialResult;
}

export default function MaterialEstimate({ materials }: MaterialEstimateProps) {
  return (
    <div className="material-box">
      <div className="material-header">Estimasi Kebutuhan Material (Belanja Sendiri):</div>
      <ul>
        <li style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ flex: 1 }}>Beton K-250 - K-300 (Ready Mix) <span className="tooltip-icon" data-tip="Asumsi +10% waste factor karena lubang galian tidak beraturan">?</span></span>
          <strong>~{materials.betonM3} m³</strong>
        </li>
        <li style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ flex: 1 }}>Besi Utama ({materials.utama.spec}) <span className="tooltip-icon" data-tip="Pembelian dalam bentuk lonjoran/batang standar 12m">?</span></span>
          <strong>~{materials.utama.batang} btg</strong>
        </li>
        <li style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ flex: 1 }}>Besi Spiral ({materials.spiral.spec}) <span className="tooltip-icon" data-tip="Sengkang dibentuk melingkar untuk menahan besi utama">?</span></span>
          <strong>~{materials.spiral.batang} btg</strong>
        </li>
      </ul>
      <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.4' }}>
        <div style={{ marginBottom: '4px' }}>*Rumus perhitungan besi menggunakan standar per-batang 12m.</div>
        <div>*Note: Estimasi material di atas hanya perkiraan, bisa berbeda tergantung kondisi lapangan.</div>
      </div>
    </div>
  );
}

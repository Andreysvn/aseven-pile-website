import React from 'react';
import type { CalculationResult } from '../useCalculator';

interface ResultDisplayProps {
  calculation: CalculationResult;
  packageType: 'jasa' | 'allin';
  activeTab: 'borepile' | 'strauss';
  includeMob: boolean;
  onToggleMob: (checked: boolean) => void;
  formatRupiah: (num: number) => string;
  lumpsumMinimum: number;
  waUrl: string;
}

export default function ResultDisplay({
  calculation,
  packageType,
  activeTab,
  includeMob,
  onToggleMob,
  formatRupiah,
  lumpsumMinimum,
  waUrl
}: ResultDisplayProps) {
  const formatRangeShort = (min: number, max: number, prefix = '') => {
    if (min === max) return `${prefix}${formatRupiah(min)}`;
    return `${prefix}Rp ${formatRupiah(min).replace('Rp ', '')} - ${formatRupiah(max).replace('Rp ', '')}`;
  };

  return (
    <div className="result-box">
      <span className="result-label">Estimasi Total Biaya Proyek</span>
      <span className="result-value">
        {calculation.totalMeters === 0 
          ? 'Rp 0' 
          : (packageType === 'allin' && (calculation.tier?.materialCostEstimate || 0) === 0)
            ? 'Diskusikan via WA'
            : formatRangeShort(calculation.minTotal, calculation.maxTotal)}
      </span>

      <div className="breakdown-container">
        {calculation.totalMeters > 0 && (
          <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className="breakdown-row" style={{ alignItems: 'center', marginBottom: 0, paddingBottom: '6px', borderBottom: '1px dashed #cbd5e1' }}>
              <span style={{ color: '#475569', fontWeight: 600 }}>Total Volume</span>
              <strong>{calculation.totalMeters} m¹</strong>
            </div>
            <div className="breakdown-row" style={{ alignItems: 'center', marginBottom: 0 }}>
              <span style={{ color: '#475569', fontWeight: 600 }}>Estimasi Durasi</span>
              <strong>{calculation.minDays === calculation.maxDays ? calculation.minDays : `${calculation.minDays} - ${calculation.maxDays}`} Hari Kerja</strong>
            </div>
          </div>
        )}

        <div className="breakdown-row" style={{ alignItems: 'center', padding: '0 12px' }}>
          <span>
            Biaya {packageType === 'allin' ? 'Jasa Pengeboran' : 'Jasa'}
            {calculation.totalMeters > 0 && (
              <small style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>
                ({calculation.effectiveMeters}m¹ &times; {formatRupiah(calculation.tier?.pricePerMeter.min || 0).replace(/\.000$/, 'rb')}{(calculation.tier?.pricePerMeter.max || 0) > (calculation.tier?.pricePerMeter.min || 0) ? `-${formatRupiah(calculation.tier?.pricePerMeter.max || 0).replace(/\.000$/, 'rb')}` : ''})
              </small>
            )}
          </span>
          <strong>{formatRangeShort(calculation.minJasa, calculation.maxJasa)}</strong>
        </div>

        {packageType === 'allin' && (
          <div className="breakdown-row" style={{ alignItems: 'center', padding: '0 12px' }}>
            <span>
              Estimasi Material
              {calculation.totalMeters > 0 && (calculation.tier?.materialCostEstimate || 0) > 0 && (
                <small style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>
                  ({calculation.effectiveMeters}m¹ &times; {formatRupiah(calculation.tier?.materialCostEstimate || 0).replace(/\.000$/, 'rb')})
                </small>
              )}
            </span>
            <strong style={{ color: (calculation.tier?.materialCostEstimate || 0) === 0 ? '#b91c1c' : '#0f172a' }}>
              {(calculation.tier?.materialCostEstimate || 0) === 0 
                ? 'Hubungi Kami' 
                : `+ ${formatRupiah(calculation.totalMaterial)}`}
            </strong>
          </div>
        )}

        {activeTab === 'borepile' && (
          <div className="breakdown-row" style={{ padding: '8px 12px', backgroundColor: includeMob ? '#f0fdf4' : '#f8fafc', borderRadius: '4px', border: `1px solid ${includeMob ? '#bbf7d0' : '#e2e8f0'}`, alignItems: 'center', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }}>
              <input
                type="checkbox"
                checked={includeMob}
                onChange={(e) => onToggleMob(e.target.checked)}
                style={{ marginRight: '8px', cursor: 'pointer', width: '16px', height: '16px', accentColor: '#16a34a' }}
              />
              <span>Mob/Demob ({calculation.locData?.label.split(' ')[0]})</span>
            </label>
              <strong style={{ color: includeMob ? '#212529' : '#9ca3af', textDecoration: includeMob ? 'none' : 'line-through', textAlign: 'right', marginLeft: '8px' }}>
                {calculation.isCustomMob ? 'Diskusikan via WA' : formatRangeShort(calculation.baseMobMin, calculation.baseMobMax, '+ ')}
              </strong>
          </div>
        )}
      </div>

      <div className="result-note" style={{ marginTop: '24px' }}>
        {calculation.isLumpsum && (
          <strong className="lumpsum-warning" style={{ display: 'block', color: '#b91c1c', marginBottom: '8px', padding: '8px', backgroundColor: '#fef2f2', borderLeft: '3px solid #b91c1c' }}>
            *Perhatian: Total volume di bawah {lumpsumMinimum}m akan dikenakan harga cash minimum / borongan (dihitung flat {lumpsumMinimum}m).
          </strong>
        )}
        <div style={{ marginBottom: '4px' }}>*Belum termasuk biaya pembuatan bak sirkulasi air & lumpur.</div>
        <div style={{ marginBottom: '4px' }}>*Belum termasuk biaya buang/sedot sisa lumpur hasil pengeboran.</div>
        <div style={{ marginBottom: '4px' }}>*Sudah termasuk perakitan dan pemasangan besi, serta pengecoran beton.</div>
        <div>*Note: harga di atas hanyalah estimasi, hubungi kami untuk penawaran harga resmi dan kesepakatan harga.</div>
      </div>
    </div>
  );
}

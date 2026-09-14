import React, { useState, useMemo } from 'react';
import { pricingTiers, straussTiers, pricingConfig } from '../../data/pricing';

export default function CalculatorUI() {
  const [activeTab, setActiveTab] = useState('borepile');
  const [diameter, setDiameter] = useState<number>(30);
  const [depth, setDepth] = useState<number | ''>('');
  const [points, setPoints] = useState<number | ''>('');
  const [packageType, setPackageType] = useState('jasa');
  const [tool, setTool] = useState('mini-crane');

  // Pilih data harga berdasarkan tab aktif
  const activeTiers = activeTab === 'borepile' ? pricingTiers : straussTiers;
  const availableDiameters = activeTiers.map(t => t.diameter);

  // Opsi alat berdasarkan metode
  const toolOptions = activeTab === 'borepile'
    ? [
        { value: 'mini-crane', label: 'Mini Crane' },
        { value: 'gawangan', label: 'Gawangan' },
        { value: 'mini-pile', label: 'Mini Pile' },
      ]
    : [{ value: 'strauss', label: 'Strauss Pile (Manual)' }];

  // Reset diameter & alat saat ganti tab
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const newTiers = tab === 'borepile' ? pricingTiers : straussTiers;
    setDiameter(newTiers[0].diameter);
    setTool(tab === 'borepile' ? 'mini-crane' : 'strauss');
  };

  const calculation = useMemo(() => {
    const dNum = Number(depth) || 0;
    const pNum = Number(points) || 0;
    const totalMeters = dNum * pNum;
    const tier = activeTiers.find(t => t.diameter === diameter) || activeTiers[0];
    const isLumpsum = totalMeters > 0 && totalMeters < pricingConfig.minimumDepthLumpsum;
    const effectiveMeters = isLumpsum ? pricingConfig.minimumDepthLumpsum : totalMeters;
    const minTotal = effectiveMeters * tier.pricePerMeter.min;
    const maxTotal = effectiveMeters * tier.pricePerMeter.max;
    return { totalMeters, effectiveMeters, isLumpsum, minTotal, maxTotal, isEstimate: tier.isEstimate };
  }, [diameter, depth, points, activeTiers]);

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);

  const toolLabel = toolOptions.find(t => t.value === tool)?.label || tool;

  const generateWaUrl = () => {
    const phone = '6285814173761';
    const text = `Halo ASEVEN PILE, saya ingin konsultasi proyek pondasi.\n\n*Estimasi Kalkulator:*\n- Metode: ${activeTab === 'borepile' ? 'Bore Pile Mesin' : 'Strauss Pile Manual'}\n- Alat: ${toolLabel}\n- Diameter: ${diameter} cm\n- Kedalaman: ${depth || 0} meter/titik\n- Jumlah: ${points || 0} titik\n- Total Pengeboran: ${calculation.totalMeters} meter\n- Paket: ${packageType === 'jasa' ? 'Hanya Jasa Pengeboran' : 'All-In'}\n\nMohon info lebih detail. Terima kasih.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="calc-wrapper">
      {/* Header */}
      <div className="calc-header">
        <h3>Kalkulator Estimasi Biaya</h3>
        <p>Pilih metode dan masukkan spesifikasi proyek Anda.</p>
      </div>

      {/* Tabs */}
      <div className="calc-tabs">
        <button className={`tab-btn ${activeTab === 'borepile' ? 'active' : ''}`} onClick={() => handleTabChange('borepile')}>
          Bore Pile (Mesin)
        </button>
        <button className={`tab-btn ${activeTab === 'strauss' ? 'active' : ''}`} onClick={() => handleTabChange('strauss')}>
          Strauss Pile (Manual)
        </button>
      </div>

      {/* Body */}
      <div className="calc-body">
        {/* Pilihan Alat */}
        <div className="input-group">
          <label>Jenis Alat</label>
          {toolOptions.length > 1 ? (
            <div className="radio-group">
              {toolOptions.map((t) => (
                <label key={t.value} className="radio-card">
                  <input type="radio" name="tool" value={t.value} checked={tool === t.value} onChange={() => setTool(t.value)} />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="tool-static">{toolOptions[0].label}</div>
          )}
        </div>

        {/* Diameter */}
        <div className="input-group">
          <label>Diameter Pengeboran</label>
          <div className="radio-group">
            {availableDiameters.map((d) => (
              <label key={d} className="radio-card">
                <input type="radio" name="diameter" value={d} checked={diameter === d} onChange={() => setDiameter(d)} />
                <span>{d} cm</span>
              </label>
            ))}
          </div>
        </div>

        {/* Depth + Points */}
        <div className="input-row">
          <div className="input-group">
            <label>Kedalaman per Titik (m)</label>
            <input type="number" placeholder="cth: 12" className="text-input" value={depth} onChange={(e) => setDepth(e.target.value === '' ? '' : Number(e.target.value))} min="1" />
          </div>
          <div className="input-group">
            <label>Jumlah Titik Bor</label>
            <input type="number" placeholder="cth: 45" className="text-input" value={points} onChange={(e) => setPoints(e.target.value === '' ? '' : Number(e.target.value))} min="1" />
          </div>
        </div>

        {/* Package */}
        <div className="input-group">
          <label>Paket Layanan</label>
          <select className="select-input" value={packageType} onChange={(e) => setPackageType(e.target.value)}>
            <option value="jasa">Hanya Jasa Pengeboran</option>
            <option value="allin">All-In (Jasa + Beton + Besi)</option>
          </select>
          {packageType === 'allin' && (
            <small className="allin-note">*Kalkulator hanya menghitung jasa dasar. Biaya material dihitung terpisah menyesuaikan harga pasar.</small>
          )}
        </div>
      </div>

      {/* Footer / Result */}
      <div className="calc-footer">
        <div className="result-box">
          <span className="result-label">Estimasi Biaya Jasa Dasar</span>
          <span className="result-value">
            {calculation.totalMeters === 0
              ? 'Rp 0'
              : calculation.minTotal === calculation.maxTotal
                ? formatRupiah(calculation.minTotal)
                : `${formatRupiah(calculation.minTotal)} – ${formatRupiah(calculation.maxTotal)}`}
          </span>
          <small className="result-note">
            {calculation.isLumpsum && (
              <strong className="lumpsum-warning">
                *Total bor di bawah {pricingConfig.minimumDepthLumpsum}m → berlaku tarif Lumpsum.
              </strong>
            )}
            {calculation.isEstimate ? '*Harga masih berupa range estimasi. ' : ''}
            *Belum termasuk mobilisasi alat {formatRupiah(pricingConfig.mobilizationFee)}.
          </small>
        </div>
        <a href={generateWaUrl()} target="_blank" rel="noopener noreferrer" className="calc-cta-btn">
          Kirim Rincian ke WhatsApp
        </a>
      </div>

      <style>{`
        /* ===== WRAPPER ===== */
        .calc-wrapper {
          background: #fff;
          border: 1px solid #dee2e6;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,.08), 0 8px 10px -6px rgba(0,0,0,.06);
          overflow: hidden;
          max-width: 560px;
          margin: 0 auto;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* ===== HEADER ===== */
        .calc-header {
          background: #f8f9fa;
          padding: 20px 16px;
          border-bottom: 1px solid #e9ecef;
          text-align: center;
        }
        .calc-header h3 {
          margin: 0 0 4px;
          color: #800000;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 18px;
          font-weight: 700;
        }
        .calc-header p {
          margin: 0;
          font-size: 13px;
          color: #6c757d;
        }

        /* ===== TABS ===== */
        .calc-tabs {
          display: flex;
          border-bottom: 1px solid #dee2e6;
          background: #f8f9fa;
        }
        .tab-btn {
          flex: 1;
          padding: 12px 8px;
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: #6c757d;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 150ms;
        }
        .tab-btn:hover { color: #a52a2a; }
        .tab-btn.active {
          color: #800000;
          border-bottom-color: #800000;
          background: #fff;
        }

        /* ===== BODY ===== */
        .calc-body {
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input-group > label {
          font-size: 13px;
          font-weight: 600;
          color: #212529;
        }

        /* ===== RADIO CARDS ===== */
        .radio-group {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .radio-card {
          position: relative;
          display: block;
          cursor: pointer;
        }
        .radio-card input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }
        .radio-card span {
          display: block;
          text-align: center;
          padding: 10px 4px;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #212529;
          transition: all 150ms;
        }
        .radio-card span:hover {
          border-color: #a52a2a;
        }
        .radio-card input:checked + span {
          background: #800000;
          color: #fff;
          border-color: #800000;
        }

        /* ===== INPUT ROW ===== */
        .input-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        /* ===== TEXT & SELECT INPUTS ===== */
        .text-input, .select-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          font-family: inherit;
          font-size: 16px;
          color: #212529;
          background: #fff;
          transition: border-color 150ms;
          -webkit-appearance: none;
          box-sizing: border-box;
        }
        .text-input:focus, .select-input:focus {
          outline: none;
          border-color: #800000;
          box-shadow: 0 0 0 3px rgba(128, 0, 0, 0.1);
        }

        .allin-note {
          color: #e0a800;
          font-size: 12px;
          line-height: 1.4;
        }

        .tool-static {
          padding: 10px 16px;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #6c757d;
        }

        /* ===== FOOTER / RESULT ===== */
        .calc-footer {
          padding: 20px 16px;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
        }
        .result-box {
          text-align: center;
          margin-bottom: 16px;
          padding: 16px 12px;
          background: #fff;
          border-radius: 8px;
          border: 1px dashed #dee2e6;
        }
        .result-label {
          display: block;
          font-size: 11px;
          color: #6c757d;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
        }
        .result-value {
          display: block;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #212529;
          margin-bottom: 8px;
          word-break: break-word;
        }
        .result-note {
          display: block;
          font-size: 11px;
          color: #6c757d;
          line-height: 1.5;
        }
        .lumpsum-warning {
          display: block;
          color: #800000;
          margin-bottom: 4px;
        }

        /* ===== CTA BUTTON ===== */
        .calc-cta-btn {
          display: block;
          width: 100%;
          padding: 14px;
          background: #800000;
          color: #fff;
          text-align: center;
          text-decoration: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 600;
          font-size: 15px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: background 150ms;
          box-sizing: border-box;
        }
        .calc-cta-btn:hover {
          background: #4a0000;
        }

        /* ===== TABLET (640px+) ===== */
        @media (min-width: 640px) {
          .calc-wrapper {
            max-width: 560px;
          }
          .calc-header {
            padding: 24px;
          }
          .calc-body {
            padding: 24px;
          }
          .calc-footer {
            padding: 24px;
          }
          .radio-group {
            grid-template-columns: repeat(5, 1fr);
          }
          .input-row {
            grid-template-columns: 1fr 1fr;
          }
          .result-value {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
}

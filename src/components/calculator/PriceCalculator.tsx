import React, { useState } from 'react';
import { siteConfig } from '../../data/site.config';
import { straussTiers, pricingTiers, pricingConfig } from '../../data/pricing';

function getTierPrice(tiers: { diameter: number; pricePerMeter: { min: number; max: number } }[], diameter: number) {
  const tier = tiers.find(t => t.diameter === diameter);
  return tier ? tier.pricePerMeter.min : 0;
}

export default function PriceCalculator() {
  const [method, setMethod] = useState('strauss');
  const [diameter, setDiameter] = useState(20);
  const [depth, setDepth] = useState(6);
  const [points, setPoints] = useState(10);

  const calculatePrice = () => {
    const tiers = method === 'strauss' ? straussTiers : pricingTiers;
    const basePrice = getTierPrice(tiers, diameter);
    const totalMeter = depth * points;
    const mobDemob = method === 'mesin' ? pricingConfig.mobilizationFee : 0;
    const totalCost = basePrice * totalMeter + mobDemob;

    return { totalCost, totalMeter, basePrice, mobDemob };
  };

  const { totalCost, totalMeter, basePrice, mobDemob } = calculatePrice();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
      
      {/* Kiri: Form Input */}
      <div style={{ flex: '1 1 350px', background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', color: '#1e293b' }}>Spesifikasi Proyek</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Metode Pengeboran</label>
          <select value={method} onChange={(e) => { setMethod(e.target.value); setDiameter(method === 'strauss' ? 20 : 30); }} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <option value="strauss">Strauss Pile Manual</option>
            <option value="mesin">Bore Pile Mesin (Mini Crane/Gawang)</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Diameter Bor (cm)</label>
          <select value={diameter} onChange={(e) => setDiameter(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            {method === 'strauss' ? (
              <>
                <option value={20}>20 cm</option>
                <option value={25}>25 cm</option>
                <option value={30}>30 cm</option>
                <option value={40}>40 cm</option>
              </>
            ) : (
              <>
                <option value={30}>30 cm</option>
                <option value={40}>40 cm</option>
                <option value={50}>50 cm</option>
              </>
            )}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Kedalaman / Titik (m)</label>
            <input type="number" min="1" value={depth} onChange={(e) => setDepth(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Jumlah Titik</label>
            <input type="number" min="1" value={points} onChange={(e) => setPoints(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
        </div>
      </div>

      {/* Kanan: Hasil Estimasi */}
      <div style={{ flex: '1 1 350px', background: '#fafafa', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Estimasi Biaya Jasa</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed #cbd5e1' }}>
          <span style={{ color: '#475569' }}>Total Volume</span>
          <strong style={{ color: '#0f172a' }}>{totalMeter} Meter</strong>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed #cbd5e1' }}>
          <span style={{ color: '#475569' }}>Harga per Meter</span>
          <strong style={{ color: '#0f172a' }}>Rp {basePrice.toLocaleString('id-ID')}</strong>
        </div>

        {mobDemob > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed #cbd5e1' }}>
            <span style={{ color: '#475569' }}>Mobilisasi Alat (Jabodetabek)</span>
            <strong style={{ color: '#0f172a' }}>Rp {mobDemob.toLocaleString('id-ID')}</strong>
          </div>
        )}

        <div style={{ marginTop: '16px' }}>
          <span style={{ display: 'block', fontSize: '0.875rem', color: '#64748b', marginBottom: '8px' }}>Total Estimasi (Hanya Jasa Pengeboran):</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8b0000' }}>
            Rp {totalCost.toLocaleString('id-ID')}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px', lineHeight: 1.4 }}>
            *Ini adalah kalkulasi kasaran (jasa upah tenaga). Belum termasuk material beton, besi tulangan, dan pembuangan lumpur (buang tanah). Harga fix akan diberikan setelah survei lokasi.
          </p>
        </div>

        <button 
          onClick={() => {
            const text = `Halo ASEVEN PILE, saya sudah cek kalkulator harga:\n- Metode: ${method === 'strauss' ? 'Strauss Pile Manual' : 'Bore Pile Mesin'}\n- Diameter: ${diameter} cm\n- Kedalaman: ${depth} m\n- Jumlah: ${points} titik\n(Total ${totalMeter} meter)\n\nMohon info detail harganya.`;
            window.open(`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(text)}`);
          }}
          style={{ width: '100%', padding: '14px', background: '#25D366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', marginTop: '24px', cursor: 'pointer' }}
        >
          Diskusikan ke WhatsApp
        </button>
      </div>

    </div>
  );
}

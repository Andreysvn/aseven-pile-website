import React from 'react';

interface PackageSelectProps {
  value: 'jasa' | 'allin';
  onChange: (value: 'jasa' | 'allin') => void;
}

export default function PackageSelect({ value, onChange }: PackageSelectProps) {
  return (
    <div className="input-group" style={{ marginBottom: '24px' }}>
      <label style={{ display: 'block', marginBottom: '12px' }}>
        Pilih Layanan <span className="tooltip-icon" data-tip="All-In berarti kami sediakan jasa + besi + beton">?</span>
      </label>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Opsi Hanya Jasa */}
        <div 
          onClick={() => onChange('jasa')}
          style={{
            border: value === 'jasa' ? '2px solid #800000' : '1px solid #cbd5e1',
            backgroundColor: value === 'jasa' ? '#fdf2f2' : '#ffffff',
            padding: '12px 10px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s'
          }}
        >
          {/* Radio Button Custom */}
          <div style={{ 
            width: '18px', height: '18px', flexShrink: 0, borderRadius: '50%', 
            border: value === 'jasa' ? '6px solid #800000' : '2px solid #cbd5e1',
            boxSizing: 'border-box', transition: 'all 0.2s'
          }} />
          <span style={{ fontSize: '13px', fontWeight: value === 'jasa' ? 700 : 500, color: value === 'jasa' ? '#800000' : '#475569', lineHeight: 1.3 }}>
            Hanya Jasa Pengeboran
          </span>
        </div>

        {/* Opsi Jasa + Material (All-In) */}
        <div 
          onClick={() => onChange('allin')}
          style={{
            border: value === 'allin' ? '2px solid #800000' : '1px solid #cbd5e1',
            backgroundColor: value === 'allin' ? '#fdf2f2' : '#ffffff',
            padding: '12px 10px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s'
          }}
        >
          {/* Radio Button Custom */}
          <div style={{ 
            width: '18px', height: '18px', flexShrink: 0, borderRadius: '50%', 
            border: value === 'allin' ? '6px solid #800000' : '2px solid #cbd5e1',
            boxSizing: 'border-box', transition: 'all 0.2s'
          }} />
          <span style={{ fontSize: '13px', fontWeight: value === 'allin' ? 700 : 500, color: value === 'allin' ? '#800000' : '#475569', lineHeight: 1.3 }}>
            Jasa + Material (All-In)
          </span>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

interface PileVisualizerProps {
  tool: string;
  depth: number | '';
  diameter: number;
  packageType: 'jasa' | 'allin';
}

export default function PileVisualizer({ tool, depth, diameter, packageType }: PileVisualizerProps) {
  // Normalize values
  const safeDepth = depth === '' ? 1 : Math.max(1, depth);
  const maxDepth = tool === 'strauss' ? 6 : 30; // Max slider value for scaling
  
  // Calculate hole dimensions
  // Dibikin lebih ramping biar proporsional dengan gambar alat yang udah dikecilin
  const holeWidth = Math.max(22, diameter * 0.6); // 30cm -> 22px, 80cm -> 48px
  const holeDepthRatio = safeDepth / maxDepth;
  const holeHeight = 60 + (holeDepthRatio * 180); // 60px min, 240px max
  
  const groundHeight = 280; // Ditambah biar teks diameter nggak kepotong

  return (
    <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '14px', fontWeight: 700, color: '#475569' }}>
        Visualisasi Struktur Tiang
      </div>
      
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: '320px', 
        height: '440px', // Diperpanjang 20px biar teks muat
        margin: '0 auto', 
        background: '#e0f2fe', // Langit (Sky)
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #cbd5e1'
      }}>
        
        {/* Tanah (Ground) */}
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          width: '100%', 
          height: `${groundHeight}px`, 
          background: '#d6c4b4', // Warna coklat tanah (muted earthy brown)
          borderTop: '2px solid #bba38f' // Garis coklat yang sedikit lebih gelap
        }}>
          {/* Faint subtle texture overlay to prevent flatness without being noisy */}
          <div style={{ 
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: 'url(/images/visualizer/texture-dots.png)', 
            backgroundSize: '120px',
            opacity: 0.12, // Diterangkan sedikit biar tekstur pasirnya pas
            mixBlendMode: 'multiply',
          }} />
        </div>

        {/* Lubang Bor (Hole) */}
        <div style={{ 
          position: 'absolute', 
          top: `${440 - groundHeight}px`, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: `${holeWidth}px`, 
          height: `${holeHeight}px`, 
          background: '#7f1d1d', // Merah Maroon
          borderRadius: '0 0 4px 4px',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.3)'
        }}>
          {/* Besi Spiral & Beton (Rebar & Concrete) - Muncul kalau paket All-in */}
          {packageType === 'allin' && (
            <div style={{
              position: 'absolute',
              top: 0, bottom: 0, left: 0, right: 0,
              background: '#cbd5e1', // Warna cor beton (abu-abu terang)
              display: 'flex',
              justifyContent: 'center',
              boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.1)'
            }}>
              {/* Kerangka Besi Tulangan (Rebar Cage) */}
              <div style={{
                width: '64%', // Selimut beton (concrete cover) di sisi kiri-kanan
                height: '100%',
                borderLeft: '2px solid #334155', // Besi tulangan utama kiri
                borderRight: '2px solid #334155', // Besi tulangan utama kanan
                // Besi cincin / spiral horizontal
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 12px, #475569 12px, #475569 14px)'
              }} />
            </div>
          )}
        </div>

        {/* Alat Bor (Drill Tool) */}
        <img 
          src={`/images/visualizer/${tool}.png`} 
          alt={`Alat ${tool}`}
          style={{ 
            position: 'absolute', 
            bottom: tool === 'gawangan' ? `${groundHeight - 12}px` : `${groundHeight}px`, // gawangan agak diturunin biar napak
            left: tool === 'mini-crane' ? '43%' : '50%', // mini-crane digeser ke kiri biar senter
            transform: 'translateX(-50%)', 
            height: '140px', 
            objectFit: 'contain',
            // Gambar putih murni, pakai multiply supaya transparan
            mixBlendMode: 'multiply',
            zIndex: 10
          }} 
        />

        {/* Info Tinggi Alat (Tool Height Info) */}
        <div style={{ 
          position: 'absolute', 
          bottom: `${groundHeight}px`, 
          left: '50%', 
          marginLeft: tool === 'strauss' ? '110px' : '70px', // Strauss digeser lebih jauh karena gambarnya lebar (ada 2 orang)
          height: '140px', // Sama dengan tinggi gambar alat
          borderRight: '1px dashed #64748b',
          display: 'flex',
          alignItems: 'center'
        }}>
          {/* Batas Atas */}
          <div style={{ position: 'absolute', top: 0, right: '-4px', width: '8px', height: '1px', background: '#64748b' }} />
          {/* Batas Bawah */}
          <div style={{ position: 'absolute', bottom: 0, right: '-4px', width: '8px', height: '1px', background: '#64748b' }} />
          {/* Teks Angka */}
          <div style={{ 
            position: 'absolute', 
            right: '-16px', 
            top: '50%', 
            transform: 'translateY(-50%) rotate(90deg)', 
            color: '#475569', 
            fontSize: '11px', 
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}>
            {tool === 'strauss' ? 'Tinggi ± 2 Meter' : 'Tinggi ± 5 Meter'}
          </div>
        </div>

        {/* Penggaris Kedalaman (Depth Ruler) */}
        <div style={{ 
          position: 'absolute', 
          top: `${440 - groundHeight}px`, 
          left: '50%', 
          marginLeft: `-${(holeWidth / 2) + 25}px`,
          height: `${holeHeight}px`, 
          borderLeft: '2px dashed #f59e0b',
          display: 'flex',
          alignItems: 'center'
        }}>
          {/* Batas Atas */}
          <div style={{ position: 'absolute', top: 0, left: '-6px', width: '10px', height: '2px', background: '#f59e0b' }} />
          {/* Batas Bawah */}
          <div style={{ position: 'absolute', bottom: 0, left: '-6px', width: '10px', height: '2px', background: '#f59e0b' }} />
          {/* Teks Angka */}
          <div style={{ 
            position: 'absolute', 
            left: '-20px', 
            top: '50%', 
            transform: 'translateY(-50%) rotate(-90deg)', 
            color: '#d97706', 
            fontSize: '12px', 
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}>
            {safeDepth} Meter
          </div>
        </div>

        {/* Label Diameter */}
        <div style={{ 
          position: 'absolute', 
          top: `${440 - groundHeight + holeHeight + 8}px`, 
          left: '50%', 
          transform: 'translateX(-50%)',
          color: '#475569', 
          fontSize: '12px', 
          fontWeight: 'bold'
        }}>
          Ø {diameter} cm
        </div>

      </div>
    </div>
  );
}

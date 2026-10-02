import type { CalculatorConfig } from './calculator.config';

export type Tab = 'borepile' | 'strauss';
export type PackageType = 'jasa' | 'allin';
export type RoadAccess = 'wide' | 'narrow';

export interface CalcState {
  activeTab: Tab;
  diameter: number;
  depth: number | '';
  points: number | '';
  packageType: PackageType;
  tool: string;
  location: string;
  roadAccess: RoadAccess;
  includeMob: boolean;
}

export interface CalculationResult {
  totalMeters: number;
  effectiveMeters: number;
  isLumpsum: boolean;
  minTotal: number;
  maxTotal: number;
  minJasa: number;
  maxJasa: number;
  totalMaterial: number;
  mobMin: number;
  mobMax: number;
  baseMobMin: number;
  baseMobMax: number;
  isEstimate: boolean;
  isCustomMob: boolean;
  locData: CalculatorConfig['locations'][number] | undefined;
  tier: CalculatorConfig['tiers'][number] | undefined;
  minDays: number;
  maxDays: number;
}

export interface MaterialResult {
  betonM3: string;
  utama: { batang: number; spec: string };
  spiral: { batang: number; spec: string };
}

export function activeTiersFor(state: CalcState, config: CalculatorConfig) {
  return state.activeTab === 'borepile' ? config.tiers : config.straussTiers;
}

export function toolOptionsFor(state: CalcState, config: CalculatorConfig) {
  return state.activeTab === 'borepile' ? config.toolOptions.borepile : config.toolOptions.strauss;
}

export function toolLabel(state: CalcState, config: CalculatorConfig) {
  const opts = toolOptionsFor(state, config);
  return opts.find(t => t.value === state.tool)?.label || state.tool;
}

export function computeCalculation(state: CalcState, config: CalculatorConfig): CalculationResult {
  const tiers = activeTiersFor(state, config);
  const dNum = Number(state.depth) || 0;
  const pNum = Number(state.points) || 0;
  const totalMeters = dNum * pNum;
  const tier = tiers.find(t => t.diameter === state.diameter) || tiers[0];
  const minThreshold = config.lumpsumMinimum[state.activeTab];
  const isLumpsum = totalMeters > 0 && totalMeters < minThreshold;
  const effectiveMeters = isLumpsum ? minThreshold : totalMeters;

  const minJasa = effectiveMeters * tier.pricePerMeter.min;
  const maxJasa = effectiveMeters * tier.pricePerMeter.max;

  const matEstimate = tier.materialCostEstimate || 0;
  const totalMaterial = state.packageType === 'allin' ? (effectiveMeters * matEstimate) : 0;

  const locData = config.locations.find(l => l.value === state.location);

  const baseMobMin = state.activeTab === 'borepile' && locData && !locData.mobDemob.custom ? locData.mobDemob.min : 0;
  const baseMobMax = state.activeTab === 'borepile' && locData && !locData.mobDemob.custom ? locData.mobDemob.max : 0;

  const mobMin = state.includeMob ? baseMobMin : 0;
  const mobMax = state.includeMob ? baseMobMax : 0;

  const minTotal = minJasa + totalMaterial + mobMin;
  const maxTotal = maxJasa + totalMaterial + mobMax;

  let minDays = 0;
  let maxDays = 0;
  if (pNum > 0) {
    if (state.activeTab === 'borepile') {
      minDays = Math.ceil(pNum / 4);
      maxDays = Math.ceil(pNum / 2);
    } else {
      minDays = Math.ceil(pNum / 3);
      maxDays = Math.ceil(pNum / 1);
    }
  }

  return {
    totalMeters, effectiveMeters, isLumpsum,
    minTotal, maxTotal,
    minJasa, maxJasa,
    totalMaterial, mobMin, mobMax,
    baseMobMin, baseMobMax,
    isEstimate: tier.isEstimate,
    isCustomMob: locData?.mobDemob.custom || false,
    locData,
    tier,
    minDays,
    maxDays,
  };
}

export function computeMaterials(diameter: number, totalMeters: number): MaterialResult {
  if (totalMeters === 0) {
    return { betonM3: '0', utama: { batang: 0, spec: '' }, spiral: { batang: 0, spec: '' } };
  }

  const r = (diameter / 100) / 2;
  const volumeTeoritis = 3.14159 * r * r * totalMeters;
  const betonM3 = (volumeTeoritis * 1.1).toFixed(1);

  let jmlTulangan = 4;
  if (diameter >= 40) jmlTulangan = 6;
  if (diameter >= 50) jmlTulangan = 8;
  if (diameter >= 60) jmlTulangan = 10;
  if (diameter >= 80) jmlTulangan = 14;

  const panjangBesiUtama = totalMeters * jmlTulangan;
  const batangBesiUtama = Math.ceil(panjangBesiUtama / 12);

  const pitch = 0.15;
  const kelilingSpiral = 3.14159 * ((diameter - 5) / 100);
  const spiralPerMeter = kelilingSpiral / pitch;
  const panjangBesiSpiral = totalMeters * spiralPerMeter;
  const batangBesiSpiral = Math.ceil(panjangBesiSpiral / 12);

  return {
    betonM3,
    utama: { batang: batangBesiUtama, spec: diameter >= 40 ? 'D13 Ulir' : 'D10 / D13 Ulir' },
    spiral: { batang: batangBesiSpiral, spec: 'Polos 8mm' },
  };
}

export function formatRupiah(num: number): string {
  if (num === 0) return 'Rp 0';
  if (num >= 1000000) {
    const millions = num / 1000000;
    const formatted = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(millions);
    return `Rp ${formatted} Juta`;
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
}

export function formatRangeShort(min: number, max: number, prefix = ''): string {
  if (min === max) return `${prefix}${formatRupiah(min)}`;
  return `<span style="display:inline-block;text-align:right;line-height:1.2">${prefix}${formatRupiah(min)}<br/><span style="font-size:0.85em;opacity:0.85;font-weight:normal">- ${formatRupiah(max)}</span></span>`;
}

export function generateWaUrl(state: CalcState, config: CalculatorConfig, calc: CalculationResult, materials: MaterialResult): string {
  const label = toolLabel(state, config);
  let text = `Halo Aseven Pile, saya ingin konsultasi proyek pondasi.\n\n*Spesifikasi Proyek:*\n- Lokasi: ${calc.locData?.label}\n- Metode: ${state.activeTab === 'borepile' ? 'Bore Pile Mesin' : 'Strauss Pile Manual'}\n- Alat: ${label}\n- Diameter: ${state.diameter} cm\n- Kedalaman: ${state.depth || 0} meter/titik\n- Jumlah: ${state.points || 0} titik\n- Akses Jalan: ${state.roadAccess === 'wide' ? 'Truk Bisa Masuk' : 'Sempit / Gang'}\n- Layanan: ${state.packageType === 'jasa' ? 'Hanya Jasa Pengeboran' : 'Jasa + Material Beton & Besi'}\n\n*Estimasi Biaya:*\n- Total Volume: ${calc.totalMeters} meter\n- Biaya ${state.packageType === 'jasa' ? 'Jasa' : 'Jasa + Material'}: ${formatRupiah(calc.minJasa + calc.totalMaterial)}${calc.maxJasa > calc.minJasa ? ` - ${formatRupiah(calc.maxJasa + calc.totalMaterial)}` : ''}\n`;

  if (state.packageType === 'jasa' && calc.totalMeters > 0) {
    text += `\n*Catatan Belanja Material:*\n- Beton K-250 - K-300: ~${materials.betonM3} mÂ³\n- Besi Utama (${materials.utama.spec}): ~${materials.utama.batang} btg\n- Besi Spiral (${materials.spiral.spec}): ~${materials.spiral.batang} btg\n`;
  }

  if (state.activeTab === 'borepile') {
    text += `\n- Mob/Demob: ${!state.includeMob ? 'TIDAK TERMASUK (Klien Sediakan Sendiri)' : calc.isCustomMob ? 'Menyesuaikan lokasi' : `${formatRupiah(calc.baseMobMin)} - ${formatRupiah(calc.baseMobMax)}`}\n`;
  }
  text += `\nMohon info lebih detail (ketersediaan jadwal & buang lumpur). Terima kasih.`;
  return `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(text)}`;
}

/* ===================== RENDER BUILDERS ===================== */

export function titleFor(state: CalcState, rawTitle: string | null): string {
  const serviceName = state.activeTab === 'borepile' ? 'Bore Pile' : 'Strauss Pile';
  return rawTitle ? rawTitle.replace('{service}', serviceName) : `Kalkulator Estimasi Biaya ${serviceName}`;
}

export function roadInner(state: CalcState): string {
  const warning = state.roadAccess === 'narrow'
    ? `<div class="warning-box" style="margin-top:12px;padding:12px;background-color:#fffbeb;border-left:4px solid #b45309;border-radius:4px;font-size:13.5px;color:#78350f;line-height:1.5"><strong style="color:#b45309;display:block;margin-bottom:4px">Perhatian:</strong>Karena akses jalan sempit/gang, mobilisasi alat mesin (Mini Crane / Gawangan) kemungkinan tidak muat. Disarankan menggunakan metode <strong>Strauss Pile (Manual)</strong>. Kekurangannya: kedalaman maksimal hanya ~6 meter tergantung karakteristik tanah.</div>`
    : '';
  return `<label>Akses Jalan <span class="tooltip-icon" data-tip="Menentukan jenis alat berat yang bisa masuk lokasi">?</span></label><div class="radio-group" style="grid-template-columns:1fr 1fr"><label class="radio-card"><input type="radio" name="road" value="wide"${state.roadAccess === 'wide' ? ' checked' : ''}/><span>Masuk Truk (&gt; 3m)</span></label><label class="radio-card"><input type="radio" name="road" value="narrow"${state.roadAccess === 'narrow' ? ' checked' : ''}/><span>Gang Sempit (&lt; 3m)</span></label></div>${warning}`;
}

export function toolInner(state: CalcState, config: CalculatorConfig): string {
  const options = toolOptionsFor(state, config);
  const tooltip = state.activeTab === 'borepile'
    ? 'Mini crane dan Gawangan adalah alat berat.'
    : 'Pengeboran manual tenaga manusia, cocok untuk pondasi dangkal';
  const inner = options.length > 1
    ? `<div class="radio-group">${options.map(t => `<label class="radio-card"><input type="radio" name="tool" value="${t.value}"${state.tool === t.value ? ' checked' : ''}/><span>${t.label}</span></label>`).join('')}</div>`
    : `<div class="tool-static">${options[0].label}</div>`;
  return `<label>Jenis Alat <span class="tooltip-icon" data-tip="${tooltip}">?</span></label>${inner}`;
}

export function diameterInner(state: CalcState, config: CalculatorConfig): string {
  const tiers = activeTiersFor(state, config);
  const diameters = tiers.map(t => t.diameter);
  return `<label>Diameter Pengeboran</label><div class="radio-group" style="grid-template-columns:repeat(${diameters.length}, 1fr)">${diameters.map(d => `<label class="radio-card"><input type="radio" name="diameter" value="${d}"${state.diameter === d ? ' checked' : ''}/><span>${d} cm</span></label>`).join('')}</div>`;
}

function packageCard(selected: boolean, label: string, pkg: 'jasa' | 'allin') {
  return `<div data-pkg="${pkg}" style="border:${selected ? '2px solid #800000' : '1px solid #cbd5e1'};background-color:${selected ? '#fdf2f2' : '#ffffff'};padding:12px 10px;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:10px;transition:all 0.2s"><div style="width:18px;height:18px;flex-shrink:0;border-radius:50%;border:${selected ? '6px solid #800000' : '2px solid #cbd5e1'};box-sizing:border-box;transition:all 0.2s"></div><span style="font-size:13px;font-weight:${selected ? 700 : 500};color:${selected ? '#800000' : '#475569'};line-height:1.3">${label}</span></div>`;
}

export function packageInner(state: CalcState): string {
  return `<label style="display:block;margin-bottom:12px">Pilih Layanan <span class="tooltip-icon" data-tip="All-In berarti kami sediakan jasa + besi + beton">?</span></label><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${packageCard(state.packageType === 'jasa', 'Hanya Jasa Pengeboran', 'jasa')}${packageCard(state.packageType === 'allin', 'Jasa + Material (All-In)', 'allin')}</div>`;
}

export function visualizerRootStyle(): string {
  return 'background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;padding:16px;margin-bottom:24px';
}

export function visualizerInner(state: CalcState): string {
  const tool = state.tool;
  const depth = state.depth;
  const diameter = state.diameter;
  const packageType = state.packageType;
  const safeDepth = depth === '' ? 1 : Math.max(1, depth);
  const maxDepth = tool === 'strauss' ? 6 : 30;
  const holeWidth = Math.max(22, diameter * 0.6);
  const holeDepthRatio = safeDepth / maxDepth;
  const holeHeight = 60 + (holeDepthRatio * 180);
  const groundHeight = 280;

  const allin = packageType === 'allin'
    ? `<div style="position:absolute;top:0;bottom:0;left:0;right:0;background:#cbd5e1;display:flex;justify-content:center;box-shadow:inset 0 4px 10px rgba(0,0,0,0.1)"><div style="width:64%;height:100%;border-left:2px solid #334155;border-right:2px solid #334155;background-image:repeating-linear-gradient(0deg, transparent, transparent 12px, #475569 12px, #475569 14px)"></div></div>`
    : '';

  return `<div style="text-align:center;margin-bottom:16px;font-size:14px;font-weight:700;color:#475569">Visualisasi Struktur Tiang</div><div style="position:relative;width:100%;max-width:320px;height:440px;margin:0 auto;background:#e0f2fe;border-radius:8px;overflow:hidden;border:1px solid #cbd5e1"><div style="position:absolute;bottom:0;left:0;width:100%;height:${groundHeight}px;background:#d6c4b4;border-top:2px solid #bba38f"><div style="position:absolute;top:0;left:0;right:0;bottom:0;background-image:url(/images/visualizer/texture-dots.png);background-size:120px;opacity:0.12;mix-blend-mode:multiply"></div></div><div style="position:absolute;top:${440 - groundHeight}px;left:50%;transform:translateX(-50%);width:${holeWidth}px;height:${holeHeight}px;background:#7f1d1d;border-radius:0 0 4px 4px;overflow:hidden;display:flex;justify-content:center;box-shadow:inset 0 4px 6px rgba(0,0,0,0.3)">${allin}</div><img src="/images/visualizer/${tool}.png" alt="Alat ${tool}" style="position:absolute;bottom:${tool === 'gawangan' ? groundHeight - 12 : groundHeight}px;left:${tool === 'mini-crane' ? '43%' : '50%'};transform:translateX(-50%);height:140px;object-fit:contain;mix-blend-mode:multiply;z-index:10"/><div style="position:absolute;bottom:${groundHeight}px;left:50%;margin-left:${tool === 'strauss' ? '110px' : '70px'};height:140px;border-right:1px dashed #64748b;display:flex;align-items:center"><div style="position:absolute;top:0;right:-4px;width:8px;height:1px;background:#64748b"></div><div style="position:absolute;bottom:0;right:-4px;width:8px;height:1px;background:#64748b"></div><div style="position:absolute;right:-16px;top:50%;transform:translateY(-50%) rotate(90deg);color:#475569;font-size:11px;font-weight:bold;white-space:nowrap">${tool === 'strauss' ? 'Tinggi ± 2 Meter' : 'Tinggi ± 5 Meter'}</div></div><div style="position:absolute;top:${440 - groundHeight}px;left:50%;margin-left:-${(holeWidth / 2) + 25}px;height:${holeHeight}px;border-left:2px dashed #f59e0b;display:flex;align-items:center"><div style="position:absolute;top:0;left:-6px;width:10px;height:2px;background:#f59e0b"></div><div style="position:absolute;bottom:0;left:-6px;width:10px;height:2px;background:#f59e0b"></div><div style="position:absolute;left:-20px;top:50%;transform:translateY(-50%) rotate(-90deg);color:#d97706;font-size:12px;font-weight:bold;white-space:nowrap">${safeDepth} Meter</div></div><div style="position:absolute;top:${440 - groundHeight + holeHeight + 8}px;left:50%;transform:translateX(-50%);color:#475569;font-size:12px;font-weight:bold">Ø ${diameter} cm</div></div>`;
}

export function footerInner(state: CalcState, config: CalculatorConfig): string {
  const calc = computeCalculation(state, config);
  const materials = computeMaterials(state.diameter, calc.totalMeters);
  const waUrl = generateWaUrl(state, config, calc, materials);
  const packageType = state.packageType;
  const lumpsumMinimum = config.lumpsumMinimum[state.activeTab];
  const tier = calc.tier;
  const minPrice = tier?.pricePerMeter.min || 0;
  const maxPrice = tier?.pricePerMeter.max || 0;
  const matEst = tier?.materialCostEstimate || 0;

  const resultValue = calc.totalMeters === 0
    ? 'Rp 0'
    : (packageType === 'allin' && matEst === 0)
      ? 'Diskusikan via WA'
      : formatRangeShort(calc.minTotal, calc.maxTotal);

  const volumeBox = calc.totalMeters > 0
    ? `<div style="background-color:#f8fafc;padding:10px 12px;border-radius:6px;border:1px solid #e2e8f0;margin-bottom:12px;display:flex;flex-direction:column;gap:6px"><div class="breakdown-row" style="align-items:center;margin-bottom:0;padding-bottom:6px;border-bottom:1px dashed #cbd5e1"><span style="color:#475569;font-weight:600">Total Volume</span><strong>${calc.totalMeters} m¹</strong></div><div class="breakdown-row" style="align-items:center;margin-bottom:0"><span style="color:#475569;font-weight:600">Estimasi Durasi</span><strong>${calc.minDays === calc.maxDays ? calc.minDays : `${calc.minDays} - ${calc.maxDays}`} Hari Kerja</strong></div></div>`
    : '';

  const jasaSmall = calc.totalMeters > 0
    ? `<small style="font-size:11px;color:#64748b;margin-left:4px">(${calc.effectiveMeters}m¹ × ${formatRupiah(minPrice).replace(/\.000$/, 'rb')}${maxPrice > minPrice ? `-${formatRupiah(maxPrice).replace(/\.000$/, 'rb')}` : ''})</small>`
    : '';
  const jasaRow = `<div class="breakdown-row" style="align-items:center;padding:0 12px"><span>Biaya ${packageType === 'allin' ? 'Jasa Pengeboran' : 'Jasa'}${jasaSmall}</span><strong>${formatRangeShort(calc.minJasa, calc.maxJasa)}</strong></div>`;

  const materialRow = packageType === 'allin'
    ? `<div class="breakdown-row" style="align-items:center;padding:0 12px"><span>Estimasi Material${calc.totalMeters > 0 && matEst > 0 ? `<small style="font-size:11px;color:#64748b;margin-left:4px">(${calc.effectiveMeters}m¹ × ${formatRupiah(matEst).replace(/\.000$/, 'rb')})</small>` : ''}</span><strong style="color:${matEst === 0 ? '#b91c1c' : '#0f172a'}">${matEst === 0 ? 'Hubungi Kami' : `+ ${formatRupiah(calc.totalMaterial)}`}</strong></div>`
    : '';

  const mobRow = state.activeTab === 'borepile'
    ? `<div class="breakdown-row" style="padding:8px 12px;background-color:${state.includeMob ? '#f0fdf4' : '#f8fafc'};border-radius:4px;border:1px solid ${state.includeMob ? '#bbf7d0' : '#e2e8f0'};align-items:center;margin-top:8px"><label style="display:flex;align-items:center;cursor:pointer;flex:1"><input type="checkbox"${state.includeMob ? ' checked' : ''} style="margin-right:8px;cursor:pointer;width:16px;height:16px;accent-color:#16a34a"/><span>Mob/Demob (${calc.locData?.label.split(' ')[0]})</span></label><strong style="color:${state.includeMob ? '#212529' : '#9ca3af'};text-decoration:${state.includeMob ? 'none' : 'line-through'};text-align:right;margin-left:8px">${calc.isCustomMob ? 'Diskusikan via WA' : formatRangeShort(calc.baseMobMin, calc.baseMobMax, '+ ')}</strong></div>`
    : '';

  const lumpsumWarning = calc.isLumpsum
    ? `<strong class="lumpsum-warning" style="display:block;color:#b91c1c;margin-bottom:8px;padding:8px;background-color:#fef2f2;border-left:3px solid #b91c1c">*Perhatian: Total volume di bawah ${lumpsumMinimum}m akan dikenakan harga cash minimum / borongan (dihitung flat ${lumpsumMinimum}m).</strong>`
    : '';

  const resultBox = `<div class="result-box"><span class="result-label">Estimasi Total Biaya Proyek</span><span class="result-value">${resultValue}</span><div class="breakdown-container">${volumeBox}${jasaRow}${materialRow}${mobRow}</div><div class="result-note" style="margin-top:24px">${lumpsumWarning}<div style="margin-bottom:4px">*Belum termasuk biaya pembuatan bak sirkulasi air & lumpur.</div><div style="margin-bottom:4px">*Belum termasuk biaya buang/sedot sisa lumpur hasil pengeboran.</div><div style="margin-bottom:4px">*Sudah termasuk perakitan dan pemasangan besi, serta pengecoran beton.</div><div>*Note: harga di atas hanyalah estimasi, hubungi kami untuk penawaran harga resmi dan kesepakatan harga.</div></div></div>`;

  const materialBox = (calc.totalMeters > 0 && packageType === 'jasa')
    ? `<div class="material-box"><div class="material-header">Estimasi Kebutuhan Material (Belanja Sendiri):</div><ul><li style="display:flex;align-items:center;margin-bottom:6px"><span style="flex:1">Beton K-250 - K-300 (Ready Mix) <span class="tooltip-icon" data-tip="Asumsi +10% waste factor karena lubang galian tidak beraturan">?</span></span><strong>~${materials.betonM3} m³</strong></li><li style="display:flex;align-items:center;margin-bottom:6px"><span style="flex:1">Besi Utama (${materials.utama.spec}) <span class="tooltip-icon" data-tip="Pembelian dalam bentuk lonjoran/batang standar 12m">?</span></span><strong>~${materials.utama.batang} btg</strong></li><li style="display:flex;align-items:center"><span style="flex:1">Besi Spiral (${materials.spiral.spec}) <span class="tooltip-icon" data-tip="Sengkang dibentuk melingkar untuk menahan besi utama">?</span></span><strong>~${materials.spiral.batang} btg</strong></li></ul><div style="font-size:10px;color:#94a3b8;line-height:1.4"><div style="margin-bottom:4px">*Rumus perhitungan besi menggunakan standar per-batang 12m.</div><div>*Note: Estimasi material di atas hanya perkiraan, bisa berbeda tergantung kondisi lapangan.</div></div></div>`
    : '';

  const cta = `<a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="calc-cta-btn" style="display:flex;align-items:center;justify-content:center;gap:8px"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>Konsultasi via WhatsApp</a>`;

  return resultBox + materialBox + cta;
}

export function initState(defaults: { method?: Tab; diameter?: number; location?: string; depth?: number; points?: number }, config: CalculatorConfig): CalcState {
  const activeTab: Tab = defaults?.method || 'borepile';
  const tiers = activeTab === 'borepile' ? config.tiers : config.straussTiers;
  const diameter = defaults?.diameter || tiers[0].diameter;
  const location = defaults?.location || config.locations[0].value;
  const tool = activeTab === 'borepile' ? 'mini-crane' : 'strauss';
  const depth = defaults?.depth ?? (activeTab === 'borepile' ? 12 : 6);
  const points = defaults?.points ?? 30;
  return {
    activeTab, diameter, depth, points,
    packageType: 'jasa', tool, location,
    roadAccess: 'wide', includeMob: true,
  };
}

export function nextStateOnTab(state: CalcState, tab: Tab, config: CalculatorConfig): CalcState {
  const newTiers = tab === 'borepile' ? config.tiers : config.straussTiers;
  const next: CalcState = {
    ...state,
    activeTab: tab,
    diameter: newTiers[0].diameter,
    tool: tab === 'borepile' ? 'mini-crane' : 'strauss',
  };
  if (tab === 'strauss' && Number(state.depth) > 6) {
    next.depth = 6;
  }
  return next;
}


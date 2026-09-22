import { useState, useMemo } from 'react';
import type { CalculatorConfig } from './calculator.config';

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

export interface CalculatorDefaults {
  method?: 'borepile' | 'strauss';
  diameter?: number;
  location?: string;
  depth?: number;
  points?: number;
}

export function useCalculator(config: CalculatorConfig, defaults?: CalculatorDefaults) {
  const initialTab = defaults?.method || 'borepile';
  const initialTiers = initialTab === 'borepile' ? config.tiers : config.straussTiers;
  const initialDiameter = defaults?.diameter || initialTiers[0].diameter;
  const initialLocation = defaults?.location || config.locations[0].value;
  const initialTool = initialTab === 'borepile' ? 'mini-crane' : 'strauss';
  const initialDepth = defaults?.depth ?? (initialTab === 'borepile' ? 12 : 6);
  const initialPoints = defaults?.points ?? 30;

  const [activeTab, setActiveTab] = useState<'borepile' | 'strauss'>(initialTab);
  const [diameter, setDiameter] = useState<number>(initialDiameter);
  const [depth, setDepth] = useState<number | ''>(initialDepth);
  const [points, setPoints] = useState<number | ''>(initialPoints);
  const [packageType, setPackageType] = useState<'jasa' | 'allin'>('jasa');
  const [tool, setTool] = useState(initialTool);
  const [location, setLocation] = useState(initialLocation);
  const [roadAccess, setRoadAccess] = useState<'wide' | 'narrow'>('wide');
  const [includeMob, setIncludeMob] = useState(true);

  const activeTiers = activeTab === 'borepile' ? config.tiers : config.straussTiers;
  const availableDiameters = activeTiers.map(t => t.diameter);

  const toolOptions = activeTab === 'borepile' ? config.toolOptions.borepile : config.toolOptions.strauss;

  const handleTabChange = (tab: 'borepile' | 'strauss') => {
    setActiveTab(tab);
    const newTiers = tab === 'borepile' ? config.tiers : config.straussTiers;
    setDiameter(newTiers[0].diameter);
    setTool(tab === 'borepile' ? 'mini-crane' : 'strauss');
    if (tab === 'strauss' && Number(depth) > 6) {
      setDepth(6);
    }
  };

  const calculation: CalculationResult = useMemo(() => {
    const dNum = Number(depth) || 0;
    const pNum = Number(points) || 0;
    const totalMeters = dNum * pNum;
    const tier = activeTiers.find(t => t.diameter === diameter) || activeTiers[0];
    const minThreshold = config.lumpsumMinimum[activeTab];
    const isLumpsum = totalMeters > 0 && totalMeters < minThreshold;
    const effectiveMeters = isLumpsum ? minThreshold : totalMeters;

    const minJasa = effectiveMeters * tier.pricePerMeter.min;
    const maxJasa = effectiveMeters * tier.pricePerMeter.max;

    const matEstimate = tier.materialCostEstimate || 0;
    const totalMaterial = packageType === 'allin' ? (effectiveMeters * matEstimate) : 0;

    const locData = config.locations.find(l => l.value === location);

    const baseMobMin = activeTab === 'borepile' && locData && !locData.mobDemob.custom ? locData.mobDemob.min : 0;
    const baseMobMax = activeTab === 'borepile' && locData && !locData.mobDemob.custom ? locData.mobDemob.max : 0;

    const mobMin = includeMob ? baseMobMin : 0;
    const mobMax = includeMob ? baseMobMax : 0;

    const minTotal = minJasa + totalMaterial + mobMin;
    const maxTotal = maxJasa + totalMaterial + mobMax;

    // Menghitung estimasi durasi (berdasarkan jumlah titik)
    // Mesin (borepile): 2 - 4 titik per hari. Jadi hari max = points / 2, hari min = points / 4
    // Manual (strauss): 1 - 3 titik per hari. Jadi hari max = points / 1, hari min = points / 3
    let minDays = 0;
    let maxDays = 0;
    if (pNum > 0) {
      if (activeTab === 'borepile') {
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
  }, [diameter, depth, points, activeTiers, packageType, location, activeTab, includeMob, config]);

  const materials: MaterialResult = useMemo(() => {
    if (calculation.totalMeters === 0) {
      return { betonM3: '0', utama: { batang: 0, spec: '' }, spiral: { batang: 0, spec: '' } };
    }

    const r = (diameter / 100) / 2;
    const volumeTeoritis = 3.14159 * r * r * calculation.totalMeters;
    const betonM3 = (volumeTeoritis * 1.1).toFixed(1);

    let jmlTulangan = 4;
    if (diameter >= 40) jmlTulangan = 6;
    if (diameter >= 50) jmlTulangan = 8;
    if (diameter >= 60) jmlTulangan = 10;
    if (diameter >= 80) jmlTulangan = 14;

    const panjangBesiUtama = calculation.totalMeters * jmlTulangan;
    const batangBesiUtama = Math.ceil(panjangBesiUtama / 12);

    const pitch = 0.15;
    const kelilingSpiral = 3.14159 * ((diameter - 5) / 100);
    const spiralPerMeter = kelilingSpiral / pitch;
    const panjangBesiSpiral = calculation.totalMeters * spiralPerMeter;
    const batangBesiSpiral = Math.ceil(panjangBesiSpiral / 12);

    return {
      betonM3,
      utama: { batang: batangBesiUtama, spec: diameter >= 40 ? 'D13 Ulir' : 'D10 / D13 Ulir' },
      spiral: { batang: batangBesiSpiral, spec: 'Polos 8mm' },
    };
  }, [diameter, calculation.totalMeters]);

  const formatRupiah = (num: number) => {
    if (num === 0) return 'Rp 0';
    if (num >= 1000000) {
      const millions = num / 1000000;
      const formatted = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(millions);
      return `Rp ${formatted} Juta`;
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
  };

  const toolLabel = toolOptions.find(t => t.value === tool)?.label || tool;

  const generateWaUrl = () => {
    let text = `Halo ASEVEN PILE, saya ingin konsultasi proyek pondasi.\n\n*Spesifikasi Proyek:*\n- Lokasi: ${calculation.locData?.label}\n- Metode: ${activeTab === 'borepile' ? 'Bore Pile Mesin' : 'Strauss Pile Manual'}\n- Alat: ${toolLabel}\n- Diameter: ${diameter} cm\n- Kedalaman: ${depth || 0} meter/titik\n- Jumlah: ${points || 0} titik\n- Akses Jalan: ${roadAccess === 'wide' ? 'Truk Bisa Masuk' : 'Sempit / Gang'}\n- Layanan: ${packageType === 'jasa' ? 'Hanya Jasa Pengeboran' : 'Jasa + Material Beton & Besi'}\n\n*Estimasi Biaya:*\n- Total Volume: ${calculation.totalMeters} meter\n- Biaya ${packageType === 'jasa' ? 'Jasa' : 'Jasa + Material'}: ${formatRupiah(calculation.minJasa + calculation.totalMaterial)}${calculation.maxJasa > calculation.minJasa ? ` - ${formatRupiah(calculation.maxJasa + calculation.totalMaterial)}` : ''}\n`;

    if (packageType === 'jasa' && calculation.totalMeters > 0) {
      text += `\n*Catatan Belanja Material:*\n- Beton K-250 - K-300: ~${materials.betonM3} m³\n- Besi Utama (${materials.utama.spec}): ~${materials.utama.batang} btg\n- Besi Spiral (${materials.spiral.spec}): ~${materials.spiral.batang} btg\n`;
    }

    if (activeTab === 'borepile') {
      text += `\n- Mob/Demob: ${!includeMob ? 'TIDAK TERMASUK (Klien Sediakan Sendiri)' : calculation.isCustomMob ? 'Menyesuaikan lokasi' : `${formatRupiah(calculation.baseMobMin)} - ${formatRupiah(calculation.baseMobMax)}`}\n`;
    }
    text += `\nMohon info lebih detail (ketersediaan jadwal & buang lumpur). Terima kasih.`;
    return `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(text)}`;
  };

  return {
    activeTab, handleTabChange,
    diameter, setDiameter,
    depth, setDepth,
    points, setPoints,
    packageType, setPackageType,
    tool, setTool,
    location, setLocation,
    roadAccess, setRoadAccess,
    includeMob, setIncludeMob,
    activeTiers, availableDiameters, toolOptions,
    calculation, materials,
    formatRupiah, toolLabel, generateWaUrl,
  };
}

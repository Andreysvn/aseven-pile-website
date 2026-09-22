import type { PricingData } from '../../data/pricing';

export interface LocationOption {
  value: string;
  label: string;
  mobDemob: { min: number; max: number; custom?: boolean };
}

export interface CalculatorConfig {
  tiers: PricingData[];
  straussTiers: PricingData[];
  locations: LocationOption[];
  whatsapp: string;
  lumpsumMinimum: { borepile: number; strauss: number };
  toolOptions: {
    borepile: { value: string; label: string }[];
    strauss: { value: string; label: string }[];
  };
}

export const asevenCalculatorConfig: CalculatorConfig = {
  tiers: [
    { diameter: 30, pricePerMeter: { min: 115000, max: 115000 }, materialCostEstimate: 210000, isEstimate: false, notes: "Ideal untuk pondasi rumah tinggal 2-3 lantai." },
    { diameter: 40, pricePerMeter: { min: 130000, max: 130000 }, materialCostEstimate: 370000, isEstimate: false, notes: "Standar untuk ruko dan gedung komersial menengah." },
    { diameter: 50, pricePerMeter: { min: 185000, max: 185000 }, materialCostEstimate: 550000, isEstimate: false, notes: "Untuk struktur berat atau kondisi tanah butuh daya dukung tinggi." },
    { diameter: 60, pricePerMeter: { min: 250000, max: 300000 }, materialCostEstimate: 800000, isEstimate: true, notes: "Harga estimasi. Untuk proyek infrastruktur & gedung tinggi." },
    { diameter: 80, pricePerMeter: { min: 300000, max: 350000 }, materialCostEstimate: 0, isEstimate: true, notes: "Harga estimasi. Biasanya untuk proyek berat." },
  ],
  straussTiers: [
    { diameter: 20, pricePerMeter: { min: 70000, max: 70000 }, materialCostEstimate: 100000, isEstimate: false, notes: "Untuk pondasi ringan, pagar, bangunan 1 lantai." },
    { diameter: 25, pricePerMeter: { min: 75000, max: 75000 }, materialCostEstimate: 150000, isEstimate: false, notes: "Standar untuk rumah tinggal 1-2 lantai." },
    { diameter: 30, pricePerMeter: { min: 85000, max: 85000 }, materialCostEstimate: 210000, isEstimate: false, notes: "Cocok untuk rumah tinggal 2 lantai di tanah stabil." },
    { diameter: 40, pricePerMeter: { min: 110000, max: 110000 }, materialCostEstimate: 0, isEstimate: false, notes: "Diameter terbesar untuk metode manual." },
  ],
  locations: [
    { value: 'jabodetabek', label: 'Jabodetabek', mobDemob: { min: 1500000, max: 4000000 } },
    { value: 'banten', label: 'Banten (Serang, Cilegon, Pandeglang, dll)', mobDemob: { min: 2500000, max: 4000000 } },
    { value: 'bandung', label: 'Bandung & Sekitarnya', mobDemob: { min: 3000000, max: 5000000 } },
    { value: 'jawatengah', label: 'Jawa Tengah', mobDemob: { min: 5000000, max: 7000000 } },
    { value: 'jawatimur', label: 'Jawa Timur', mobDemob: { min: 7000000, max: 10000000 } },
    { value: 'other', label: 'Luar Jawa / Lainnya', mobDemob: { min: 0, max: 0, custom: true } },
  ],
  whatsapp: '6285814173761',
  lumpsumMinimum: { borepile: 200, strauss: 100 },
  toolOptions: {
    borepile: [
      { value: 'mini-crane', label: 'Mini Crane' },
      { value: 'gawangan', label: 'Gawangan' },
    ],
    strauss: [{ value: 'strauss', label: 'Strauss Pile' }],
  },
};

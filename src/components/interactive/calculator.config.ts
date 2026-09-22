import { pricingTiers, straussTiers } from '../../data/pricing';
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
  // Harga langsung dari pricing.ts (Single Source of Truth)
  tiers: pricingTiers,
  straussTiers: straussTiers,

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

export interface PricingData {
  diameter: number;
  pricePerMeter: {
    min: number;
    max: number;
  };
  materialCostEstimate: number; // Estimasi biaya material (besi + beton) per meter. 0 = "Hubungi Kami"
  isEstimate: boolean;
  notes: string;
}

// ===== BORE PILE (MESIN) =====
export const pricingTiers: PricingData[] = [
  {
    diameter: 30,
    pricePerMeter: { min: 115000, max: 115000 },
    materialCostEstimate: 210000,
    isEstimate: false,
    notes: "Ideal untuk pondasi rumah tinggal 2-3 lantai."
  },
  {
    diameter: 40,
    pricePerMeter: { min: 130000, max: 130000 },
    materialCostEstimate: 370000,
    isEstimate: false,
    notes: "Standar untuk ruko dan gedung komersial menengah."
  },
  {
    diameter: 50,
    pricePerMeter: { min: 185000, max: 185000 },
    materialCostEstimate: 550000,
    isEstimate: false,
    notes: "Untuk struktur berat atau kondisi tanah butuh daya dukung tinggi."
  },
  {
    diameter: 60,
    pricePerMeter: { min: 250000, max: 300000 },
    materialCostEstimate: 800000,
    isEstimate: true,
    notes: "Harga estimasi. Untuk proyek infrastruktur & gedung tinggi."
  },
  {
    diameter: 80,
    pricePerMeter: { min: 300000, max: 350000 },
    materialCostEstimate: 0,
    isEstimate: true,
    notes: "Harga estimasi. Biasanya untuk proyek berat."
  }
];

// ===== STRAUSS PILE (MANUAL) =====
export const straussTiers: PricingData[] = [
  {
    diameter: 20,
    pricePerMeter: { min: 70000, max: 70000 },
    materialCostEstimate: 100000,
    isEstimate: false,
    notes: "Untuk pondasi ringan, pagar, bangunan 1 lantai."
  },
  {
    diameter: 25,
    pricePerMeter: { min: 75000, max: 75000 },
    materialCostEstimate: 150000,
    isEstimate: false,
    notes: "Standar untuk rumah tinggal 1-2 lantai."
  },
  {
    diameter: 30,
    pricePerMeter: { min: 85000, max: 85000 },
    materialCostEstimate: 210000,
    isEstimate: false,
    notes: "Cocok untuk rumah tinggal 2 lantai di tanah stabil."
  },
  {
    diameter: 40,
    pricePerMeter: { min: 110000, max: 110000 },
    materialCostEstimate: 0,
    isEstimate: false,
    notes: "Diameter terbesar untuk metode manual."
  }
];

// ===== CONFIG UMUM =====
export const pricingConfig = {
  lastUpdated: "2026-09-10",
  mobilizationFee: 3500000,
  minimumDepthLumpsum: 50,
};

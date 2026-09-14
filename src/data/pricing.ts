export interface PricingData {
  diameter: number;
  pricePerMeter: {
    min: number;
    max: number;
  };
  isEstimate: boolean;
  notes?: string;
}

export const pricingTiers: PricingData[] = [
  {
    diameter: 30,
    pricePerMeter: { min: 115000, max: 115000 },
    isEstimate: false,
    notes: "Ideal untuk pondasi rumah tinggal 2-3 lantai. Beban ringan-sedang."
  },
  {
    diameter: 40,
    pricePerMeter: { min: 130000, max: 130000 },
    isEstimate: false,
    notes: "Standar untuk ruko dan gedung komersial menengah."
  },
  {
    diameter: 50,
    pricePerMeter: { min: 185000, max: 185000 },
    isEstimate: false,
    notes: "Untuk struktur berat, pabrik, atau kondisi tanah yang butuh daya dukung tinggi."
  },
  {
    diameter: 60,
    pricePerMeter: { min: 250000, max: 300000 },
    isEstimate: true,
    notes: "Harga estimasi (tergantung kondisi lapangan). Untuk proyek infrastruktur & gedung tinggi."
  },
  {
    diameter: 80,
    pricePerMeter: { min: 300000, max: 350000 },
    isEstimate: true,
    notes: "Harga estimasi (tergantung kondisi lapangan). Biasanya untuk proyek berat."
  }
];

// Strauss Pile (Manual) — diameter dan harga berbeda dari Bore Pile Mesin
export const straussTiers: PricingData[] = [
  {
    diameter: 20,
    pricePerMeter: { min: 70000, max: 70000 },
    isEstimate: false,
    notes: "Untuk pondasi ringan, pagar, dan bangunan 1 lantai."
  },
  {
    diameter: 25,
    pricePerMeter: { min: 75000, max: 75000 },
    isEstimate: false,
    notes: "Standar untuk rumah tinggal 1-2 lantai dengan beban ringan."
  },
  {
    diameter: 30,
    pricePerMeter: { min: 85000, max: 85000 },
    isEstimate: false,
    notes: "Cocok untuk rumah tinggal 2 lantai di tanah stabil."
  },
  {
    diameter: 40,
    pricePerMeter: { min: 110000, max: 110000 },
    isEstimate: false,
    notes: "Diameter terbesar untuk metode manual. Untuk ruko kecil atau tanah dengan daya dukung cukup."
  }
];

export const pricingConfig = {
  lastUpdated: "2026-09-10",
  mobilizationFee: 3500000,
  minimumDepthLumpsum: 50,
};


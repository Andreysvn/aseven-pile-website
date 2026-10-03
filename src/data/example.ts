import { pricingTiers } from './pricing';

export interface ExampleCalc {
  isReal: boolean;
  diameterCm: number;
  depthM: number;
  points: number;
  pricePerM: number;
  total: number;
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Contoh perhitungan biaya bore pile per kota.
 * - Bila kota punya `caseStudy.isReal` → pakai angka proyek nyata.
 * - Bila tidak → contoh digenerate dari data kota (kedalaman dari `averageDepth`,
 *   jumlah titik divariasikan stabil per kota) supaya angka BEDA tiap wilayah.
 */
export function exampleForCity(city: any): ExampleCalc {
  const cs = city.caseStudy;
  const isReal = !!(cs && cs.isReal);

  let diameterCm = cs?.diameter ?? 30;
  let depthM = cs?.depthM ?? 0;
  let points = cs?.points ?? 0;

  if (!isReal) {
    const nums = String(city.averageDepth || '').match(/\d+/g);
    if (nums && nums.length >= 2) depthM = Math.round((Number(nums[0]) + Number(nums[1])) / 2);
    else if (nums && nums.length === 1) depthM = Number(nums[0]);
    if (!depthM) depthM = 10;
    points = 12 + (hash(String(city.slug)) % 9); // 12–20
  }

  const tier = pricingTiers.find((t) => t.diameter === diameterCm) ?? pricingTiers[0];
  const pricePerM = tier.pricePerMeter.min;
  const total = points * depthM * pricePerM;

  return { isReal, diameterCm, depthM, points, pricePerM, total };
}

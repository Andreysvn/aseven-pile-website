import { pricingTiers } from './pricing';

export interface ExampleItem {
  diameterCm: number;
  depthM: number;
  points: number;
  pricePerM: number;
  subtotal: number;
}

export interface ExampleCalc {
  isReal: boolean;
  items: ExampleItem[];
  total: number;
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function exampleForCity(city: any, service: "borepile" | "strauss" = "borepile"): ExampleCalc {
  const cs = service === "strauss" && city.caseStudyStrauss ? city.caseStudyStrauss : city.caseStudy;
  const isReal = !!(cs && cs.isReal);

  let items: ExampleItem[] = [];
  
  if (isReal && cs.items && Array.isArray(cs.items)) {
    items = cs.items.map((i: any) => {
      const tier = pricingTiers.find((t) => t.diameter === i.diameter) ?? pricingTiers[0];
      const pricePerM = i.price ?? tier.pricePerMeter.min;
      return {
        diameterCm: i.diameter,
        depthM: i.depthM,
        points: i.points,
        pricePerM,
        subtotal: i.points * i.depthM * pricePerM
      };
    });
  } else if (isReal && cs.diameter) {
    const tier = pricingTiers.find((t) => t.diameter === cs.diameter) ?? pricingTiers[0];
    const pricePerM = cs.price ?? tier.pricePerMeter.min;
    items = [{
      diameterCm: cs.diameter,
      depthM: cs.depthM,
      points: cs.points,
      pricePerM,
      subtotal: cs.points * cs.depthM * pricePerM
    }];
  } else {
    // Generate dummy example
    let depthM = 0;
    const nums = String(city.averageDepth || '').match(/\d+/g);
    if (nums && nums.length >= 2) depthM = Math.round((Number(nums[0]) + Number(nums[1])) / 2);
    else if (nums && nums.length === 1) depthM = Number(nums[0]);
    if (!depthM) depthM = 10;
    
    const points = 12 + (hash(String(city.slug)) % 9); // 12-20
    const diameterCm = 30; // default example diameter
    const tier = pricingTiers.find((t) => t.diameter === diameterCm) ?? pricingTiers[0];
    const pricePerM = tier.pricePerMeter.min;
    
    items = [{
      diameterCm,
      depthM,
      points,
      pricePerM,
      subtotal: points * depthM * pricePerM
    }];
  }

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return { isReal, items, total };
}

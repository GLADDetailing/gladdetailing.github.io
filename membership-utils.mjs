export const CLUB_PLANS = { monthly: 'Monthly', biweekly: 'Bi-weekly', weekly: 'Weekly' };
export const CLUB_PRICES = {
  monthly: [70, 80, 100],
  biweekly: [130, 150, 180],
  weekly: [240, 280, 320],
};
export const CLUB_VEHICLES = {
  sedan: { label: 'Sedan / coupe', tier: 0 },
  suv: { label: 'SUV (2 rows)', tier: 1 },
  'large-suv': { label: 'Large SUV (3 rows)', tier: 2 },
  truck: { label: 'Truck', tier: 2 },
  unique: { label: 'Something unique', tier: null },
};
export const CLUB_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const CLUB_TIMES = [
  'Morning (8 AM to 11 AM)',
  'Afternoon (12 PM to 4 PM)',
  'Evening (5 PM to 7 PM)',
];
export function clubQuote(plan, vehicle) {
  if (!Object.hasOwn(CLUB_PLANS, plan) || !Object.hasOwn(CLUB_VEHICLES, vehicle)) return null;
  const tier = CLUB_VEHICLES[vehicle].tier;
  return tier === null ? null : CLUB_PRICES[plan][tier];
}

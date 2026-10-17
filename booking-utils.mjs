export const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfcx6kZL6CQWi26hkuztpklaUUA11LxALfGJmJa9r0kpKqNxQ/viewform';
export const PACKAGES = ['In & Out', 'Interior Focused', 'Exterior Focused', 'Full Detail'];
export const VEHICLES = {
  sedan: { label: 'Sedan / coupe', formValue: 'Sedan/Coupe' },
  suv: { label: 'SUV (2 rows)', formValue: 'SUV (2 rows)' },
  'large-suv': { label: 'Large SUV (3 rows)', formValue: 'Large SUV (3 rows)' },
  truck: { label: 'Truck', formValue: 'Truck' },
  'truck-or-large-suv': { label: 'Truck / large SUV', formValue: '' },
};
export function normalizeSelection(selection = {}) {
  return {
    package: PACKAGES.includes(selection.package) ? selection.package : '',
    vehicle: Object.hasOwn(VEHICLES, selection.vehicle) ? selection.vehicle : '',
  };
}
export function readSelection(search) {
  const query = new URLSearchParams(search);
  return normalizeSelection({ package: query.get('package'), vehicle: query.get('vehicle') });
}
export function buildFormURL(selection, embedded = true) {
  const chosen = normalizeSelection(selection);
  const url = new URL(FORM_URL);
  if (embedded) url.searchParams.set('embedded', 'true');
  if (chosen.package) url.searchParams.set('entry.1129786076', chosen.package);
  if (chosen.vehicle && VEHICLES[chosen.vehicle].formValue) {
    url.searchParams.set('entry.1294561045', VEHICLES[chosen.vehicle].formValue);
  }
  return url.href;
}
export function buildBookingPageURL(selection) {
  const chosen = normalizeSelection(selection);
  const query = new URLSearchParams();
  if (chosen.package) query.set('package', chosen.package);
  if (chosen.vehicle) query.set('vehicle', chosen.vehicle);
  return 'book.html' + (query.size ? '?' + query.toString() + '#request-form' : '');
}

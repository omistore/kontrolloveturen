export type DecodedVin = {
  vin: string
  make: string
  model: string
  year: number
  engine?: string
  fuelType?: string
  bodyType?: string
  country?: string
}

// Map WMI (first 3 chars) to Manufacturer and Country
const WMI_MAP: Record<string, { make: string; country: string }> = {
  WBA: { make: 'BMW', country: 'Gjermani' },
  WBS: { make: 'BMW M', country: 'Gjermani' },
  WBY: { make: 'BMW i', country: 'Gjermani' },
  WAU: { make: 'Audi', country: 'Gjermani' },
  WUA: { make: 'Audi Sport', country: 'Gjermani' },
  WDB: { make: 'Mercedes-Benz', country: 'Gjermani' },
  WDC: { make: 'Mercedes-Benz', country: 'Gjermani' },
  WDD: { make: 'Mercedes-Benz', country: 'Gjermani' },
  WVW: { make: 'Volkswagen', country: 'Gjermani' },
  WV1: { make: 'Volkswagen Nutzfahrzeuge', country: 'Gjermani' },
  WV2: { make: 'Volkswagen Nutzfahrzeuge', country: 'Gjermani' },
  WP0: { make: 'Porsche', country: 'Gjermani' },
  WP1: { make: 'Porsche', country: 'Gjermani' },
  VF1: { make: 'Renault', country: 'Francë' },
  VF3: { make: 'Peugeot', country: 'Francë' },
  VF7: { make: 'Citroën', country: 'Francë' },
  ZAR: { make: 'Alfa Romeo', country: 'Itali' },
  ZFA: { make: 'Fiat', country: 'Itali' },
  ZFF: { make: 'Ferrari', country: 'Itali' },
  '1FA': { make: 'Ford', country: 'SHBA' },
  '1FD': { make: 'Ford', country: 'SHBA' },
  '1FM': { make: 'Ford', country: 'SHBA' },
  '1FT': { make: 'Ford', country: 'SHBA' },
  '1G1': { make: 'Chevrolet', country: 'SHBA' },
  '1GC': { make: 'Chevrolet', country: 'SHBA' },
  '1G6': { make: 'Cadillac', country: 'SHBA' },
  '2HG': { make: 'Honda', country: 'Kanada' },
  '2HK': { make: 'Honda', country: 'Kanada' },
  '3VW': { make: 'Volkswagen', country: 'Meksikë' },
  '4S3': { make: 'Subaru', country: 'SHBA' },
  '5UX': { make: 'BMW', country: 'SHBA' },
  '5YJ': { make: 'Tesla', country: 'SHBA' },
  JHM: { make: 'Honda', country: 'Japoni' },
  JHL: { make: 'Honda', country: 'Japoni' },
  JM1: { make: 'Mazda', country: 'Japoni' },
  JN1: { make: 'Nissan', country: 'Japoni' },
  JN6: { make: 'Nissan', country: 'Japoni' },
  JT1: { make: 'Toyota', country: 'Japoni' },
  JT2: { make: 'Toyota', country: 'Japoni' },
  JTD: { make: 'Toyota', country: 'Japoni' },
  JTE: { make: 'Toyota', country: 'Japoni' },
  KMH: { make: 'Hyundai', country: 'Kore e Jugut' },
  KM8: { make: 'Hyundai', country: 'Kore e Jugut' },
  KNA: { make: 'Kia', country: 'Kore e Jugut' },
  KND: { make: 'Kia', country: 'Kore e Jugut' },
  SAL: { make: 'Land Rover', country: 'Britani e Madhe' },
  SAJ: { make: 'Jaguar', country: 'Britani e Madhe' },
  TMB: { make: 'Škoda', country: 'Çeki' },
  TM9: { make: 'Škoda', country: 'Çeki' },
  VSS: { make: 'SEAT', country: 'Spanjë' },
  YV1: { make: 'Volvo', country: 'Suedi' },
  YV4: { make: 'Volvo', country: 'Suedi' },
}

/**
 * Decodes a VIN. Only verified data is returned: NHTSA vPIC results when available,
 * otherwise just the manufacturer/country from the WMI. Nothing is guessed.
 */
export async function decodeVin(rawVin: string): Promise<DecodedVin> {
  const vin = rawVin.trim().toUpperCase()
  const manufacturerInfo = WMI_MAP[vin.slice(0, 3)]

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`, {
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (res.ok) {
      const data = (await res.json()) as { Results?: Array<Record<string, string>> }
      const r = data?.Results?.[0]
      if (r && r.Make) {
        const engine = [r.DisplacementL && `${Number(r.DisplacementL).toFixed(1)}L`, r.EngineCylinders && `${r.EngineCylinders} cil.`]
          .filter(Boolean)
          .join(' ')
        return {
          vin,
          make: r.Make,
          model: r.Model || '',
          year: Number(r.ModelYear) || 0,
          engine: engine || undefined,
          fuelType: r.FuelTypePrimary || undefined,
          bodyType: r.BodyClass || undefined,
          country: r.PlantCountry || manufacturerInfo?.country,
        }
      }
    }
  } catch {
    // Fall through to WMI-only result
  }

  return {
    vin,
    make: manufacturerInfo?.make || '',
    model: '',
    year: 0,
    country: manufacturerInfo?.country,
  }
}
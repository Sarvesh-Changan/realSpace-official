export interface ReraCityLocation {
  name: string;
  aliases?: string[];
  localities: string[];
}

export interface ReraRegionLocation {
  name: string;
  cities: ReraCityLocation[];
}

export const RERA_LOCATIONS: ReraRegionLocation[] = [
  {
    name: 'Mumbai Metropolitan Region (MMR)',
    cities: [
      { name: 'Mumbai', localities: ['Andheri', 'Bandra', 'Powai', 'Borivali', 'Kandivali'] },
      { name: 'Thane', aliases: ['Thane West', 'Thane West, Mumbai MMR'], localities: ['Majiwada', 'Manpada', 'Ghodbunder Road', 'Kolshet', 'Vartak Nagar', 'Teen Hath Naka', 'Pokhran Road', 'Wagle Estate'] },
      { name: 'Navi Mumbai', localities: ['Vashi', 'Nerul', 'Kharghar', 'Airoli', 'Belapur'] },
      { name: 'Kalyan-Dombivli', aliases: ['Kalyan', 'Dombivli', 'Dombivli East', 'Dombivli West'] , localities: ['Kalyan West', 'Dombivli East', 'Dombivli West'] },
      { name: 'Mira-Bhayandar', aliases: ['Mira Road', 'Bhayandar', 'Mira Road East', 'Mira Road West'], localities: ['Mira Road', 'Bhayandar'] },
      { name: 'Vasai-Virar', aliases: ['Vasai', 'Virar'], localities: ['Vasai East', 'Vasai West', 'Virar East', 'Virar West'] },
      { name: 'Panvel', localities: ['New Panvel', 'Taloja'] },
      { name: 'Bhiwandi', localities: ['Bhiwandi'] },
      { name: 'Ulhasnagar', localities: ['Ulhasnagar'] },
      { name: 'Ambernath', localities: ['Ambernath East', 'Ambernath West'] },
      { name: 'Badlapur', localities: ['Badlapur East', 'Badlapur West'] },
      { name: 'Khopoli', localities: ['Khopoli'] },
      { name: 'Karjat', localities: ['Karjat'] },
    ],
  },
  {
    name: 'Pune Region',
    cities: [
      { name: 'Pune', localities: ['Baner', 'Wakad', 'Hinjewadi', 'Hadapsar', 'Kharadi', 'Kothrud', 'Viman Nagar', 'Bavdhan'] },
      { name: 'Pimpri-Chinchwad', aliases: ['Pimpri Chinchwad', 'PCMC'], localities: ['Pimpri', 'Chinchwad', 'Ravet', 'Moshi'] },
      { name: 'Baramati', localities: ['Baramati'] },
      { name: 'Talegaon Dabhade', aliases: ['Talegaon'], localities: ['Talegaon Dabhade'] },
      { name: 'Lonavala', localities: ['Lonavala'] },
      { name: 'Daund', localities: ['Daund'] },
      { name: 'Junnar', localities: ['Junnar'] },
    ],
  },
  {
    name: 'Nashik Region',
    cities: [
      { name: 'Nashik', localities: ['Gangapur Road', 'Indira Nagar', 'College Road', 'Panchavati', 'Pathardi Phata'] },
      { name: 'Malegaon', localities: ['Malegaon'] },
      { name: 'Dhule', localities: ['Dhule'] },
      { name: 'Jalgaon', localities: ['Jalgaon'] },
      { name: 'Nandurbar', localities: ['Nandurbar'] },
    ],
  },
  {
    name: 'Vidarbha Region',
    cities: [
      { name: 'Nagpur', localities: ['Dharampeth', 'Manish Nagar', 'Wardha Road', 'Hingna Road', 'MIHAN'] },
      { name: 'Amravati', localities: ['Amravati'] },
      { name: 'Akola', localities: ['Akola'] },
      { name: 'Yavatmal', localities: ['Yavatmal'] },
      { name: 'Wardha', localities: ['Wardha'] },
      { name: 'Chandrapur', localities: ['Chandrapur'] },
      { name: 'Gondia', localities: ['Gondia'] },
      { name: 'Bhandara', localities: ['Bhandara'] },
      { name: 'Washim', localities: ['Washim'] },
      { name: 'Buldhana', localities: ['Buldhana'] },
      { name: 'Gadchiroli', localities: ['Gadchiroli'] },
    ],
  },
  {
    name: 'Marathwada Region',
    cities: [
      { name: 'Chhatrapati Sambhajinagar', aliases: ['Aurangabad'], localities: ['CIDCO', 'Garkheda', 'Satara Parisar', 'Beed Bypass'] },
      { name: 'Nanded', localities: ['Nanded'] },
      { name: 'Latur', localities: ['Latur'] },
      { name: 'Parbhani', localities: ['Parbhani'] },
      { name: 'Beed', localities: ['Beed'] },
      { name: 'Jalna', localities: ['Jalna'] },
      { name: 'Dharashiv', aliases: ['Osmanabad'], localities: ['Dharashiv'] },
      { name: 'Hingoli', localities: ['Hingoli'] },
    ],
  },
  {
    name: 'Western Maharashtra',
    cities: [
      { name: 'Kolhapur', localities: ['Tarabai Park', 'Rajarampuri', 'Shahupuri'] },
      { name: 'Sangli-Miraj-Kupwad', aliases: ['Sangli', 'Miraj'], localities: ['Sangli', 'Miraj'] },
      { name: 'Satara', localities: ['Satara'] },
      { name: 'Solapur', localities: ['Solapur'] },
      { name: 'Ahilyanagar', aliases: ['Ahmednagar'], localities: ['Ahilyanagar'] },
      { name: 'Ichalkaranji', localities: ['Ichalkaranji'] },
    ],
  },
  {
    name: 'Konkan Region',
    cities: [
      { name: 'Alibag', aliases: ['Alibaug'], localities: ['Alibag'] },
      { name: 'Ratnagiri', localities: ['Ratnagiri'] },
      { name: 'Chiplun', localities: ['Chiplun'] },
      { name: 'Sindhudurg', localities: ['Kankavli', 'Sawantwadi', 'Malvan'] },
      { name: 'Dapoli', localities: ['Dapoli'] },
    ],
  },
];

export const ALL_REGIONS_VALUE = 'All Regions';
export const ALL_CITIES_VALUE = 'All Cities';
export const ALL_LOCALITIES_VALUE = 'All Localities';

export function formatReraEnquiryLocation(region: string, city: string, locality: string): string {
  const cityOrRegion = city && city !== ALL_CITIES_VALUE
    ? city
    : region && region !== ALL_REGIONS_VALUE
      ? region
      : '';
  const selectedLocality = locality && locality !== ALL_LOCALITIES_VALUE ? locality : '';
  return [selectedLocality, cityOrRegion].filter(Boolean).join(', ');
}

export function normalizeLocation(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

export function getRegionForCity(cityName: string): string {
  const normalized = normalizeLocation(cityName);
  if (!normalized) return '';

  return RERA_LOCATIONS.find((region) =>
    region.cities.some((city) => [city.name, ...(city.aliases ?? [])].some((name) => normalizeLocation(name) === normalized))
  )?.name ?? '';
}

export function getCityLocation(cityName: string): ReraCityLocation | undefined {
  const normalized = normalizeLocation(cityName);
  return RERA_LOCATIONS.flatMap((region) => region.cities).find((city) =>
    [city.name, ...(city.aliases ?? [])].some((name) => normalizeLocation(name) === normalized)
  );
}

export function cityMatchesLocation(propertyCity: string, selectedCity: string): boolean {
  const property = normalizeLocation(propertyCity);
  const selected = getCityLocation(selectedCity);
  if (!property || !selected) return property === normalizeLocation(selectedCity);

  return [selected.name, ...(selected.aliases ?? [])].some((name) => normalizeLocation(name) === property);
}

export function getLocalitiesForCity(cityName: string, additional: string[] = []): string[] {
  const city = getCityLocation(cityName);
  return Array.from(new Set([...(city?.localities ?? []), ...additional.map((value) => value.trim()).filter(Boolean)]))
    .sort((a, b) => a.localeCompare(b));
}

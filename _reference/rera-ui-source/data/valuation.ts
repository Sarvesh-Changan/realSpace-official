export interface MicroMarketRate {
  id: string;
  name: string;
  residentialAvgPerSqFt: number;
  commercialAvgPerSqFt: number;
  rentalYieldPercent: number;
  annualAppreciation: string;
  topProjects: string[];
}

export const thaneMicroMarketRates: MicroMarketRate[] = [
  {
    id: 'ghodbunder-road',
    name: 'Ghodbunder Road',
    residentialAvgPerSqFt: 11500,
    commercialAvgPerSqFt: 12500,
    rentalYieldPercent: 3.8,
    annualAppreciation: '8.5% YoY',
    topProjects: ['Lodha Splendora', 'Rosa Bella', 'Raunak City', 'Hiranandani Estate'],
  },
  {
    id: 'majiwada',
    name: 'Majiwada / EEH Junction',
    residentialAvgPerSqFt: 14800,
    commercialAvgPerSqFt: 17500,
    rentalYieldPercent: 4.2,
    annualAppreciation: '9.2% YoY',
    topProjects: ['Lodha Crown', 'Rustomjee Urbania', 'Ashwin Sheth Avalon', 'Lodha Luxuria'],
  },
  {
    id: 'teen-hath-naka',
    name: 'Teen Hath Naka / LBS Marg',
    residentialAvgPerSqFt: 17200,
    commercialAvgPerSqFt: 21000,
    rentalYieldPercent: 4.5,
    annualAppreciation: '10.1% YoY',
    topProjects: ['Godrej Alive', 'Centrum Business Square', 'Highway Darshan', 'Dosti Vihar'],
  },
  {
    id: 'pokhran-road',
    name: 'Pokhran Road 1 & 2',
    residentialAvgPerSqFt: 18500,
    commercialAvgPerSqFt: 19000,
    rentalYieldPercent: 3.9,
    annualAppreciation: '9.8% YoY',
    topProjects: ['Raymond Realty Ten X Habitat', 'Sunteck Beach Residences', 'Vasant Vihar'],
  },
  {
    id: 'kolshet-road',
    name: 'Kolshet Road',
    residentialAvgPerSqFt: 13500,
    commercialAvgPerSqFt: 14000,
    rentalYieldPercent: 4.0,
    annualAppreciation: '8.8% YoY',
    topProjects: ['Kalpataru Parkcity', 'Lodha Amāra', 'Dosti West County'],
  },
  {
    id: 'kasarvadavli',
    name: 'Kasarvadavli Lake Zone',
    residentialAvgPerSqFt: 10800,
    commercialAvgPerSqFt: 11500,
    rentalYieldPercent: 3.7,
    annualAppreciation: '11.4% YoY (Metro Impact)',
    topProjects: ['ACE Homes', 'Puraniks City', 'Cosmos Lounge'],
  },
  {
    id: 'wagle-estate',
    name: 'Wagle Industrial Estate',
    residentialAvgPerSqFt: 13200,
    commercialAvgPerSqFt: 15500,
    rentalYieldPercent: 8.2, // Commercial high yield
    annualAppreciation: '8.0% YoY',
    topProjects: ['O22 Business Park', 'Lodha Supremus', 'AI Avenue Tech Park'],
  },
];

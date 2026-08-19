export interface RoomConstraint {
  defaultQty: number;
  minQty: number;
  maxQty: number | null;
  isFixedFloor: boolean;
}

export interface QuoteState {
  bhkType: string;
  rooms: {
    kitchens: number;
    livingRooms: number;
    bedrooms: number;
    bathrooms: number;
    wardrobes: number;
  };
  roomConstraints?: Record<string, RoomConstraint>;
  spaceDescription?: string;
  requirements: {
    interior: boolean;
    exterior: boolean;
  };
  packageTier: string;
  additionalServices: string[];
  contact: {
    name: string;
    phone: string;
    email: string;
    location: string;
    requirements: string;
    verifiedToken?: string;
    websiteUrl?: string; // Honeypot field
  };
}

export interface QuoteBreakdownItem {
  label: string;
  amount: number;
}

export interface QuoteCalculationResult {
  estimatedBudgetLow: number;
  estimatedBudgetHigh: number;
  breakdown: QuoteBreakdownItem[];
  leadId?: string;
}

export interface RoomConstraint {
  defaultQty: number;
  minQty: number;
  maxQty: number | null;
  isFixedFloor: boolean;
}

export interface ActiveRoomType {
  key: string;
  groupKeys: string[];
  label: string;
}

export interface QuoteState {
  bhkType: string;
  rooms: Record<string, number>;
  roomConstraints?: Record<string, RoomConstraint>;
  spaceDescription?: string;
  requirements: {
    interior: boolean;
    exterior: boolean;
  };
  packageTier: string;
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


export interface CommissionTier {
  percentage: number;
  maxAmount: number;
}

export interface CommissionConfig {
  tiers: CommissionTier[];
}

export interface ProjectCommissionConfig {
  directPayment: CommissionConfig;
  financed: CommissionConfig;
}

export interface CommissionResult {
  userId: string;
  userName: string;
  userEmail: string;
  tier: number;
  percentage: number;
  amount: number;
  commissionAmount: number;
  reason?: string; // Razón por la cual no comisiona
}

export const COMMISSION_CONFIGS: Record<string, ProjectCommissionConfig> = {
  GENERAL: {
    directPayment: {
      tiers: [
        { percentage: 10, maxAmount: 4000 }, // Nivel 1: 10% hasta S/4,000
        { percentage: 4, maxAmount: 1600 }, // Nivel 2: 4% hasta S/1,600
        { percentage: 3, maxAmount: 1200 }, // Nivel 3: 3% hasta S/1,200
        { percentage: 1, maxAmount: 400 }, // Nivel 4: 1% hasta S/400
        { percentage: 1, maxAmount: 400 }, // Nivel 5: 1% hasta S/400
        { percentage: 0.5, maxAmount: 200 }, // Nivel 6: 0.5% hasta S/200
        { percentage: 0.5, maxAmount: 200 }, // Nivel 7: 0.5% hasta S/200
      ],
    },
    financed: {
      tiers: [
        { percentage: 5, maxAmount: 2000 }, // Nivel 1: 5% hasta S/2,000
        { percentage: 3, maxAmount: 1200 }, // Nivel 2: 3% hasta S/1,200
        { percentage: 2, maxAmount: 800 }, // Nivel 3: 2% hasta S/800
        { percentage: 1, maxAmount: 400 }, // Nivel 4: 1% hasta S/400
        { percentage: 0.5, maxAmount: 200 }, // Nivel 5: 0.5% hasta S/200
        { percentage: 0.3, maxAmount: 120 }, // Nivel 6: 0.3% hasta S/120
        { percentage: 0.2, maxAmount: 80 }, // Nivel 7: 0.2% hasta S/80
      ],
    },
  },
  APOLO: {
    directPayment: {
      tiers: [
        { percentage: 6, maxAmount: 9120 }, // Nivel 1: 6% hasta S/9,120
        { percentage: 2.5, maxAmount: 3800 }, // Nivel 2: 2.5% hasta S/3,800
        { percentage: 1.7, maxAmount: 2584 }, // Nivel 3: 1.70% hasta S/2,584
        { percentage: 0.6, maxAmount: 912 }, // Nivel 4: 0.60% hasta S/912
        { percentage: 0.6, maxAmount: 912 }, // Nivel 5: 0.60% hasta S/912
        { percentage: 0.3, maxAmount: 456 }, // Nivel 6: 0.30% hasta S/456
        { percentage: 0.3, maxAmount: 456 }, // Nivel 7: 0.30% hasta S/456
      ],
    },
    financed: {
      tiers: [
        { percentage: 3.5, maxAmount: 5320 }, // Nivel 1: 3.50% hasta S/5,320
        { percentage: 1.5, maxAmount: 2280 }, // Nivel 2: 1.50% hasta S/2,280
        { percentage: 1.3, maxAmount: 1976 }, // Nivel 3: 1.30% hasta S/1,976
        { percentage: 0.8, maxAmount: 1216 }, // Nivel 4: 0.80% hasta S/1,216
        { percentage: 0.4, maxAmount: 608 }, // Nivel 5: 0.40% hasta S/608
        { percentage: 0.3, maxAmount: 456 }, // Nivel 6: 0.30% hasta S/456
        { percentage: 0.2, maxAmount: 304 }, // Nivel 7: 0.20% hasta S/304
      ],
    },
  },
};

export interface UserBasicInfo {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
  nickname?: string;
}

export interface UserWithPosition {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  position?: 'LEFT' | 'RIGHT';
}

export interface ActiveAncestorWithMembership {
  userId: string;
  userName: string;
  userEmail: string;
  site: 'LEFT' | 'RIGHT';
}

export interface ParentChainUser {
  userId: string;
  userName: string;
  userEmail: string;
}

export interface DirectBonusUser {
  userId: string;
  userName: string;
  userEmail: string;
  paymentReference?: string;
  paymentId?: number;
  directBonus: number;
  metadata?: Record<string, any>;
  type: 'DIRECT_BONUS';
}

export interface CreateDirectBonusRequest {
  users: DirectBonusUser[];
}

export interface ProcessedDirectBonus {
  referrerUserId: string;
  bonusPoints: number;
  paymentReference: string;
  transactionId: number;
  previousPoints: number;
  currentPoints: number;
}

export interface FailedDirectBonus {
  userId: string;
  userName: string;
  userEmail: string;
  paymentReference: string;
  reason: string;
}

export interface DirectBonusResponse {
  processed: ProcessedDirectBonus[];
  failed: FailedDirectBonus[];
}

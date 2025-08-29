export interface UserMembershipInfo {
  id: string;
  startDate: Date;
  endDate: Date;
  status:
    | 'PENDING'
    | 'ACTIVE'
    | 'INACTIVE'
    | 'EXPIRED'
    | 'DELETED'
    | 'SUSPENDED';
  planName: string;
  minimumReconsumptionAmount: number;
}

export interface UserMembershipStatusResponse {
  hasMembership: boolean;
  membership: UserMembershipInfo | null;
}

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
export interface VolumeAssignment {
  userId: string;
  userName: string;
  userEmail: string;
  site: 'LEFT' | 'RIGHT';
  volume: number;
}
import { Injectable, Logger } from '@nestjs/common';
import { MessagingService } from 'src/messaging/messaging.service';
import {
  CreateDirectBonusRequest,
  DirectBonusResponse,
} from '../interfaces/user.interface';

export interface MonthlyVolumeUserAssignment {
  userId: string;
  userName: string;
  userEmail: string;
  site: 'LEFT' | 'RIGHT';
  paymentId?: string;
  leftDirects?: number;
  rightDirects?: number;
}

export interface CreateMonthlyVolumeRequest {
  amount: number;
  volume: number;
  users: MonthlyVolumeUserAssignment[];
}

export interface ProcessedMonthlyVolume {
  userId: string;
  side: 'LEFT' | 'RIGHT';
  volumeAdded: number;
  directsAdded?: number;
  action: 'created' | 'updated';
  monthlyVolumeId: number;
  totalVolumeAfter: number;
}

export interface FailedMonthlyVolume {
  userId: string;
  reason: string;
}

export interface CreateMonthlyVolumeResponse {
  processed: ProcessedMonthlyVolume[];
  failed: FailedMonthlyVolume[];
}

@Injectable()
export class PointService {
  private readonly logger = new Logger(PointService.name);

  constructor(private readonly pointsClient: MessagingService) {}

  async createMonthlyVolume(
    request: CreateMonthlyVolumeRequest,
  ): Promise<CreateMonthlyVolumeResponse> {
    return this.pointsClient.send<CreateMonthlyVolumeResponse>(
      { cmd: 'monthlyVolume.createMonthlyVolume' },
      request,
    );
  }

  async createDirectBonus(
    request: CreateDirectBonusRequest,
  ): Promise<DirectBonusResponse> {
    return this.pointsClient.send<DirectBonusResponse>(
      { cmd: 'userPoints.createDirectBonus' },
      request,
    );
  }
}

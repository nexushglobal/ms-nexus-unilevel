/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { throwError, firstValueFrom } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { POINT_SERVICE } from 'src/config/services';

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

  constructor(
    @Inject(POINT_SERVICE) private readonly pointsClient: ClientProxy,
  ) {}

  async createMonthlyVolume(
    request: CreateMonthlyVolumeRequest,
  ): Promise<CreateMonthlyVolumeResponse> {
    return firstValueFrom(
      this.pointsClient
        .send<CreateMonthlyVolumeResponse>(
          { cmd: 'monthlyVolume.createMonthlyVolume' },
          request,
        )
        .pipe(
          timeout(30000),
          catchError((error) => {
            this.logger.error('Error creando volumen mensual:', error);
            return throwError(() => ({
              status: 500,
              message: `Error al crear volumen mensual: ${error.message}`,
              service: 'point',
              timestamp: new Date().toISOString(),
            }));
          }),
        ),
    );
  }
}

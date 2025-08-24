/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { throwError, firstValueFrom } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { USERS_SERVICE } from 'src/config/services';

import {
  UserBasicInfo,
  UserWithPosition,
  ActiveAncestorWithMembership,
} from '../interfaces/user.interface';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(USERS_SERVICE) private readonly usersClient: ClientProxy,
  ) {}

  async getUserBasicInfo(userId: string): Promise<UserBasicInfo> {
    return firstValueFrom(
      this.usersClient
        .send<UserBasicInfo>({ cmd: 'users.getUserBasicInfo' }, { userId })
        .pipe(
          timeout(10000),
          catchError((error) => {
            this.logger.error(
              `Error obteniendo información básica del usuario ${userId}:`,
              error,
            );
            return throwError(() => ({
              status: 500,
              message: `Error al obtener información del usuario: ${error.message}`,
              service: 'user',
              timestamp: new Date().toISOString(),
            }));
          }),
        ),
    );
  }

  async getActiveAncestorsWithMembership(
    userId: string,
  ): Promise<ActiveAncestorWithMembership[]> {
    return firstValueFrom(
      this.usersClient
        .send<
          ActiveAncestorWithMembership[]
        >({ cmd: 'users.getActiveAncestorsWithMembership' }, { userId })
        .pipe(
          timeout(15000),
          catchError((error) => {
            this.logger.error(
              `Error obteniendo ancestros activos con membresía para usuario ${userId}:`,
              error,
            );
            return throwError(() => ({
              status: 500,
              message: `Error al obtener ancestros del usuario: ${error.message}`,
              service: 'user',
              timestamp: new Date().toISOString(),
            }));
          }),
        ),
    );
  }

  async getUserWithPosition(userId: string): Promise<UserWithPosition> {
    return firstValueFrom(
      this.usersClient
        .send<UserWithPosition>(
          { cmd: 'users.getUserWithPosition' },
          { userId },
        )
        .pipe(
          timeout(10000),
          catchError((error) => {
            this.logger.error(
              `Error obteniendo usuario con posición ${userId}:`,
              error,
            );
            return throwError(() => ({
              status: 500,
              message: `Error al obtener posición del usuario: ${error.message}`,
              service: 'user',
              timestamp: new Date().toISOString(),
            }));
          }),
        ),
    );
  }
}

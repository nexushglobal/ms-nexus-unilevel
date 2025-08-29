import { Injectable, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { PointService, CreateMonthlyVolumeRequest } from './point.service';
import { VolumeAssignment } from '../interfaces/volume.interface';
import { UserWithPosition } from '../interfaces/user.interface';

@Injectable()
export class VolumeService {
  private readonly logger = new Logger(VolumeService.name);

  constructor(
    private readonly userService: UserService,
    private readonly pointService: PointService,
  ) {}

  async processMonthlyVolumeForSale(
    userId: string,
    isSeller: boolean,
    totalAmount: number,
    saleId: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `Procesando volumen mensual para venta - Usuario: ${userId}, Rol: ${isSeller ? 'VENDEDOR' : 'COMPRADOR'}, Monto: ${totalAmount}`,
      );

      // Obtener información del usuario con su posición
      const userInfo = await this.userService
        .getUserWithPosition(userId)
        .catch((error) => {
          this.logger.warn(
            `No se pudo obtener información del usuario ${userId}:`,
            error,
          );
          return null as UserWithPosition | null;
        });

      // Preparar asignaciones de volumen solo para el usuario que realizó la transacción
      const userVolumeAssignments: VolumeAssignment[] = [];

      const userName = userInfo
        ? `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() ||
          'Usuario'
        : 'Usuario';

      const userEmail = userInfo?.email || 'usuario@example.com';

      // Asignar 50% al lado izquierdo
      userVolumeAssignments.push({
        userId: userId,
        userName: userName,
        userEmail: userEmail,
        site: 'LEFT',
        volume: totalAmount / 2,
      });

      // Asignar 50% al lado derecho
      userVolumeAssignments.push({
        userId: userId,
        userName: userName,
        userEmail: userEmail,
        site: 'RIGHT',
        volume: totalAmount / 2,
      });

      this.logger.log(
        `Procesando volumen para usuario: ${userId} (${userName})`,
      );

      // Procesar volúmenes (agrupados por volumen para optimizar)
      await this.processVolumeGroups(userVolumeAssignments, saleId);
    } catch (error) {
      this.logger.error('Error procesando volumen mensual:', error);
      // No lanzamos error para no fallar la venta, solo logueamos
    }
  }

  /**
   * Procesa grupos de volumen organizados por cantidad
   */
  private async processVolumeGroups(
    assignments: VolumeAssignment[],
    saleId: string,
  ): Promise<void> {
    if (assignments.length === 0) {
      this.logger.log('No hay asignaciones de volumen mensual para procesar');
      return;
    }

    this.logger.log(
      `Enviando ${assignments.length} asignaciones de volumen mensual`,
    );

    // Agrupar usuarios por volumen para optimizar las llamadas
    const volumeGroups = new Map<number, typeof assignments>();

    assignments.forEach((assignment) => {
      const volume = assignment.volume;
      if (!volumeGroups.has(volume)) {
        volumeGroups.set(volume, []);
      }
      volumeGroups.get(volume)!.push(assignment);
    });

    let totalProcessed = 0;
    let totalFailed = 0;

    // Procesar cada grupo de volumen
    for (const [volume, groupAssignments] of volumeGroups) {
      try {
        this.logger.log(
          `Procesando ${groupAssignments.length} usuarios con volumen ${volume}`,
        );

        const monthlyVolumeRequest: CreateMonthlyVolumeRequest = {
          amount: volume,
          volume: volume,
          users: groupAssignments.map((assignment) => ({
            userId: assignment.userId,
            userName: assignment.userName,
            userEmail: assignment.userEmail,
            site: assignment.site,
            paymentId: `SALE_${saleId}`,
          })),
        };

        const result =
          await this.pointService.createMonthlyVolume(monthlyVolumeRequest);

        totalProcessed += result.processed?.length || 0;
        totalFailed += result.failed?.length || 0;

        if (result.failed?.length > 0) {
          this.logger.warn(
            `Volúmenes fallidos para grupo de volumen ${volume}:`,
            result.failed,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error procesando grupo de volumen ${volume}:`,
          error,
        );
        totalFailed += groupAssignments.length;
      }
    }

    this.logger.log(
      `Volumen mensual total procesado: ${totalProcessed} exitosos, ${totalFailed} fallidos`,
    );
  }
}

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { PointService } from './point.service';
import { MembershipService } from './membership.service';
import {
  CreateDirectBonusRequest,
  DirectBonusUser,
} from '../interfaces/user.interface';
import {
  CommissionResult,
  COMMISSION_CONFIGS,
  CommissionConfig,
} from '../../unilevel/interfaces/commission-config.interface';
import { SaleType } from '../../unilevel/enums/sale-type.enum';

@Injectable()
export class CommissionService {
  private readonly logger = new Logger(CommissionService.name);

  constructor(
    private readonly userService: UserService,
    private readonly pointService: PointService,
    private readonly membershipService: MembershipService,
  ) {}

  /**
   * Procesa comisiones completas para una venta
   */
  async processCommissionsForSale(
    userId: string,
    isSeller: boolean,
    totalAmount: number,
    projectName: string,
    saleType: SaleType,
  ): Promise<Record<string, any> | null> {
    try {
      // 1. Obtener información del usuario actual
      const currentUserInfo = await this.userService
        .getUserWithPosition(userId)
        .catch((error) => {
          this.logger.warn(
            `No se pudo obtener información del usuario actual ${userId}:`,
            error,
          );
          return null;
        });

      if (!currentUserInfo) {
        this.logger.warn(
          `No se pudo obtener información del usuario ${userId}, no se procesarán comisiones`,
        );
        return null;
      }

      // 2. Obtener cadena de padres directos (máximo 6 niveles)
      const parentChain = await this.userService
        .getParentChain(userId)
        .catch((error) => {
          this.logger.warn(
            `No se pudieron obtener padres para usuario ${userId}:`,
            error,
          );
          return [];
        });

      // 3. Crear usuario actual para agregar al arreglo
      const currentUser = {
        userId: userId,
        userName:
          currentUserInfo.firstName && currentUserInfo.lastName
            ? `${currentUserInfo.firstName} ${currentUserInfo.lastName}`.trim()
            : 'Usuario Actual',
        userEmail: currentUserInfo.email,
      };

      // 4. Combinar usuario actual + padres (usuario actual al inicio)
      const fullUserChain = [currentUser, ...parentChain];

      // 5. Calcular comisiones por tramos
      let commissionResults = this.calculateCommissionsByTiers(
        fullUserChain,
        totalAmount,
        projectName,
        saleType,
      );

      // 6. Validar membresías activas y actualizar comisiones
      commissionResults =
        await this.validateMembershipsAndUpdateCommissions(commissionResults);

      if (commissionResults.length === 0) {
        return null;
      }

      // 7. Enviar puntos directos a usuarios que comisionan
      await this.sendDirectBonusPoints(commissionResults);

      // 8. Crear y retornar metadata
      return this.createCommissionMetadata(
        commissionResults,
        projectName,
        saleType,
      );
    } catch (error) {
      this.logger.error('Error procesando comisiones:', error);
      return null;
    }
  }

  /**
   * Calcula las comisiones por tramos basado en el proyecto y tipo de pago
   */
  private calculateCommissionsByTiers(
    userChain: Array<{ userId: string; userName: string; userEmail: string }>,
    totalAmount: number,
    projectName: string,
    saleType: SaleType,
  ): CommissionResult[] {
    // Determinar configuración: APOLO tiene reglas específicas, todos los demás proyectos usan reglas estándar
    const isApoloProject = projectName.toUpperCase() === 'APOLO';
    const projectKey = isApoloProject ? 'APOLO' : 'GENERAL';
    const projectConfig = COMMISSION_CONFIGS[projectKey];

    if (!projectConfig) {
      this.logger.error(
        `Configuración no encontrada para proyecto: ${projectName}`,
      );
      return [];
    }

    // Seleccionar configuración según tipo de venta
    const commissionConfig: CommissionConfig =
      saleType === SaleType.DIRECT_PAYMENT
        ? projectConfig.directPayment
        : projectConfig.financed;

    const results: CommissionResult[] = [];

    // Calcular comisión para cada usuario en su nivel correspondiente
    userChain.forEach((user, index) => {
      if (index >= commissionConfig.tiers.length) {
        return;
      }

      const tier = commissionConfig.tiers[index];
      const amountForCommission = Math.min(totalAmount, tier.maxAmount);
      const commissionAmount = (amountForCommission * tier.percentage) / 100;

      const result: CommissionResult = {
        userId: user.userId,
        userName: user.userName,
        userEmail: user.userEmail,
        tier: index + 1,
        percentage: tier.percentage,
        amount: amountForCommission,
        commissionAmount,
      };

      results.push(result);
    });

    return results;
  }

  private async validateMembershipsAndUpdateCommissions(
    commissionResults: CommissionResult[],
  ): Promise<CommissionResult[]> {
    const updatedResults: CommissionResult[] = [];

    for (const result of commissionResults) {
      try {
        // Validar membresía activa
        const membershipStatus =
          await this.membershipService.getUserMembershipStatus(result.userId);

        const hasActiveMembership =
          membershipStatus.hasMembership &&
          membershipStatus.membership?.status === 'ACTIVE';

        if (hasActiveMembership) {
          // Usuario tiene membresía activa - mantener comisión
          updatedResults.push(result);
        } else {
          // Usuario sin membresía activa - comisión = 0
          updatedResults.push({
            ...result,
            commissionAmount: 0,
            reason: 'No tiene membresía activa',
          });
        }
      } catch (error) {
        // En caso de error, asumir sin membresía
        this.logger.warn(
          `Error validando membresía para usuario ${result.userId}: ${error.message}`,
        );
        updatedResults.push({
          ...result,
          commissionAmount: 0,
          reason: 'Error validando membresía',
        });
      }
    }

    return updatedResults;
  }

  /**
   * Envía puntos directos a usuarios que comisionan
   */
  private async sendDirectBonusPoints(
    commissionResults: CommissionResult[],
  ): Promise<void> {
    // Preparar usuarios para puntos directos (solo los que comisionan)
    const usersForDirectBonus = commissionResults
      .filter((result) => result.tier > 1 && result.commissionAmount > 0) // Solo padres que comisionan
      .map(
        (result): DirectBonusUser => ({
          userId: result.userId,
          userName: result.userName,
          userEmail: result.userEmail,
          directBonus: result.commissionAmount,
          type: 'DIRECT_BONUS',
        }),
      );

    // Enviar puntos directos si hay usuarios que comisionan
    if (usersForDirectBonus.length > 0) {
      try {
        const directBonusRequest: CreateDirectBonusRequest = {
          users: usersForDirectBonus,
        };
        await this.pointService.createDirectBonus(directBonusRequest);
      } catch (error) {
        this.logger.error(
          'Error enviando puntos directos de comisiones:',
          error,
        );
        // No fallar la venta por esto
      }
    }
  }

  /**
   * Crea la metadata de comisiones en español
   */
  private createCommissionMetadata(
    commissionResults: CommissionResult[],
    projectName: string,
    saleType: SaleType,
  ): Record<string, any> {
    return {
      comisiones: commissionResults.map((result) => ({
        usuario: result.userId,
        nombre: result.userName,
        email: result.userEmail,
        nivel: result.tier,
        porcentaje: result.percentage,
        montoComision: result.commissionAmount,
        ...(result.reason && { razon: result.reason }), // Solo incluir si existe reason
      })),
      totalComisiones: commissionResults
        .reduce((sum, c) => sum + c.commissionAmount, 0)
        .toFixed(2),
      proyecto: projectName,
      tipoVenta: saleType,
      fechaProcesamiento: new Date().toISOString(),
    };
  }
}

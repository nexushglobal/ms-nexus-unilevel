/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Sale } from '../entities/sale.entity';
import { StatusSale } from '../enums/status-sale.enum';
import { PaymentApprovedNotificationDto } from '../dto/payment-approved-notification.dto';
import { CommissionService } from '../../common/services/commission.service';
import { VolumeService } from '../../common/services/volume.service';
import { LotTransactionRole } from '../enums/lot-transaction-role.enum';
import { TransactionService } from '../../common/services/transaction.service';

@Injectable()
export class PaymentNotificationService {
  private readonly logger = new Logger(PaymentNotificationService.name);

  constructor(
    private readonly commissionService: CommissionService,
    private readonly volumeService: VolumeService,
    private readonly transactionService: TransactionService,
  ) {}

  async handlePaymentApproved(
    notificationData: PaymentApprovedNotificationDto,
  ): Promise<void> {
    this.logger.log(
      `Recibida notificación de pago aprobado para venta: ${notificationData.saleId}`,
    );

    return await this.transactionService.runInTransaction(
      async (queryRunner) => {
        // 1. Buscar la venta en la base de datos
        const sale = await queryRunner.manager.findOne(Sale, {
          where: { saleIdReference: notificationData.saleId },
        });

        if (!sale)
          throw new RpcException({
            status: HttpStatus.NOT_FOUND,
            message: `Venta con ID ${notificationData.saleId} no encontrada`,
          });

        // 2. Actualizar estado de la venta
        await queryRunner.manager.update(
          Sale,
          { id: sale.id },
          {
            status: StatusSale.APPROVED,
          },
        );

        // 3. Obtener información necesaria para procesar comisiones y volúmenes
        const userId = sale.vendorId;
        const projectName = sale.projectName || 'Default Project';
        const saleType = sale.type;
        const isSeller = sale.lotTransactionRole === LotTransactionRole.SELLER;

        const commissionMetadata =
          await this.commissionService.processCommissionsForSale(
            userId,
            isSeller,
            sale.amount,
            projectName,
            saleType,
          );

        // 5. Procesar volumen mensual
        this.logger.log(`Procesando volumen mensual para usuario ${userId}`);
        await this.volumeService.processMonthlyVolumeForSale(
          userId,
          isSeller,
          sale.amount,
          sale.id,
        );

        // 6. Actualizar metadata de la venta con información de comisiones
        const updatedMetadata: any = {
          ...sale.metadata,
          ...commissionMetadata,
          processedAt: new Date().toISOString(),
        };

        await queryRunner.manager.update(
          Sale,
          { id: sale.id },
          {
            metadata: updatedMetadata,
          },
        );

        this.logger.log(
          `Pago procesado exitosamente para venta: ${notificationData.saleId}`,
        );
      },
    );
  }
}

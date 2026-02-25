/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Sale } from '../entities/sale.entity';
import { StatusSale } from '../enums/status-sale.enum';
import { PaymentAction } from '../enums/payment-action.enum';
import { PaymentApprovedNotificationDto } from '../dto/payment-approved-notification.dto';
import { CommissionService } from '../../common/services/commission.service';
import { VolumeService } from '../../common/services/volume.service';
import { LotTransactionRole } from '../enums/lot-transaction-role.enum';
import { TransactionService } from '../../common/services/transaction.service';

// Estados que pertenecen a la fase de reserva
const RESERVATION_STATUSES: StatusSale[] = [
  StatusSale.RESERVATION_PENDING,
  StatusSale.RESERVATION_PENDING_APPROVAL,
  StatusSale.RESERVATION_IN_PAYMENT,
  StatusSale.RESERVED,
];

// Estados donde se procesan comisiones y volúmenes
const COMMISSION_STATUSES: StatusSale[] = [
  StatusSale.APPROVED,
  StatusSale.IN_PAYMENT_PROCESS,
  StatusSale.COMPLETED,
];

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
      `Recibida notificación de pago para venta: ${notificationData.saleId} | action: ${notificationData.action} | saleStatus: ${notificationData.saleStatus}`,
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

        const { saleStatus, action, approvedAmount } = notificationData;

        // 2. Actualizar estado de la venta
        await queryRunner.manager.update(
          Sale,
          { id: sale.id },
          { status: saleStatus },
        );

        this.logger.log(
          `Estado de venta ${notificationData.saleId} actualizado: ${sale.status} → ${saleStatus}`,
        );

        // 3. Si fue aprobado y hay monto, actualizar tracking de montos
        if (action === PaymentAction.APPROVED && approvedAmount) {
          const amountUpdates = this.calculateAmountUpdates(
            sale,
            saleStatus,
            approvedAmount,
          );

          await queryRunner.manager.update(
            Sale,
            { id: sale.id },
            amountUpdates,
          );

          this.logger.log(
            `Montos actualizados para venta ${notificationData.saleId}: ${JSON.stringify(amountUpdates)}`,
          );
        }

        // 4. Procesar comisiones y volúmenes solo en estados finales
        if (
          action === PaymentAction.APPROVED &&
          COMMISSION_STATUSES.includes(saleStatus)
        ) {
          await this.processCommissionsAndVolumes(sale, queryRunner);
        }

        this.logger.log(
          `Notificación procesada exitosamente para venta: ${notificationData.saleId}`,
        );
      },
    );
  }

  private calculateAmountUpdates(
    sale: Sale,
    saleStatus: StatusSale,
    approvedAmount: number,
  ): Partial<Sale> {
    const isReservationPhase = RESERVATION_STATUSES.includes(sale.status);

    if (isReservationPhase) {
      // Pago de reserva
      const paid = Number(sale.reservationAmountPaid ?? 0) + approvedAmount;
      const pending = Number(sale.reservationAmountPending ?? 0) - approvedAmount;
      return {
        reservationAmountPaid: paid,
        reservationAmountPending: Math.max(pending, 0),
      };
    }

    // Pago de inicial o total (fase de venta)
    const updates: Partial<Sale> = {
      totalAmountPaid: Number(sale.totalAmountPaid ?? 0) + approvedAmount,
      totalAmountPending: Math.max(
        Number(sale.totalAmountPending ?? 0) - approvedAmount,
        0,
      ),
    };

    // Si tiene monto inicial pendiente, también actualizar inicial
    if (Number(sale.initialAmountPending ?? 0) > 0) {
      const initialPaid =
        Number(sale.initialAmountPaid ?? 0) + approvedAmount;
      const initialPending =
        Number(sale.initialAmountPending ?? 0) - approvedAmount;
      updates.initialAmountPaid = initialPaid;
      updates.initialAmountPending = Math.max(initialPending, 0);
    }

    return updates;
  }

  private async processCommissionsAndVolumes(
    sale: Sale,
    queryRunner: any,
  ): Promise<void> {
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

    this.logger.log(`Procesando volumen mensual para usuario ${userId}`);
    await this.volumeService.processMonthlyVolumeForSale(
      userId,
      isSeller,
      sale.amount,
      sale.id,
    );

    const updatedMetadata: any = {
      ...sale.metadata,
      ...commissionMetadata,
      processedAt: new Date().toISOString(),
    };

    await queryRunner.manager.update(
      Sale,
      { id: sale.id },
      { metadata: updatedMetadata },
    );
  }
}

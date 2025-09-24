/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FindAllLotsDto } from './dto/find-all-lots.dto';
import { CalculateAmortizationDto } from './dto/calculate-amortizacion-dto';
import { CreateUpdateLeadDto } from './dto/create-update-lead.dto';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CreateClientAndGuarantorDto } from './dto/create-client-and-guarantor.dto';
import { FindAllSalesDto } from './dto/find-all-sales.dto';
import { CreateDetailPaymentDto } from './dto/create-detail-payment.dto';
import { PaymentApprovedNotificationDto } from './dto/payment-approved-notification.dto';
import { UnilevelService } from './services/unilevel.service';
import { UnilevelCustomService } from './services/unilevel-custom.service';
import { PaymentNotificationService } from './services/payment-notification.service';

@Controller()
export class UnilevelController {
  // private readonly EXTERNAL_USER_ID = '3f9f5e47-bfe5-4e85-b9b2-f4cd20e5e3a4';
  constructor(
    private readonly unilevelService: UnilevelService,
    private readonly unilevelCustomService: UnilevelCustomService,
    private readonly paymentNotificationService: PaymentNotificationService,
  ) {}

  @MessagePattern({ cmd: 'unilevel.getProjects' })
  async projects() {
    return this.unilevelService.getProjects();
  }

  @MessagePattern({ cmd: 'unilevel.getStages' })
  async getStages(@Payload('projectId', ParseUUIDPipe) projectId: string) {
    return this.unilevelService.getStages(projectId);
  }

  @MessagePattern({ cmd: 'unilevel.getBlocks' })
  async getBlocks(@Payload('stageId', ParseUUIDPipe) stageId: string) {
    return this.unilevelService.getBlocks(stageId);
  }

  @MessagePattern({ cmd: 'unilevel.getLots' })
  async getLots(@Payload('blockId', ParseUUIDPipe) blockId: string) {
    return this.unilevelService.getLots(blockId);
  }

  @MessagePattern({ cmd: 'unilevel.findLotsByProjectId' })
  async findLotsByProjectId(@Payload() data: FindAllLotsDto) {
    return this.unilevelService.findLotsByProjectId(data);
  }

  // ============= CÁLCULOS =============
  @MessagePattern({ cmd: 'unilevel.calculateAmortization' })
  async calculateAmortization(
    @Payload() calculateDto: CalculateAmortizationDto,
  ) {
    return this.unilevelService.calculeAmortization(
      calculateDto.totalAmount,
      calculateDto.initialAmount,
      calculateDto.reservationAmount || 0,
      calculateDto.interestRate,
      calculateDto.numberOfPayments,
      calculateDto.firstPaymentDate,
    );
  }

  // ============= LEADS =============
  @MessagePattern({ cmd: 'unilevel.createOrUpdateLead' })
  async createOrUpdateLead(
    @Payload() createUpdateLeadDto: CreateUpdateLeadDto,
  ) {
    return this.unilevelService.createOrUpdateLead(createUpdateLeadDto);
  }

  // ============= CLIENTES Y GARANTES =============
  @MessagePattern({ cmd: 'unilevel.createClientAndGuarantor' })
  async createClientAndGuarantor(
    @Payload()
    clientGuarantorDto: CreateClientAndGuarantorDto,
  ) {
    return this.unilevelService.createClientAndGuarantor(clientGuarantorDto);
  }

  // ============= VENTAS =============
  @MessagePattern({ cmd: 'unilevel.createSale' })
  async createSale(@Payload() createSaleDto: CreateSaleDto) {
    return this.unilevelService.createSale(createSaleDto);
  }

  @MessagePattern({ cmd: 'unilevel.findAllSales' })
  async findAllSales(@Payload() findAllSalesDto: FindAllSalesDto) {
    return this.unilevelService.findAllSales(findAllSalesDto);
  }

  @MessagePattern({ cmd: 'unilevel.findOneSaleById' })
  async findOneSaleById(@Payload('id', ParseUUIDPipe) id: string) {
    return this.unilevelService.findOneSaleById(id);
  }

  @MessagePattern({ cmd: 'unilevel.createPaymentSale' })
  async handleCreatePaymentSale(
    @Payload('saleId', ParseUUIDPipe) saleId: string,
    @Payload('payments') payments: CreateDetailPaymentDto[],
    @Payload('files') files: any[],
  ) {
    const deserializedFiles =
      files?.map((file) => ({
        ...file,
        buffer: Buffer.from(file.buffer, 'base64'),
      })) || [];
    return this.unilevelService.createPaymentSale(
      saleId,
      payments,
      deserializedFiles,
    );
  }

  @MessagePattern({ cmd: 'unilevel.paidInstallments' })
  async handlePaidInstallments(
    @Payload('financingId', ParseUUIDPipe) financingId: string,
    @Payload('amountPaid') amountPaid: number,
    @Payload('payments') payments: CreateDetailPaymentDto[],
    @Payload('files') files: any[],
  ) {
    const deserializedFiles =
      files?.map((file) => ({
        ...file,
        buffer: Buffer.from(file.buffer, 'base64'),
      })) || [];

    return this.unilevelService.paidInstallments(
      financingId,
      amountPaid,
      payments,
      deserializedFiles,
    );
  }

  @MessagePattern({ cmd: 'unilevel.getUserLotCounts' })
  async getUserLotCounts(@Payload() data: { userId: string }) {
    return this.unilevelCustomService.getUserLotCounts(data.userId);
  }

  @MessagePattern({ cmd: 'unilevel.getUsersLotCountsBatch' })
  async getUsersLotCountsBatch(@Payload() data: { userIds: string[] }) {
    return this.unilevelCustomService.getUsersLotCountsBatch(data.userIds);
  }

  // ============= PAYMENT NOTIFICATIONS =============
  @MessagePattern({ cmd: 'unilevel.payment.approved' })
  async handlePaymentApprovedNotification(
    @Payload() notificationData: PaymentApprovedNotificationDto,
  ) {
    return this.paymentNotificationService.handlePaymentApproved(
      notificationData,
    );
  }
}

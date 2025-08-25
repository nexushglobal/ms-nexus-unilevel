/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FindAllLotsDto } from './dto/find-all-lots.dto';
import { UnilevelService } from './unilevel.service';
import { CalculateAmortizationDto } from './dto/calculate-amortizacion-dto';
import { CreateUpdateLeadDto } from './dto/create-update-lead.dto';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CreateClientAndGuarantorDto } from './dto/create-client-and-guarantor.dto';
import { FindAllSalesDto } from './dto/find-all-sales.dto';
import { CreateDetailPaymentDto } from './dto/create-detail-payment.dto';

@Controller()
export class UnilevelController {
  private readonly EXTERNAL_USER_ID = '3f9f5e47-bfe5-4e85-b9b2-f4cd20e5e3a4';
  constructor(private unilevelService: UnilevelService) {}

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
    @Payload('saleIdReference', ParseUUIDPipe) saleIdReference: string,
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
      saleIdReference,
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
    return this.unilevelService.getUserLotCounts(data.userId);
  }
}

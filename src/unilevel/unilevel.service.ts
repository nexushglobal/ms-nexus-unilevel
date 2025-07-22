/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { HttpAdapter } from 'src/common/interfaces/http-adapter.interface';
import { ProjectListResponseDto } from './interfaces/project-list.dto';
import { envs } from 'src/config/envs';
import { StageResponse } from './interfaces/stage-response.interface';
import { BlockResponse } from './interfaces/block-response.interface';
import { LotResponse } from './interfaces/lot-response.interface';
import { FindAllLotsDto } from './dto/find-all-lots.dto';
import { LotDetailResponseDto } from './interfaces/lot-detail-response.dto';
import { Paginated } from 'src/common/dto/paginated.dto';
import { CalculateAmortizationResponse } from './interfaces/calculate-amortization-response.interface';
import { CreateUpdateLeadDto } from './dto/create-update-lead.dto';
import { ClientAndGuarantorResponse } from './interfaces/client-and-guarantor-response.interface';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleResponse } from './interfaces/sale-response.interface';
import { CreateClientAndGuarantorDto } from './dto/create-client-and-guarantor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { DeepPartial, Repository } from 'typeorm';
import { SaleLoteResponse } from './interfaces/sale-lote-response.interface';
import { formatSaleResponse } from './helpers/format-sale-response.helper';
import { BaseService } from 'src/common/services/base.service';
import { FindAllSalesDto } from './dto/find-all-sales.dto';
import { CreatePaymentSaleDto } from './dto/create-payment-sale.dto';

@Injectable()
export class UnilevelService extends BaseService<Sale> {
  private readonly huertasApiUrl: string;
  private readonly huertasApiKey: string;
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    private readonly httpAdapter: HttpAdapter,
  ) {
    super(saleRepository);
    this.huertasApiUrl = envs.HUERTAS_API_URL;
    this.huertasApiKey = envs.HUERTAS_API_KEY;
  }

  async getProjects(): Promise<ProjectListResponseDto> {
    return this.httpAdapter.get<ProjectListResponseDto>(
      `${this.huertasApiUrl}/api/external/projects`,
      this.huertasApiKey,
    );
  }

  async getStages(projectId: string): Promise<StageResponse[]> {
    return this.httpAdapter.get<StageResponse[]>(
      `${this.huertasApiUrl}/api/external/projects/${projectId}/stages`,
      this.huertasApiKey,
    );
  }

  async getBlocks(stageId: string): Promise<BlockResponse[]> {
    return this.httpAdapter.get<BlockResponse[]>(
      `${this.huertasApiUrl}/api/external/stages/${stageId}/blocks`,
      this.huertasApiKey,
    );
  }

  async getLots(blockId: string): Promise<LotResponse[]> {
    return this.httpAdapter.get<LotResponse[]>(
      `${this.huertasApiUrl}/api/external/blocks/${blockId}/lots`,
      this.huertasApiKey,
    );
  }

  async findLotsByProjectId(
    findAllLotsDto: FindAllLotsDto,
  ): Promise<Paginated<LotDetailResponseDto>> {
    const { projectId, ...rest } = findAllLotsDto;
    const queryParams = new URLSearchParams();
    if (rest.page) queryParams.append('page', rest.page.toString());
    if (rest.limit) queryParams.append('limit', rest.limit.toString());
    if (rest.order) queryParams.append('order', rest.order);
    if (rest.status) queryParams.append('status', rest.status);
    if (rest.term) queryParams.append('term', rest.term);
    if (rest.stageId) queryParams.append('stageId', rest.stageId);
    if (rest.blockId) queryParams.append('blockId', rest.blockId);

    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.huertasApiUrl}/api/external/projects/${projectId}/lots?${queryString}`
      : `${this.huertasApiUrl}/api/external/projects/${projectId}/lots`;
    return this.httpAdapter.get<Paginated<LotDetailResponseDto>>(
      url,
      this.huertasApiKey,
    );
  }

  async calculeAmortization(
    totalAmount: number,
    initialAmount: number,
    reservationAmount: number,
    interestRate: number,
    numberOfPayments: number,
    firstPaymentDate: string,
  ): Promise<CalculateAmortizationResponse> {
    const data = {
      totalAmount,
      initialAmount,
      reservationAmount,
      interestRate,
      numberOfPayments,
      firstPaymentDate,
    };
    return this.httpAdapter.post<CalculateAmortizationResponse>(
      `${this.huertasApiUrl}/api/external/calculate/amortization`,
      data,
      this.huertasApiKey,
    );
  }

  async createOrUpdateLead(createUpdateDto: CreateUpdateLeadDto) {
    return this.httpAdapter.post(
      `${this.huertasApiUrl}/api/external/leads`,
      createUpdateDto,
      this.huertasApiKey,
    );
  }

  async createClientAndGuarantor(
    createClientAndGuarantorDto: CreateClientAndGuarantorDto,
  ): Promise<ClientAndGuarantorResponse> {
    return this.httpAdapter.post<ClientAndGuarantorResponse>(
      `${this.huertasApiUrl}/api/external/clients-and-guarantors`,
      createClientAndGuarantorDto,
      this.huertasApiKey,
    );
  }

  async createSale(createSaleDto: CreateSaleDto): Promise<SaleLoteResponse> {
    const { userId, ...rest } = createSaleDto;
    rest.metadata = rest.metadata || {
      service: 'Nexus',
      exteralUserId: userId,
    };
    const saleHuertas = await this.httpAdapter.post<SaleResponse>(
      `${this.huertasApiUrl}/api/external/sales`,
      rest,
      this.huertasApiKey,
    );
    const sale = this.saleRepository.create({
      clientFullName: `${saleHuertas.client.firstName} ${saleHuertas.client.lastName}`,
      phone: saleHuertas.client.phone,
      currency: saleHuertas.currency,
      amount: saleHuertas.totalAmount,
      amountInitial: saleHuertas.financing?.initialAmount,
      numberCoutes: saleHuertas.financing?.quantityCoutes,
      type: saleHuertas.type,
      status: saleHuertas.status,
      vendorId: userId,
      saleIdReference: saleHuertas.id,
    } as DeepPartial<Sale>);
    const newSale = await this.saleRepository.save(sale);
    return formatSaleResponse(newSale);
  }

  async findAllSales(
    findAllSalesDto: FindAllSalesDto,
  ): Promise<Paginated<SaleLoteResponse>> {
    const { userId, ...paginationDto } = findAllSalesDto;
    const sales = await this.saleRepository.find({
      where: { vendorId: userId },
    });
    const salesResponse = sales.map((sale) => formatSaleResponse(sale));
    return this.findAllBase(salesResponse, paginationDto);
  }

  async findOneSaleById(id: string): Promise<SaleResponse> {
    return this.httpAdapter.get<SaleResponse>(
      `${this.huertasApiUrl}/api/external/sales/${id}`,
      this.huertasApiKey,
    );
  }

  createPaymentSale(
    saleId: string,
    createPaymentSaleDto: CreatePaymentSaleDto,
    files: Express.Multer.File[],
  ) {
    const formData = new FormData();

    // Agregar datos del pago
    Object.entries(createPaymentSaleDto).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    // Agregar archivos
    if (files && files.length > 0) {
      files.forEach((file) => {
        const blob = new Blob([file.buffer], { type: file.mimetype });
        formData.append('files', blob, file.originalname);
      });
    }

    return this.httpAdapter.post(
      `${this.huertasApiUrl}/api/external/payments/sale/${saleId}`,
      formData,
      this.huertasApiKey,
    );
  }

  paidInstallments(
    financingId: string,
    amountPaid: number,
    payments: string[],
    files: Express.Multer.File[],
  ) {
    const formData = new FormData();

    formData.append('amountPaid', amountPaid.toString());
    payments.forEach((payment) => formData.append('payments', payment));

    // Agregar archivos
    if (files && files.length > 0) {
      files.forEach((file) => {
        const blob = new Blob([file.buffer], { type: file.mimetype });
        formData.append('files', blob, file.originalname);
      });
    }

    return this.httpAdapter.post(
      `${this.huertasApiUrl}/api/external/financing/installments/paid/${financingId}`,
      formData,
      this.huertasApiKey,
    );
  }
}

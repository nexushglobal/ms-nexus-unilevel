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
import { CreateClientDto } from './dto/create-client.dto';
import { CreateGuarantorDto } from './dto/create-guarantor.dto';
import { CreateSecondaryClientDto } from './dto/create-secondary-client.dto';
import { ClientAndGuarantorResponse } from './interfaces/client-and-guarantor-response.interface';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleResponse } from './interfaces/sale-response.interface';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class UnilevelService {
  private readonly huertasApiUrl: string;
  private readonly huertasApiKey: string;
  constructor(private readonly httpAdapter: HttpAdapter) {
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

  async createClientAndGuarantor(data: {
    createClient: CreateClientDto;
    createGuarantor?: CreateGuarantorDto;
    createSecondaryClient?: CreateSecondaryClientDto[];
    document: string;
    userId: string;
  }): Promise<ClientAndGuarantorResponse> {
    return this.httpAdapter.post<ClientAndGuarantorResponse>(
      `${this.huertasApiUrl}/api/external/clients-and-guarantors`,
      data,
      this.huertasApiKey,
    );
  }

  async createSale(
    createSaleDto: CreateSaleDto,
    userId: string,
  ): Promise<SaleResponse> {
    const data = {
      ...createSaleDto,
      userId,
    };
    return this.httpAdapter.post<SaleResponse>(
      `${this.huertasApiUrl}/api/external/sales`,
      data,
      this.huertasApiKey,
    );
  }

  async findAllSales(
    paginationDto: PaginationDto,
  ): Promise<Paginated<SaleResponse>> {
    const queryParams = new URLSearchParams();
    if (paginationDto.page)
      queryParams.append('page', paginationDto.page.toString());
    if (paginationDto.limit)
      queryParams.append('limit', paginationDto.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.huertasApiUrl}/api/external/sales?${queryString}`
      : `${this.huertasApiUrl}/api/external/sales`;

    return this.httpAdapter.get<Paginated<SaleResponse>>(
      url,
      this.huertasApiKey,
    );
  }

  async findOneSaleById(id: string): Promise<SaleResponse> {
    return this.httpAdapter.get<SaleResponse>(
      `${this.huertasApiUrl}/api/external/sales/${id}`,
      this.huertasApiKey,
    );
  }
}

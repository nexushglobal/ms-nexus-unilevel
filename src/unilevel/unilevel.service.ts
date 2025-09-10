import { HttpStatus, Injectable, Logger } from '@nestjs/common';
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
import { DeepPartial, In, QueryRunner, Repository } from 'typeorm';
import { SaleLoteResponse } from './interfaces/sale-lote-response.interface';
import { formatSaleResponse } from './helpers/format-sale-response.helper';
import { BaseService } from 'src/common/services/base.service';
import { FindAllSalesDto } from './dto/find-all-sales.dto';
import { CreateDetailPaymentDto } from './dto/create-detail-payment.dto';
import { LotTransactionRole } from './enums/lot-transaction-role.enum';
import { TransactionService } from 'src/common/services/transaction.service';
import { StatusSale } from './enums/status-sale.enum';
import { RpcException } from '@nestjs/microservices';
import { UserService } from 'src/common/services/user.service';
import { PointService } from 'src/common/services/point.service';
import { MembershipService } from 'src/common/services/membership.service';
import { CommissionService } from 'src/common/services/commission.service';
import { VolumeService } from 'src/common/services/volume.service';

@Injectable()
export class UnilevelService extends BaseService<Sale> {
  private readonly logger = new Logger(UnilevelService.name);
  private readonly huertasApiUrl: string;
  private readonly huertasApiKey: string;

  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    private readonly httpAdapter: HttpAdapter,
    private readonly transactionService: TransactionService,
    private readonly userService: UserService,
    private readonly pointService: PointService,
    private readonly membershipService: MembershipService,
    private readonly commissionService: CommissionService,
    private readonly volumeService: VolumeService,
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
    const { userId, isSeller, projectName, ...rest } = createSaleDto;
    const lotTransactionRole =
      isSeller === false ? LotTransactionRole.BUYER : LotTransactionRole.SELLER;
    rest.metadata = rest.metadata || {
      Servicio: 'Nexus',
      'ID de usuario externo': userId,
      'Rol del usuario en la transacción': lotTransactionRole,
    };
    this.logger.log('PRojectName: ', projectName);
    try {
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
        lotTransactionRole,
        status: saleHuertas.status,
        vendorId: userId,
        saleIdReference: saleHuertas.id,
      } as DeepPartial<Sale>);

      return await this.transactionService.runInTransaction(
        async (queryRunner) => {
          // 1. Procesar comisiones y puntos directos primero
          // const commissionMetadata =
          //   await this.commissionService.processCommissionsForSale(
          //     userId,
          //     isSeller || true,
          //     rest.totalAmount,
          //     projectName,
          //     rest.saleType,
          //   );
          // 2. Crear la venta con metadata incluida
          const saleWithMetadata = this.saleRepository.create({
            ...sale,
            // metadata: commissionMetadata,
          } as DeepPartial<Sale>);

          const newSale = await queryRunner.manager.save(saleWithMetadata);

          // 3. Procesar volumen mensual para el usuario
          // await this.volumeService.processMonthlyVolumeForSale(
          //   userId,
          //   isSeller || true,
          //   rest.totalAmount,
          //   newSale.id,
          // );
          return formatSaleResponse(newSale);
        },
      );
    } catch (error) {
      this.logger.error('Error creating sale:', error);
      throw error;
    }
  }

  async findAllSales(
    findAllSalesDto: FindAllSalesDto,
  ): Promise<Paginated<SaleLoteResponse>> {
    const { userId, lotTransactionRole, ...paginationDto } = findAllSalesDto;
    const queryBuilder = this.saleRepository
      .createQueryBuilder('sale')
      .where('sale.vendorId = :userId', { userId })
      .orderBy('sale.createdAt', 'DESC');
    if (lotTransactionRole)
      queryBuilder.andWhere('sale.lotTransactionRole = :lotTransactionRole', {
        lotTransactionRole,
      });

    const sales = await queryBuilder.getMany();
    const salesResponse = sales.map((sale) => formatSaleResponse(sale));
    return this.findAllBase(salesResponse, paginationDto);
  }

  async findOneSaleById(id: string): Promise<SaleResponse> {
    return this.httpAdapter.get<SaleResponse>(
      `${this.huertasApiUrl}/api/external/sales/${id}`,
      this.huertasApiKey,
    );
  }

  async updateStatusSale(
    id: string,
    status: StatusSale,
    queryRunner?: QueryRunner,
  ): Promise<Sale | null> {
    const repository = queryRunner
      ? this.saleRepository.manager.getRepository(Sale)
      : this.saleRepository;
    const sale = await repository.update({ id }, { status });
    if (sale.affected === 0)
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Ls venta a actualizar no se encuentra registrada`,
      });
    const updatedSale = await repository.findOne({ where: { id } });
    return updatedSale;
  }

  async createPaymentSale(
    saleId: string,
    payments: CreateDetailPaymentDto[],
    files: Express.Multer.File[],
  ) {
    const formData = new FormData();
    formData.append('payments', JSON.stringify(payments));
    // Agrega archivos
    files.forEach((file) => {
      const blob = new Blob([file.buffer as any], { type: file.mimetype });
      formData.append('files', blob, file.originalname);
    });
    return this.transactionService.runInTransaction(async (queryRunner) => {
      const sale = await this.saleRepository.findOne({
        where: { saleIdReference: saleId },
      });
      if (!sale)
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `La venta no se encuentra registrada`,
        });
      await this.updateStatusSale(
        sale.id,
        StatusSale.PENDING_APPROVAL,
        queryRunner,
      );
      return this.httpAdapter.post(
        `${this.huertasApiUrl}/api/external/payments/sale/${sale.saleIdReference}`,
        formData,
        this.huertasApiKey,
      );
    });
  }

  paidInstallments(
    financingId: string,
    amountPaid: number,
    payments: CreateDetailPaymentDto[],
    files: Express.Multer.File[],
  ) {
    const formData = new FormData();
    formData.append('amountPaid', amountPaid.toString());
    formData.append('payments', JSON.stringify(payments));
    // Agregar archivos
    files.forEach((file) => {
      const blob = new Blob([file.buffer as any], { type: file.mimetype });
      formData.append('files', blob, file.originalname);
    });
    return this.httpAdapter.post(
      `${this.huertasApiUrl}/api/external/financing/installments/paid/${financingId}`,
      formData,
      this.huertasApiKey,
    );
  }

  async getUserLotCounts(userId: string): Promise<{
    purchased: number;
    sold: number;
  }> {
    try {
      this.logger.log(`Obteniendo conteo de lotes para usuario: ${userId}`);

      const [purchasedCount, soldCount] = await Promise.all([
        // Contar lotes comprados (como BUYER)
        this.saleRepository.count({
          where: {
            vendorId: userId,
            lotTransactionRole: LotTransactionRole.BUYER,
          },
        }),
        // Contar lotes vendidos (como SELLER)
        this.saleRepository.count({
          where: {
            vendorId: userId,
            lotTransactionRole: LotTransactionRole.SELLER,
          },
        }),
      ]);

      this.logger.log(
        `Usuario ${userId}: ${purchasedCount} comprados, ${soldCount} vendidos`,
      );

      return {
        purchased: purchasedCount,
        sold: soldCount,
      };
    } catch (error) {
      this.logger.error(
        `Error obteniendo conteo de lotes para usuario ${userId}:`,
        error,
      );
      return {
        purchased: 0,
        sold: 0,
      };
    }
  }

  async getUsersLotCountsBatch(userIds: string[]): Promise<{
    [userId: string]: {
      purchased: number;
      sold: number;
    };
  }> {
    try {
      this.logger.log(
        `Obteniendo conteo de lotes para ${userIds.length} usuarios en lote`,
      );

      if (userIds.length === 0) {
        return {};
      }

      const [purchasedSales, soldSales] = await Promise.all([
        // Obtener todas las ventas como BUYER para los usuarios
        this.saleRepository.find({
          where: {
            vendorId: In(userIds),
            lotTransactionRole: LotTransactionRole.BUYER,
          },
          select: ['vendorId'],
        }),
        // Obtener todas las ventas como SELLER para los usuarios
        this.saleRepository.find({
          where: {
            vendorId: In(userIds),
            lotTransactionRole: LotTransactionRole.SELLER,
          },
          select: ['vendorId'],
        }),
      ]);

      // Crear un mapa de resultados
      const result: { [userId: string]: { purchased: number; sold: number } } =
        {};

      // Inicializar todos los usuarios con 0
      userIds.forEach((userId) => {
        result[userId] = { purchased: 0, sold: 0 };
      });

      // Contar lotes comprados
      purchasedSales.forEach((sale) => {
        if (result[sale.vendorId]) {
          result[sale.vendorId].purchased++;
        }
      });

      // Contar lotes vendidos
      soldSales.forEach((sale) => {
        if (result[sale.vendorId]) {
          result[sale.vendorId].sold++;
        }
      });

      this.logger.log(
        `Procesados conteos de lotes para ${userIds.length} usuarios: ${purchasedSales.length} compras, ${soldSales.length} ventas`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Error obteniendo conteos de lotes en lote:`, error);

      // En caso de error, retornar objeto con todos los usuarios en 0
      const result: { [userId: string]: { purchased: number; sold: number } } =
        {};
      userIds.forEach((userId) => {
        result[userId] = { purchased: 0, sold: 0 };
      });

      return result;
    }
  }
}

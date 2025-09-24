import { Injectable, Logger } from '@nestjs/common';
import { Sale } from '../entities/sale.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LotTransactionRole } from '../enums/lot-transaction-role.enum';

@Injectable()
export class UnilevelCustomService {
  private readonly logger = new Logger(UnilevelCustomService.name);
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

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

  async createNexusBrandImageFile(): Promise<Express.Multer.File> {
    const imageUrl =
      'https://firebasestorage.googleapis.com/v0/b/test-project-3657a.appspot.com/o/nexus%2Fnexus-brand.jpg?alt=media&token=90e21e0e-f0f9-44df-9fec-64dcb61ffa48';

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const imageBuffer = Buffer.from(await response.arrayBuffer());

      return {
        buffer: imageBuffer,
        originalname: 'nexus-brand.jpg',
        mimetype: 'image/jpeg',
        fieldname: 'file',
        encoding: '7bit',
        size: imageBuffer.length,
        destination: '',
        filename: 'nexus-brand.jpg',
        path: '',
        stream: null,
      } as unknown as Express.Multer.File;
    } catch (error) {
      this.logger.error('Error fetching brand image from Firebase:', error);
      throw new Error('Failed to create brand image file');
    }
  }
}

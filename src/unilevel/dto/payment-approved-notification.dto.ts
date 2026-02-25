import {
  IsString,
  IsNumber,
  IsObject,
  IsOptional,
  IsUUID,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { StatusSale } from '../enums/status-sale.enum';
import { PaymentAction } from '../enums/payment-action.enum';

export class PaymentApprovedNotificationDto {
  @IsUUID()
  saleId: string;

  @IsEnum(StatusSale, { message: 'El estado de venta debe ser un valor válido' })
  newStatus: StatusSale;

  @IsEnum(PaymentAction, { message: 'La acción debe ser APPROVED o REJECTED' })
  action: PaymentAction;

  @IsOptional()
  @IsNumber()
  approvedAmount?: number;

  @IsOptional()
  @IsDateString()
  approvalDate?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  projectName?: string;
}

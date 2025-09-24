import {
  IsString,
  IsNumber,
  IsObject,
  IsOptional,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class PaymentApprovedNotificationDto {
  @IsUUID()
  saleId: string;

  @IsString()
  status: string;

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

  // Estos campos probablemente no los tendrás del webhook
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  saleType?: string;
}

import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsInt,
  IsOptional,
} from 'class-validator';

export class CombinedInstallmentDto {
  @IsNotEmpty({ message: 'La fecha de pago esperada es requerida' })
  @IsDateString({}, { message: 'La fecha de pago esperada debe ser válida' })
  expectedPaymentDate: string;

  @IsOptional()
  @IsNumber(
    {},
    { message: 'El monto de la cuota del lote debe ser un número' },
  )
  @Type(() => Number)
  lotInstallmentAmount?: number | null;

  @IsOptional()
  @IsInt({ message: 'El número de cuota del lote debe ser un entero' })
  @Type(() => Number)
  lotInstallmentNumber?: number | null;

  @IsOptional()
  @IsNumber({}, { message: 'El monto de la cuota de HU debe ser un número' })
  @Type(() => Number)
  huInstallmentAmount?: number | null;

  @IsOptional()
  @IsInt({ message: 'El número de cuota de HU debe ser un entero' })
  @Type(() => Number)
  huInstallmentNumber?: number | null;

  @IsNotEmpty({ message: 'El monto total de la cuota es requerido' })
  @IsNumber(
    {},
    { message: 'El monto total de la cuota debe ser un número' },
  )
  @Type(() => Number)
  totalInstallmentAmount: number;
}

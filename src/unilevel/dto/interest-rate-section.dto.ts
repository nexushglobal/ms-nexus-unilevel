import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class InterestRateSectionDto {
  @IsNotEmpty({ message: 'La cuota inicio del tramo es requerida' })
  @IsNumber({}, { message: 'La cuota inicio del tramo debe ser un numero' })
  @Min(1, { message: 'La cuota inicio del tramo debe ser mayor o igual a 1' })
  @Type(() => Number)
  startInstallment: number;

  @IsNotEmpty({ message: 'La cuota fin del tramo es requerida' })
  @IsNumber({}, { message: 'La cuota fin del tramo debe ser un numero' })
  @Min(1, { message: 'La cuota fin del tramo debe ser mayor o igual a 1' })
  @Type(() => Number)
  endInstallment: number;

  @IsNotEmpty({ message: 'La tasa de interes del tramo es requerida' })
  @IsNumber({}, { message: 'La tasa de interes del tramo debe ser un numero' })
  @Min(0, {
    message: 'La tasa de interes del tramo debe ser mayor o igual a 0',
  })
  @Type(() => Number)
  interestRate: number;
}

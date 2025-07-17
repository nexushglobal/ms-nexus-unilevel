import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { LotStatus } from '../enums/lot-status.enum';

export class FindAllLotsDto {
  @IsNotEmpty({ message: 'El campo de proyecto es obligatorio' })
  @IsUUID('4', { message: 'El ID de etapa debe ser un UUID válido' })
  projectId?: string;

  @IsOptional()
  @IsEnum(LotStatus, {
    message: 'El estado debe ser Activo, Inactivo, Vendido o Separado',
  })
  status?: LotStatus;

  @IsOptional()
  @IsString({ message: 'El campo de termino es una cadena de caracteres' })
  term?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID de etapa debe ser un UUID válido' })
  stageId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID de manzana debe ser un UUID válido' })
  blockId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';
}

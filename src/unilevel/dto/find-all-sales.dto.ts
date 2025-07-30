import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { LotTransactionRole } from '../enums/lot-transaction-role.enum';

export class FindAllSalesDto extends PaginationDto {
  @IsString({ message: 'El campo userId debe ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'El campo userId es requerido' })
  userId: string;

  @IsOptional()
  @IsEnum(LotTransactionRole, {
    message:
      'El campo rol del usuario en venta debe ser una cadena de caracteres',
  })
  lotTransactionRole?: LotTransactionRole;
}

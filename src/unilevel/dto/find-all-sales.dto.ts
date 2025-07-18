import { IsNotEmpty, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindAllSalesDto extends PaginationDto {
  @IsString({ message: 'El campo userId debe ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'El campo userId es requerido' })
  userId: string;
}

import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateClientDto } from './create-client.dto';
import { CreateGuarantorDto } from './create-guarantor.dto';
import { CreateSecondaryClientDto } from './create-secondary-client.dto';

export class CreateClientAndGuarantorDto {
  @IsObject({ message: 'Los datos del cliente deben ser un objeto' })
  @ValidateNested() // Valida el DTO anidado
  @Type(() => CreateClientDto) // Necesario para la transformación
  createClient: CreateClientDto;

  @IsOptional()
  @IsObject({ message: 'Los datos del garante deben ser un objeto' })
  @ValidateNested()
  @Type(() => CreateGuarantorDto)
  createGuarantor: CreateGuarantorDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSecondaryClientDto)
  createSecondaryClient: CreateSecondaryClientDto[];

  @IsString({ message: 'El documento es una cadena de caracteres' })
  @IsNotEmpty({ message: 'El documento es requerido' })
  document: string;
}

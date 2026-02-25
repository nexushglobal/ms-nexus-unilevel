import { Type } from 'class-transformer';
import {
  IsArray,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CreateClientDto } from './create-client.dto';
import { CreateGuarantorDto } from './create-guarantor.dto';
import { CreateSecondaryClientDto } from './create-secondary-client.dto';

export class CreateClientAndGuarantorDto {
  @IsObject({ message: 'Los datos del cliente deben ser un objeto' })
  @ValidateNested()
  @Type(() => CreateClientDto)
  createClient: CreateClientDto;

  @IsOptional()
  @IsObject({ message: 'Los datos del garante deben ser un objeto' })
  @ValidateNested()
  @Type(() => CreateGuarantorDto)
  createGuarantor?: CreateGuarantorDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSecondaryClientDto)
  createSecondaryClient?: CreateSecondaryClientDto[];
}

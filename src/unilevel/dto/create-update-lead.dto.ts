import {
  IsArray,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  Matches,
  MaxLength,
  IsEnum,
  IsBoolean,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { DocumentType } from '../enums/document-type.enum';
import { CompanionDto } from './companion.dto';

export class CreateUpdateLeadDto {
  @IsString()
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message: 'El nombre solo debe contener letras y espacios',
  })
  firstName: string;

  @IsString()
  @MaxLength(100, {
    message: 'El apellido no puede tener más de 100 caracteres',
  })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message: 'El apellido solo debe contener letras y espacios',
  })
  lastName: string;

  @IsString()
  @MaxLength(20, {
    message: 'El documento no puede tener más de 20 caracteres',
  })
  document: string;

  @IsEnum(DocumentType, { message: 'El tipo de documento debe ser DNI o CE' })
  documentType: DocumentType;

  @IsOptional()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{6,15}$/, {
    message: 'El teléfono debe ser un número válido',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{6,15}$/, {
    message: 'El teléfono alternativo debe ser un número válido',
  })
  phone2?: string;

  @IsOptional()
  @IsNumber()
  @Min(18, { message: 'La edad mínima es 18 años' })
  @Max(120, { message: 'La edad máxima es 120 años' })
  age?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  sourceId?: number;

  @IsOptional()
  @IsNumber()
  ubigeoId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Las observaciones no pueden tener más de 500 caracteres',
  })
  observations?: string;

  @IsOptional()
  @IsArray({ message: 'Los proyectos de interés deben ser un arreglo' })
  @IsString({ each: true })
  @ArrayMaxSize(10, {
    message: 'Los proyectos de interés no pueden ser más de 10',
  })
  interestProjects?: string[];

  @IsOptional()
  @IsArray({ message: 'Los acompañantes deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => CompanionDto)
  companions?: CompanionDto[];

  @IsOptional()
  @IsObject({ message: 'La metadata debe ser un objeto' })
  metadata?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isNewLead?: boolean;
}

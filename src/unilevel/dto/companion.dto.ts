import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CompanionDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo del acompanante es requerido' })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message: 'El nombre solo debe contener letras y espacios',
  })
  @MaxLength(200, {
    message: 'El nombre no puede tener mas de 200 caracteres',
  })
  fullName: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, {
    message: 'El DNI no puede tener mas de 20 caracteres',
  })
  dni?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message: 'El parentesco solo debe contener letras',
  })
  @MaxLength(50, {
    message: 'El parentesco no puede tener mas de 50 caracteres',
  })
  relationship?: string;
}

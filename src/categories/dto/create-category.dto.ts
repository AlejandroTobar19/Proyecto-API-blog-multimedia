import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class CreateCategoryDto {
  @ApiProperty({ description: 'Nombre único de la categoría' })
  @IsString()
  name: string;
}

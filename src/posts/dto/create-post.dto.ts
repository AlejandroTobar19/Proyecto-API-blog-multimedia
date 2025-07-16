// src/posts/dto/create-post.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsInt, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ type: [Number], description: 'IDs de etiquetas asociadas' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[];
}

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { IsNumber } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  postId: number;



  @ApiProperty({ isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];


}

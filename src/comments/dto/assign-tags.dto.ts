import { IsArray, IsString } from 'class-validator';

export class AssignTagsDto {
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}

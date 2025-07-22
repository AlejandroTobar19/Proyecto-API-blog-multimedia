import { IsIn } from 'class-validator';

export class ModerateCommentDto {
  @IsIn(['pendiente', 'aprobado', 'rechazado'])
  status: string;
}

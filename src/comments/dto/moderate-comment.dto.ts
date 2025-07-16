import { IsIn } from 'class-validator';

export class ModerateCommentDto {
  @IsIn(['aprobado', 'rechazado'])
  status: 'aprobado' | 'rechazado';
}
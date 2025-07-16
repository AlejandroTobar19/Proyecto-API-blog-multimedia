import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { Tag } from './entity/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tag])], // 👈 ESTA LÍNEA ES CLAVE
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService, TypeOrmModule], // 👈 (opcional si otros módulos usarán el repo)
})
export class TagsModule {}

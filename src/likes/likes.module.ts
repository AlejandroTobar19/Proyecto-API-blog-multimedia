import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { Like } from './entity/like.entity';
import { Comment } from '../comments/entities/comment.entity';
import { User } from '../users/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Comment, User])], // 👈 AÑADIR ENTIDADES
  providers: [LikesService],
  controllers: [LikesController],
})
export class LikesModule {}
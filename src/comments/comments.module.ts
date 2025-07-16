import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entity/post.entity';
import { User } from '../users/entity/user.entity'; // 👈 importar User

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Post, User]) // 👈 incluir User aquí
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}

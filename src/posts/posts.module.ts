import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entity/post.entity';
import { User } from '../users/entity/user.entity';
import { Category } from '../categories/entity/category.entity';
import { Tag } from '../tags/entity/tag.entity';
import { Comment } from '../comments/entities/comment.entity';
import { PostHistory } from './entity/post-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostHistory, User, Category, Tag, Comment]) // 👈 agrega Comment aquí
  ],
  controllers: [PostsController],
  providers: [PostsService]
})
export class PostsModule {}

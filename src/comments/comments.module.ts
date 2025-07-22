import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { CommentHistory } from './entities/comment-history.entity'; // <-- importar
import { Post } from '../posts/entity/post.entity';
import { User } from '../users/entity/user.entity';
import { Tag } from '../tags/entity/tag.entity';
import { ReportsModule } from 'src/reports/reports.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, CommentHistory, Post, User, Tag]),
    ReportsModule, // <-- ✅
  ],

  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule { }

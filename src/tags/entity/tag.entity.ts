import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
} from 'typeorm';
import { Post } from '../../posts/entity/post.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { IsNotEmpty, IsString } from 'class-validator';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsNotEmpty()
  @IsString()
  name: string;


  @ManyToMany(() => Post, (post) => post.tags)
  posts: Post[];

  @ManyToMany(() => Comment, (comment) => comment.tags)
  comments: Comment[];
}

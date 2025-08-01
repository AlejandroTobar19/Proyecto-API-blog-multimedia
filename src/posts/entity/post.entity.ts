import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';

import { User } from '../../users/entity/user.entity';
import { Category } from '../../categories/entity/category.entity';
import { Tag } from '../../tags/entity/tag.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { PostHistory } from './post-history.entity';
import { ImagePost } from './image-post.entity'; 

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.posts)
  author: User;

  @ManyToOne(() => Category, (category) => category.posts, { nullable: true })
  category: Category;

  @ManyToMany(() => Tag, (tag) => tag.posts, { cascade: true })
  @JoinTable()
  tags: Tag[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => PostHistory, (history) => history.post)
  histories: PostHistory[];

  @OneToMany(() => ImagePost, (image) => image.post, { cascade: true })
  images: ImagePost[];

  @Column({ default: 0 })
  views: number;

  @Column({ default: 'publicado' })
  status: 'publicado' | 'borrador';
}

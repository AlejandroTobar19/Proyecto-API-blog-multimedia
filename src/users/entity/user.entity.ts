import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Post } from '../../posts/entity/post.entity';
import { OneToMany } from 'typeorm';
import { Comment } from '../../comments/entities/comment.entity';
import { Like } from '../../likes/entity/like.entity';
import { Subscription } from '../../subscriptions/entity/subscription.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Exclude()
  @Column()
  password: string;

  @Column() // lector | autor | admin
  role: string;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.user) 
  likes: Like[]; 

  @OneToMany(() => Subscription, (subscription) => subscription.subscriber)
  following: Subscription[];

  // Quiénes siguen a este usuario
  @OneToMany(() => Subscription, (subscription) => subscription.author)
  followers: Subscription[];

}

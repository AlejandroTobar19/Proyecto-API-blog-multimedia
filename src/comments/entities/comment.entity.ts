import {
    Column,
    Entity,
    ManyToOne,
    JoinTable,
    ManyToMany,
    OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { User } from '../../users/entity/user.entity';
import { Post } from '../../posts/entity/post.entity';
import { Tag } from '../../tags/entity/tag.entity';
import { CommentHistory } from './comment-history.entity';
import { Like } from '../../likes/entity/like.entity'; 



@Entity()
export class Comment extends BaseEntity {
    @Column()
    content: string;

    @ManyToOne(() => User, (user) => user.comments)
    author: User;

    @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
    post: Post;

    @Column({ default: false })
    isModerated: boolean;

    @Column({ default: 'pendiente' })
    status: string;

    @ManyToMany(() => Tag, (tag) => tag.comments, {
        cascade: true,
        eager: true,
    })
    @JoinTable()
    tags: Tag[];

    @OneToMany(() => CommentHistory, (history) => history.comment, { 
    })
    histories: CommentHistory[];

      @OneToMany(() => Like, (like) => like.comment) 
  likes: Like[];
}
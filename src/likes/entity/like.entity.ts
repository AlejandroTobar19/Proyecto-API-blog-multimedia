import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { Comment } from '../../comments/entities/comment.entity';

@Entity('likes')
export class Like {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.likes)
    user: User;

    @ManyToOne(() => Comment, (comment) => comment.likes, { onDelete: 'CASCADE' })
    comment: Comment;
}
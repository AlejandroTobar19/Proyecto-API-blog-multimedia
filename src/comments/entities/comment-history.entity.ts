import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Comment } from './comment.entity';

@Entity('comment_history') // ⬅️ Nombre explícito de tabla
export class CommentHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    oldContent: string;

    @CreateDateColumn()
    editedAt: Date;

    @ManyToOne(() => Comment, (comment) => comment.histories, { nullable: true, onDelete: 'CASCADE' })
    comment?: Comment;

    @Column({ default: 'pendiente' })
    status: string;
}
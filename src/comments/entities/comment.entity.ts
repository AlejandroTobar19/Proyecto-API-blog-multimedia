import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { Post } from '../../posts/entity/post.entity';

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @ManyToOne(() => User, (user) => user.comments, {
        eager: true,
        nullable: false,
    })
    author: User;


    @ManyToOne(() => Post, post => post.comments)
    post: Post;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ default: 'pendiente' })
    status: 'pendiente' | 'aprobado' | 'rechazado';


}

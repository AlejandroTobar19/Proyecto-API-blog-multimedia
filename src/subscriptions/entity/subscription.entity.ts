import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entity/user.entity';

@Entity('subscriptions')
export class Subscription {
    @PrimaryGeneratedColumn()
    id: number;

    // El usuario que se suscribe
    @ManyToOne(() => User, (user) => user.following)
    subscriber: User;

    // El autor al que se sigue
    @ManyToOne(() => User, (user) => user.followers)
    author: User;

    @CreateDateColumn()
    createdAt: Date;
}
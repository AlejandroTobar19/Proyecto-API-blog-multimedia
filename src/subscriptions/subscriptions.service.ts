import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entity/subscription.entity';
import { User } from '../users/entity/user.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async toggleSubscription(authorId: number, subscriber: User): Promise<{ subscribed: boolean }> {
    if (authorId === subscriber.id) {
      throw new BadRequestException('No te puedes suscribir a ti mismo.');
    }

    const author = await this.userRepository.findOne({ where: { id: authorId } });
    if (!author) {
      throw new NotFoundException('Autor no encontrado');
    }

    const existingSubscription = await this.subscriptionRepository.findOne({
      where: {
        author: { id: authorId },
        subscriber: { id: subscriber.id },
      },
    });

    if (existingSubscription) {
      await this.subscriptionRepository.remove(existingSubscription);
      return { subscribed: false };
    } else {
      const newSubscription = this.subscriptionRepository.create({ author, subscriber });
      await this.subscriptionRepository.save(newSubscription);
      return { subscribed: true };
    }
  }

  async getFollowersCount(authorId: number): Promise<number> {
    return this.subscriptionRepository.count({
      where: { author: { id: authorId } },
    });
  }
}
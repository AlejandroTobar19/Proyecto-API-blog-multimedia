import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entity/like.entity';
import { User } from '../users/entity/user.entity';
import { Comment } from '../comments/entities/comment.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async toggleLike(commentId: number, user: User): Promise<{ liked: boolean }> {
    const comment = await this.commentRepository.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    const existingLike = await this.likeRepository.findOne({
      where: {
        comment: { id: commentId },
        user: { id: user.id },
      },
    });

    if (existingLike) {
      // Si ya existe un like, lo quitamos
      await this.likeRepository.remove(existingLike);
      return { liked: false };
    } else {
      // Si no existe, lo creamos
      const newLike = this.likeRepository.create({ comment, user });
      await this.likeRepository.save(newLike);
      return { liked: true };
    }
  }

  async countLikesForComment(commentId: number): Promise<number> {
    return this.likeRepository.count({
      where: { comment: { id: commentId } },
    });
  }
}
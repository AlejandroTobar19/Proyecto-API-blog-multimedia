import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../users/entity/user.entity';
import { Post } from '../posts/entity/post.entity';
import { UnauthorizedException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ModerateCommentDto } from './dto/moderate-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,

    @InjectRepository(Post)
    private postRepo: Repository<Post>,

    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) { }

  async create(dto: CreateCommentDto, user: User) {
    const post = await this.postRepo.findOne({ where: { id: dto.postId } });
    if (!post) throw new NotFoundException('Post no encontrado');

    // 🔥 Buscar el usuario completo desde la base de datos
    const fullUser = await this.usersRepo.findOne({ where: { id: user.id } });
    if (!fullUser) throw new NotFoundException('Usuario no encontrado');

    const comment = this.commentRepo.create({
      content: dto.content,
      author: fullUser,
      post,
    });

    return this.commentRepo.save(comment);
  }


  async findAll() {
    const comments = await this.commentRepo.find({ relations: ['author', 'post'] });
    return instanceToPlain(comments); // 👈 aquí se aplica la transformación
  }

  async findByPost(postId: number) {
    const comments = await this.commentRepo.find({
      where: { post: { id: postId } },
      relations: ['author'],
    });
    return instanceToPlain(comments); // 👈 también aquí
  }

  async update(id: number, dto: UpdateCommentDto, user: any) {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) throw new NotFoundException('Comentario no encontrado');

    if (comment.author.id !== user.userId) {
      throw new UnauthorizedException('No tienes permiso para editar este comentario');
    }

    this.commentRepo.merge(comment, dto);
    return this.commentRepo.save(comment);
  }

  async remove(id: number, user: any) {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) throw new NotFoundException('Comentario no encontrado');

    if (comment.author.id !== user.userId && user.role !== 'admin') {
      throw new UnauthorizedException('No tienes permiso para eliminar este comentario');
    }

    return this.commentRepo.remove(comment);
  }

  async moderate(id: number, dto: ModerateCommentDto): Promise<Comment> {
    const comment = await this.commentRepo.findOneBy({ id });

    if (!comment) throw new NotFoundException('Comentario no encontrado');

    comment.status = dto.status;
    return this.commentRepo.save(comment);
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return this.commentRepo.find({
      where: { post: { id: postId }, status: 'aprobado' },
      relations: ['author'],
    });
  }


}

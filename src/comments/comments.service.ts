import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ModerateCommentDto } from './dto/moderate-comment.dto';
import { instanceToPlain } from 'class-transformer';
import { CommentHistory } from './entities/comment-history.entity';
import { CommentHistoryDto } from './dto/comment-history.dto';
import { User } from '../users/entity/user.entity';
import { Post } from '../posts/entity/post.entity';
import { Tag } from '../tags/entity/tag.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,

    @InjectRepository(Post)
    private postsRepository: Repository<Post>,

    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,

    @InjectRepository(CommentHistory)
    private readonly commentHistoryRepo: Repository<CommentHistory>,
  ) { }

  async create(dto: CreateCommentDto, user: User): Promise<Comment> {
    const { content, postId, tags } = dto;

    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post no encontrado');

    const fullUser = await this.usersRepository.findOne({ where: { id: user.id } });
    if (!fullUser) throw new NotFoundException('Usuario no encontrado');

    const comment = this.commentRepo.create({
      content,
      post,
      author: fullUser,
      status: 'pendiente',
    });

    if (tags && tags.length > 0) {
      const tagEntities = await Promise.all(
        tags.map(async (name) => {
          let tag = await this.tagsRepository.findOne({ where: { name } });
          if (!tag) {
            tag = this.tagsRepository.create({ name });
            await this.tagsRepository.save(tag);
          }
          return tag;
        })
      );
      comment.tags = tagEntities;
    }

    return this.commentRepo.save(comment);
  }

  async findAll(): Promise<Comment[]> {
    return this.commentRepo.find({ relations: ['author', 'post', 'tags'] });
  }


  async findByPost(postId: number): Promise<Comment[]> {
    return this.commentRepo.find({
      where: { post: { id: postId } },
      relations: ['author', 'tags', 'post'],
    });
  }


  async update(id: number, dto: UpdateCommentDto, user: User) {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['author', 'tags', 'histories'],
    });

    if (!comment) throw new NotFoundException('Comentario no encontrado');

    if (comment.author.id !== user.id && user.role !== 'admin') {
      throw new UnauthorizedException('No tienes permiso para editar este comentario');
    }

    const originalContent = comment.content;
    const originalStatus = comment.status;

    // Actualizar contenido
    comment.content = dto.content ?? comment.content;

    // Actualizar tags si vienen nuevos
    if (dto.tags) {
      const tagEntities = await Promise.all(
        dto.tags.map(async (name) => {
          let tag = await this.tagsRepository.findOne({ where: { name } });
          if (!tag) {
            tag = this.tagsRepository.create({ name });
            await this.tagsRepository.save(tag);
          }
          return tag;
        })
      );
      comment.tags = tagEntities;
    }

    // Guardamos el comentario actualizado primero
    const updatedComment = await this.commentRepo.save(comment);

    // Si cambió el contenido, registramos historial (después de guardar)
    if (dto.content && dto.content !== originalContent) {
      const history = this.commentHistoryRepo.create({
        oldContent: originalContent,
        status: originalStatus,
        comment: updatedComment, // ahora sí tiene ID
      });

      await this.commentHistoryRepo.save(history);
    }

    return this.commentRepo.findOne({
      where: { id: updatedComment.id },
      relations: ['author', 'tags', 'histories'],
    });
  }


  async remove(id: number, user: User) {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!comment) throw new NotFoundException('Comentario no encontrado');

    if (comment.author.id !== user.id && user.role !== 'admin') {
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

  async findByTag(tagName: string): Promise<Comment[]> {
    const tag = await this.tagsRepository.findOne({
      where: { name: tagName },
      relations: ['comments'],
    });
    if (!tag) return [];
    return tag.comments;
  }

  async getHistory(commentId: number): Promise<CommentHistoryDto[]> {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: ['histories', 'histories.comment'], // <- importante
    });

    if (!comment) throw new NotFoundException('Comentario no encontrado');

    return comment.histories.map((h) => ({
      id: h.id,
      oldContent: h.oldContent,
      editedAt: h.editedAt,
      status: h.status,
      commentId: h.comment!.id, // <- forzamos non-null
    }));
  }



  async getMostUsedTags(limit: number = 5) {
    const result = await this.commentRepo
      .createQueryBuilder('comment')
      .leftJoin('comment.tags', 'tag')
      .select('tag.name', 'name')
      .addSelect('COUNT(tag.id)', 'count')
      .groupBy('tag.name')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return result;
  }

  async assignTags(commentId: number, tags: string[], user: User) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: ['author', 'tags'],
    });

    if (!comment) throw new NotFoundException('Comentario no encontrado');

    if (comment.author.id !== user.id && user.role !== 'admin') {
      throw new UnauthorizedException('No tienes permiso para modificar este comentario');
    }

    const cleanedTags = tags.map((t) => t.trim().toLowerCase()).filter((t) => t !== '');

    const tagEntities: Tag[] = [];

    for (const name of cleanedTags) {
      let tag = await this.tagsRepository.findOne({ where: { name } });
      if (!tag) {
        tag = this.tagsRepository.create({ name });
        await this.tagsRepository.save(tag);
      }
      tagEntities.push(tag);
    }

    comment.tags = tagEntities;
    return this.commentRepo.save(comment);
  }

  // DESPUÉS
  async updateStatus(id: number, status: string, user: User): Promise<Comment> {
  // 1. Carga el comentario junto con la información del autor del post
  const comment = await this.commentRepo.findOne({
    where: { id },
    relations: ['author', 'post', 'post.author'], // 👈 Relaciones clave
  });

  if (!comment) {
    throw new NotFoundException('Comentario no encontrado');
  }

  // 2. Lógica de autorización
  const isOwner = comment.post.author.id === user.id;

  // Si el usuario NO es admin Y NO es el dueño del post, denegar acceso
  if (user.role !== 'admin' && !isOwner) {
    throw new UnauthorizedException(
      'No tienes permiso para moderar este comentario',
    );
  }

  // 3. Si la autorización es exitosa, actualiza el estado
  comment.status = status;
  return this.commentRepo.save(comment);
  }
}

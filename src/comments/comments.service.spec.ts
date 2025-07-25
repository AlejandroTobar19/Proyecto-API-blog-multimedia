import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Tag } from '../tags/entity/tag.entity';
import { User } from '../users/entity/user.entity';
import { Repository } from 'typeorm';
import { Post } from '../posts/entity/post.entity';
import { CommentHistory } from './entities/comment-history.entity';


describe('CommentsService - assignTags', () => {
  let service: CommentsService;
  let commentRepo: Repository<Comment>;
  let tagRepo: Repository<Tag>;

  const mockCommentRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockTagRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Tester',
    password: '123456',
    role: 'admin',
    comments: [],
    posts: [],
    likes: [],
    following: [],
    followers: []
  };

  beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      CommentsService,
      { provide: getRepositoryToken(Comment), useValue: mockCommentRepo },
      { provide: getRepositoryToken(Tag), useValue: mockTagRepo },
      { provide: getRepositoryToken(User), useValue: {} },
      { provide: getRepositoryToken(CommentHistory), useValue: {} },
      { provide: getRepositoryToken(Post), useValue: {} }, // ← ESTA LÍNEA AGREGA EL FALTANTE
    ],
  }).compile();

  service = module.get<CommentsService>(CommentsService);
});

  it('debería asignar tags nuevos y existentes a un comentario', async () => {
    const tags = ['nestjs', 'typescript'];
    const existingTag = { id: 1, name: 'nestjs', comments: [] };
    const newTag = { id: 2, name: 'typescript', comments: [] };

    const comment = {
      id: 10,
      content: 'comentario prueba',
      tags: [],
      author: mockUser,
    };

    mockCommentRepo.findOne.mockResolvedValue(comment);
    mockTagRepo.findOne
      .mockResolvedValueOnce(existingTag) // "nestjs" ya existe
      .mockResolvedValueOnce(null); // "typescript" no existe
    mockTagRepo.create.mockReturnValue(newTag);
    mockTagRepo.save.mockResolvedValue(newTag);
    mockCommentRepo.save.mockResolvedValue({
      ...comment,
      tags: [existingTag, newTag],
    });

    const result = await service.assignTags(comment.id, tags, mockUser);

    expect(mockCommentRepo.findOne).toHaveBeenCalledWith({
      where: { id: comment.id },
      relations: ['author', 'tags'],
    });

    expect(mockTagRepo.findOne).toHaveBeenCalledTimes(2);
    expect(mockTagRepo.save).toHaveBeenCalledWith(newTag);
    expect(mockCommentRepo.save).toHaveBeenCalled();

    expect(result.tags).toEqual([existingTag, newTag]);
  });
});

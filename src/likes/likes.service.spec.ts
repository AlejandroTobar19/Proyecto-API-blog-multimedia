import { Test, TestingModule } from '@nestjs/testing';
import { LikesService } from './likes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Like } from './entity/like.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Repository } from 'typeorm';

describe('LikesService', () => {
  let service: LikesService;
  let likeRepository: Repository<Like>;

  const mockLikeRepository = {
    count: jest.fn(),
    // ... otros mocks si los necesitas
  };

  const mockCommentRepository = {
    // ... mocks para el comment repository
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesService,
        {
          provide: getRepositoryToken(Like),
          useValue: mockLikeRepository,
        },
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
      ],
    }).compile();

    service = module.get<LikesService>(LikesService);
    likeRepository = module.get<Repository<Like>>(getRepositoryToken(Like));
  });

  it('debería calcular correctamente el número de likes', async () => {
    const commentId = 1;
    const expectedLikes = 15;

    // Simula que el método count del repositorio devuelve 15
    mockLikeRepository.count.mockResolvedValue(expectedLikes);

    const result = await service.countLikesForComment(commentId);

    // Verifica que el servicio fue llamado con el ID correcto
    expect(mockLikeRepository.count).toHaveBeenCalledWith({
      where: { comment: { id: commentId } },
    });

    // Verifica que el resultado es el esperado
    expect(result).toEqual(expectedLikes);
  });
});
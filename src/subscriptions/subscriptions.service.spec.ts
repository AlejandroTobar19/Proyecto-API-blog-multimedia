// src/subscriptions/subscriptions.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Subscription } from './entity/subscription.entity';
import { User } from '../users/entity/user.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// --- Mocks de Datos ---
const mockSubscriber: User = { id: 1, name: 'Subscriber User' } as User;
const mockAuthor: User = { id: 2, name: 'Author User' } as User;

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let subscriptionRepository: Repository<Subscription>;
  let userRepository: Repository<User>;

  // --- Configuración de los Repositorios Mock ---
  const mockSubscriptionRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  // --- Configuración del Módulo de Pruebas ---
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: getRepositoryToken(Subscription),
          useValue: mockSubscriptionRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    subscriptionRepository = module.get<Repository<Subscription>>(
      getRepositoryToken(Subscription),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  // Limpia los mocks después de cada prueba
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Pruebas para toggleSubscription ---
  describe('toggleSubscription', () => {
    it('debería permitir a un usuario suscribirse a un autor', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockAuthor);
      mockSubscriptionRepository.findOne.mockResolvedValue(null); // No hay suscripción previa
      mockSubscriptionRepository.create.mockReturnValue({} as Subscription);
      mockSubscriptionRepository.save.mockResolvedValue({} as Subscription);

      const result = await service.toggleSubscription(mockAuthor.id, mockSubscriber);

      expect(result).toEqual({ subscribed: true });
      expect(mockSubscriptionRepository.save).toHaveBeenCalled();
    });

    it('debería permitir a un usuario desuscribirse de un autor', async () => {
      const existingSubscription = { id: 1, author: mockAuthor, subscriber: mockSubscriber };
      mockUserRepository.findOne.mockResolvedValue(mockAuthor);
      mockSubscriptionRepository.findOne.mockResolvedValue(existingSubscription);

      const result = await service.toggleSubscription(mockAuthor.id, mockSubscriber);

      expect(result).toEqual({ subscribed: false });
      expect(mockSubscriptionRepository.remove).toHaveBeenCalledWith(existingSubscription);
    });

    it('debería lanzar un error si un usuario intenta suscribirse a sí mismo', async () => {
      await expect(
        service.toggleSubscription(mockSubscriber.id, mockSubscriber),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar un error si el autor no existe', async () => {
        mockUserRepository.findOne.mockResolvedValue(null);
        await expect(
            service.toggleSubscription(999, mockSubscriber)
        ).rejects.toThrow(NotFoundException);
    });
  });

  // --- Pruebas para getFollowersCount ---
  describe('getFollowersCount', () => {
    it('debería devolver el número correcto de seguidores', async () => {
        const followerCount = 42;
        mockSubscriptionRepository.count.mockResolvedValue(followerCount);

        const result = await service.getFollowersCount(mockAuthor.id);

        expect(result).toEqual(followerCount);
        expect(mockSubscriptionRepository.count).toHaveBeenCalledWith({
            where: { author: { id: mockAuthor.id } }
        });
    });
  });
});
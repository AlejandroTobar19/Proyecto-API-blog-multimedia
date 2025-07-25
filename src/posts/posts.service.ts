import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Post } from './entity/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '../users/entity/user.entity';
import { Category } from '../categories/entity/category.entity';
import { Tag } from '../tags/entity/tag.entity';
import { Comment } from '../comments/entities/comment.entity';
import { instanceToPlain } from 'class-transformer';
import { PostHistory } from './entity/post-history.entity';
import { ImagePost } from './entity/image-post.entity';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Post) private postRepo: Repository<Post>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Category) private categoryRepo: Repository<Category>,
        @InjectRepository(Tag) private tagRepo: Repository<Tag>,
        @InjectRepository(Comment) private commentRepo: Repository<Comment>,
        @InjectRepository(PostHistory) private readonly historyRepo: Repository<PostHistory>,
        @InjectRepository(ImagePost) private imagePostRepo: Repository<ImagePost>,
    ) {}

    // src/posts/posts.service.ts

    async create(dto: CreatePostDto, user: User) { // 👈 Cambiamos el tipo a "User"
        const author = await this.userRepo.findOneBy({ id: user.id }); // 👈 Usamos "user.id"
        if (!author) throw new NotFoundException('Autor no encontrado');

        let category: Category | undefined = undefined;
        if (dto.categoryId) {
            const found = await this.categoryRepo.findOneBy({ id: dto.categoryId });
            if (!found) throw new NotFoundException('Categoría no encontrada');
            category = found;
        }

            let tags: Tag[] = [];
            if (dto.tagIds && dto.tagIds.length > 0) {
                tags = await this.tagRepo.find({
                    where: { id: In(dto.tagIds) },
                });
            }   

            const post = this.postRepo.create({
                ...dto,
                author,
                ...(category && { category }),
                tags,
            });

            return this.postRepo.save(post);
    }

    async saveImage(postId: number, filename: string) {
        const post = await this.postRepo.findOne({
            where: { id: postId },
            relations: ['images'],
        });

        if (!post) throw new NotFoundException('Post no encontrado');

        const image = this.imagePostRepo.create({ url: filename, post });
        return this.imagePostRepo.save(image);
    }

    async findAll() {
        const posts = await this.postRepo.find({
            relations: ['author', 'tags', 'category'],
        });
        return instanceToPlain(posts);
    }

    async findById(id: number): Promise<Post> {
        const post = await this.postRepo.findOne({
            where: { id },
            relations: ['author', 'category', 'tags'],
        });

        if (!post) throw new NotFoundException('Post no encontrado');

        post.views++;
        await this.postRepo.save(post);

        return post;
    }

    async findByAuthor(authorId: number) {
        const posts = await this.postRepo.find({
            where: { author: { id: authorId } },
            relations: ['author', 'tags', 'category'],
        });
        return instanceToPlain(posts);
    }

    async update(id: number, dto: UpdatePostDto, user: User) {
        const post = await this.postRepo.findOne({
            where: { id },
            relations: ['author', 'tags', 'category'],
        });

        if (!post) throw new NotFoundException('Post no encontrado');

        if (post.author.id !== user.id && user.role !== 'admin') {
            throw new UnauthorizedException('No tienes permiso para editar este post');
        }

        const postHistory = this.historyRepo.create({
            title: post.title,
            content: post.content,
            post,
        });
        await this.historyRepo.save(postHistory);

        if (dto.categoryId) {
            const category = await this.categoryRepo.findOneBy({ id: dto.categoryId });
            if (!category) throw new NotFoundException('Categoría no encontrada');
            post.category = category;
        }

        if (dto.tagIds) {
            post.tags = dto.tagIds.length > 0
                ? await this.tagRepo.find({ where: { id: In(dto.tagIds) } })
                : [];
        }

        this.postRepo.merge(post, dto);
        return this.postRepo.save(post);
    }

    async getPostHistory(postId: number): Promise<PostHistory[]> {
        return this.historyRepo.find({
            where: { post: { id: postId } },
            order: { editedAt: 'DESC' },
        });
    }

    async remove(id: number, user: User) {
        const post = await this.postRepo.findOne({
            where: { id },
            relations: ['author', 'comments'],
        });

        if (!post) throw new NotFoundException('Post no encontrado');

        if (post.author.id !== user.id) {
            throw new UnauthorizedException('No tienes permiso para eliminar este post');
        }

        if (post.comments && post.comments.length > 0) {
            await this.commentRepo.remove(post.comments);
        }

        return this.postRepo.remove(post);
    }

    async getTopViewedPosts(): Promise<Post[]> {
        return this.postRepo.find({
            order: { views: 'DESC' },
            take: 5,
            relations: ['category', 'tags'],
        });
    }

    async getMostUsedTags() {
        const result = await this.postRepo
            .createQueryBuilder('post')
            .leftJoin('post.tags', 'tag')
            .select('tag.name', 'name')
            .addSelect('COUNT(*)', 'count')
            .where('tag.name IS NOT NULL')
            .groupBy('tag.name')
            .orderBy('count', 'DESC')
            .limit(5)
            .getRawMany();

        return result;
    }

    async addTags(postId: number, tagNames: string[], user: User) {
        const post = await this.postRepo.findOne({
            where: { id: postId },
            relations: ['author', 'tags'],
        });

        if (!post) throw new NotFoundException('Post no encontrado');

        if (post.author.id !== user.id && user.role !== 'admin') {
            throw new UnauthorizedException('No tienes permiso para editar este post');
        }

        const tagsToAdd: Tag[] = [];

        for (const name of tagNames) {
            const normalized = name.trim().toLowerCase();
            if (!normalized) continue;

            let tag = await this.tagRepo.findOne({ where: { name: normalized } });

            if (!tag) {
                tag = this.tagRepo.create({ name: normalized });
                await this.tagRepo.save(tag);
            }

            tagsToAdd.push(tag);
        }

        post.tags = Array.from(new Set([...post.tags, ...tagsToAdd]));

        return this.postRepo.save(post);
    }

    async findOne(id: number) {
        const post = await this.postRepo.findOne({
            where: { id },
            relations: ['author', 'category', 'tags', 'comments', 'images'],
        });

        if (!post) throw new NotFoundException('Post no encontrado');

        post.views += 1;
        await this.postRepo.save(post);

        post.images = post.images.map((img) => ({
            ...img,
            url: `http://localhost:3000/uploads/${img.url}`,
        }));

        return post;
    }

    async getMostViewed(limit: number = 10) {
        const posts = await this.postRepo.find({
            order: { views: 'DESC' },
            take: limit,
            relations: ['author', 'category', 'tags', 'comments'],
        });

        return posts;
    }

    async getMostViewedPosts(): Promise<Post[]> {
        return this.postRepo.find({
            order: {
                views: 'DESC',
            },
            take: 5,
        });
    }
}

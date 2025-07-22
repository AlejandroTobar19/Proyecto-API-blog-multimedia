// src/posts/posts.controller.ts
import {
    Controller,
    Get,
    Post as HttpPost,
    Body,
    Param,
    Patch,
    Delete,
    UseGuards,
    Req,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdatePostDto } from './dto/update-post.dto';
import { Request } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { Query } from '@nestjs/common';
import { Post } from './entity/post.entity';




@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @UseGuards(JwtAuthGuard)
    @HttpPost(':id/tags')
    @UseGuards(JwtAuthGuard)
    addTagsToPost(
        @Param('id', ParseIntPipe) postId: number,
        @Body() body: { tags: string[] },
        @Req() req
    ) {
        return this.postsService.addTags(postId, body.tags, req.user);
    }



    @Get()
    findAll() {
        return this.postsService.findAll();
    }

    @Get(':id')
    getPost(@Param('id') id: string) {
        return this.postsService.findOne(+id);
    }


    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdatePostDto, @Req() req) {
        return this.postsService.update(+id, dto, req.user);
    }


    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Req() req) {
        return this.postsService.remove(+id, req.user);
    }

    @Get(':id/history')
    async getHistory(@Param('id', ParseIntPipe) id: number) {
        return this.postsService.getPostHistory(id);
    }

    @Get('report/top-views')
    getTopViewed() {
        return this.postsService.getTopViewedPosts();
    }

    @Get('report/top-tags')
    getTopTags() {
        return this.postsService.getMostUsedTags();
    }

    @Get('ranking/most-viewed')
    getMostViewed(@Query('limit') limit?: string) {
        const parsedLimit = limit ? parseInt(limit) : 10;
        return this.postsService.getMostViewed(parsedLimit);
    }

    @UseGuards(JwtAuthGuard)
    @HttpPost()
    create(@Body() dto: CreatePostDto, @Req() req) {
        return this.postsService.create(dto, req.user);
    }

    @Get('report/most-viewed')
    async getMostViewedPosts(): Promise<Post[]> {
        return this.postsService.getMostViewedPosts();
    }

}

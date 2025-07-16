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



@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @UseGuards(JwtAuthGuard)
    @HttpPost()
    create(@Body() dto: CreatePostDto, @Req() req) {
        return this.postsService.create(dto, req.user);
    }

    @Get()
    findAll() {
        return this.postsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.postsService.findById(+id);
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


}

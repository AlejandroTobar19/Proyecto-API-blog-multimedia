import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ModerateCommentDto } from './dto/moderate-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../users/entity/user.entity';
import { AssignTagsDto } from './dto/assign-tags.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Comment } from './entities/comment.entity';
import { Comment as CommentEntity } from './entities/comment.entity';
import { Response } from 'express';
import { PdfService } from '../reports/pdf.service'; // asegurate de la ruta correcta
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';




@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly pdfService: PdfService, // nuevo servicio
  ) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateCommentDto, @Req() req: RequestWithUser) {
    return this.commentsService.create(dto, req.user);
  }

  @Get()
  findAll() {
    return this.commentsService.findAll();
  }

  @Get('post/:postId')
  findByPost(@Param('postId') postId: number) {
    return this.commentsService.findByPost(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @Req() req: RequestWithUser,
  ) {
    return this.commentsService.update(+id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.commentsService.remove(+id, req.user);
  }

  @Patch(':id/moderate')
  moderate(@Param('id') id: string, @Body() dto: ModerateCommentDto) {
    return this.commentsService.moderate(+id, dto);
  }

  @Get('tag')
  findByTag(@Query('name') name: string) {
    return this.commentsService.findByTag(name);
  }

  @Get(':id/history')
  @UseGuards(JwtAuthGuard)
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.getHistory(id);
  }

  @Get('report/top-tags')
  getMostUsedTags(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit) : 5;
    return this.commentsService.getMostUsedTags(parsedLimit);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/tags')
  assignTags(
    @Param('id') id: string,
    @Body() dto: AssignTagsDto,
    @Req() req: RequestWithUser,
  ) {
    return this.commentsService.assignTags(+id, dto.tags, req.user);
  }

    // DESPUÉS
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'autor') // 👈 ADMIN Y AUTOR
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ModerateCommentDto,
    @Req() req: RequestWithUser, // 👈 Añade el decorador @Req
  ): Promise<Comment> {
    // Pasa el usuario al servicio para la validación
    return this.commentsService.updateStatus(id, dto.status, req.user);
  }

  @Get('report/pdf/:postId')
  async getCommentsPdf(
    @Param('postId') postId: number,
    @Res() res: Response,
  ) {
    const comments = await this.commentsService.getCommentsByPost(postId);
    this.pdfService.generateCommentsReport(comments, res);
  }

  @Get('report/pdf')
  async getAllCommentsPdf(@Res() res: Response) {
    const comments = await this.commentsService.findAll();
    this.pdfService.generateCommentsReport(comments, res);
  }


}

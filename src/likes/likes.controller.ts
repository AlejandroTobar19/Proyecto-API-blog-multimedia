import { Controller, Post, Get, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('comments/:id/toggle-like')
  toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.likesService.toggleLike(id, req.user);
  }

  @Get('comments/:id/likes-count')
  async getLikesCount(@Param('id', ParseIntPipe) id: number) {
    const count = await this.likesService.countLikesForComment(id);
    return { count };
  }
}
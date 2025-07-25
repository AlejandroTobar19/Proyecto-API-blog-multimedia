import { Controller, Post, Get, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('users/:id')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('toggle-subscription')
  toggleSubscription(
    @Param('id', ParseIntPipe) authorId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.subscriptionsService.toggleSubscription(authorId, req.user);
  }

  @Get('followers-count')
  async getFollowersCount(@Param('id', ParseIntPipe) authorId: number) {
    const count = await this.subscriptionsService.getFollowersCount(authorId);
    return { count };
  }
}
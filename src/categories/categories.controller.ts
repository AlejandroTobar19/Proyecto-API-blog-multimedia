import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entity/category.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UnauthorizedException } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';



@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear nueva categoría (solo admin)' })
  @ApiResponse({ status: 201, description: 'Categoría creada', type: Category })
  create(@Body() dto: CreateCategoryDto, @Req() req: RequestWithUser) {
    const user = req.user;
    if (user.role !== 'admin') {
      throw new UnauthorizedException('Solo los administradores pueden crear categorías');
    }
    return this.categoriesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las categorías' })
  @ApiResponse({ status: 200, description: 'Lista de categorías', type: [Category] })
  findAll() {
    return this.categoriesService.findAll();
  }
}

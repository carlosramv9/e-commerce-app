import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SlugUtil } from '../../common/utils/slug.util';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '@prisma/client';

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    if (createCategoryDto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: createCategoryDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const existingSlugs = await this.prisma.category.findMany({
      select: { slug: true },
    });

    const slug = SlugUtil.generateUnique(
      createCategoryDto.name,
      existingSlugs.map((c) => c.slug),
    );

    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        slug,
        description: createCategoryDto.description,
        parentId: createCategoryDto.parentId,
      },
    });
  }

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        parent: true,
        _count: {
          select: { products: true, children: true },
        },
      },
    });
  }

  async findTree(): Promise<CategoryWithChildren[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    const buildTree = (parentId: string | null): CategoryWithChildren[] => {
      return categories
        .filter((cat) => cat.parentId === parentId)
        .map((cat) => ({
          ...cat,
          children: buildTree(cat.id),
        }));
    };

    return buildTree(null);
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updateCategoryDto.parentId) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parent = await this.prisma.category.findUnique({
        where: { id: updateCategoryDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    let slug = category.slug;
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingSlugs = await this.prisma.category.findMany({
        where: { id: { not: id } },
        select: { slug: true },
      });

      slug = SlugUtil.generateUnique(
        updateCategoryDto.name,
        existingSlugs.map((c) => c.slug),
      );
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...updateCategoryDto,
        slug,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        products: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.children.length > 0) {
      throw new BadRequestException('Cannot delete category with subcategories');
    }

    if (category.products.length > 0) {
      throw new BadRequestException('Cannot delete category with products');
    }

    await this.prisma.category.delete({
      where: { id },
    });
  }
}

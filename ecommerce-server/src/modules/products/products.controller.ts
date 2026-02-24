import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { AddImageDto } from './dto/add-image.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Products')
@Controller('products')
@UseGuards(RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Create a new product' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all products with pagination and filters' })
  findAll(@Query() queryDto: QueryProductDto) {
    return this.productsService.findAll(queryDto);
  }

  @Get('low-stock')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Get products with low stock' })
  getLowStock() {
    return this.productsService.getLowStock();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Update product' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Delete product' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post(':id/images')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Add image to product' })
  addImage(@Param('id') id: string, @Body() addImageDto: AddImageDto) {
    return this.productsService.addImage(id, addImageDto);
  }

  @Delete(':id/images/:imageId')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Remove image from product' })
  removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.productsService.removeImage(id, imageId);
  }

  @Patch(':id/stock')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Update product stock' })
  updateStock(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.productsService.updateStock(id, quantity);
  }
}

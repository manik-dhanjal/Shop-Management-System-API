import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { ProductDocument } from './schema/product.schema';
import CreateProductDto from './dtos/create-product.dto';
import { ProductService } from './product.service';
import { UpdateProductDto } from './dtos/update-product.dto';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';
import { Roles } from '@shared/decorator/roles.decorator';
import { UserRole } from '@api/user/enum/user-role.enum';

@Controller({ path: 'shop/:shopId/product', version: '1' })
@Roles(UserRole.EMPLOYEE, UserRole.ADMIN, UserRole.MANAGER)
export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  @Get(':productId')
  async getProduct(
    @Param('productId') productId: string,
  ): Promise<LeanDocument<ProductDocument>> {
    return this.productService.getProductById(productId);
  }

  @Post('paginated')
  async getPaginatedProducts(
    @Param('shopId') shopId: string,
    @Body() query: PaginationQueryDto<CreateProductDto>,
  ): Promise<PaginatedResponseDto<LeanDocument<ProductDocument>>> {
    return this.productService.getPaginatedProducts(shopId, query);
  }

  @Post()
  async addProduct(
    @Param('shopId') shopId: string,
    @Body() product: CreateProductDto,
  ): Promise<LeanDocument<ProductDocument>> {
    return this.productService.createProduct(shopId, product);
  }

  @Patch(':productId')
  async updateProduct(
    @Param('productId') productId: string,
    @Body() product: UpdateProductDto,
  ): Promise<LeanDocument<ProductDocument>> {
    return this.productService.updateProductById(productId, product);
  }

  @Delete(':productId')
  async deleteProduct(@Param('productId') productId: string): Promise<void> {
    return this.productService.deleteProductById(productId);
  }
}

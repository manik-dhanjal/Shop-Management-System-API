import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { ProductDocument } from './schema/product.schema';
import CreateProductDTO from './dtos/create-product.dto';
import { ProductService } from './product.service';

@Controller('api/shop/:shop/product')
export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  @Get(':id')
  async getProducts(
    @Param('id') id: string,
  ): Promise<LeanDocument<ProductDocument>> {
    return this.productService.getProductById(id);
  }

  @Post()
  async addProduct(
    @Body() product: CreateProductDTO,
  ): Promise<LeanDocument<ProductDocument>> {
    return this.productService.createProduct(product);
  }
}

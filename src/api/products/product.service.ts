import { Injectable, Logger } from '@nestjs/common';
import { ProductRepository } from './repository/product.repository';
import CreateProductDto from './dtos/create-product.dto';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { ProductDocument } from './schema/product.schema';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  constructor(private readonly repository: ProductRepository) {}

  async createProduct(
    newProduct: CreateProductDto,
  ): Promise<LeanDocument<ProductDocument>> {
    this.logger.log(newProduct);
    const createdProduct = await this.repository.create(newProduct);
    return createdProduct.toJSON();
  }

  async getProductById(id: string): Promise<LeanDocument<ProductDocument>> {
    return this.repository.findOne({ _id: id });
  }
}

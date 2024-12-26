import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProductRepository } from './repository/product.repository';
import CreateProductDto from './dtos/create-product.dto';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { ProductDocument } from './schema/product.schema';
import { UpdateProductDto } from './dtos/update-product.dto';
import mongoose, { isObjectIdOrHexString, Types } from 'mongoose';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  constructor(private readonly repository: ProductRepository) {}

  async createProduct(
    shopId: string,
    newProduct: CreateProductDto,
  ): Promise<LeanDocument<ProductDocument>> {
    if (!isObjectIdOrHexString(shopId))
      throw new UnauthorizedException(`${shopId} is not valid shop Mongo ID`);
    const createdProduct = await this.repository.create({
      shop: new Types.ObjectId(shopId),
      ...newProduct,
    });
    return createdProduct.toJSON();
  }

  async getProductById(id: string): Promise<LeanDocument<ProductDocument>> {
    return this.repository.findOne({ _id: id }, {}, {}, ['images']);
  }

  async getPaginatedProducts(
    shopId: string,
    query: PaginationQueryDto<CreateProductDto>,
  ): Promise<PaginatedResponseDto<LeanDocument<ProductDocument>>> {
    // Set default values for page and limit if not provided
    const skip = (query.page - 1) * query.limit;
    return this.repository.findWithPagination(
      {
        shop: shopId,
        ...query.filter,
      },
      undefined,
      query.sort,
      skip,
      query.limit,
      ['images'],
    );
  }

  async updateProductById(
    id: string,
    product: UpdateProductDto,
  ): Promise<LeanDocument<ProductDocument>> {
    if (!isObjectIdOrHexString(id))
      throw new NotFoundException('Invalid Shop ID');
    const productId = new mongoose.Types.ObjectId(id);
    return this.repository.updateOne(productId, product);
  }

  async deleteProductById(id: string): Promise<void> {
    if (!isObjectIdOrHexString(id))
      throw new NotFoundException('Invalid Shop ID');
    const productId = new mongoose.Types.ObjectId(id);
    await this.repository.deleteOne(productId);
  }
}

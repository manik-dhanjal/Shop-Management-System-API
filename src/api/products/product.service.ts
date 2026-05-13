import {
  BadRequestException,
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
import { InventoryService } from '@api/inventory/inventory.service';
import { omit as _omit } from 'lodash';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  constructor(
    private readonly repository: ProductRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  async createProduct(
    shopId: string,
    newProduct: CreateProductDto,
  ): Promise<Omit<LeanDocument<ProductDocument>, 'inventory'>> {
    if (!isObjectIdOrHexString(shopId))
      throw new UnauthorizedException(`${shopId} is not valid shop Mongo ID`);
    const createdProduct = await this.repository.create({
      shop: new Types.ObjectId(shopId),
      ..._omit(newProduct, ['inventory']),
    });

    if (newProduct.inventory && newProduct.inventory.length > 0) {
      const inventoryIds = await this.inventoryService.addInventoryBulk(
        newProduct.inventory.map((inventory) => ({
          ...inventory,
          product: createdProduct._id,
          shop: new Types.ObjectId(shopId),
        })),
      );
      this.repository.updateOne(createdProduct._id, {
        $push: { inventory: { $each: inventoryIds } },
      });
    }
    return _omit(createdProduct.toJSON(), ['inventory']);
  }

  async getProductById(
    id: string,
  ): Promise<Omit<LeanDocument<ProductDocument>, 'inventory'>> {
    return this.repository.findOne(
      { _id: id },
      {
        inventory: 0,
      },
      {},
      ['images'],
    );
  }

  async getPaginatedProducts(
    shopId: string,
    query: PaginationQueryDto<CreateProductDto>,
  ): Promise<
    PaginatedResponseDto<Omit<LeanDocument<ProductDocument>, 'inventory'>>
  > {
    // Set default values for page and limit if not provided
    const skip = (query.page - 1) * query.limit;
    return this.repository.findWithPagination(
      {
        shop: shopId,
        ...query.filter,
      },
      {
        inventory: 0,
      },
      query.sort,
      skip,
      query.limit,
      ['images'],
    );
  }

  async updateProductById(
    id: string,
    product: UpdateProductDto,
  ): Promise<Omit<LeanDocument<ProductDocument>, 'inventory'>> {
    if (!isObjectIdOrHexString(id))
      throw new NotFoundException('Invalid Shop ID');
    const productId = new mongoose.Types.ObjectId(id);
    const updatedProduct = await this.repository.updateOne(productId, product);
    return _omit(updatedProduct, ['inventory']);
  }

  async deleteProductById(id: string): Promise<void> {
    if (!isObjectIdOrHexString(id))
      throw new NotFoundException('Invalid Shop ID');
    const productId = new mongoose.Types.ObjectId(id);
    await this.repository.deleteOne(productId);
  }

  /**
   * Validates stock and decrements it atomically for an order line set.
   * Uses a conditional $inc per product so a concurrent order cannot oversell.
   * If any product fails the stock check, previously decremented products are rolled back.
   */
  async assertAndDecrementStock(
    shopId: string,
    lines: { productId: string; quantity: number }[],
  ): Promise<void> {
    if (!lines.length) {
      throw new BadRequestException('Order must contain at least one item');
    }
    const succeeded: { productId: string; quantity: number }[] = [];
    for (const line of lines) {
      if (!isObjectIdOrHexString(line.productId)) {
        await this.rollbackStock(succeeded);
        throw new BadRequestException(`Invalid product id ${line.productId}`);
      }
      if (line.quantity <= 0) {
        await this.rollbackStock(succeeded);
        throw new BadRequestException('Quantity must be positive');
      }
      const result = await this.repository.model.findOneAndUpdate(
        {
          _id: new Types.ObjectId(line.productId),
          shop: new Types.ObjectId(shopId),
          stock: { $gte: line.quantity },
        },
        { $inc: { stock: -line.quantity } },
        { new: true },
      );
      if (!result) {
        await this.rollbackStock(succeeded);
        throw new BadRequestException(
          `Insufficient stock for product ${line.productId}`,
        );
      }
      succeeded.push(line);
    }
  }

  private async rollbackStock(
    lines: { productId: string; quantity: number }[],
  ): Promise<void> {
    await Promise.all(
      lines.map((l) =>
        this.repository.model.updateOne(
          { _id: new Types.ObjectId(l.productId) },
          { $inc: { stock: l.quantity } },
        ),
      ),
    );
  }
}

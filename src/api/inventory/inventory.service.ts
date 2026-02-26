import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InventoryRepository } from './repository/inventory.repository';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { isMongoId } from 'class-validator';
import mongoose, { Types } from 'mongoose';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { InventoryDocument } from './schema/inventory.schema';
import { ProductRepository } from '@api/products/repository/product.repository';
import { MeasuringUnit } from '@api/products/enum/measuring-unit.enum';
import { PaginatedInventoryQueryDto } from './dto/paginated-inventory-query.dto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async getInventory(
    shopId: string,
    query: PaginatedInventoryQueryDto,
  ): Promise<PaginatedResponseDto<LeanDocument<InventoryDocument>>> {
    const skip = (query.page - 1) * query.limit;
    const shopMongoId = this.convertToMongoId(shopId);
    return this.inventoryRepository.findWithPagination(
      {
        shop: shopMongoId,
        ...query.filter,
      },
      undefined,
      query.sort,
      skip,
      query.limit,
      ['supplier'],
    );
  }

  async addInventory(shopId: string, createInventoryDto: CreateInventoryDto) {
    if (
      createInventoryDto.currentQuantity > createInventoryDto.initialQuantity
    ) {
      throw new BadRequestException(
        'Current quantity cannot exceed initial quantity',
      );
    }

    const product = await this.productRepository.findOne({
      _id: createInventoryDto.product,
      shop: this.convertToMongoId(shopId),
    });
    if (!product) {
      throw new NotFoundException('Product not found in the specified shop');
    }

    const createdInventory = await this.inventoryRepository.create({
      ...createInventoryDto,
      measuringUnit: createInventoryDto.measuringUnit || product.measuringUnit,
      shop: this.convertToMongoId(shopId),
    });
    await this.productRepository.updateOne(createInventoryDto.product, {
      $inc: { stock: createInventoryDto.currentQuantity },
      $push: { inventory: createdInventory._id },
    });
    return createdInventory;
  }

  async updateInventory(
    shopId: string,
    inventoryId: string,
    updateInventoryDto: UpdateInventoryDto,
  ) {
    const shopMongoId = this.convertToMongoId(shopId);
    const inventoryMongoId = this.convertToMongoId(inventoryId);

    if (shopId !== updateInventoryDto.shop.toString()) {
      throw new ForbiddenException('Shop ID in the path and body do not match');
    }

    if (updateInventoryDto.currentQuantity !== undefined) {
      if (
        updateInventoryDto.initialQuantity !== undefined &&
        updateInventoryDto.currentQuantity > updateInventoryDto.initialQuantity
      ) {
        throw new BadRequestException(
          'Current quantity cannot exceed initial quantity',
        );
      }

      const inventory = await this.inventoryRepository.findOne({
        _id: inventoryMongoId,
        shop: shopMongoId,
      });

      if (updateInventoryDto.currentQuantity > inventory.initialQuantity) {
        throw new BadRequestException(
          'Current quantity cannot exceed initial quantity',
        );
      }

      if (!inventory) {
        throw new NotFoundException('Inventory item not found');
      }
      const quantityDifference =
        updateInventoryDto.currentQuantity - inventory.currentQuantity;

      const updatedProduct = await this.productRepository.updateOne(
        inventory.product,
        {
          $inc: { stock: quantityDifference },
        },
      );
      if (!updatedProduct) {
        throw new NotFoundException('Product not found');
      }
    }

    return this.inventoryRepository.updateOne(
      inventoryMongoId,
      updateInventoryDto,
    );
  }

  async deleteInventory(inventoryId: string, shopId: string): Promise<void> {
    const inventoryToDelete = await this.inventoryRepository.findOne({
      _id: this.convertToMongoId(inventoryId),
      shop: this.convertToMongoId(shopId),
    });
    if (!inventoryToDelete) {
      throw new NotFoundException('Inventory item not found');
    }

    await this.productRepository.update(
      { _id: inventoryToDelete.product, shop: this.convertToMongoId(shopId) },
      {
        $inc: { stock: -1 * inventoryToDelete.currentQuantity },
        $pull: { inventory: inventoryToDelete._id },
      },
    );
    await this.inventoryRepository.delete({
      _id: this.convertToMongoId(inventoryId),
      shop: this.convertToMongoId(shopId),
    });
  }

  async addInventoryBulk(
    createInventoryDtos: CreateInventoryDto[],
  ): Promise<mongoose.Types.ObjectId[]> {
    const createdInventories =
      await this.inventoryRepository.model.insertMany(createInventoryDtos);

    return createdInventories.map((inventory) => inventory._id);
  }

  convertToMongoId(id: string): Types.ObjectId {
    if (isMongoId(id) === false) {
      throw new NotFoundException('Invalid ID');
    }
    return new Types.ObjectId(id);
  }
}

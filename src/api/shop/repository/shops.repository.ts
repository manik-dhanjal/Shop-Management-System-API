import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CoreRepository } from '@core/core.repository';
import mongoose, { Model } from 'mongoose';
import { Shop, ShopDocument } from '../schema/shop.schema';
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { UpdateShopDto } from '../dto/update-shop.dto';

@Injectable()
export class ShopRepository extends CoreRepository<ShopDocument> {
  constructor(
    @InjectModel(Shop.name)
    readonly model: Model<ShopDocument>,
  ) {
    super(model);
  }

  async getPaginatedSuppliers(
    shopId: string,
    query: PaginationQueryDto<UpdateShopDto>,
  ): Promise<PaginatedResponseDto<ShopDocument>> {
    const skip = (query.page - 1) * query.limit;

    const result = await this.model.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(shopId) } },

      { $unwind: '$suppliers' },

      {
        $lookup: {
          from: 'products',
          localField: 'suppliers',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },

      {
        $facet: {
          data: [{ $skip: skip }, { $limit: query.limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ]);

    const docs = result[0]?.data || [];
    const totalRecords = result[0]?.totalCount[0]?.count || 0;
    const totalPages =
      query.limit > 0 ? Math.ceil(totalRecords / query.limit) : 0;
    const currentPage =
      query.limit > 0 ? Math.floor(skip / query.limit) + 1 : 1;
    const nextPage = currentPage < totalPages ? currentPage + 1 : null;
    const prevPage = currentPage > 1 ? currentPage - 1 : null;
    return {
      docs,
      pagination: {
        totalRecords: totalRecords,
        currentPage: currentPage,
        totalPages: totalPages,
        nextPage: nextPage,
        prevPage: prevPage,
      },
    };
  }
}

import { NotFoundException } from '@nestjs/common';
import { PaginationMetadata } from '@shared/types/pagination.interface';
import { LeanDocument } from '@shared/types/lean-document.interface';
import {
  FilterQuery,
  Model,
  Types,
  SortOrder,
  UpdateQuery,
  UpdateWriteOpResult,
} from 'mongoose';

export class CoreRepository<T> {
  readonly model: Model<T>;

  constructor(injectedModel: Model<T>) {
    this.model = injectedModel;
  }

  /**
   * Creates a new document in the database.
   * @param createTestModelDto - The data transfer object (DTO) containing the fields required to create the model.
   * @returns A Promise that resolves to the created document.
   */
  async create(createTestModelDto: Record<string, any>): Promise<T> {
    // Utilize the model's create method to insert a new document into the database.
    return await this.model.create(createTestModelDto);
  }

  /**
   * Optimized version of finding a single document in the collection based on the provided filter.
   *
   * @param filter - The filter to apply when searching for the document.
   * @param selection - The fields to include or exclude from the document. Default is `{}`.
   * @param sorting - The sorting criteria for the document. Default is `{}`.
   * @param population - The path(s) to populate in the found document. Default is `[]`.
   * @param skipError - Whether to skip throwing an error if the document is not found. Default is `false`.
   * @returns A Promise that resolves to the found document.
   * @throws NotFoundException if the document is not found and skipError is `false`.
   */
  async findOne(
    filter: FilterQuery<T>,
    selection:
      | string
      | string[]
      | Partial<Record<keyof T, number | boolean | string | object>> = {},
    sorting: Partial<Record<keyof T, SortOrder>> = {},
    population: string | string[] = [],
    skipError = false,
  ): Promise<LeanDocument<T> | null> {
    // Utilize chaining to optimize query execution
    const query = this.model.findOne(filter).lean<T>();
    if (
      typeof selection === 'string' ||
      Array.isArray(selection) ||
      Object.keys(selection).length
    )
      query.select(selection);
    if (Object.keys(sorting).length) query.sort(sorting);
    if (population) query.populate(population);

    const found = await query.exec();

    // Throw NotFoundException if the document is not found and skipError is false
    if (!found && !skipError) {
      throw new NotFoundException(`${this.model.modelName} not found`);
    }

    return found;
  }

  /**
   * Finds multiple documents in the collection based on the provided filter and population options.
   *
   * @param filter - The filter to apply when searching for the documents.
   * @param selection - The fields to include or exclude from the documents. Default is `{}`.
   * @param sorting - The sorting criteria for the documents. Default is `{}`.
   * @param population - The path(s) to populate in the found documents. Default is `[]`.
   * @returns A Promise that resolves to an array of found documents.
   */
  async find(
    filter: FilterQuery<T>,
    selection:
      | string
      | string[]
      | Partial<Record<keyof T, number | boolean | string | object>> = {},
    sorting: Partial<Record<keyof T, SortOrder>> = {},
    population: string | string[] = [],
  ): Promise<LeanDocument<T>[]> {
    // Utilize chaining to optimize query execution
    const query = this.model.find(filter);
    if (
      typeof selection === 'string' ||
      Array.isArray(selection) ||
      Object.keys(selection).length
    )
      query.select(selection);
    if (Object.keys(sorting).length) query.sort(sorting);
    if (population) query.populate(population);
    return query.lean<T[]>().exec();
  }

  /**
   * Finds multiple documents in the collection based on the provided filter with pagination and population options,
   * and provides pagination metadata including total records, current page, total pages, next page, and previous page.
   *
   * @param filter - The filter to apply when searching for the documents.
   * @param selection - The fields to include or exclude from the documents. Can be a string, array of strings, or an object specifying fields to include or exclude. Default is `{}`.
   * @param sorting - The sorting criteria for the documents. Default is `{}`.
   * @param skip - The number of documents to skip for pagination. Default is `0`.
   * @param limit - The maximum number of documents to return for pagination. Default is `0`.
   * @param population - The path(s) to populate in the found documents. Default is `[]`.
   * @returns A Promise that resolves to an object containing an array of found documents and pagination metadata.
   */
  async findWithPagination(
    filter: FilterQuery<T>,
    selection:
      | string
      | string[]
      | Partial<Record<keyof T, number | boolean | string | object>> = {},
    sorting: Partial<Record<keyof T, SortOrder>> = {},
    skip = 0,
    limit = 10,
    population: string | string[] = [],
  ): Promise<{
    docs: LeanDocument<T>[];
    pagination: PaginationMetadata;
  }> {
    const query = this.getModelInstance().find(filter);
    if (
      typeof selection === 'string' ||
      Array.isArray(selection) ||
      Object.keys(selection).length
    )
      query.select(selection);
    if (Object.keys(sorting).length) query.sort(sorting);
    if (skip !== undefined) query.skip(skip);
    if (limit !== undefined) query.limit(limit);
    if (population) query.populate(population);

    const records = await query.lean<T[]>().exec();
    const totalRecords = await this.getModelInstance().countDocuments(filter);
    const totalPages = limit > 0 ? Math.ceil(totalRecords / limit) : 0;
    const currentPage = limit > 0 ? Math.floor(skip / limit) + 1 : 1;
    const nextPage = currentPage < totalPages ? currentPage + 1 : null;
    const prevPage = currentPage > 1 ? currentPage - 1 : null;

    return {
      docs: records,
      pagination: {
        totalRecords: totalRecords,
        currentPage: currentPage,
        totalPages: totalPages,
        nextPage: nextPage,
        prevPage: prevPage,
      },
    };
  }

  /**
   * Updates a single document in the collection based on the provided ID and returns the updated document.
   *
   * @param id - The ID of the document to update.
   * @param updateQuery - The update query to apply to the document.
   * @returns A Promise that resolves to the updated document.
   */
  async updateOne(
    id: Types.ObjectId,
    updateQuery: UpdateQuery<T>,
  ): Promise<LeanDocument<T>> {
    // Update the document directly and return the updated document
    return this.getModelInstance()
      .findByIdAndUpdate(id, updateQuery, { new: true, runValidators: true })
      .lean<T>()
      .exec();
  }

  /**
   * Updates multiple documents in the collection based on the provided filter.
   *
   * @param filter - The filter to apply when searching for the documents to update.
   * @param updatedData - The updated data to apply to the documents.
   * @returns A Promise that resolves to the result of the update operation.
   */
  async update(
    filter: FilterQuery<T>,
    updatedData: UpdateQuery<T>,
  ): Promise<UpdateWriteOpResult> {
    // Update documents using the regular model instance
    return this.getModelInstance()
      .updateMany(filter, updatedData, { new: true, runValidators: true })
      .exec();
  }

  /**
   * Deletes a single document from the collection based on the provided ID.
   * This method directly returns the result of the deletion operation.
   *
   * @param id - The ID of the document to delete.
   * @returns A Promise that resolves to the result of the deletion operation.
   */
  async deleteOne(id: Types.ObjectId): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  /**
   * Deletes documents from the collection based on the provided filter.
   *
   * @param filter - The filter to apply when searching for the documents to delete.
   * @returns A Promise that resolves to the result of the deletion operation.
   */
  async delete(filter: FilterQuery<T>): Promise<void> {
    await this.getModelInstance().deleteMany(filter).exec();
  }

  /**
   * Returns the model instance used by the repository.
   *
   * @returns The model instance.
   */
  getModelInstance(): Model<T> {
    return this.model;
  }

  /**
   * Counts the number of documents in the collection that match the provided filter.
   *
   * @param filter - The criteria used to filter documents. Default is `{}`.
   * @returns A Promise that resolves to the count of documents.
   */
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}

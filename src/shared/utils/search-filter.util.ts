import { FilterQuery } from 'mongoose';

type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  | Date;

type DotPath<T> = T extends Primitive
  ? never
  : {
      [K in keyof T & string]: T[K] extends Primitive
        ? K
        : T[K] extends Array<unknown>
          ? K
          : K | `${K}.${DotPath<T[K]>}`;
    }[keyof T & string];

export interface BuildSearchFilterOptions<T> {
  search?: string;
  includedFields: DotPath<T>[];
  caseInsensitive?: boolean;
}

export const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function buildSearchFilter<T>(
  options: BuildSearchFilterOptions<T>,
): FilterQuery<T> {
  const { search, includedFields, caseInsensitive = true } = options;

  const normalizedSearch = search?.trim();
  if (!normalizedSearch) return {};

  const sanitizedSearch = escapeRegex(normalizedSearch);

  const searchableFields = includedFields.map((field) => String(field));

  if (!searchableFields.length) return {};

  const regexFilter = {
    $regex: sanitizedSearch,
    ...(caseInsensitive ? { $options: 'i' } : {}),
  };

  return {
    $or: searchableFields.map((field) => ({ [field]: regexFilter })),
  } as FilterQuery<T>;
}

import { Document } from 'mongoose';

export type LeanDocument<T> = Omit<T, Exclude<keyof Document, '_id'>>;

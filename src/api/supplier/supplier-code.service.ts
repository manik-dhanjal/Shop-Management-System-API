import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { SupplierCounterRepository } from './repository/supplier-counter.repository';

@Injectable()
export class SupplierCodeService {
  constructor(private readonly counterRepo: SupplierCounterRepository) {}

  private format(n: number): string {
    return `SUP/${String(n).padStart(4, '0')}`;
  }

  async generate(shopId: string): Promise<string> {
    const n = await this.counterRepo.getNextNumber(new Types.ObjectId(shopId));
    return this.format(n);
  }

  async peek(shopId: string): Promise<string> {
    const n = await this.counterRepo.peekNextNumber(new Types.ObjectId(shopId));
    return this.format(n);
  }
}

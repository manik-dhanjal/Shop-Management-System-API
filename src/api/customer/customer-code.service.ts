import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CustomerCounterRepository } from './repository/customer-counter.repository';

@Injectable()
export class CustomerCodeService {
  constructor(private readonly counterRepo: CustomerCounterRepository) {}

  private format(n: number): string {
    return `CUST/${String(n).padStart(4, '0')}`;
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

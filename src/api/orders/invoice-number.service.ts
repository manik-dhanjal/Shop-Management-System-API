import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { InvoiceCounterRepository } from './repository/invoice-counter.repository';

@Injectable()
export class InvoiceNumberService {
  constructor(private readonly counterRepo: InvoiceCounterRepository) {}

  /**
   * Returns the Indian financial year (Apr 1 – Mar 31) for the given date.
   * Format: "YY-YY" e.g. "25-26".
   */
  static getFinancialYear(d: Date = new Date()): string {
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-indexed
    const startYear = month >= 3 ? year : year - 1;
    const endYear = startYear + 1;
    return `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
  }

  private format(n: number, fy: string): string {
    return `INV/${fy}/${String(n).padStart(4, '0')}`;
  }

  async generate(shopId: string, at: Date = new Date()): Promise<string> {
    const fy = InvoiceNumberService.getFinancialYear(at);
    const n = await this.counterRepo.getNextNumber(
      new Types.ObjectId(shopId),
      fy,
    );
    return this.format(n, fy);
  }

  async peek(shopId: string, at: Date = new Date()): Promise<string> {
    const fy = InvoiceNumberService.getFinancialYear(at);
    const n = await this.counterRepo.peekNextNumber(
      new Types.ObjectId(shopId),
      fy,
    );
    return this.format(n, fy);
  }
}

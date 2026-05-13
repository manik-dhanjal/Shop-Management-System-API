import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { isMongoId } from 'class-validator';
import { OrderRepository } from '@api/orders/repository/order.repository';
import { ShopRepository } from '@api/shop/repository/shops.repository';
import { GstReturnClient } from '../clients/gst-return.client';
import { GstFilingRepository } from '../repository/gst-filing.repository';
import {
  GstFiling,
  GstFilingStatus,
  GstFilingDocument,
  GstReturnType,
} from '../schema/gst-filing.schema';
import { PrepareGstReturnDto } from '../dto/prepare-gst-return.dto';
import { FileGstReturnDto } from '../dto/file-gst-return.dto';
import { AiGstService } from './ai-gst.service';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { TaxType } from '@api/orders/enum/tax-type.enum';
import { InvoiceType } from '@api/orders/enum/invoice-type.enum';
import {
  B2BInvoice,
  B2CLInvoice,
  B2CSInvoice,
  Gstr1Data,
  Gstr3BData,
} from '../interfaces/gst-return.interface';

@Injectable()
export class GstFilingService {
  private readonly logger = new Logger(GstFilingService.name);

  constructor(
    private readonly gstFilingRepository: GstFilingRepository,
    private readonly orderRepository: OrderRepository,
    private readonly shopRepository: ShopRepository,
    private readonly gstReturnClient: GstReturnClient,
    private readonly aiGstService: AiGstService,
  ) {}

  async prepareReturn(
    shopId: string,
    dto: PrepareGstReturnDto,
  ): Promise<LeanDocument<GstFilingDocument>> {
    const shopMongoId = this.toMongoId(shopId);
    const shop = await this.shopRepository.findOne(
      { _id: shopMongoId },
      {},
      {},
      [],
      false,
    );

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    const { fromDate, toDate } = this.periodToDates(dto.returnPeriod);

    const orders = await this.orderRepository.find(
      {
        shop: shopMongoId,
        createdAt: { $gte: fromDate, $lte: toDate },
      },
      {},
      {},
      ['customer'],
    );

    let preparedData: Gstr1Data | Gstr3BData;
    if (dto.returnType === GstReturnType.GSTR1) {
      preparedData = this.buildGstr1Data(orders, dto.gstin);
    } else {
      preparedData = this.buildGstr3BData(orders, dto.gstin, dto.returnPeriod);
    }

    let aiSuggestions: Record<string, any> | undefined;
    if (dto.useAi !== false) {
      try {
        aiSuggestions = await this.aiGstService.analyzeAndSuggest(
          dto.returnType,
          preparedData,
          dto.returnPeriod,
          dto.gstin,
        );
      } catch (err) {
        this.logger.warn(`AI suggestion failed: ${err.message}`);
      }
    }

    const filing = await this.gstFilingRepository.create({
      shop: shopMongoId,
      gstin: dto.gstin,
      returnPeriod: dto.returnPeriod,
      returnType: dto.returnType,
      status: GstFilingStatus.PREPARED,
      preparedData,
      aiSuggestions,
    });

    return filing as unknown as LeanDocument<GstFilingDocument>;
  }

  async fileReturn(
    shopId: string,
    dto: FileGstReturnDto,
  ): Promise<LeanDocument<GstFilingDocument>> {
    const shopMongoId = this.toMongoId(shopId);
    const filingMongoId = this.toMongoId(dto.filingId);

    const filing = await this.gstFilingRepository.findOne(
      { _id: filingMongoId, shop: shopMongoId },
      {},
      {},
      [],
      false,
    );

    if (!filing) {
      throw new NotFoundException('GST filing record not found');
    }

    if (filing.status === GstFilingStatus.FILED) {
      throw new BadRequestException('This return has already been filed');
    }

    let filingResponse: Record<string, any>;
    let newStatus: GstFilingStatus;
    let errorMessage: string | undefined;

    try {
      const returnData = {
        gstin: dto.gstin,
        returnPeriod: dto.returnPeriod,
        returnType: dto.returnType,
        filingStatus: 'PENDING',
        data: filing.preparedData,
      } as any;

      if (dto.returnType === GstReturnType.GSTR1) {
        filingResponse = await this.gstReturnClient.fileGSTR1(dto.gstin, returnData);
      } else {
        filingResponse = await this.gstReturnClient.fileGSTR3B(dto.gstin, returnData);
      }

      newStatus = GstFilingStatus.FILED;
    } catch (err) {
      this.logger.error(`GST filing API call failed: ${err.message}`);
      newStatus = GstFilingStatus.FAILED;
      errorMessage = err.message;
      filingResponse = {};
    }

    return this.gstFilingRepository.updateOne(filingMongoId, {
      status: newStatus,
      filingResponse,
      errorMessage,
      ...(newStatus === GstFilingStatus.FILED ? { filedAt: new Date() } : {}),
    });
  }

  async getFilingStatus(
    shopId: string,
    filingId: string,
  ): Promise<LeanDocument<GstFilingDocument>> {
    const shopMongoId = this.toMongoId(shopId);
    const filingMongoId = this.toMongoId(filingId);

    const filing = await this.gstFilingRepository.findOne(
      { _id: filingMongoId, shop: shopMongoId },
      {},
      {},
      [],
      true,
    );

    if (!filing) {
      throw new NotFoundException('GST filing record not found');
    }

    return filing;
  }

  async getFilingsForShop(
    shopId: string,
    page = 1,
    limit = 10,
  ): Promise<{ docs: LeanDocument<GstFilingDocument>[]; pagination: any }> {
    const shopMongoId = this.toMongoId(shopId);
    const skip = (page - 1) * limit;
    return this.gstFilingRepository.findWithPagination(
      { shop: shopMongoId },
      {},
      { createdAt: -1 } as any,
      skip,
      limit,
    );
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private buildGstr1Data(orders: any[], gstin: string): Gstr1Data {
    const b2bInvoices: B2BInvoice[] = [];
    const b2clInvoices: B2CLInvoice[] = [];
    const b2csInvoices: B2CSInvoice[] = [];

    for (const order of orders) {
      const invoiceDate = new Date(order.createdAt).toISOString().split('T')[0];
      const customerGstin: string = order.customer?.gstin ?? '';
      const taxableValue = (order.billing?.grandTotal ?? 0) - this.sumTaxes(order.billing?.taxes ?? []);
      const cgst = this.sumTaxByType(order.billing?.taxes ?? [], TaxType.CGST);
      const sgst = this.sumTaxByType(order.billing?.taxes ?? [], TaxType.SGST);
      const igst = this.sumTaxByType(order.billing?.taxes ?? [], TaxType.IGST);
      const cess = this.sumTaxByType(order.billing?.taxes ?? [], TaxType.CESS);
      const totalAmount = order.billing?.finalAmount ?? 0;

      if (customerGstin) {
        b2bInvoices.push({
          invoiceNumber: order.invoiceId,
          invoiceDate,
          customerGstin,
          customerName: order.customer?.name ?? '',
          customerState: order.customer?.billingAddress?.state ?? '',
          taxableValue,
          cgst,
          sgst,
          igst,
          cess,
          totalAmount,
        });
      } else if (
        order.invoiceType === InvoiceType.EXPORT_INVOICE ||
        totalAmount > 250000
      ) {
        // B2CL: export invoices or domestic unregistered invoices above Rs. 2.5 lakh
        b2clInvoices.push({
          invoiceNumber: order.invoiceId,
          invoiceDate,
          customerName: order.customer?.name ?? '',
          customerState: order.customer?.billingAddress?.state ?? '',
          taxableValue,
          cgst,
          sgst,
          igst,
          cess,
          totalAmount,
        });
      } else {
        b2csInvoices.push({
          invoiceNumber: order.invoiceId,
          invoiceDate,
          customerState: order.customer?.billingAddress?.state ?? '',
          taxableValue,
          cgst,
          sgst,
          igst,
          cess,
          totalAmount,
        });
      }
    }

    return {
      b2bInvoices,
      b2clInvoices,
      b2csInvoices,
      creditDebitNotes: [],
      creditDebitNotesUnregistered: [],
      exportInvoices: [],
      advanceTax: [],
      taxPaid: [],
    };
  }

  private buildGstr3BData(
    orders: any[],
    gstin: string,
    returnPeriod: string,
  ): Gstr3BData {
    let taxableValue = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let cess = 0;

    for (const order of orders) {
      const taxes = order.billing?.taxes ?? [];
      const orderTaxable = (order.billing?.grandTotal ?? 0) - this.sumTaxes(taxes);
      taxableValue += orderTaxable;
      cgst += this.sumTaxByType(taxes, TaxType.CGST);
      sgst += this.sumTaxByType(taxes, TaxType.SGST);
      igst += this.sumTaxByType(taxes, TaxType.IGST);
      cess += this.sumTaxByType(taxes, TaxType.CESS);
    }

    return {
      gstin,
      returnPeriod,
      outwardSupplies: { taxableValue, cgst, sgst, igst, cess },
      inwardSupplies: { taxableValue: 0, cgst: 0, sgst: 0, igst: 0, cess: 0 },
      itc: { cgst: 0, sgst: 0, igst: 0, cess: 0 },
      taxLiability: { cgst, sgst, igst, cess },
      taxPaid: { cgst, sgst, igst, cess },
    };
  }

  private sumTaxes(taxes: { amount: number }[]): number {
    return taxes.reduce((sum, t) => sum + (t.amount ?? 0), 0);
  }

  private sumTaxByType(
    taxes: { type: string; amount: number }[],
    type: TaxType,
  ): number {
    return taxes
      .filter((t) => t.type === type)
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);
  }

  private periodToDates(returnPeriod: string): { fromDate: Date; toDate: Date } {
    const month = parseInt(returnPeriod.substring(0, 2), 10) - 1;
    const year = parseInt(returnPeriod.substring(2), 10);
    const fromDate = new Date(year, month, 1);
    const toDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return { fromDate, toDate };
  }

  private toMongoId(id: string): Types.ObjectId {
    if (!isMongoId(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    return new Types.ObjectId(id);
  }
}

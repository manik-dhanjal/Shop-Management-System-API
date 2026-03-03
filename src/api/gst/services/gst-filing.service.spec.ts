import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { GstFilingService } from './gst-filing.service';
import { GstFilingRepository } from '../repository/gst-filing.repository';
import { OrderRepository } from '@api/orders/repository/order.repository';
import { ShopRepository } from '@api/shop/repository/shops.repository';
import { GstReturnClient } from '../clients/gst-return.client';
import { AiGstService } from './ai-gst.service';
import {
  GstFilingStatus,
  GstReturnType,
} from '../schema/gst-filing.schema';
import { TaxType } from '@api/orders/enum/tax-type.enum';
import { InvoiceType } from '@api/orders/enum/invoice-type.enum';

const shopId = new Types.ObjectId().toHexString();
const filingId = new Types.ObjectId().toHexString();

const mockShop = { _id: new Types.ObjectId(shopId), gstDetails: { gstin: '29ABCDE1234F1Z5' } };

const mockOrders = [
  {
    _id: new Types.ObjectId(),
    invoiceId: 'INV-001',
    invoiceType: InvoiceType.TAX_INVOICE,
    createdAt: new Date('2024-03-15'),
    customer: {
      name: 'Test Customer',
      gstin: '27AAAAA0000A1Z5',
      billingAddress: { state: 'Maharashtra' },
    },
    billing: {
      grandTotal: 1180,
      finalAmount: 1180,
      taxes: [
        { type: TaxType.CGST, rate: 9, amount: 90 },
        { type: TaxType.SGST, rate: 9, amount: 90 },
      ],
    },
  },
];

const mockFiling = {
  _id: new Types.ObjectId(filingId),
  shop: new Types.ObjectId(shopId),
  gstin: '29ABCDE1234F1Z5',
  returnPeriod: '032024',
  returnType: GstReturnType.GSTR1,
  status: GstFilingStatus.PREPARED,
  preparedData: {},
};

describe('GstFilingService', () => {
  let service: GstFilingService;
  let gstFilingRepository: jest.Mocked<GstFilingRepository>;
  let orderRepository: jest.Mocked<OrderRepository>;
  let shopRepository: jest.Mocked<ShopRepository>;
  let gstReturnClient: jest.Mocked<GstReturnClient>;
  let aiGstService: jest.Mocked<AiGstService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GstFilingService,
        {
          provide: GstFilingRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(mockFiling),
            findOne: jest.fn().mockResolvedValue(mockFiling),
            updateOne: jest.fn().mockResolvedValue({ ...mockFiling, status: GstFilingStatus.FILED }),
            findWithPagination: jest.fn().mockResolvedValue({ docs: [mockFiling], pagination: {} }),
          },
        },
        {
          provide: OrderRepository,
          useValue: {
            find: jest.fn().mockResolvedValue(mockOrders),
          },
        },
        {
          provide: ShopRepository,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockShop),
          },
        },
        {
          provide: GstReturnClient,
          useValue: {
            fileGSTR1: jest.fn().mockResolvedValue({ status: 'SUCCESS' }),
            fileGSTR3B: jest.fn().mockResolvedValue({ status: 'SUCCESS' }),
          },
        },
        {
          provide: AiGstService,
          useValue: {
            analyzeAndSuggest: jest.fn().mockResolvedValue({
              summary: 'Test summary',
              insights: [],
              warnings: [],
              suggestedAdjustments: {},
              confidenceScore: 0.9,
            }),
          },
        },
      ],
    }).compile();

    service = module.get<GstFilingService>(GstFilingService);
    gstFilingRepository = module.get(GstFilingRepository);
    orderRepository = module.get(OrderRepository);
    shopRepository = module.get(ShopRepository);
    gstReturnClient = module.get(GstReturnClient);
    aiGstService = module.get(AiGstService);
  });

  describe('prepareReturn', () => {
    it('should prepare GSTR1 data from orders and persist a filing record', async () => {
      const dto = {
        gstin: '29ABCDE1234F1Z5',
        returnPeriod: '032024',
        returnType: GstReturnType.GSTR1,
        useAi: true,
      };

      const result = await service.prepareReturn(shopId, dto);

      expect(shopRepository.findOne).toHaveBeenCalledWith(
        { _id: expect.any(Types.ObjectId) },
        {},
        {},
        [],
        false,
      );
      expect(orderRepository.find).toHaveBeenCalled();
      expect(aiGstService.analyzeAndSuggest).toHaveBeenCalled();
      expect(gstFilingRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          gstin: dto.gstin,
          returnPeriod: dto.returnPeriod,
          returnType: GstReturnType.GSTR1,
          status: GstFilingStatus.PREPARED,
        }),
      );
      expect(result).toEqual(mockFiling);
    });

    it('should prepare GSTR3B data correctly', async () => {
      const dto = {
        gstin: '29ABCDE1234F1Z5',
        returnPeriod: '032024',
        returnType: GstReturnType.GSTR3B,
        useAi: false,
      };

      await service.prepareReturn(shopId, dto);

      const createCall = gstFilingRepository.create.mock.calls[0][0];
      expect(createCall.returnType).toBe(GstReturnType.GSTR3B);
      expect(createCall.preparedData).toHaveProperty('outwardSupplies');
      expect(aiGstService.analyzeAndSuggest).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when shop is not found', async () => {
      shopRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.prepareReturn(shopId, {
          gstin: '29ABCDE1234F1Z5',
          returnPeriod: '032024',
          returnType: GstReturnType.GSTR1,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for an invalid shopId', async () => {
      await expect(
        service.prepareReturn('invalid-id', {
          gstin: '29ABCDE1234F1Z5',
          returnPeriod: '032024',
          returnType: GstReturnType.GSTR1,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('fileReturn', () => {
    it('should file a prepared GSTR1 return and update status to FILED', async () => {
      const dto = {
        gstin: '29ABCDE1234F1Z5',
        returnPeriod: '032024',
        returnType: GstReturnType.GSTR1,
        authToken: 'mock-token',
        filingId,
      };

      const result = await service.fileReturn(shopId, dto);

      expect(gstReturnClient.fileGSTR1).toHaveBeenCalled();
      expect(gstFilingRepository.updateOne).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        expect.objectContaining({ status: GstFilingStatus.FILED }),
      );
      expect(result.status).toBe(GstFilingStatus.FILED);
    });

    it('should throw BadRequestException when return is already filed', async () => {
      gstFilingRepository.findOne.mockResolvedValueOnce({
        ...mockFiling,
        status: GstFilingStatus.FILED,
      } as any);

      await expect(
        service.fileReturn(shopId, {
          gstin: '29ABCDE1234F1Z5',
          returnPeriod: '032024',
          returnType: GstReturnType.GSTR1,
          authToken: 'mock-token',
          filingId,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should set status FAILED when GST API call throws', async () => {
      gstReturnClient.fileGSTR1.mockRejectedValueOnce(new Error('API error'));

      const result = await service.fileReturn(shopId, {
        gstin: '29ABCDE1234F1Z5',
        returnPeriod: '032024',
        returnType: GstReturnType.GSTR1,
        authToken: 'mock-token',
        filingId,
      });

      expect(gstFilingRepository.updateOne).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        expect.objectContaining({ status: GstFilingStatus.FAILED }),
      );
    });
  });

  describe('getFilingStatus', () => {
    it('should return the filing record for a valid id', async () => {
      const result = await service.getFilingStatus(shopId, filingId);
      expect(result).toEqual(mockFiling);
    });

    it('should throw NotFoundException when filing is not found', async () => {
      gstFilingRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.getFilingStatus(shopId, filingId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getFilingsForShop', () => {
    it('should return paginated filings for a shop', async () => {
      const result = await service.getFilingsForShop(shopId, 1, 10);
      expect(result.docs).toHaveLength(1);
      expect(gstFilingRepository.findWithPagination).toHaveBeenCalledWith(
        { shop: expect.any(Types.ObjectId) },
        {},
        { createdAt: -1 },
        0,
        10,
      );
    });
  });
});

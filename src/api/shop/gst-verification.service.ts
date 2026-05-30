import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GstAuthClient } from '@api/gst/clients/gst-auth.client';
import { GSTPublicClient } from '@api/gst/clients/gst-public.client';
import { GstPublicSearchTaxpayerResponse } from '@api/gst/interfaces/public-search-taxpayer-response.interface';
import { Shop, ShopDocument } from './schema/shop.schema';
import { ConstitutionOfBusiness } from './enum/constitution-of-business.enum';
import { GstStatus } from './schema/gst-details.schema';
import { NormalizedGstDetailsDto } from './dto/gst-verify.dto';

@Injectable()
export class GstVerificationService {
  private readonly logger = new Logger(GstVerificationService.name);

  constructor(
    @InjectModel(Shop.name) private readonly shopModel: Model<ShopDocument>,
    private readonly gstAuthClient: GstAuthClient,
    private readonly gstPublicClient: GSTPublicClient,
  ) {}

  async requestOtp(gstin: string): Promise<void> {
    this.logger.debug(`[step 1/3] Sending OTP request to GST portal for ${gstin}`);
    try {
      const res = await this.gstAuthClient.getOtp({ gstin });
      this.logger.debug(`[step 1/3] OTP request accepted for ${gstin} — raw response: ${JSON.stringify(res)}`);
    } catch (err) {
      this.logger.error(`[step 1/3] OTP request failed for ${gstin}: ${err.message} — response: ${JSON.stringify(err?.response?.data)}`);
      throw new ServiceUnavailableException(
        'Verification service unavailable — try again later.',
      );
    }
  }

  async verifyWithOtp(
    shopId: string,
    gstin: string,
    otp: string,
    email?: string,
  ): Promise<NormalizedGstDetailsDto> {
    this.logger.debug(`[step 2/3] verifyWithOtp start — shopId=${shopId} gstin=${gstin} email=${email ?? '(none)'}`);

    const shop = await this.shopModel.findById(shopId).lean().exec();
    if (!shop) throw new NotFoundException('Shop not found');

    // Step 2a: Validate OTP → get session token
    let sessionToken: string;
    let sessionExpiry: Date;
    try {
      this.logger.debug(`[step 2a/3] Calling validateOtp for ${gstin}`);
      const tokenRes = await this.gstAuthClient.validateOtp({ gstin, otp });
      this.logger.debug(`[step 2a/3] validateOtp raw response: ${JSON.stringify(tokenRes)}`);
      sessionToken = tokenRes?.data?.authToken ?? tokenRes?.authToken;
      const expiresInSec = tokenRes?.data?.expiresIn ?? tokenRes?.expiresIn ?? 21600;
      sessionExpiry = new Date(Date.now() + expiresInSec * 1000);
      if (!sessionToken) throw new Error('No auth token in response');
      this.logger.debug(`[step 2a/3] Session token obtained, expires at ${sessionExpiry.toISOString()}`);
    } catch (err) {
      const msg: string = err?.response?.data?.message ?? err.message ?? '';
      this.logger.debug(`[step 2a/3] validateOtp error — msg="${msg}" response=${JSON.stringify(err?.response?.data)}`);
      if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('otp')) {
        throw new BadRequestException('Invalid OTP. Please check and try again.');
      }
      if (msg.toLowerCase().includes('expired')) {
        throw new BadRequestException('OTP expired. Please resend OTP.');
      }
      this.logger.error(`[step 2a/3] OTP validation failed for ${gstin}: ${msg}`);
      throw new ServiceUnavailableException(
        'Verification service unavailable — try again later.',
      );
    }

    // Step 2b: Store session token
    this.logger.debug(`[step 2b/3] Storing session token for shopId=${shopId}`);
    await this.shopModel.updateOne(
      { _id: shopId },
      {
        $set: {
          'gstDetails.gstSessionToken': sessionToken,
          'gstDetails.gstSessionExpiresAt': sessionExpiry,
        },
      },
    );

    // Step 3: Fetch taxpayer record
    const taxpayerEmail = email ?? shop.gstDetails?.email ?? '';
    this.logger.debug(`[step 3/3] Calling searchTaxpayer for ${gstin} with email=${taxpayerEmail || '(empty)'}`);
    let taxpayer: GstPublicSearchTaxpayerResponse;
    try {
      taxpayer = await this.gstPublicClient.searchTaxpayer(gstin, taxpayerEmail);
      this.logger.debug(`[step 3/3] searchTaxpayer raw response: ${JSON.stringify(taxpayer)}`);
    } catch (err) {
      const status = err?.response?.status;
      this.logger.debug(`[step 3/3] searchTaxpayer error — status=${status} body=${JSON.stringify(err?.response?.data)}`);
      if (status === 404) {
        throw new BadRequestException('GSTIN not found on the GST portal.');
      }
      this.logger.error(`[step 3/3] Taxpayer search failed for ${gstin}: ${err.message}`);
      throw new ServiceUnavailableException(
        'Verification service unavailable — try again later.',
      );
    }

    const normalized = this.normalize(taxpayer);
    this.logger.debug(`[step 3/3] Normalized taxpayer data: ${JSON.stringify(normalized)}`);

    // Write verified fields to DB
    this.logger.debug(`[step 3/3] Writing verified fields to DB for shopId=${shopId}`);
    await this.shopModel.updateOne(
      { _id: shopId },
      {
        $set: {
          'gstDetails.gstin': normalized.gstin,
          'gstDetails.legalName': normalized.legalName,
          'gstDetails.tradeName': normalized.tradeName,
          'gstDetails.panCardNumber': normalized.panCardNumber,
          'gstDetails.address': normalized.address,
          'gstDetails.state': normalized.state,
          'gstDetails.registrationDate': normalized.registrationDate,
          'gstDetails.status': normalized.status,
          'gstDetails.constitutionOfBusiness': normalized.constitutionOfBusiness,
          'gstDetails.einvoiceApplicable': normalized.einvoiceApplicable,
          'gstDetails.natureOfBusiness': normalized.natureOfBusiness,
          'gstDetails.verifiedAt': normalized.verifiedAt,
        },
      },
    );
    this.logger.debug(`[step 3/3] DB write complete for shopId=${shopId}`);

    return normalized;
  }

  async reVerify(shopId: string): Promise<NormalizedGstDetailsDto | null> {
    this.logger.debug(`[reVerify] start for shopId=${shopId}`);
    const shop = await this.shopModel
      .findById(shopId)
      .select(
        'gstDetails.gstin gstDetails.email gstDetails.gstSessionToken gstDetails.gstSessionExpiresAt',
      )
      .lean()
      .exec();

    if (!shop?.gstDetails?.gstin) {
      this.logger.debug(`[reVerify] skipped shopId=${shopId} — no gstin`);
      return null;
    }

    const { gstSessionToken, gstSessionExpiresAt } = shop.gstDetails as any;
    if (!gstSessionToken || (gstSessionExpiresAt && new Date(gstSessionExpiresAt) < new Date())) {
      this.logger.warn(`[reVerify] skipped shopId=${shopId} gstin=${shop.gstDetails.gstin} — session token absent or expired (expiresAt=${gstSessionExpiresAt ?? 'null'})`);
      return null;
    }

    this.logger.debug(`[reVerify] calling searchTaxpayer for ${shop.gstDetails.gstin}`);
    let taxpayer: GstPublicSearchTaxpayerResponse;
    try {
      taxpayer = await this.gstPublicClient.searchTaxpayer(
        shop.gstDetails.gstin,
        shop.gstDetails.email ?? '',
      );
      this.logger.debug(`[reVerify] searchTaxpayer response: ${JSON.stringify(taxpayer)}`);
    } catch (err) {
      this.logger.warn(`[reVerify] fetch failed for shopId=${shopId} gstin=${shop.gstDetails.gstin}: ${err.message}`);
      return null;
    }

    const normalized = this.normalize(taxpayer);
    this.logger.debug(`[reVerify] normalized: ${JSON.stringify(normalized)}`);
    await this.shopModel.updateOne(
      { _id: shopId },
      {
        $set: {
          'gstDetails.legalName': normalized.legalName,
          'gstDetails.tradeName': normalized.tradeName,
          'gstDetails.address': normalized.address,
          'gstDetails.state': normalized.state,
          'gstDetails.registrationDate': normalized.registrationDate,
          'gstDetails.status': normalized.status,
          'gstDetails.constitutionOfBusiness': normalized.constitutionOfBusiness,
          'gstDetails.einvoiceApplicable': normalized.einvoiceApplicable,
          'gstDetails.natureOfBusiness': normalized.natureOfBusiness,
          'gstDetails.verifiedAt': normalized.verifiedAt,
        },
      },
    );
    return normalized;
  }

  private normalize(raw: GstPublicSearchTaxpayerResponse): NormalizedGstDetailsDto {
    const d = raw.data;

    const address = assembleAddress(d.pradr?.addr);
    const state = extractState(d.stj, d.gstin);
    const registrationDate = parseGstDate(d.rgdt);
    const status = mapGstStatus(d.sts);
    const constitutionOfBusiness = mapConstitution(d.ctb);

    return {
      gstin: d.gstin,
      legalName: d.lgnm || undefined,
      tradeName: d.tradeNam || undefined,
      panCardNumber: d.gstin?.slice(2, 12) || undefined,
      address: address || undefined,
      state: state || undefined,
      registrationDate: registrationDate || undefined,
      status: status || undefined,
      constitutionOfBusiness,
      einvoiceApplicable: d.einvoiceStatus === 'Yes',
      natureOfBusiness: d.nba?.length ? d.nba : undefined,
      verifiedAt: new Date(),
    };
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function assembleAddress(addr: any): string {
  if (!addr) return '';
  const parts = [
    addr.flno,
    addr.bno,
    addr.bnm,
    addr.st,
    addr.loc,
    addr.dst,
    addr.stcd,
  ].filter(Boolean);
  const base = parts.join(', ');
  return addr.pncd ? `${base} - ${addr.pncd}` : base;
}

function extractState(stj: string, gstin: string): string {
  if (stj) {
    // "State - Maharashtra - ..." → "Maharashtra"
    const m = stj.match(/^State\s*-\s*([^-]+)/i);
    if (m) return m[1].trim();
    return stj.split(' - ')[0].trim();
  }
  // Fall back: first 2 chars of GSTIN are state code — caller can do a lookup
  return gstin?.slice(0, 2) ?? '';
}

function parseGstDate(rgdt: string): Date | null {
  if (!rgdt) return null;
  // dd/mm/yyyy
  const parts = rgdt.split('/');
  if (parts.length !== 3) return null;
  const iso = `${parts[2]}-${parts[1]}-${parts[0]}`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

function mapGstStatus(sts: string): GstStatus | null {
  if (!sts) return null;
  const map: Record<string, GstStatus> = {
    active: GstStatus.ACTIVE,
    inactive: GstStatus.INACTIVE,
    suspended: GstStatus.SUSPENDED,
    cancelled: GstStatus.CANCELLED,
  };
  return map[sts.toLowerCase()] ?? null;
}

function mapConstitution(ctb: string): ConstitutionOfBusiness {
  if (!ctb) return ConstitutionOfBusiness.OTHERS;
  const lower = ctb.toLowerCase();
  const values = Object.values(ConstitutionOfBusiness);
  const match = values.find((v) => v.toLowerCase() === lower);
  if (match) return match;
  // Prefix match fallback
  const prefix = values.find((v) => lower.startsWith(v.toLowerCase().slice(0, 6)));
  return prefix ?? ConstitutionOfBusiness.OTHERS;
}

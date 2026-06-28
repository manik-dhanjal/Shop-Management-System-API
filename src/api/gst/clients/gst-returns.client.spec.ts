import { AxiosInstance } from 'axios';
import { GstReturnsClient } from './gst-returns.client';
import { GstReturnForm } from '../enum/gst-return-form.enum';
import { GstSession } from '../interfaces/gst-request.interface';
import { GstRequestFailedException } from '../exceptions/gst-request-failed.exception';

describe('GstReturnsClient', () => {
  let request: jest.Mock;
  let client: GstReturnsClient;

  const session: GstSession = {
    email: 'me@asp.in',
    gstUsername: 'TN_NT2.152384',
    stateCode: '27',
    transactionId: 'txn-123',
  };

  const ok = (data: unknown = {}) => ({ data: { status_cd: '1', data } });

  beforeEach(() => {
    request = jest.fn().mockResolvedValue(ok());
    client = new GstReturnsClient({ request } as unknown as AxiosInstance);
  });

  it('routes gstin/retperiod to the query string on GET reads', async () => {
    await client.getSection(GstReturnForm.GSTR1, 'b2b', {
      session,
      gstin: '27AHQPA7588L1ZJ',
      retPeriod: '042024',
      params: { ctin: '01AABCE2207R1Z5', empty: undefined },
    });

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'get',
        url: '/gstr1/b2b',
        params: {
          email: 'me@asp.in',
          ctin: '01AABCE2207R1Z5',
          gstin: '27AHQPA7588L1ZJ',
          retperiod: '042024',
        },
        headers: expect.objectContaining({
          gst_username: 'TN_NT2.152384',
          state_cd: '27',
          txn: 'txn-123',
        }),
      }),
    );
    // empty params are dropped, gstin is not duplicated into headers on a GET
    expect(request.mock.calls[0][0].params).not.toHaveProperty('empty');
    expect(request.mock.calls[0][0].headers).not.toHaveProperty('gstin');
  });

  it('routes gstin/ret_period to headers and sends the body on PUT save', async () => {
    await client.save(GstReturnForm.GSTR1, {
      session,
      gstin: '27AHQPA7588L1ZJ',
      retPeriod: '042024',
      payload: { gstin: '27AHQPA7588L1ZJ', fp: '042024', b2b: [] },
    });

    const call = request.mock.calls[0][0];
    expect(call.method).toBe('put');
    expect(call.url).toBe('/gstr1/retsave');
    expect(call.headers).toMatchObject({
      gstin: '27AHQPA7588L1ZJ',
      ret_period: '042024',
    });
    expect(call.params).not.toHaveProperty('gstin');
    expect(call.data).toMatchObject({ fp: '042024' });
  });

  it('uses retevcfile when an EVC OTP is supplied', async () => {
    await client.file(GstReturnForm.GSTR3B, {
      session,
      gstin: '27AHQPA7588L1ZJ',
      retPeriod: '042024',
      pan: 'AHQPA7588L',
      evcOtp: '123456',
      payload: {},
    });

    const call = request.mock.calls[0][0];
    expect(call.url).toBe('/gstr3b/retevcfile');
    expect(call.params).toMatchObject({ pan: 'AHQPA7588L', evcotp: '123456' });
  });

  it('throws GstRequestFailedException on an envelope failure (HTTP 200, status_cd "0")', async () => {
    request.mockResolvedValue({
      data: {
        status_cd: '0',
        error: { error_cd: 'RET12521', message: 'GSTR1 is already submitted' },
      },
    });

    await expect(
      client.submit(GstReturnForm.GSTR1, {
        session,
        gstin: '27AHQPA7588L1ZJ',
        retPeriod: '042024',
        payload: {},
      }),
    ).rejects.toBeInstanceOf(GstRequestFailedException);
  });
});

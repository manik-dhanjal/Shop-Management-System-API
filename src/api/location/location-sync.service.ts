import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { Country as CscCountry, State as CscState } from 'country-state-city';
import { Country, CountryDocument } from './schema/country.schema';
import { State, StateDocument } from './schema/state.schema';
import { LocationService } from './location.service';

/**
 * Weekly sync of world countries and non-India states from the
 * country-state-city package. India states are managed separately
 * (GST 2-digit codes + tax metadata) and are never overwritten here.
 *
 * Cron: 3am every Sunday.
 */
@Injectable()
export class LocationSyncService {
  private readonly logger = new Logger(LocationSyncService.name);

  constructor(
    @InjectModel(Country.name) private readonly countryModel: Model<CountryDocument>,
    @InjectModel(State.name) private readonly stateModel: Model<StateDocument>,
    private readonly locationService: LocationService,
  ) {}

  @Cron('0 3 * * 0', { name: 'location-sync' })
  async syncLocationData() {
    this.logger.log('Starting weekly location data sync…');
    try {
      const [countries, states] = await Promise.all([
        this.syncCountries(),
        this.syncNonIndiaStates(),
      ]);
      this.locationService.invalidateCache();
      this.logger.log(`Location sync done — ${countries} countries, ${states} non-India states`);
    } catch (err) {
      this.logger.error('Location sync failed', (err as Error).message);
    }
  }

  private async syncCountries(): Promise<number> {
    const all = CscCountry.getAllCountries();
    const ops = all.map(c => ({
      updateOne: {
        filter: { code: c.isoCode },
        update: {
          $set: {
            name: c.name,
            ...(c.phonecode && { dialCode: `+${c.phonecode}` }),
            ...(c.currency && { currency: c.currency }),
            hasStates: true,
          },
          $setOnInsert: {
            code: c.isoCode,
            hasGstin: c.isoCode === 'IN',
            sortOrder: c.isoCode === 'IN' ? 0 : 999,
            taxRegime: c.isoCode === 'IN' ? 'GST' : 'NONE',
          },
        },
        upsert: true,
      },
    }));
    await this.countryModel.bulkWrite(ops as any[], { ordered: false });
    return all.length;
  }

  private async syncNonIndiaStates(): Promise<number> {
    const nonIndia = CscState.getAllStates().filter(s => s.countryCode !== 'IN');
    const ops = nonIndia.map(s => ({
      updateOne: {
        filter: { countryCode: s.countryCode, code: s.isoCode },
        update: {
          $set: {
            name: s.name,
            type: 'State',
            isUnionTerritory: false,
            professionalTaxApplicable: false,
            compositionAllowed: true,
          },
          $setOnInsert: {
            countryCode: s.countryCode,
            code: s.isoCode,
          },
        },
        upsert: true,
      },
    }));
    await this.stateModel.bulkWrite(ops as any[], { ordered: false });
    return nonIndia.length;
  }
}

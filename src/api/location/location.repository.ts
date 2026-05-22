import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Country, CountryDocument } from './schema/country.schema';
import { State, StateDocument } from './schema/state.schema';
import { City, CityDocument } from './schema/city.schema';

@Injectable()
export class LocationRepository {
  constructor(
    @InjectModel(Country.name) private readonly countryModel: Model<CountryDocument>,
    @InjectModel(State.name) private readonly stateModel: Model<StateDocument>,
    @InjectModel(City.name) private readonly cityModel: Model<CityDocument>,
  ) {}

  findAllCountries(): Promise<CountryDocument[]> {
    return this.countryModel.find().sort({ sortOrder: 1, name: 1 }).lean().exec();
  }

  findStatesByCountry(countryCode: string): Promise<StateDocument[]> {
    return this.stateModel
      .find({ countryCode: countryCode.toUpperCase() })
      .sort({ name: 1 })
      .lean()
      .exec();
  }

  findCitiesByState(
    countryCode: string,
    stateCode: string,
    query?: string,
    limit = 50,
  ): Promise<CityDocument[]> {
    const cc = countryCode.toUpperCase();
    const sc = stateCode;

    if (query && query.trim()) {
      return this.cityModel
        .find(
          {
            $text: { $search: query },
            countryCode: cc,
            stateCode: sc,
          },
          { score: { $meta: 'textScore' } },
        )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean()
        .exec();
    }

    return this.cityModel
      .find({ countryCode: cc, stateCode: sc })
      .sort({ isMajor: -1, population: -1, name: 1 })
      .limit(limit)
      .lean()
      .exec();
  }

  findCityPincodes(cityId: string): Promise<CityDocument | null> {
    return this.cityModel.findById(cityId, { pincodes: 1, name: 1, stateCode: 1 }).lean().exec();
  }

  findCityByPincode(countryCode: string, pincode: string): Promise<CityDocument | null> {
    return this.cityModel
      .findOne(
        { countryCode: countryCode.toUpperCase(), 'pincodes.code': pincode },
        { name: 1, stateCode: 1, isSez: 1, sezName: 1, 'pincodes.$': 1 },
      )
      .lean()
      .exec();
  }

  findStateByCode(countryCode: string, stateCode: string): Promise<StateDocument | null> {
    return this.stateModel
      .findOne({ countryCode: countryCode.toUpperCase(), code: stateCode })
      .lean()
      .exec();
  }
}

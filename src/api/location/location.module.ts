import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { Country, CountrySchema } from './schema/country.schema';
import { State, StateSchema } from './schema/state.schema';
import { City, CitySchema } from './schema/city.schema';
import { LocationRepository } from './location.repository';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { LocationSyncService } from './location-sync.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: Country.name, schema: CountrySchema },
      { name: State.name, schema: StateSchema },
      { name: City.name, schema: CitySchema },
    ]),
  ],
  providers: [LocationRepository, LocationService, LocationSyncService],
  controllers: [LocationController],
  exports: [LocationService],
})
export class LocationModule {}

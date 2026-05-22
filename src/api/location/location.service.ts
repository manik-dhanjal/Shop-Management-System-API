import { Injectable, Logger, OnModuleInit, NotFoundException } from '@nestjs/common';
import { LocationRepository } from './location.repository';

/** Minimal Map-based LRU: delete-then-set on hit keeps insertion order = recency */
class LruCache<V> {
  private readonly map = new Map<string, V>();
  constructor(private readonly maxSize: number) {}

  get(key: string): V | undefined {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key: string, value: V): void {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.maxSize) {
      this.map.delete(this.map.keys().next().value);
    }
  }
}

@Injectable()
export class LocationService implements OnModuleInit {
  private readonly logger = new Logger(LocationService.name);

  /** Loaded fully on boot — ~250 KB combined */
  private countriesCache: any[] | null = null;
  private statesCache = new Map<string, any[]>(); // keyed by countryCode

  /** City search: 500-entry LRU */
  private readonly cityLru = new LruCache<any[]>(500);

  /** Pincode lookup: 1,000-entry LRU */
  private readonly pincodeLru = new LruCache<any>(1_000);

  constructor(private readonly repo: LocationRepository) {}

  async onModuleInit() {
    try {
      await this.warmUpCache();
    } catch (err) {
      this.logger.warn(`Location cache warm-up skipped: ${(err as Error).message}`);
    }
  }

  private async warmUpCache() {
    const [countries, states] = await Promise.all([
      this.repo.findAllCountries(),
      this.repo.findStatesByCountry('IN'),
    ]);
    // Only cache if collections are populated — avoids locking in empty arrays
    // when the seeder hasn't run yet at boot time.
    if (countries.length) this.countriesCache = countries;
    if (states.length) this.statesCache.set('IN', states);
    this.logger.log(
      `Location cache warm: ${countries.length} countries, ${states.length} IN states`,
    );
  }

  async getCountries(): Promise<any[]> {
    if (!this.countriesCache?.length) {
      this.countriesCache = await this.repo.findAllCountries();
    }
    return this.countriesCache ?? [];
  }

  async getStatesByCountry(countryCode: string): Promise<any[]> {
    const cc = countryCode.toUpperCase();
    const cached = this.statesCache.get(cc);
    // Re-fetch if not cached or was cached empty (e.g. seeder ran after boot)
    if (!cached?.length) {
      const states = await this.repo.findStatesByCountry(cc);
      if (states.length) this.statesCache.set(cc, states);
      return states;
    }
    return cached;
  }

  async getCitiesByState(
    countryCode: string,
    stateCode: string,
    query?: string,
    limit = 50,
  ): Promise<any[]> {
    const cacheKey = `${countryCode}:${stateCode}:${query || '_default'}:${limit}`;
    const cached = this.cityLru.get(cacheKey);
    if (cached) return cached;

    const cities = await this.repo.findCitiesByState(countryCode, stateCode, query, limit);
    this.cityLru.set(cacheKey, cities);
    return cities;
  }

  async getCityPincodes(cityId: string): Promise<any> {
    const city = await this.repo.findCityPincodes(cityId);
    if (!city) throw new NotFoundException(`City ${cityId} not found`);
    return city;
  }

  async lookupPincode(countryCode: string, pincode: string): Promise<any> {
    const cacheKey = `${countryCode}:${pincode}`;
    const cached = this.pincodeLru.get(cacheKey);
    if (cached !== undefined) {
      if (cached === null) throw new NotFoundException(`Pincode ${pincode} not found`);
      return cached;
    }

    const city = await this.repo.findCityByPincode(countryCode, pincode);
    if (!city) {
      this.pincodeLru.set(cacheKey, null);
      throw new NotFoundException(`Pincode ${pincode} not found`);
    }

    const states = await this.getStatesByCountry(countryCode);
    const state = states.find((s) => s.code === (city as any).stateCode);
    const pincodeEntry = (city as any).pincodes?.[0];

    const result = {
      pincode,
      city: (city as any).name,
      state: state?.name || (city as any).stateCode,
      stateCode: (city as any).stateCode,
      isSez: (city as any).isSez,
      officeType: pincodeEntry?.officeType,
      sezName: (city as any).sezName,
      cityId: String((city as any)._id),
    };

    this.pincodeLru.set(cacheKey, result);
    return result;
  }

  /** Invalidate in-memory caches (call after a seed refresh) */
  invalidateCache() {
    this.countriesCache = null;
    this.statesCache.clear();
    this.logger.log('Location cache invalidated');
  }
}

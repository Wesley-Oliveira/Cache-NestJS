import {
  CacheInterceptor,
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
  UseInterceptors,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AppService } from './app.service';
import { Person } from './shared/models/Person';

@Controller()
export class AppController {
  myfakeDB: Person = {
    name: 'naveen',
    email: 'naveen@gmail.com',
  };

  constructor(
    private readonly appService: AppService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('in-memory')
  async getFromMemoryCache() {
    // The cache store provides the method 'del('key')'  used to delete the record from the cache.
    // await this.cacheManager.del('your_key_to_delte');

    // The cache store provides the method 'reset()' used to clear the entire In-Memory cache.
    // await this.cacheManager.reset()

    const value = await this.cacheManager.get<Person>('user-info');
    if (value) {
      return {
        dataFrom: 'From Cache',
        userInfo: value,
      };
    }

    await this.cacheManager.set<Person>('user-info', this.myfakeDB, {
      ttl: 300,
    });
    return {
      dataFrom: 'My Fake Database',
      userInfo: this.myfakeDB,
    };
  }

  // The first call increments to one, the preceding calls will be answered by the cache
  // without incrementing the counter. Only after you clear the cache by calling /reset
  // the counter will be incremented once again.
  counter = 0;
  @Get()
  @UseInterceptors(CacheInterceptor)
  incrementCounter() {
    this.counter++;
    return this.counter;
  }

  // Call this endpoint to reset the cache for the route '/'
  @Get('reset')
  resetCache() {
    const routeToClear = '/';
    this.cacheManager.del(routeToClear, () => console.log('clear done'));
  }
}

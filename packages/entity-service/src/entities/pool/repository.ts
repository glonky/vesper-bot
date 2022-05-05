import { Service } from 'typedi';
import { BaseRepository } from '../base-entity/index';
import { Pool } from './entity';

@Service()
export class PoolRepository extends BaseRepository<Pool> {
  async getPoolById(poolId: string) {
    return null;
  }
}

import Container, { Service } from 'typedi';
import fetch from 'node-fetch';
import { Config } from '../../config';
import { Dashboard, LoanRate, Pool, PoolDataPoints, ValuesLocked, VspStats } from './interfaces';

@Service()
export class VesperService {
  private baseUrl = 'https://api.vesper.finance';

  /**
   * Gets additional information such as contracts, strategies and pool rewards from all pools.
   * Returns an array with the requested data:
   */
  public async getDashboard() {
    return this.fetch<Dashboard[]>('dashboard');
  }

  /**
   * Gets the APY, APR and token symbol from all pools.
   * Returns an object with the key `lendRates` that contains an array with the requested data from each pool.
   */
  public async getLoanRates() {
    return this.fetch<LoanRate[]>('loan-rates');
  }

  /**
   * Gets detailed information from all pools.
   */
  public async getPools() {
    return this.fetch<Pool[]>('pools');
  }

  /**
   * Gets data points such as values, supplies, interest and interest fee from the specified pool within the last week.
   */
  public async getPoolDataPointsFromAddress(address: string) {
    return this.fetch<PoolDataPoints[]>(`pools/${address}/data-points`);
  }

  /**
   * Gets deposits asset values from all pools within the last month.
   */
  public async getValuesLocked() {
    return this.fetch<ValuesLocked[]>('values-locked');
  }

  /**
   * Gets information related to the VSP token, such as price, total and circulating supply, market cap and more.
   */
  public async getVspStats() {
    return this.fetch<VspStats>('vsp-stats');
  }

  private fetch<T>(endpoint: string): Promise<T> {
    const stage = Container.get(Config).isProduction ? 'prod' : 'beta';

    return fetch(`${this.baseUrl}/${endpoint}?stages=${stage}`).then((response: any) => response.json()) as Promise<T>;
  }
}

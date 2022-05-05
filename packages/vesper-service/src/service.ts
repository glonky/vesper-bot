import { Inject, Service } from 'typedi';
import fetch from 'node-fetch';
import BigNumber from 'bignumber.js';
import { EtherscanService } from '@vesper-discord/blockchain-scan-service';
import { Config } from './config';
import { Dashboard, LendRate, Pool, PoolDataPoints, ValuesLocked, VspStats } from './interfaces';

@Service()
export class VesperService {
  @Inject(() => Config)
  private readonly config!: Config;

  @Inject(() => EtherscanService)
  private readonly etherscanService!: EtherscanService;

  private baseUrl = 'https://api.vesper.finance';

  public async getExchangeRate() {
    const vspQuantityInVVSPPool = await this.etherscanService.getERC20TokenAccountBalanceForTokenContractAddress({
      address: this.config.vvspTokenAddress,
      contractAddress: this.config.vspTokenAddress,
    });

    const vvspTotalSupply = await this.etherscanService.getERC20TokenTotalSupplyByContractAddress(
      this.config.vvspTokenAddress,
    );

    const vvspToVSPRatio = vspQuantityInVVSPPool.result.dividedBy(vvspTotalSupply.result);
    const vspToVVSPRatio = vvspTotalSupply.result.dividedBy(vspQuantityInVVSPPool.result);

    return {
      vspToVVSPRatio,
      vvspToVSPRatio,
    };
  }

  /**
   * Gets additional information such as contracts, strategies and pool rewards from all pools.
   * Returns an array with the requested data:
   */
  public async getDashboards() {
    return this.fetch<Dashboard[]>('dashboard');
  }

  /**
   * Gets the APY, APR and token symbol from all pools.
   * Returns an object with the key `lendRates` that contains an array with the requested data from each pool.
   */
  public async getLoanRates() {
    return this.fetch<{ lendRates: LendRate[] }>('loan-rates');
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
    const response = await this.fetch<VspStats>('vsp-stats');
    return {
      ...response,
      circulatingSupply: new BigNumber(response.circulatingSupply).shiftedBy(-18),
      marketCap: response.marketCap,
      totalSupply: new BigNumber(response.totalSupply).shiftedBy(-18),
      vspDistributed: new BigNumber(response.vspDistributed).shiftedBy(-18),
      vspDistributed30d: new BigNumber(response.vspDistributed30d).shiftedBy(-18),
    };
  }

  private fetch<T>(endpoint: string): Promise<T> {
    const stage = 'prod';

    return fetch(`${this.baseUrl}/${endpoint}?stages=${stage}`).then((response: any) => response.json()) as Promise<T>;
  }
}

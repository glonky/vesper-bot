import Container, { Service } from 'typedi';
import fetch from 'node-fetch';
import { Config } from '../config';

export interface Token {
  address: string;
  balance: string;
  decimals: string;
  symbol: string;
}

export interface Contract {
  // pool contract address.
  address: string;

  // list of tokens from the contract.
  tokens: Token[];

  // number of holders from the pool.
  holders: number;
}

export interface Strategy {
  // pool strategy address.
  address: string;

  // list of tokens information from strategy.
  tokens: Token[];

  // information on the MakerDAO Vault as applicable.
  makerVaultInfo?: {
    collateralRatio: string;
    daiDebt: string;
    highWater: string;
    isUnderwater: string;
    lowWater: string;
    vaultNum: string;
  };
}

export interface Dashboard {
  // the name of the pool
  name: string;

  // pool contract information.
  contract: Contract;

  // list of pool strategies information such as address, tokens, pool rewards, status and stage.
  strategies: Strategy[];

  // @deprecated
  strategy: Strategy;

  // pool rewards information.
  poolRewards: {
    // pool rewards address.
    address: string;

    // list of pool tokens
    tokens: Token[];
  };
  status: 'operative' | 'paused';
  stage: 'alpha' | 'beta' | 'prod' | 'retired';
}

export interface LoanRate {
  // annual percentage yield calculated over the last 24h.
  apy: number;

  // annual percentage rate calculated over the last 24h.
  apr: number;

  // token symbol.
  tokenSymbol: string;
}

export interface Pool {
  // name of the pool.
  name: string;

  // address of the pool.
  address: string;

  // asset compounding the pool
  asset: {
    // asset address.
    address: string;

    // pool asset decimals quantity.
    decimals: string;

    // asset symbol.
    symbol: string;

    // asset currency.
    currency: string;

    // asset price.
    price: number;
  };

  // the block at which the pool contract was created.
  birthblock: number;

  // the id of the chain where the contract was deployed.
  chainId: number;

  // shows the risk level of the pool. More than 3 is considered aggressive, 3 or less is conservative.
  riskLevel: number;

  // stage the pool is currently on. It can be "alpha", "beta", "prod" or "retired".
  stage: string;

  // collateral rewards rate.
  collRewardsRate: string;

  // pool decimals quantity.
  decimals: string;

  // interest earned from the pool.
  interestEarned: string;

  // interest fee that it is charged. It is set to 15% for every pool except vVSP which is 0.
  interestFee: number;

  // time (expresed in seconds) where the user can't do a withdraw. It is set to 0 for every pool except for vVSP which is 24 hours (86400 seconds).
  lockPeriod: number;

  // pool status. It can be "operative", "paused".
  status: 'operative' | 'paused';

  // pool token value.
  tokenValue: string;

  // pool total supply.
  totalSupply: string;

  // pool total value.
  totalValue: string;

  // flag used to know if pool gives rewards.
  vspRewards: false;

  // VSP rewards rate.
  vspRewardsRate: string;

  // withdraw fee charged. It is set to 0.60% for every pool except vVSP which is 0.
  withdrawFee: number;

  // color (in hex) used to represent a pool, for example in a chart.
  color: string;

  // number of holders from a pool.
  holders: number;

  // flag used to know if a pool is in the process of retiring.
  isRetiring: false;

  // pool actual rates from 1, 2, 7 and 30 days.
  actualRates: { [key: number]: number };

  // pool earning rates from 1, 2, 7 and 30 days.
  earningRates: { [key: number]: number };

  // VSP delta rates from 1, 2, 7 and 30 days.
  vspDeltaRates: { [key: number]: number };
}

export interface PoolDataPoints {
  // the block number where the values were taking from.
  number: number;

  // interest given from the specified pool.
  interest: string;

  // interest fee that it's charged. It is set to 15% for every pool except vVSP which is 0.
  interestFee: number;

  // pool supply from which the data point is from.
  supply: string;

  // date and time (in seconds) from which the data point is from.
  timestamp: number;

  // pool value from which the data point is from.
  value: string;
}

export interface ValuesLocked {
  //  random ID.
  _id: string;

  // the block number where the values were taking from.
  number: number;

  // date and time (in seconds) in which the data comes from.
  timestamp: number;

  // list of pools by address
  valuesLocked: {
    // total value locked from the pool within the timestamp
    [key: number]: string;
  }[];
}

export interface VspStats {
  // last VSP token price.
  price: number;

  // VSP token price change within the last hour.
  priceChange1h: number;

  // VSP token price delta change within the last hour.
  priceDelta1h: number;

  // VSP token total supply.
  totalSupply: string;

  //  VSP token circulating supply.
  circulatingSupply: string;

  // VSP token market cap.
  marketCap: number;

  // VSP tokens distributed.
  vspDistributed: string;

  // VSP tokens distributed within 30 days.
  vspDistributed30d: string;
}

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

    return fetch(`${this.baseUrl}/${endpoint}?stages=${stage}`).then((response) => response.json()) as Promise<T>;
  }
}

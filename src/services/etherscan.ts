import { URL, URLSearchParams } from 'url';
import Container, { Service } from 'typedi';
import fetch from 'node-fetch';
import { Cacheable } from '@type-cacheable/core';
import BigNumber from 'bignumber.js';
import { Config } from '../config';
import { Logger, LoggerDecorator } from '../logger';

export interface EtherscanResponse<T> {
  status: string;
  message: string;
  result: T;
}

export interface GetGasOracleResponse {
  LastBlock: string;
  SafeGasPrice: string;
  ProposeGasPrice: string;
  FastGasPrice: string;
  suggestBaseFee: string;
  gasUsedRatio: string;
}

interface EtherscanFetchParams {
  [key: string]: string;
  module: 'account' | 'contract' | 'transaction' | 'block' | 'logs' | 'stats' | 'proxy' | 'gastracker';
  action: string;
}

@Service()
export class EtherscanService {
  @LoggerDecorator('EtherscanService')
  private logger!: Logger;

  /**
   * Returns the current Safe, Proposed and Fast gas prices.
   * @cacheable 5 seconds
   */
  @Cacheable({
    ttlSeconds: 5,
  })
  public async getGasOracle() {
    return this.fetch<GetGasOracleResponse>({
      action: 'gasoracle',
      module: 'gastracker',
    });
  }

  /**
   * Returns the current Safe, Proposed and Fast gas prices.
   * @cacheable 5 seconds
   */
  @Cacheable({
    ttlSeconds: 5,
  })
  public async getEstimationOfConfirmationTime(gasPrice: string | number | BigNumber) {
    return this.fetch<string>({
      action: 'gasestimate',
      gasprice: gasPrice.toString(),
      module: 'gastracker',
    });
  }

  private async fetch<T>(params: EtherscanFetchParams): Promise<EtherscanResponse<T>> {
    const config = Container.get(Config);

    const searchParams = new URLSearchParams({
      ...params,
      apikey: config.etherscan.apiKey,
    });
    const url = new URL(config.etherscan.baseUrl);
    url.search = searchParams.toString();

    this.logger.debug('Fetching', {
      url: url.toString(),
    });

    const result = (await fetch(url.toString(), {
      method: 'GET',
    }).then((response: any) => response.json())) as EtherscanResponse<T>;

    // TODO: Retry if rate limit exceeded
    // Max rate limit reached: https://docs.etherscan.io/support/rate-limits
    if (result.status === '0') {
      throw new Error(`[${result.message}] ${result.result}`);
    }

    return result;
  }
}

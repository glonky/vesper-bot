import { URL, URLSearchParams } from 'url';
import Container, { Service } from 'typedi';
import fetch from 'node-fetch';
import { Cacheable } from '@type-cacheable/core';
import BigNumber from 'bignumber.js';
import { Config } from '../../config';
import { Logger, LoggerDecorator } from '../../logger';
import { GetGasOracleResponse, EtherscanResponse, EtherscanFetchParams } from './interfaces';

interface GetERC20TokenAccountBalanceForTokenContractAddressProps {
  contractAddress: string;
  address: string;
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

  /**
   * Returns the current amount of an ERC-20 token in circulation.
   * @cacheable 5 seconds
   * @tip The result is returned in the token's smallest decimal representation.
   * Eg. a token with a balance of 215.241526476136819398 and 18 decimal places will be returned as 215241526476136819398
   */
  @Cacheable({
    ttlSeconds: 5,
  })
  public async getERC20TokenTotalSupplyByContractAddress(contractAddress: string) {
    const response = await this.fetch<BigNumber>({
      action: 'tokensupply',
      contractaddress: contractAddress,
      module: 'stats',
    });

    return { ...response, result: new BigNumber(response.result) };
  }

  /**
   * Returns the current balance of an ERC-20 token of an address.
   * @cacheable 5 seconds
   * @tip The result is returned in the token's smallest decimal representation.
   * Eg. a token with a balance of 215.241526476136819398 and 18 decimal places will be returned as 215241526476136819398
   */
  @Cacheable({
    ttlSeconds: 5,
  })
  public async getERC20TokenAccountBalanceForTokenContractAddress({
    contractAddress,
    address,
  }: GetERC20TokenAccountBalanceForTokenContractAddressProps) {
    const response = await this.fetch<BigNumber>({
      action: 'tokenbalance',
      address: address,
      contractaddress: contractAddress,
      module: 'account',
    });

    return { ...response, result: new BigNumber(response.result) };
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
    }).then((response) => response.json())) as EtherscanResponse<T>;

    // TODO: Retry if rate limit exceeded
    // Max rate limit reached: https://docs.etherscan.io/support/rate-limits
    if (result.status === '0') {
      throw new Error(`[${result.message}] ${result.result}`);
    }

    return result;
  }
}

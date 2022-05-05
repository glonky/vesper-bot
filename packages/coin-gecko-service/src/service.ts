import { URL, URLSearchParams } from 'url';
import { Inject, Service } from 'typedi';
import fetch from 'node-fetch';
import { Logger, LoggerDecorator, Log } from '@vesper-discord/logger';
import { Retriable } from '@vesper-discord/retry';
import { Cacheable } from '@vesper-discord/redis-service';
import { ErrorHandler } from '@vesper-discord/errors';
import { omitBy, isNil } from 'lodash';
import { Config } from './config';
import { CoinInfoFromContractAddress, PriceOfToken } from './interfaces';
import { CoinGeckoErrorConverter } from './errors/index';

export enum PlatformId {
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon-pos',
  AVALANCHE = 'avalanche',
}

@Service()
export class CoinGeckoService {
  @LoggerDecorator()
  private readonly logger!: Logger;

  @Inject(() => Config)
  private readonly config!: Config;

  @Log({
    logInput: ({ input }) => input[0],
    logResult: ({ result }) => result,
  })
  @Cacheable({
    ttlSeconds: 60 * 60 * 24,
  })
  public async getCoinInfoFromContractAddress(props: { platformId: PlatformId; contractAddress: string }) {
    return this.fetch<CoinInfoFromContractAddress>(`coins/${props.platformId}/contract/${props.contractAddress}`, {});
  }

  @Log({
    logInput: ({ input }) => input[0],
    logResult: ({ result }) => result,
  })
  @Cacheable({
    ttlSeconds: 5,
  })
  public async getPriceOfToken(props: { platformId: PlatformId; contractAddresses: string[]; vsCurrencies: string[] }) {
    return this.fetch<PriceOfToken>(`simple/token_price/${props.platformId}`, {
      contract_addresses: props.contractAddresses.join(','),
      vs_currencies: props.vsCurrencies.join(','),
    });
  }

  @Log({
    logInput: ({ scope, input }) => {
      const [endpoint, params] = input;
      const cleanParams = omitBy(params, isNil);
      const searchParams = new URLSearchParams({
        ...cleanParams,
      });

      const url = new URL(`${scope.config.baseUrl}/${scope.config.apiVersion}/${endpoint}`);
      url.search = searchParams.toString();

      return {
        ...cleanParams,
        url: url.toString(),
      };
    },
    logLevel: 'trace',
    logResult: ({ result }) => result,
    message: 'Fetching data from Etherscan',
  })
  @Retriable()
  @ErrorHandler({
    converter: CoinGeckoErrorConverter,
  })
  private fetch<T>(endpoint: string, params?: { [key: string]: string }): Promise<T> {
    const searchParams = new URLSearchParams(params);
    const url = new URL(`${this.config.baseUrl}/${this.config.apiVersion}/${endpoint}`);
    url.search = searchParams.toString();

    this.logger.trace('Fetching', {
      url: url.toString(),
    });

    return fetch(url.toString(), {
      method: 'GET',
    }).then((response) => response.json()) as Promise<T>;
  }
}

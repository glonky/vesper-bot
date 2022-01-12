import { URL, URLSearchParams } from 'url';
import { Inject, Service } from 'typedi';
import fetch from 'node-fetch';
import { Logger, LoggerDecorator } from '@vesper-discord/logger';
import { Retriable } from '@vesper-discord/retry';
import { Cacheable } from '@vesper-discord/redis-service';
import { ErrorHandler } from '@vesper-discord/errors';
import { Config } from './config';
import { CoinInfoFromContractAddress } from './interfaces';
import { CoinGeckoErrorConverter } from './errors';

@Service()
export class CoinGeckoService {
  @LoggerDecorator()
  private logger!: Logger;

  @Inject()
  private config!: Config;

  @Cacheable({
    ttlSeconds: 1,
  })
  public async getCoinInfoFromContractAddress(props: { coinId: string; contractAddress: string }) {
    return this.fetch<CoinInfoFromContractAddress>(`coins/${props.coinId}/contract/${props.contractAddress}`);
  }

  @Retriable()
  @ErrorHandler({
    converter: CoinGeckoErrorConverter,
  })
  private fetch<T>(endpoint: string, params?: { [key: string]: string }): Promise<T> {
    const searchParams = new URLSearchParams(params);
    const url = new URL(`${this.config.baseUrl}/${this.config.apiVersion}/${endpoint}`);
    url.search = searchParams.toString();

    this.logger.debug('Fetching', {
      url: url.toString(),
    });

    return fetch(url.toString(), {
      method: 'GET',
    }).then((response) => response.json()) as Promise<T>;
  }
}

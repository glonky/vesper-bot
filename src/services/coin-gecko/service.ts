import { URL, URLSearchParams } from 'url';
import Container, { Service } from 'typedi';
import fetch from 'node-fetch';
import { Cacheable } from '@type-cacheable/core';
import { Config } from '../../config';
import { Logger, LoggerDecorator } from '../../logger';
import { Retriable } from '../../retry';
import { ErrorHandler } from '../../errors';
import { CoinInfoFromContractAddress } from './interfaces';
import { CoinGeckoErrorConverter } from './errors';

@Service()
export class CoinGeckoService {
  @LoggerDecorator('CoinGeckoService')
  private logger!: Logger;

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
    const config = Container.get(Config);

    const searchParams = new URLSearchParams(params);
    const url = new URL(`${config.coinGecko.baseUrl}/${config.coinGecko.apiVersion}/${endpoint}`);
    url.search = searchParams.toString();

    this.logger.debug('Fetching', {
      url: url.toString(),
    });

    return fetch(url.toString(), {
      method: 'GET',
    }).then((response) => response.json()) as Promise<T>;
  }
}

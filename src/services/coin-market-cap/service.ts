import Container, { Service } from 'typedi';
import fetch, { Headers } from 'node-fetch';
import { Cacheable } from '@type-cacheable/core';
import { Config } from '../../config';
import { CryptoCurrencyMapItem, CoinMarketCapResponse } from './interfaces';

// export interface MarketPairsLatest {}

@Service()
export class CoinMarketCapService {
  private baseUrl = 'https://pro-api.coinmarketcap.com/v1';

  @Cacheable({
    ttlSeconds: 30,
  })
  public async getCryptoCurrencyMap() {
    return this.fetch<CryptoCurrencyMapItem[]>('cryptocurrency/map');
  }

  @Cacheable({
    ttlSeconds: 30,
  })
  public async getCryptoCurrencyMarketPairsLatest(symbol: string) {
    return this.fetch<CryptoCurrencyMapItem[]>('cryptocurrency/market-pairs/latest');
  }

  // public async getCryptocurrencySymbolFromCoinMarketCapId(coinMarketCapId: number) {
  //   const results = await this.fetch<CryptoCurrencyMapItem[]>('cryptocurrency/map');
  //   return results.data.find((item) => item.id === coinMarketCapId).symbol;
  // }

  // public async getCoinMarketCapIdFromSymbol(symbol: string) {
  //   const results = await this.fetch<CryptoCurrencyMapItem[]>('cryptocurrency/map');
  //   return results.data.find((item) => item.symbol === symbol).id;
  // }

  private async fetch<T>(endpoint: string) {
    const config = Container.get(Config);

    return fetch(`${this.baseUrl}/${endpoint}`, {
      headers: new Headers({
        'X-CMC_PRO_API_KEY': config.coinMarketCap.apiKey,
      }),
      method: 'GET',
    }).then((response) => response.json()) as Promise<CoinMarketCapResponse<T>>;
  }
}

import Container, { Service } from 'typedi';
import fetch, { Headers } from 'node-fetch';
import { Cacheable } from '@type-cacheable/core';
import { Config } from '../config';

// export interface MarketPairsLatest {}

export interface CryptoCurrencyMapItem {
  id: number;
  rank: number;
  name: string;
  symbol: string;
  slug: string;
  is_active: number;
  first_historical_data: string;
  last_historical_data: string;
  platform: {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    token_address: string;
  };
}

interface CoinMarketCapResponse<T> {
  data: T;
  status: {
    timestamp: string;
    error_code?: number;
    error_message?: string;
    elapsed: number;
    credit_count: number;
  };
}

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
    }).then((response: any) => response.json()) as Promise<CoinMarketCapResponse<T>>;
  }
}

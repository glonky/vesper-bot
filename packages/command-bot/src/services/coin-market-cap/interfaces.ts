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

export interface CoinMarketCapResponse<T> {
  data: T;
  status: {
    timestamp: string;
    error_code?: number;
    error_message?: string;
    elapsed: number;
    credit_count: number;
  };
}

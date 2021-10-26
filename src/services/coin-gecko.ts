import { URL, URLSearchParams } from 'url';
import Container, { Service } from 'typedi';
import fetch from 'node-fetch';
import { Cacheable } from '@type-cacheable/core';
import { Config } from '../config';
import { Logger, LoggerDecorator } from '../logger';

export interface CoinGeckoResponse<T> {
  success: boolean;
  message: string;
  code: number;
  data: T;
}

/**
 * Available options to order results by
 */
export enum Order {
  GECKO_ASC = 'gecko_asc',
  GECKO_DESC = 'gecko_desc',
  MARKET_CAP_ASC = 'market_cap_asc',
  MARKET_CAP_DESC = 'market_cap_desc',
  VOLUME_ASC = 'volume_asc',
  VOLUME_DESC = 'volume_desc',
  COIN_NAME_ASC = 'coin_name_asc',
  COIN_NAME_DESC = 'coin_name_desc',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  HOUR_24_ASC = 'h24_change_asc',
  HOUR_24_DESC = 'h24_change_desc',
  TRUST_SCORE_DESC = 'trust_score_desc',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  OPEN_INTEREST_BTC_ASC = 'open_interest_btc_asc',
  OPEN_INTEREST_BTC_DESC = 'open_interest_btc_desc',
  TRADE_VOLUME_24H_BTC_ASC = 'trade_volume_24h_btc_asc',
  TRADE_VOLUME_24H_BTC_DESC = 'trade_volume_24h_btc_desc',
}

/**
 * Available status update category types to filter by
 */
export enum StatusUpdateCategory {
  EXCHANGE_LISTING = 'exchange_listing',
  GENERAL = 'general',
  FUND_MOVEMENT = 'fund_movement',
  MILESTONE = 'milestone',
  EVENT = 'event',
  PARTNERSHIP = 'partnership',
  NEW_LISTINGS = 'new_listings',
  SOFTWARE_RELEASE = 'software_release',
}

/**
 * Available project type options to filter by
 */
export enum StatusUpdateProjectType {
  COIN = 'coin',
  MARKET = 'market',
}

/**
 * List of event types (most recent from /events/type)
 */
export enum EVENT_TYPE {
  CONFERENCE = 'Conference',
  EVENT = 'Event',
  MEETUP = 'Meetup',
}

export interface CoinInfoFromContractAddress {
  id: string;
  symbol: string;
  name: string;
  asset_platform_id: string;
  platforms: { [platform: string]: string };
  block_time_in_minutes: number;
  hashing_algorithm?: string;
  categories: string[];
  public_notice: string;
  additional_notices?: string[];
  localization: { [locale: string]: string };
  description: { [locale: string]: string };
  links: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    chat_url: string[];
    announcement_url: string[];
    twitter_screen_name: string;
    facebook_username: string;
    bitcointalk_thread_identifier?: string;
    telegram_channel_identifier: string;
    subreddit_url?: string;
    repos_url: {
      github: string[];
      bitbucket: string[];
    };
  };
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  country_origin: string;
  genesis_date?: string;
  contract_address: string;
  sentiment_votes_up_percentage: number;
  sentiment_votes_down_percentage: number;
  market_cap_rank: number;
  coingecko_rank: number;
  coingecko_score: number;
  developer_score: number;
  community_score: number;
  liquidity_score: number;
  public_interest_score: number;
  market_data: {
    current_price: { [symbol: string]: number };
    total_value_locked: { [symbol: string]: number };
    mcap_to_tvl_ratio: number;
    fdv_to_tvl_ratio: number;
    roi?: number;
    ath: { [symbol: string]: number };
    ath_change_percentage: { [symbol: string]: number };
    ath_date: { [symbol: string]: string };
    atl: { [symbol: string]: number };
    atl_change_percentage: { [symbol: string]: number };
    atl_date: { [symbol: string]: string };
    market_cap: { [symbol: string]: number };
    market_cap_rank: number;
    fully_diluted_valuation: { [symbol: string]: number };
    total_volume: { [symbol: string]: number };
    high_24h: { [symbol: string]: number };
    low_24h: { [symbol: string]: number };
    price_change_24h: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_14d: number;
    price_change_percentage_30d: number;
    price_change_percentage_60d: number;
    price_change_percentage_200d: number;
    price_change_percentage_1y: number;
    market_cap_change_24h: number;
    market_cap_change_percentage_24h: string;
    price_change_24h_in_currency: { [symbol: string]: number };
    price_change_percentage_1h_in_currency: { [symbol: string]: number };
    price_change_percentage_24h_in_currency: { [symbol: string]: number };
    price_change_percentage_7d_in_currency: { [symbol: string]: number };
    price_change_percentage_14d_in_currency: { [symbol: string]: number };
    price_change_percentage_30d_in_currency: { [symbol: string]: number };
    price_change_percentage_60d_in_currency: { [symbol: string]: number };
    price_change_percentage_200d_in_currency: { [symbol: string]: number };
    price_change_percentage_1y_in_currency: { [symbol: string]: number };
    market_cap_change_24h_in_currency: { [symbol: string]: number };
    market_cap_change_percentage_24h_in_currency: { [symbol: string]: number };
    total_supply: number;
    max_supply: number;
    circulating_supply: number;
    last_updated: string;
  };
  community_data: {
    facebook_likes: number;
    twitter_followers: number;
    reddit_average_posts_48h: number;
    reddit_average_comments_48h: number;
    reddit_subscribers: number;
    reddit_accounts_active_48h: number;
    telegram_channel_user_count: number;
  };
  developer_data: {
    forks: number;
    stars: number;
    subscribers: number;
    total_issues: number;
    closed_issues: number;
    pull_requests_merged: number;
    pull_request_contributors: number;
    code_additions_deletions_4_weeks: {
      additions?: number;
      deletions?: number;
    };
    commit_count_4_weeks: number;
    last_4_weeks_commit_activity_series: number[];
  };
  public_interest_stats: {
    alexa_rank: number;
    bing_matches: number;
  };
  status_updates: string[];
  last_updated: string;
  tickers: {
    base: string;
    target: string;
    market: {
      name: string;
      identifier: string;
      has_trading_incentive: boolean;
    };
    last: number;
    volume: number;
    converted_last: { [currency: string]: number };
    converted_volume: { [currency: string]: number };
    trust_score: string;
    bid_ask_spread_percentage: number;
    timestamp: string;
    last_traded_at: string;
    last_fetch_at: string;
    is_anomaly: boolean;
    is_stale: boolean;
    trade_url: string;
    token_info_url: string;
    coin_id: string;
    target_coin_id: string;
  }[];
}

@Service()
export class CoinGeckoService {
  @LoggerDecorator('CoinGeckoService')
  private logger!: Logger;

  @Cacheable({
    ttlSeconds: 60,
  })
  public async getCoinInfoFromContractAddress(props: { coinId: string; contractAddress: string }) {
    return this.fetch<CoinInfoFromContractAddress>(`coins/${props.coinId}/contract/${props.contractAddress}`);
  }

  public async ping() {
    return this.fetch<{ gecko_says: string }>('ping');
  }

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
    }).then((response: any) => response.json()) as Promise<T>;
  }
}

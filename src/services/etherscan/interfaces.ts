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

export interface EtherscanFetchParams {
  [key: string]: string;
  module: 'account' | 'contract' | 'transaction' | 'block' | 'logs' | 'stats' | 'proxy' | 'gastracker';
  action: string;
}

export enum BlockchainScanServiceType {
  ETHERSCAN = 'etherscan',
  POLYGON_SCAN = 'polygon-scan',
  SNOWTRACE = 'snowtrace',
}

export interface BlockchainScanResponse<T> {
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

export interface GetListOfNormalTransactionsByAddressResponse {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
}

export interface GetListOfERC20TokenTransferEventsByAddressResponse {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
}

export interface BlockchainScanFetchParams {
  [key: string]: string | number | boolean | undefined;
  module: 'account' | 'contract' | 'transaction' | 'block' | 'logs' | 'stats' | 'proxy' | 'gastracker';
  action: string;
}

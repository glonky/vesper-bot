/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../../../../node_modules/web3-eth-contract/types/index.d.ts" />

declare module 'vesper-lib' {
  export interface MetadataToken {
    symbol: string;
    address: string;
    decimals: number;
    chainId: number;
  }

  export interface MetadataPool {
    name: string;
    address: string;
    asset: string;
    birthblock: number;
    chainId: number;
    riskLevel: number;
    stage: 'alpha' | 'beta' | 'retired' | 'prod';
  }
  export interface MetadataController {
    name: string;
    address: string;
    chainId: number;
  }

  export interface Metadata {
    name: string;
    version: string;
    controllers: MetadataController[];
    pools: MetadataPool[];
    tokens: MetadataToken[];
  }

  export interface PoolMethods {
    canRebalance: () => Promise<boolean>;
    claimVsp: () => Promise<any>;
    deposit: () => Promise<any>;
    getAddress: () => Promise<string>;
    getAssetAddress: () => Promise<string>;
    getAssetBalance: () => Promise<number>;
    getBalance: () => Promise<number>;
    getClaimableVsp: () => Promise<any>;
    getContracts: () => Promise<any>;
    getDepositedBalance: () => Promise<any>;
    getInterestEarned: () => Promise<any>;
    getInterestFee: () => Promise<any>;
    getPoolRewardsAddress: () => Promise<any>;
    getVspRewardsRate: () => Promise<any>;
    getStrategyAddress: () => Promise<any>;
    getStrategyVaultInfo: () => Promise<any>;
    getTokenValue: () => Promise<any>;
    getTotalSupply: () => Promise<any>;
    getValueLocked: () => Promise<any>;
    getWithdrawFee: () => Promise<any>;
    getWithdrawTimelock: () => Promise<any>;
    hasVspRewards: () => Promise<any>;
    rebalance: () => Promise<any>;
    withdraw: () => Promise<any>;
  }

  export interface Pool {
    name: string;
    address: string;
    asset: {
      address: string;
      decimals: string;
      symbol: string;
    };
    birthblock: number;
    chainId: number;
    riskLevel: number;
    stage: string;
    collRewardsRate: string;
    decimals: string;
    interestEarned: string;
    interestFee: number;
    lockPeriod: number;
    status: string;
    tokenValue: string;
    totalSupply: string;
    totalValue: string;
    vspRewards: boolean;
    vspRewardsRate: string;
    withdrawFee: number;
  }

  export interface AssetPortfolio {
    DAI: string;
    ETH: string;
    LINK: string;
    USDC: string;
    VSP: string;
    WBTC: string;
  }

  export interface Contracts {
    poolContracts: Contract[];
    controllerContracts: Contract[];
    assetContracts: Contract[];
    pools: MetadataPool[];
  }

  export interface PortfolioAsset {
    assets: string;
    claimableVsp: string;
    timelock: number;
    tokens: string;
  }
  export interface Portfolio {
    [key: string]: PortfolioAsset;
  }

  export interface Instance {
    metadata: Metadata;
    getContracts: () => Promise<Contracts>;
    getPools: () => Promise<Pool>;
    getPortfolio: (address: string) => Promise<Portfolio>;
    getAssetPortfolio: (address: string) => Promise<AssetPortfolio>;
    vDAI: PoolMethods;
    '0xcA0c34A3F35520B9490C1d58b35A19AB64014D80': PoolMethods;
    vETH: PoolMethods;
    '0x103cc17C2B1586e5Cd9BaD308690bCd0BBe54D5e': PoolMethods;
    vLINK: PoolMethods;
    '0x0a27E910Aee974D05000e05eab8a4b8Ebd93D40C': PoolMethods;
    vUSDC: PoolMethods;
    '0x0C49066C0808Ee8c673553B7cbd99BCC9ABf113d': PoolMethods;

    vVSP: PoolMethods;
    '0xbA4cFE5741b357FA371b506e5db0774aBFeCf8Fc': PoolMethods;
    vWBTC: PoolMethods;
    '0x4B2e76EbBc9f2923d83F5FBDe695D8733db1a17B': PoolMethods;
  }

  export interface CreateOptions {
    from?: string;
    metadata?: string;
    overestimation?: number;
    stages?: string[] | ['all'];
  }

  export default function createVesper(web3: any, options?: CreateOptions): Instance;
}

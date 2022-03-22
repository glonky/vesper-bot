/* eslint-disable @typescript-eslint/triple-slash-reference */

declare module 'vesper-metadata' {
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

  export default Metadata;
}

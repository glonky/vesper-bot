import { ExtendedError, ExtendedErrorProps } from '@vesper-discord/errors';
import { BlockchainScanServiceType } from '../interfaces';

export type BlockchainScanError = Error & {
  code: string;
  status: string;
  url: string;
  action: string;
  module: string;
};

export interface ExtendedBlockchainScanErrorProps extends ExtendedErrorProps<BlockchainScanError> {
  scanService: BlockchainScanServiceType;
}

export class ExtendedBlockchainScanError extends ExtendedError {
  constructor(message: string, props: ExtendedBlockchainScanErrorProps) {
    super(message || `Error from ${props.scanService} service`, props);
    Object.setPrototypeOf(this, ExtendedBlockchainScanError.prototype);
    this.name = this.constructor.name;
  }
}

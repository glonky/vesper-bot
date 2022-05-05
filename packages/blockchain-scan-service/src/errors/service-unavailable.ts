import { RetriableError } from '@vesper-discord/errors';
import { BlockchainScanError, ExtendedBlockchainScanErrorProps } from './error';

export class BlockchainScanServiceUnavailableError extends RetriableError<BlockchainScanError> {
  constructor(props: ExtendedBlockchainScanErrorProps) {
    super('Blockchain scan service unavailable', props);
    Object.setPrototypeOf(this, BlockchainScanServiceUnavailableError.prototype);
    this.name = this.constructor.name;
  }
}

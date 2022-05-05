import { RetriableError } from '@vesper-discord/errors';
import { ExtendedBlockchainScanErrorProps, BlockchainScanError } from './error';

export class BlockchainScanRateLimitError extends RetriableError<BlockchainScanError> {
  constructor(props: ExtendedBlockchainScanErrorProps) {
    super('Rate limited by Blockchain scan', props);
    Object.setPrototypeOf(this, BlockchainScanRateLimitError.prototype);
    this.name = this.constructor.name;
  }
}

import { RetriableError } from '@vesper-discord/errors';
import { ExtendedEtherscanErrorProps } from './error';

export class EtherscanRateLimitError extends RetriableError {
  constructor(props: ExtendedEtherscanErrorProps) {
    super('Rate limited by Etherscan', props);
    Object.setPrototypeOf(this, EtherscanRateLimitError.prototype);
    this.name = this.constructor.name;
  }
}

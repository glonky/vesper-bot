import { RetriableError } from '@vesper-discord/errors';
import { ExtendedEtherscanErrorProps } from './error';

export class EtherscanServiceUnavailableError extends RetriableError {
  constructor(props: ExtendedEtherscanErrorProps) {
    super('Etherscan service unavailable', props);
    Object.setPrototypeOf(this, EtherscanServiceUnavailableError.prototype);
    this.name = this.constructor.name;
  }
}

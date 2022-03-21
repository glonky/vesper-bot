import { ExtendedEthersError, ExtendedEthersErrorProps } from './error';

export class EtherscanParseTransactionLogError extends ExtendedEthersError {
  constructor(props: ExtendedEthersErrorProps) {
    super('Could not parse transaction log', props);
    Object.setPrototypeOf(this, EtherscanParseTransactionLogError.prototype);
    this.name = this.constructor.name;
  }
}

import { ExtendedError, ExtendedErrorProps } from '@vesper-discord/errors';

export type EtherscanError = Error & {
  code: string;
  status: string;
  url: string;
  action: string;
  module: string;
};

export type ExtendedEtherscanErrorProps = ExtendedErrorProps<EtherscanError>;
export class ExtendedEtherscanError extends ExtendedError {
  constructor(props: ExtendedEtherscanErrorProps) {
    super('Error from Etherscan', props);
    Object.setPrototypeOf(this, ExtendedEtherscanError.prototype);
    this.name = this.constructor.name;
  }
}

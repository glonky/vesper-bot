import { ExtendedError, ExtendedErrorProps } from '@vesper-discord/errors';

export type EthersError = Error & {
  code: string;
  argument: string;
  reason: string;
  value: string;
};

export type ExtendedEthersErrorProps = ExtendedErrorProps<EthersError>;

export class ExtendedEthersError extends ExtendedError<EthersError> {
  constructor(message: string, props: ExtendedEthersErrorProps) {
    super(message, props);
    Object.setPrototypeOf(this, ExtendedEthersError.prototype);
    this.name = this.constructor.name;
  }
}

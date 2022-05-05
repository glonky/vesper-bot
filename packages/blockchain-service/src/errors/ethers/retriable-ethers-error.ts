import { RetriableError } from '@vesper-discord/errors';
import { ExtendedEthersError, ExtendedEthersErrorProps } from './error';

export class RetriableEthersError extends RetriableError<ExtendedEthersError> {
  constructor(message: string, props: ExtendedEthersErrorProps) {
    super(message, props);
    Object.setPrototypeOf(this, RetriableEthersError.prototype);
    this.name = this.constructor.name;
  }
}

import { ExtendedErrorProps } from '../../../errors';
import { ExtendedStripeError } from './error';

export class EtherscanInvalidRequestError extends ExtendedStripeError {
  constructor(message: string, props: ExtendedErrorProps) {
    super(message, props);
    Object.setPrototypeOf(this, ExtendedStripeError.prototype);
  }
}

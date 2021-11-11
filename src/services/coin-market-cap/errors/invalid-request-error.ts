import { ExtendedErrorProps } from '../../../errors';
import { ExtendedCoinMarketCapError } from './error';

export class StripeInvalidRequestError extends ExtendedCoinMarketCapError {
  constructor(message: string, props: ExtendedErrorProps) {
    super(message, props);
    Object.setPrototypeOf(this, ExtendedCoinMarketCapError.prototype);
  }
}

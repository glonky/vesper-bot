import { ExtendedErrorProps } from '@vesper-discord/errors';
import { ExtendedCoinGeckoError } from './error';

export class CoinGeckoInvalidRequestError extends ExtendedCoinGeckoError {
  constructor(message: string, props: ExtendedErrorProps) {
    super(message, props);
    Object.setPrototypeOf(this, ExtendedCoinGeckoError.prototype);
  }
}

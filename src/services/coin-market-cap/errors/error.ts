import { ExtendedError, ExtendedErrorProps } from '../../../errors';

export type CoinMarketCapError = Error & {
  code: string;
  data: {
    error: string;
  };
  raw?: {
    type?: string;
    code?: string;
  };
};

export class ExtendedCoinMarketCapError extends ExtendedError {
  constructor(message: string, props: ExtendedErrorProps) {
    super(message, props);
    Object.setPrototypeOf(this, ExtendedCoinMarketCapError.prototype);
  }
}

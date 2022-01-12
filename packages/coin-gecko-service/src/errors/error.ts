import { ExtendedError, ExtendedErrorProps } from '@vesper-discord/errors';

export type CoinGeckoError = Error & {
  code: string;
  data: {
    error: string;
  };
  raw?: {
    type?: string;
    code?: string;
  };
};

export class ExtendedCoinGeckoError extends ExtendedError {
  constructor(message: string, props: ExtendedErrorProps) {
    super(message, props);
    Object.setPrototypeOf(this, ExtendedCoinGeckoError.prototype);
  }
}

import { ExtendedError, ExtendedErrorProps } from '@vesper-discord/errors';

export type EtherscanError = Error & {
  code: string;
  data: {
    error: string;
  };
  raw?: {
    type?: string;
    code?: string;
  };
};

export class ExtendedStripeError extends ExtendedError {
  constructor(message: string, props: ExtendedErrorProps) {
    super(message, props);
    Object.setPrototypeOf(this, ExtendedStripeError.prototype);
  }
}

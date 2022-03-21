import { ExtendedError, ExtendedErrorProps } from '@vesper-discord/errors';

export type BlockchainError = Error & {
  code: string;
  data: {
    error: string;
  };
  raw?: {
    type?: string;
    code?: string;
  };
};

export class ExtendedBlockchainError extends ExtendedError {
  constructor(message: string, props: ExtendedErrorProps) {
    super(message, props);
    Object.setPrototypeOf(this, ExtendedBlockchainError.prototype);
    this.name = this.constructor.name;
  }
}

import { ExtendedError, ExtendedErrorProps } from '@vesper-discord/errors';

export type RedisError = Error & {
  code: string;
  data: {
    error: string;
  };
  raw?: {
    type?: string;
    code?: string;
  };
};

export class ExtendedRedisError extends ExtendedError {
  constructor(message: string, props: ExtendedErrorProps) {
    super(message, props);
    Object.setPrototypeOf(this, ExtendedRedisError.prototype);
  }
}
